/* Google Apps Script bridge. Deploy only after reviewing SHEETS_SYNC.md. */
function doPost(e) {
  function output(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 24000) return output({ ok: false });
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
