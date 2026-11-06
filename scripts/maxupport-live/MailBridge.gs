/* Separate Apps Script project: mail sending only, no Sheets/Drive/inbox access. */
function doPost(e) {
  function output(value) {
    return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
      ContentService.MimeType.JSON,
    );
  }
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 20000)
      return output({ ok: false });
    const secret =
      PropertiesService.getScriptProperties().getProperty("LIVE_MAIL_SECRET");
    if (!secret || secret.length < 32) return output({ ok: false });
    const envelope = JSON.parse(e.postData.contents);
    if (
      typeof envelope.timestamp !== "number" ||
      Math.abs(Date.now() - envelope.timestamp) > 300000 ||
      typeof envelope.payload !== "string" ||
      typeof envelope.signature !== "string"
    )
      return output({ ok: false });
    const expected = Utilities.computeHmacSha256Signature(
      "live-mail." + envelope.timestamp + "." + envelope.payload,
      secret,
      Utilities.Charset.UTF_8,
    )
      .map(function (b) {
        return ("0" + ((b + 256) % 256).toString(16)).slice(-2);
      })
      .join("");
    let diff = expected.length ^ envelope.signature.length;
    for (let i = 0; i < expected.length; i++)
      diff |= expected.charCodeAt(i) ^ (envelope.signature.charCodeAt(i) || 0);
    if (diff) return output({ ok: false });
    const mail = JSON.parse(envelope.payload);
    if (
      typeof mail.id !== "string" ||
      !/^[a-f0-9]{64}$/.test(mail.id) ||
      typeof mail.to !== "string" ||
      !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(mail.to) ||
      mail.to.length > 254 ||
      typeof mail.subject !== "string" ||
      !mail.subject.startsWith("[Maxupport LIVE]") ||
      mail.subject.length > 160 ||
      /[\r\n]/.test(mail.subject) ||
      typeof mail.body !== "string" ||
      mail.body.length > 8000
    )
      return output({ ok: false });
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return output({ ok: false });
    const cache = CacheService.getScriptCache(),
      key = "mail-" + mail.id;
    const status = cache.get(key);
    if (status === "sent")
      return output({ ok: true, id: mail.id, duplicate: true });
    if (status) return output({ ok: false, uncertain: true });
    if (MailApp.getRemainingDailyQuota() < 1)
      return output({ ok: false, quota: true });
    cache.put(key, "sending", 21600);
    try {
      MailApp.sendEmail({
        to: mail.to,
        subject: mail.subject,
        body: mail.body,
        name: "Maxupport LIVE",
        replyTo: "maxupport@gmail.com",
      });
      cache.put(key, "sent", 21600);
      return output({ ok: true, id: mail.id });
    } catch (error) {
      return output({ ok: false, uncertain: true });
    }
  } catch (error) {
    return output({ ok: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
