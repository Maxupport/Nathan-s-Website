/* Google Apps Script bridge. Deploy only after reviewing SHEETS_SYNC.md. */
// Login uses the *active* Google user, never the script's effective owner.
// Anonymous callers cannot obtain a proof even though the intake URL is public.
function doGet(e) {
  const denied = function () { return HtmlService.createHtmlOutput('<h1>Maxupport LIVE</h1><p>請使用 Max 的 Google 帳號登入管理端。</p>'); };
  try {
    const state = String(e.parameter.state || '');
    const returnTo = String(e.parameter.returnTo || '');
    const allowed = ['https://maxupportspace-git-feature-maxupport-live-maxupports-projects.vercel.app/live/auth', 'http://localhost:3100/live/auth'];
    const email = Session.getActiveUser().getEmail();
    const secret = PropertiesService.getScriptProperties().getProperty('LIVE_BRIDGE_SECRET');
    if (email !== 'maxupport@gmail.com' || !/^[a-f0-9]{64}$/.test(state) || allowed.indexOf(returnTo) === -1 || !secret || secret.length < 32) return denied();
    const now = Date.now();
    const claims = {purpose:'live-owner-proof', email:email, issuedAt:now, expiresAt:now+60000, state:state};
    const payload = Utilities.base64EncodeWebSafe(JSON.stringify(claims), Utilities.Charset.UTF_8).replace(/=+$/,'');
    const signature = Utilities.computeHmacSha256Signature('live-owner-proof.'+payload, secret, Utilities.Charset.UTF_8).map(function (byte) {return ('0'+((byte+256)%256).toString(16)).slice(-2);}).join('');
    // Fragment avoids sending the proof in the website URL or referrer logs.
    const href = returnTo + '#proof=' + encodeURIComponent(payload+'.'+signature);
    return HtmlService.createHtmlOutput('<meta name="referrer" content="no-referrer"><h1>Maxupport LIVE</h1><p>已確認 Max 的 Google 帳號，請於一分鐘內返回管理端。</p><a target="_top" rel="noreferrer" href="'+href+'">返回管理端</a>');
  } catch (error) {return denied();}
}

