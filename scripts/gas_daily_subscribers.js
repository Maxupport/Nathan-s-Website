/**
 * 每日檢查前一日新增之訂閱者，若有則發送彙整信件（HTML 格式含按鈕連結）
 * 建議設定觸發條件：時間驅動 > 日計時器 > 早上 8 點 到 9 點
 */
function checkDailySubscribers() {
  // 1. 設定收件信箱 (預設為執行此腳本的 Google 帳號信箱)
  var emailAddress = Session.getActiveUser().getEmail();

  // 2. Google 試算表連結
  var sheetUrl = "https://docs.google.com/spreadsheets/d/1czByKntjUWK1kv5JCd57nzoduwgkDsrKXBy2-R8-xHM/edit?usp=sharing";

  // 3. 取得試算表資料
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  // 若沒有資料或只有標題列，不進行任何操作
  if (data.length <= 1) return;

  var headers = data[0];
  var emailColIndex = -1;

  // 4. 自動偵測「Email」或「電子郵件」所在的欄位
  for (var i = 0; i < headers.length; i++) {
    var headerStr = headers[i].toString().toLowerCase();
    if (headerStr.indexOf("email") !== -1 || headerStr.indexOf("電子郵件地址") !== -1 || headerStr.indexOf("電郵") !== -1 || headerStr.indexOf("電子郵件") !== -1) {
      emailColIndex = i;
      break;
    }
  }

  // 5. 定義「昨天」的日期字串
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var yesterdayStr = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), "yyyy/MM/dd");

  var newSubscribers = [];

  // 6. 比對昨日資料
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var timestamp = row[0]; // 時間戳記通常在第 1 欄 (index = 0)

    if (timestamp instanceof Date) {
      var rowDateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy/MM/dd");

      // 如果時間戳記是昨天，就收錄該筆資料
      if (rowDateStr === yesterdayStr) {
        var email = emailColIndex !== -1 ? row[emailColIndex] : row.join(", ");
        newSubscribers.push(email);
      }
    }
  }

  // 7. 寄信通知：只要數量大於 0 就發送 HTML Email
  if (newSubscribers.length > 0) {
    var subject = "【自動通知】昨日新增 " + newSubscribers.length + " 位訂閱者！";

    // 組合訂閱者名單 HTML
    var subscriberListHtml = "";
    for (var j = 0; j < newSubscribers.length; j++) {
      subscriberListHtml += "<li style='padding: 4px 0; color: #374151;'>" + newSubscribers[j] + "</li>";
    }

    var htmlBody =
      "<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;'>" +
        "<h2 style='color: #111827; margin-top: 0;'>🎉 昨日新增 " + newSubscribers.length + " 位訂閱者！</h2>" +
        "<p style='color: #6b7280; font-size: 14px;'>日期：" + yesterdayStr + "</p>" +
        "<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;'>" +
        "<p style='color: #374151; font-weight: bold; margin-bottom: 8px;'>新訂閱者名單：</p>" +
        "<ul style='margin: 0; padding-left: 20px; font-size: 14px;'>" + subscriberListHtml + "</ul>" +
        "<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;'>" +
        "<a href='" + sheetUrl + "' style='display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;'>📊 前往 Google 試算表查看完整名單</a>" +
        "<p style='color: #9ca3af; font-size: 12px; margin-top: 24px; margin-bottom: 0;'>此為系統自動發送，請勿直接回覆此信件。</p>" +
      "</div>";

    MailApp.sendEmail({
      to: emailAddress,
      subject: subject,
      htmlBody: htmlBody
    });
  }
}