function doPost(e) {
  function output(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 300000) return output({ ok: false });
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty('LIVE_BRIDGE_SECRET');
    const spreadsheetId = properties.getProperty('LIVE_SPREADSHEET_ID');
    if (!secret || secret.length < 32 || !spreadsheetId) return output({ ok: false });
    const envelope = JSON.parse(e.postData.contents);
    if (typeof envelope.timestamp !== 'number' || Math.abs(Date.now() - envelope.timestamp) > 300000 || typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string') return output({ ok: false });
    const expected = Utilities.computeHmacSha256Signature(String(envelope.timestamp) + '.' + envelope.payload, secret, Utilities.Charset.UTF_8).map(function (byte) { return ('0' + ((byte + 256) % 256).toString(16)).slice(-2); }).join('');
    let difference = expected.length ^ envelope.signature.length;
    for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ (envelope.signature.charCodeAt(i) || 0);
    if (difference !== 0) return output({ ok: false });
    const request = JSON.parse(envelope.payload);
    if (['adminRead', 'adminSave', 'publicRead'].indexOf(request.operation) !== -1) {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(5000)) return output({ok:false});
      return output(liveAdminOperation(request, SpreadsheetApp.openById(spreadsheetId)));
    }
    const s = request.submission;
    if (request.operation !== 'submit' || !s || !/^[0-9a-f-]{36}$/i.test(s.id) || s.replyConsent !== true || s.consentVersion !== 'live-reply-v1') return output({ ok: false });
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return output({ ok: false });
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('互動原始紀錄');
    if (!sheet) return output({ ok: false });
    const expectedHeaders = ['提交 ID','保存時間','類型','主題','暱稱','Email','Instagram','歌曲','演唱者','內容','回覆同意版本','訂閱同意','互動事件','處理狀態','通知狀態'];
    const existingHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
    if (existingHeaders.some(function (value, index) { return value !== expectedHeaders[index]; })) return output({ ok: false });
    const count = sheet.getLastRow();
    if (count > 1) {
      const match = sheet.getRange(2, 1, count - 1, 1).createTextFinder(s.id).matchEntireCell(true).findNext();
      if (match) return output({ ok: true, id: s.id, savedAt: new Date(sheet.getRange(match.getRow(), 2).getValue()).toISOString(), duplicate: true });
    }
    // Shared, conservative quota guard. The lock serializes quota checks and writes.
    const cache = CacheService.getScriptCache();
    const minute = 'intake-' + Math.floor(Date.now() / 60000);
    const used = Number(cache.get(minute) || 0);
    if (used >= 60) return output({ ok: false });
    cache.put(minute, String(used + 1), 120);
    function cell(value) { const text = String(value || ''); return /^[\s]*[=+@\-]/.test(text) ? "'" + text : text; }
    const savedAt = new Date().toISOString();
    sheet.getRange(count + 1, 1, 1, expectedHeaders.length).setValues([[s.id, savedAt, cell(s.kind), cell(s.topic), cell(s.nickname), cell(s.email), cell(s.instagram), cell(s.title), cell(s.artist), cell(s.message), cell(s.consentVersion), s.subscriptionConsent ? '是' : '否', cell(JSON.stringify(s.events || [])), '待處理', '尚未通知']]);
    SpreadsheetApp.flush();
    return output({ ok: true, id: s.id, savedAt: savedAt, duplicate: false });
  } catch (error) {
    return output({ ok: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function liveRows(book, name, columns) {
  const sheet=book.getSheetByName(name);
  if (!sheet || sheet.getLastRow()<2) return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,columns).getValues();
}
function liveRevision(songs, shows) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify([songs.map(function(r){return r.slice(0,8);}),shows]), Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
}
function liveAdminOperation(request, book) {
  const songSheet=book.getSheetByName('歌曲主資料');
  if (!songSheet || songSheet.getRange(1,1).getValue() !== '歌曲 ID') return {ok:false};
  const songs=liveRows(book,'歌曲主資料',17);
  const showRows=liveRows(book,'LIVE 演出資料',3);
  const shows=showRows.filter(function(r){return r[0];}).map(function(r){return JSON.parse(r[1]);});
  if (request.operation==='publicRead') return {ok:true,shows:shows.filter(function(s){return ['next','current','performed'].indexOf(s.status)!==-1;}).map(function(s){return {id:s.id,sequence:s.sequence,date:s.date,location:s.location,copy:s.copy,items:s.items,status:s.status,mode:s.mode,artist:s.artist,overrideWarnings:[]};})};
  const revision=liveRevision(songs,showRows);
  if (request.operation==='adminRead') return {ok:true,songs:songs,shows:shows,submissions:liveRows(book,'互動原始紀錄',15),revision:revision};
  if (request.revision !== revision) return {ok:false,conflict:true};
  const changes=request.changes;
  if (!changes || !Array.isArray(changes.songs) || !Array.isArray(changes.submissions) || (changes.shows!==null && !Array.isArray(changes.shows))) return {ok:false};
  const rawSheet=book.getSheetByName('互動原始紀錄');
  const raw=liveRows(book,'互動原始紀錄',15);
  const rawById={};raw.forEach(function(r,i){rawById[r[0]]=i+2;});
  // Validate all targets before making any writes. No replace-all of raw intake.
  if (changes.submissions.some(function(c){return !rawById[c.id] || ['status','anonymize','delete'].indexOf(c.action)===-1 || (c.action==='status' && ['待處理','處理中','已完成'].indexOf(c.status)===-1);})) return {ok:false,conflict:true};
  function cell(value) {const text=String(value || '');return /^[\s]*[=+@\-]/.test(text)?"'"+text:text;}
  changes.songs.forEach(function(s){
    const index=songs.findIndex(function(r){return r[0]===s.id;});
    const row=index===-1?songSheet.getLastRow()+1:index+2;
    songSheet.getRange(row,1,1,8).setValues([[cell(s.id),cell(s.title),cell(s.artist),cell(s.category),s.serious?'是':'否',s.showcase?'是':'否',s.opener?'是':'否',s.ready?'是':'否']]);
  });
  if (changes.shows!==null) {
    let sheet=book.getSheetByName('LIVE 演出資料');
    if (!sheet) {sheet=book.insertSheet('LIVE 演出資料');sheet.getRange(1,1,1,3).setValues([['場次 ID','資料 JSON','更新時間']]);sheet.setFrozenRows(1);}
    const values=changes.shows.map(function(s){return [cell(s.id),JSON.stringify(s),new Date().toISOString()];});
    if (values.length) sheet.getRange(2,1,values.length,3).setValues(values);
    if (sheet.getLastRow()>values.length+1) sheet.getRange(values.length+2,1,sheet.getLastRow()-values.length-1,3).clearContent();
  }
  changes.submissions.filter(function(c){return c.action!=='delete';}).forEach(function(c){
    const row=rawById[c.id];
    if (c.action==='status') rawSheet.getRange(row,14).setValue(c.status);
    if (c.action==='anonymize') {rawSheet.getRange(row,5,1,3).setValues([['已匿名','','']]);rawSheet.getRange(row,10).setValue('');rawSheet.getRange(row,15).setValue('無聯絡方式');}
  });
  changes.submissions.filter(function(c){return c.action==='delete';}).map(function(c){return rawById[c.id];}).sort(function(a,b){return b-a;}).forEach(function(row){rawSheet.deleteRow(row);});
  SpreadsheetApp.flush();
  return {ok:true,revision:liveRevision(liveRows(book,'歌曲主資料',17),liveRows(book,'LIVE 演出資料',3))};
}
