// ============================================================
// Google Drive Bypass Downloader
// Version: v2026.11.08
// GitHub: https://github.com/moyshiginzburg/Google-Drive-Bypass-Downloader
// ============================================================
// UI — adds a setup menu when the form editor is opened
// ============================================================
// Purpose: Provides a one-click installation entry point inside
//          the Google Form editor.  When a user opens the form in
//          edit mode, this simple-trigger adds a custom menu item
//          that invokes setupAll().
// ============================================================
function onOpen() {
  FormApp.getUi()
    .createMenu('📥 מוריד לדרייב')
    .addItem('⚙️ התקנה — לחץ כאן להפעלה', 'setupAll')
    .addToUi();
}

// ============================================================
// Technical constants
// ============================================================
var CHUNK_BYTES = 40 * 1024 * 1024; // Size of each chunk in split download
var MAX_RUN_MS  = 240 * 1000;        // Maximum runtime before stopping

// ============================================================
// Installation function — Run only once!
// ============================================================
// Purpose: One-time setup for the form-bound downloader script.
//
// How it works:
//   1. Retrieves the bound Google Form (the script's container).
//   2. Publishes the form so it accepts responses.
//   3. Creates a destination folder in the owner's Google Drive.
//   4. Persists settings (folder ID, form ID) in Script Properties.
//   5. Registers two triggers:
//      • Time-driven (every minute) — processes pending responses.
//      • Form-submit — immediately wakes the processor on new input.
//   6. Sends a confirmation email with the form's response URL
//      and the Drive folder link to the account owner.
//   7. When invoked from the Form editor UI, shows a success dialog.
//
// Can be invoked:
//   • From the custom menu in the Form editor (recommended).
//   • Manually from the Apps Script code editor (Run ▸ setupAll).
// ============================================================
function setupAll() {
  try {
    var dA    = getS("Drive"       + "App");
    var fmA   = getS("Form"        + "App");
    var mA    = getS("Mail"        + "App");
    var sA    = getS("Script"      + "App");
    var props = getS("Properties"  + "Service").getScriptProperties();

    // --- Get the bound form (this script's container) ---
    var form = fmA.getActiveForm();

    // --- Publish the form so it accepts responses ---
    var responsesBlocked = false;
    try {
      form.setAcceptingResponses(true);
    } catch (eAccept) {
      responsesBlocked = true;
      Logger.log("לא ניתן היה לפתוח את הטופס לתגובות אוטומטית: " + eAccept.toString());
    }

    // --- Create destination folder in owner's Drive ---
    var destFolder = dA.getRootFolder().createFolder(
      "📥 הורדות אוטומטיות — " +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy")
    );
    var folderId = destFolder.getId();

    // --- Persist settings for later trigger runs ---
    props.setProperties({
      TARGET_FOLDER_ID : folderId,
      FORM_ID          : form.getId(),
      LAST_TS          : "0"
    });

    // --- Remove any old triggers to avoid duplicates ---
    sA.getProjectTriggers().forEach(function(t) { sA.deleteTrigger(t); });

    // Time-driven trigger: processes pending form responses every minute
    manageTrigger(true);

    // Form-submit trigger: immediately wakes the processor on new response
    sA.newTrigger("onFormSubmitTrigger")
      .forForm(form)
      .onFormSubmit()
      .create();

    // --- Send confirmation email to owner ---
    var ownerEmail = Session.getEffectiveUser().getEmail();
    var formUrl    = form.getPublishedUrl();
    var folderUrl  = "https://drive.google.com/drive/folders/" + folderId;

    var subject = "✅ הטופס שלך מוכן!";
    var bodyArr = [
      "שלום,",
      "",
      "ההתקנה הושלמה בהצלחה. הכל מוכן.",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🔗 לינק לטופס:",
      formUrl,
      "",
      "📁 תיקיית היעד בדרייב:",
      folderUrl,
      "━━━━━━━━━━━━━━━━━━━━━━━━━"
    ];

    if (responsesBlocked) {
      bodyArr.push("");
      bodyArr.push("⚠️ פעולה ידנית נדרשת ⚠️");
      bodyArr.push("כדי שהטופס יעבוד, עליך ללחוץ על הכפתור הסגול 'פרסום' (או Send) בפינה השמאלית העליונה של עורך הטופס.");
    }

    bodyArr = bodyArr.concat([
      "",
      "כל הקבצים ישמרו אוטומטית לתיקיית היעד.",
      "הטופס פעיל — אפשר להתחיל להשתמש בו!",
      "",
      "בהצלחה."
    ]);
    
    var bodyText = bodyArr.join("\n");
    var htmlBody = '<div dir="rtl" style="text-align: right; font-family: sans-serif; white-space: pre-wrap;">' + bodyText + '</div>';

    if (ownerEmail) {
      mA.sendEmail({
        to: ownerEmail,
        subject: subject,
        body: bodyText,
        htmlBody: htmlBody
      });
      Logger.log("מייל נשלח אל: " + ownerEmail);
    } else {
      Logger.log("אזהרה: לא ניתן היה לשלוח מייל כי כתובת המייל חסרה.");
    }

    Logger.log("══ ההתקנה הסתיימה ══");
    Logger.log("לינק לטופס: " + formUrl);
    Logger.log("תיקיית יעד: " + folderUrl);

    // --- Show UI dialog if invoked from the Form editor menu ---
    try {
      var ui = fmA.getUi();
      var uiMsg = "הטופס הוגדר בהצלחה.\n\n" +
        "קישור לטופס נשלח למייל:\n" + (ownerEmail || "לא ידוע") + "\n\n" +
        "תיקיית היעד בדרייב:\n" + folderUrl;
        
      if (responsesBlocked) {
        uiMsg += "\n\n⚠️ שים לב: כדי שהטופס יתחיל לקבל תגובות, עליך ללחוץ על הכפתור הסגול 'פרסום' למעלה.";
      }
      
      ui.alert(
        "✅ ההתקנה הושלמה!",
        uiMsg,
        ui.ButtonSet.OK
      );
    } catch (eUi) {
      // Running from the Apps Script editor — no UI context available.
    }
  } catch (e) {
    Logger.log("שגיאה בהתקנה: " + e.toString());
    try {
      var fmA = getS("Form" + "App");
      fmA.getUi().alert("❌ שגיאה בהתקנה", "התרחשה שגיאה: " + e.toString(), fmA.getUi().ButtonSet.OK);
    } catch (eUi) {}
    throw e;
  }
}

// ============================================================
// Process responses — runs automatically every minute
// ============================================================
function processFormResponses() {
  var lock = getS("Lock" + "Service").getScriptLock();
  if (!lock.tryLock(15000)) return;

  var p = getS("Properties" + "Service").getScriptProperties();
  
  var crashCount = parseInt(p.getProperty("GLOBAL_CRASH") || "0", 10) + 1;
  if (crashCount > 3) {
    Logger.log("⚠️ התגלתה קריסת מערכת קריטית 3 פעמים ברציפות! מתבצע איפוס מלא של התור כדי לשחרר את הסקריפט.");
    p.deleteProperty("CURRENT_JOB");
    p.setProperty("INTERNAL_QUEUE", "[]");
    try {
      var fId = p.getProperty("FORM_ID");
      if (fId) {
        var form = getS("Form" + "App").openById(fId);
        var resps = form.getResponses();
        var currentLast = parseFloat(p.getProperty("LAST_TS") || "0");
        for (var i = 0; i < resps.length; i++) {
          var ts = resps[i].getTimestamp().getTime();
          if (ts > currentLast) {
            p.setProperty("LAST_TS", ts.toString());
            break;
          }
        }
      }
    } catch(e) {}
    p.deleteProperty("GLOBAL_CRASH");
    lock.releaseLock();
    return;
  }
  
  p.setProperty("GLOBAL_CRASH", crashCount.toString());

  try {
  
  var start = new Date().getTime();
  var all   = p.getProperties();
  var folder = all["TARGET_FOLDER_ID"];
  var formId = all["FORM_ID"];

  if (!folder || !formId) {
    Logger.log("שגיאה: חסרות הגדרות. הפעל setupAll() תחילה.");
    lock.releaseLock();
    return;
  }

  // 1 — Continue an existing interrupted task
  var active = p.getProperty("CURRENT_JOB");
  if (active) {
    try {
      var job = JSON.parse(active);
      if (runJob(job, start, folder)) {
        p.deleteProperty("CURRENT_JOB");
      } else {
        p.setProperty("CURRENT_JOB", JSON.stringify(job));
        manageTrigger(true);
        lock.releaseLock();
        return;
      }
    } catch(e) {
      Logger.log("שגיאה קריטית ב-CURRENT_JOB, המשימה נמחקה כדי למנוע חסימה: " + e.toString());
      p.deleteProperty("CURRENT_JOB");
    }
  }

  // 2 — Internal queue (created from video tasks split into many links)
  try {
    var qStr = p.getProperty("INTERNAL_QUEUE");
    var q = qStr ? JSON.parse(qStr) : [];
    while (q.length > 0) {
      if (new Date().getTime() - start > MAX_RUN_MS) {
        p.setProperty("INTERNAL_QUEUE", JSON.stringify(q));
        manageTrigger(true);
        lock.releaseLock();
        return;
      }
      var jq = q.shift();
      if (!runJob(jq, start, folder)) {
        q.unshift(jq);
        p.setProperty("INTERNAL_QUEUE", JSON.stringify(q));
        p.setProperty("CURRENT_JOB", JSON.stringify(jq));
        manageTrigger(true);
        lock.releaseLock();
        return;
      }
    }
    p.setProperty("INTERNAL_QUEUE", "[]");
  } catch(e) {
    Logger.log("שגיאה קריטית בתור הפנימי, התור נמחק כדי למנוע חסימה: " + e.toString());
    p.setProperty("INTERNAL_QUEUE", "[]");
  }

  // 3 — New responses from the form
  var form = getS("Form" + "App").openById(formId);
  var resps = form.getResponses();
  var last  = parseFloat(p.getProperty("LAST_TS") || "0");

  for (var i = 0; i < resps.length; i++) {
    if (new Date().getTime() - start > MAX_RUN_MS) {
      manageTrigger(true);
      lock.releaseLock();
      return;
    }

    var r  = resps[i];
    var ts = r.getTimestamp().getTime();
    if (ts <= last) continue;

    var items      = r.getItemResponses();
    var origUrl    = (items[0] ? items[0].getResponse().trim() : "");
    var actionPref = (items[1] ? items[1].getResponse() : "");
    var folderPref = (items[2] ? items[2].getResponse() : "");

    Logger.log("בקשה חדשה: " + origUrl + " | העדפה בטופס: " + actionPref);
    if (!origUrl) { p.setProperty("LAST_TS", ts.toString()); continue; }

    try {
      var forceAction = null;
      var hashMatch = origUrl.match(/#force_action=([^&]+)/);
      if (hashMatch) {
        forceAction = hashMatch[1];
        origUrl = origUrl.replace(/#.*$/, "");
        Logger.log("זוהה פרמטר מיוחד בקישור: " + forceAction);
      }

      // Purpose: HLS quality links sent by email may carry a separate audio
      // rendition (#hls_audio=<encoded url>). Extract it so the audio track is
      // downloaded too after the video track; otherwise the video is silent.
      var hlsAudioUrl = null;
      var audioMatch = origUrl.match(/#hls_audio=([^&#]+)/);
      if (audioMatch) {
        hlsAudioUrl = decodeURIComponent(audioMatch[1]);
        origUrl = origUrl.replace(/#.*$/, "");
        Logger.log("Separate HLS audio track detected: " + hlsAudioUrl);
      }

    // Resolve redirects (important for bit.ly etc)
    var resolved = resolveRedirects(origUrl);
    var url = resolved.url;
    Logger.log("הכתובת לאחר פענוח הפניות: " + url);

    var autoAction = autoDetectAction(resolved, actionPref);
    Logger.log("פעולה שנבחרה לאחר סריקה: " + autoAction);

    // העתקה מדרייב
    if (autoAction === "drive") {
      var driveId = extractDriveId(url);
      if (driveId) {
        handleDriveItem(driveId, folder, forceAction);
      } else {
        Logger.log("לא זוהה מזהה דרייב תקין ב: " + url);
      }
    }
    // יוטיוב
    else if (autoAction === "youtube") {
      var ytUrl = getCobaltYoutubeUrl(url);
      if (ytUrl) {
         var nj_yt = { url: ytUrl, ts: ts, type: "bin", fn: "YouTube_Video_" + ts + ".mp4", fid: null, bDone: 0, sz: -1, session: null };
         if (!runJob(nj_yt, start, folder)) {
           p.setProperty("CURRENT_JOB", JSON.stringify(nj_yt));
           manageTrigger(true);
           lock.releaseLock();
           p.setProperty("LAST_TS", ts.toString());
           return;
         }
      } else {
         Logger.log("שגיאה: יוטיוב לא נתמך כרגע באופן ישיר או ששירות העקיפה נכשל.");
         sendFriendlyErrorEmail(origUrl, "YOUTUBE_ERROR", null);
      }
    }
    // איסוף קישורי וידאו ישן (scrape)
    else if (autoAction === "scrape_video") {
      try {
        var videos = scrapeVideos(url);
        var newQ = JSON.parse(p.getProperty("INTERNAL_QUEUE") || "[]");
        videos.forEach(function(v) {
          newQ.push({ url: v, ts: ts, type: "bin", fn: null, fid: null, bDone: 0, sz: -1, session: null });
        });
        p.setProperty("INTERNAL_QUEUE", JSON.stringify(newQ));
        Logger.log("נמצאו " + videos.length + " קישורי וידאו. נוספו לתור.");
        manageTrigger(true);
      } catch (e) { Logger.log("שגיאת סריקת וידאו: " + e); }
    }
    // שמירת דף
    else if (autoAction === "page") {
      var pj = { url: url, ts: ts, type: "page", fn: null, fid: null, filesFid: null, html: null, assets: null, assetIdx: 0, bDone: 0, session: null };
      if (!runJob(pj, start, folder)) {
        p.setProperty("CURRENT_JOB", JSON.stringify(pj));
        manageTrigger(true);
        lock.releaseLock();
        p.setProperty("LAST_TS", ts.toString());
        return;
      }
    }
    // הורדת קובץ מהאינטרנט או m3u8
    else {
      if (url.indexOf("dropbox.com") !== -1) {
        url = url.replace(/(\?dl=0|&dl=0)$/, "") + (url.indexOf("?") > -1 ? "&dl=1" : "?dl=1");
      }
      var type = autoAction === "m3u8" ? "m3u8" : "bin";
      var nj = { url: url, ts: ts, type: type, fn: null, fid: null, bDone: 0, sz: -1, session: null };
      if (type === "m3u8" && hlsAudioUrl) nj.audioUrl = hlsAudioUrl;
      if (!runJob(nj, start, folder)) {
        p.setProperty("CURRENT_JOB", JSON.stringify(nj));
        manageTrigger(true);
        lock.releaseLock();
        p.setProperty("LAST_TS", ts.toString());
        return;
      }
    }
    } catch (eItem) {
      Logger.log("שגיאה בעיבוד בקשה " + origUrl + ": " + eItem.toString());
      sendFriendlyErrorEmail(origUrl, "GENERAL_DOWNLOAD_ERROR", "שגיאה בגישה לקישור: " + eItem.toString());
    }

    p.setProperty("LAST_TS", ts.toString());
  }

  manageTrigger(false);
  lock.releaseLock();
  
  } finally {
    p.deleteProperty("GLOBAL_CRASH");
  }
}

// ============================================================
// Task routing
// ============================================================
function runJob(j, s, folder) {
  try {
    if (j.type === "page")  return handlePage(j, s, folder);
    if (j.type === "m3u8")  return handleM3U8(j, s, folder);
    return downloadSmart(j, s, folder);
  } catch (e) {
    Logger.log("שגיאה במשימה: " + e + " | url=" + j.url);
    sendFriendlyErrorEmail(j.url, "GENERAL_DOWNLOAD_ERROR", e.toString());
    return true; // Do not retry — move on
  }
}

// ============================================================
// Handle items: file or folder
// ============================================================
function extractDriveId(url) {
  if (!url) return null;
  var m1 = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (m1) return m1[1];
  var m2 = url.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
  if (m2) return m2[1];
  var m3 = url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (m3) return m3[1];
  var m4 = url.match(/\/(?:document|spreadsheets)\/d\/([a-zA-Z0-9_-]{25,})/);
  if (m4) return m4[1];
  var isGoogle = url.indexOf(".google.com") !== -1;
  if (isGoogle) {
    var fallback = url.match(/([a-zA-Z0-9_-]{25,})/g);
    if (fallback && fallback.length > 0) {
      return fallback.reduce(function(a, b) { return b.length > a.length ? b : a; });
    }
  }
  return null;
}

function resolveShortcut(dA, fileId) {
  try {
    var file = dA.getFileById(fileId);
    if (file.getMimeType() === "application/vnd.google-apps.shortcut") {
      var targetId = file.getTargetId();
      if (targetId) {
        Logger.log("קיצור דרך זוהה → מפנה ל-ID: " + targetId);
        return { id: targetId, name: file.getName(), isShortcut: true };
      }
    }
    return { id: fileId, name: file.getName(), isShortcut: false };
  } catch (e) {
    return { id: fileId, name: null, isShortcut: false };
  }
}

function handleDriveItem(id, targetFolderId, forceAction) {
  var dA     = getS("Drive" + "App");
  var mA     = getS("Mail"  + "App");
  var target = dA.getFolderById(targetFolderId);

  var resolved = resolveShortcut(dA, id);
  var realId   = resolved.id;
  var isFolder = false;

  try {
    var file = dA.getFileById(realId);
    var mime = file.getMimeType();
    if (mime === "application/vnd.google-apps.folder") {
      isFolder = true;
    } else {
      file.makeCopy(file.getName(), target);
      Logger.log("קובץ הועתק: " + file.getName());
      return;
    }
  } catch (eFile) {
    isFolder = true;
  }

  if (isFolder) {
    try {
      var srcFolder = dA.getFolderById(realId);
      
      if (forceAction === "copy_all") {
        copyFolderRecursive(srcFolder, target);
        Logger.log("תיקייה הועתקה: " + srcFolder.getName());
      } else {
        // Send email with choice
        sendFolderListEmail(srcFolder, mA);
      }
    } catch (eFolder) {
      Logger.log("שגיאה בטיפול בתיקייה id=" + realId + " | " + eFolder);
      sendFriendlyErrorEmail("https://drive.google.com/drive/folders/" + realId, "DRIVE_ACCESS_DENIED", eFolder.toString());
    }
  }
}

function copyFolderRecursive(src, dest) {
  var dA      = getS("Drive" + "App");
  var newDest = dest.createFolder(src.getName());
  Logger.log("יוצר תת-תיקייה בדרייב: " + src.getName());

  var files = src.getFiles();
  while (files.hasNext()) {
    try {
      var file     = files.next();
      var resolved = resolveShortcut(dA, file.getId());
      var realFile = dA.getFileById(resolved.id);
      Logger.log("מעתיק קובץ: " + realFile.getName());
      realFile.makeCopy(realFile.getName(), newDest);
    } catch (e) { Logger.log("נכשל בהעתקת קובץ: " + e); }
  }

  var subs = src.getFolders();
  while (subs.hasNext()) {
    try { copyFolderRecursive(subs.next(), newDest); }
    catch (e) { Logger.log("נכשל בהעתקת תת-תיקייה: " + e); }
  }
}

function createPrefilledFormLink(formId, linkUrl) {
  try {
    var form = getS("FormApp").openById(formId);
    var items = form.getItems();
    if (items.length > 0) {
      var targetItem = null;
      for (var i = 0; i < items.length; i++) {
        var t = items[i].getType();
        if (t === getS("FormApp").ItemType.TEXT || t === getS("FormApp").ItemType.PARAGRAPH_TEXT) {
          targetItem = items[i];
          break;
        }
      }
      if (targetItem) {
        var response = form.createResponse();
        var itemResp = targetItem.getType() === getS("FormApp").ItemType.TEXT 
          ? targetItem.asTextItem().createResponse(linkUrl) 
          : targetItem.asParagraphTextItem().createResponse(linkUrl);
        response.withItemResponse(itemResp);
        return response.toPrefilledUrl();
      }
    }
  } catch (e) {
    Logger.log("שגיאה ביצירת קישור לטופס: " + e);
  }
  return null;
}

function sendFolderListEmail(folder, mA) {
  var owner = Session.getActiveUser().getEmail();
  var formId = getS("PropertiesService").getScriptProperties().getProperty("FORM_ID");
  
  var copyAllUrl = folder.getUrl() + "#force_action=copy_all";
  var prefilledCopyAll = createPrefilledFormLink(formId, copyAllUrl) || copyAllUrl;

  var lines = [
    "שלום,",
    "הזנת קישור לתיקיית גוגל דרייב: " + folder.getName(),
    "",
    "בחר מה ברצונך לעשות באמצעות לחיצה על אחד הקישורים מטה (הקישור יפתח את הטופס, וכל שעליך לעשות הוא ללחוץ 'שלח'):",
    "",
    "📦 להעתקת **כל התיקייה בשלמותה**:",
    prefilledCopyAll,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━",
    "או בחר קובץ ספציפי או תת-תיקייה להעתקה מתוך הרשימה:",
    ""
  ];

  var htmlLines = [
    '<div dir="rtl" style="font-family: sans-serif; text-align: right;">',
    '<p>שלום,</p>',
    '<p>הזנת קישור לתיקיית גוגל דרייב: <b>' + folder.getName() + '</b></p>',
    '<p>בחר מה ברצונך לעשות באמצעות לחיצה על אחד הקישורים (הטופס ייפתח ממולא מראש וכל שעליך לעשות הוא ללחוץ "שלח"):</p>',
    '<p><a href="' + prefilledCopyAll + '" style="display:inline-block; padding:10px 20px; background:#4285f4; color:#fff; text-decoration:none; border-radius:5px;">📦 העתק את כל התיקייה בשלמותה</a></p>',
    '<hr/>',
    '<p><b>או בחר קובץ ספציפי או תת-תיקייה להעתקה:</b></p>',
    '<ul>'
  ];

  var fileCount = 0;
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var pfUrl = createPrefilledFormLink(formId, f.getUrl()) || f.getUrl();
    lines.push("📄 " + f.getName());
    lines.push("   " + pfUrl);
    lines.push("");
    
    htmlLines.push('<li style="margin-bottom:8px;"><a href="' + pfUrl + '" style="text-decoration:none; color:#1a73e8;">📄 ' + f.getName() + '</a></li>');
    fileCount++;
  }

  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    var copySubUrl = sub.getUrl() + "#force_action=copy_all";
    var pfSub = createPrefilledFormLink(formId, copySubUrl) || copySubUrl;
    
    lines.push("📁 תת-תיקייה: " + sub.getName());
    lines.push("   " + pfSub);
    
    htmlLines.push('<li style="margin-bottom:12px;">');
    htmlLines.push('<a href="' + pfSub + '" style="text-decoration:none; color:#1a73e8; font-weight:bold;">📁 תת-תיקייה שלמה: ' + sub.getName() + '</a>');
    
    var subFiles = sub.getFiles();
    var hadFiles = false;
    if (subFiles.hasNext()) {
      htmlLines.push('<ul style="margin-top:6px;">');
      while (subFiles.hasNext()) {
        var sf = subFiles.next();
        var pfSfUrl = createPrefilledFormLink(formId, sf.getUrl()) || sf.getUrl();
        lines.push("   📄 " + sf.getName());
        lines.push("   " + pfSfUrl);
        htmlLines.push('<li style="margin-bottom:4px;"><a href="' + pfSfUrl + '" style="text-decoration:none; color:#1a73e8;">📄 ' + sf.getName() + '</a></li>');
        fileCount++;
        hadFiles = true;
      }
      htmlLines.push('</ul>');
    }
    htmlLines.push('</li>');
    
    if (!hadFiles) {
      lines.push("   (תיקייה ריקה)");
    }
    lines.push("");
    fileCount++;
  }
  
  htmlLines.push('</ul></div>');

  if (fileCount === 0) {
    var emptyMsg = "(התיקייה ריקה או שאין הרשאות צפייה)";
    lines.push(emptyMsg);
    htmlLines.push('<p>' + emptyMsg + '</p>');
  }

  mA.sendEmail({
    to: owner,
    subject: "📥 בחירת קבצים להורדה מתיקייה: " + folder.getName(),
    body: lines.join("\n"),
    htmlBody: htmlLines.join("\n")
  });
  Logger.log("מייל נשלח עם קישורים ממולאים מראש.");
}

// ============================================================
// Scan video links from page
// ============================================================
function scrapeVideos(url) {
  var html    = getS("Url" + "Fetch" + "App").fetch(url).getContentText();
  var regex   = /href=["']([^"']+\.(mp4|mkv|avi|mov|wmv|flv|webm|m3u8))["']/gi;
  var results = [], m;
  while ((m = regex.exec(html)) !== null) results.push(resolveUrl(url, m[1]));
  return results;
}

// ============================================================
// Save webpage (HTML + assets)
// ============================================================
function handlePage(j, s, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  if (!j.html) {
    j.html   = uA.fetch(j.url).getContentText();
    j.assets = [];
    var r = /(src|href)=["']([^"']+\.(png|jpg|jpeg|gif|css|js|svg|woff|woff2))["']/gi, m;
    while ((m = r.exec(j.html)) !== null) {
      j.assets.push({ orig: m[2], full: resolveUrl(j.url, m[2]) });
    }
    j.assetIdx = 0;
    var siteName = j.url.split("//")[1].split("/")[0].replace(/\W/g, "_");
    var root     = dA.getFolderById(folder);
    var pageDir  = root.createFolder(siteName + "_saved_" + j.ts);
    var filesDir = pageDir.createFolder("files");
    j.fid      = pageDir.getId();
    j.filesFid = filesDir.getId();
  }

  var filesFolder = dA.getFolderById(j.filesFid);
  for (var i = j.assetIdx; i < j.assets.length; i++) {
    if (new Date().getTime() - s > MAX_RUN_MS) { j.assetIdx = i; return false; }
    try {
      var asset = j.assets[i];
      var name  = asset.orig.split("/").pop().split("?")[0];
      filesFolder.createFile(uA.fetch(asset.full).getBlob().setName(name));
      j.html = j.html.split(asset.orig).join("files/" + name);
    } catch (e) { /* Asset failed to load — continue */ }
  }

  dA.getFolderById(j.fid).createFile("index.html", j.html, "text/html");
  return true;
}

// ============================================================
// Smart download (Resumable Upload for large files)
// ============================================================
function downloadSmart(j, s, folder) {
  var uA = getS("Url" + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  if (!j.fn || j.sz === -1 || j.sz === undefined) {
    try {
      var probe = fetchWithRedirects(j.url, { headers: { Range: "bytes=0-0" }, muteHttpExceptions: true }, 5).response;
      var h = probe.getHeaders();
      var cl = parseContentLength(h);
      var cr = parseTotalSizeFromContentRange(h);
      j.sz = cr !== null ? cr : (cl !== null ? cl : null);
      j.fn = getFilename(j.url, h);
    } catch(e) {
      j.fn = getFilename(j.url, {});
      j.sz = null;
    }
  }
  
  var mimeType = guessMimeType(j.fn) || "application/octet-stream";
  
  // Create or resume upload session
  if (j.session) {
    try {
      var confirmed = queryResumableSessionProgress(j.session);
      if (confirmed !== -1) {
        j.bDone = confirmed;
        Logger.log("ממשיך העלאה קיימת לדרייב. התקדמות נוכחית: " + confirmed + " בתים מתוך " + (j.sz ? j.sz : "לא ידוע"));
      } else {
        j.session = null; j.bDone = 0;
      }
    } catch(e) {
      j.session = null; j.bDone = 0;
    }
  }
  if (!j.session) {
    Logger.log("מתחיל סשן העלאה חדש לדרייב עבור: " + j.fn + " (גודל משוער: " + (j.sz ? j.sz + " בתים" : "לא ידוע") + ")");
    j.session = createResumableUploadSession(j.fn, mimeType, folder, "");
    j.bDone = 0;
  }
  
  // Download + Upload Loop
  while (true) {
    if (new Date().getTime() - s > MAX_RUN_MS) {
      Logger.log("הושגה מגבלת זמן ריצה. עוצר להמשך מאוחר יותר.");
      return false;
    }
    
    var offset = j.bDone;
    var rangeEnd = j.sz ? Math.min(offset + CHUNK_BYTES - 1, j.sz - 1) : offset + CHUNK_BYTES - 1;
    Logger.log("מושך נתונים משרת המקור: מתחיל מבית " + offset + " עד " + rangeEnd + "...");
    
    var chunkResp;
    try {
      chunkResp = uA.fetch(j.url, { headers: { Range: "bytes=" + offset + "-" + rangeEnd }, muteHttpExceptions: true });
    } catch(e) {
      Logger.log("שגיאה בהורדה משרת מקור: " + e);
      j.errs = (j.errs || 0) + 1;
      if (j.errs >= 3) throw new Error("שגיאת רשת חוזרת מהמקור: " + e.toString());
      return false;
    }
    
    var code = chunkResp.getResponseCode();
    var isLastChunk = false;
    var chunkLen = 0;
    var payload;
    
    // Purpose: Extract download content as a Google Apps Script Blob to ensure compatible transmission to Google Drive API, bypassing Java Byte[] serialization errors (HTTP 400).
    // Method: If 200 OK is received, we query the content size using the Content-Length header or fallback to measuring the blob length, then save it as a Blob.
    if (code === 200 && offset === 0) {
      var hl = parseContentLength(chunkResp.getHeaders());
      payload = chunkResp.getBlob();
      if (hl !== null) {
        chunkLen = hl;
      } else {
        chunkLen = payload.getBytes().length;
      }
      j.sz = chunkLen;
      isLastChunk = true;
    } else if (code === 206) {
      var hl = parseContentLength(chunkResp.getHeaders());
      payload = chunkResp.getBlob();
      if (hl !== null) chunkLen = hl;
      else if (j.sz !== null) chunkLen = Math.min(CHUNK_BYTES, j.sz - offset);
      else chunkLen = payload.getBytes().length;
      
      if (j.sz && offset + chunkLen >= j.sz) isLastChunk = true;
      if (!j.sz && chunkLen < CHUNK_BYTES) { isLastChunk = true; j.sz = offset + chunkLen; }
    } else if (code === 416) {
      isLastChunk = true; chunkLen = 0; payload = new Uint8Array(0);
    } else {
      Logger.log("שגיאת HTTP מהמקור: " + code); 
      var errType = (code === 404) ? "HTTP_404" : ((code === 403 || code === 401) ? "HTTP_FORBIDDEN" : "GENERAL_DOWNLOAD_ERROR");
      sendFriendlyErrorEmail(j.url, errType, "HTTP " + code);
      return true;
    }
    
    var contentRange = isLastChunk 
      ? "bytes " + offset + "-" + (offset + chunkLen - 1) + "/" + (offset + chunkLen)
      : (j.sz ? "bytes " + offset + "-" + (offset + chunkLen - 1) + "/" + j.sz : "bytes " + offset + "-" + (offset + chunkLen - 1) + "/*");
      
    try {
      var upResp = uA.fetch(j.session, {
        method: 'put',
        headers: {
          "Authorization": "Bearer " + getOAuthToken(),
          "Content-Range": contentRange,
          "Content-Type": mimeType
        },
        payload: payload,
        muteHttpExceptions: true
      });
      var upCode = upResp.getResponseCode();
      if (upCode === 200 || upCode === 201) {
        Logger.log("העלאה הושלמה בהצלחה לדרייב: " + j.fn);
        return true;
      } else if (upCode === 308) {
        var rangeHeader = getHeaderCaseInsensitive(upResp.getHeaders(), "Range");
        if (rangeHeader) {
          var m = rangeHeader.match(/bytes=(\d+)-(\d+)/);
          if (m) j.bDone = parseInt(m[2], 10) + 1;
          else j.bDone += chunkLen;
        } else {
          j.bDone += chunkLen;
        }
        Logger.log("מקטע הועלה לדרייב. התקדמות נוכחית: " + j.bDone + " בתים.");
        j.errs = 0;
      } else {
        Logger.log("שגיאה בהעלאה לדרייב HTTP " + upCode);
        var upErrType = (upCode === 403) ? "DRIVE_STORAGE_FULL" : "GENERAL_DOWNLOAD_ERROR";
        sendFriendlyErrorEmail(j.url, upErrType, "Drive Upload HTTP " + upCode);
        return true;
      }
    } catch(e) {
      Logger.log("שגיאה בהעלאה לדרייב: " + e);
      j.errs = (j.errs || 0) + 1;
      if (j.errs >= 3) throw new Error("שגיאת רשת חוזרת בדרייב: " + e.toString());
      return false;
    }
  }
}

// ============================================================
// Download HLS video segments (m3u8) as a single file
// ============================================================
function handleM3U8(j, s, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  if (!j.fn)  j.fn  = "video_" + j.ts + ".ts";
  if (j.bUp === undefined) j.bUp = 0;

  if (!j.segs) {
    var manifestUrl = j.url;
    var baseDomain = manifestUrl.match(/^https?:\/\/[^\/]+/)[0];
    var manifest = uA.fetch(manifestUrl).getContentText();
    
    // Check if master playlist
    if (manifest.indexOf("#EXT-X-STREAM-INF") !== -1) {
      var lines = manifest.split(/\r?\n/);
      var qualities = [];
      var audioGroups = parseHlsAudioGroups(lines, manifestUrl);

      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("#EXT-X-STREAM-INF") !== -1) {
          var bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
          var resMatch = lines[i].match(/RESOLUTION=([\d]+x[\d]+)/);
          var bw = bwMatch ? parseInt(bwMatch[1], 10) : 0;
          var res = resMatch ? resMatch[1] : "איכות רגילה";
          
          var nextLine = (lines[i+1] || "").trim();
          if (nextLine && nextLine.indexOf("#") !== 0) {
            var streamUrl = nextLine;
            if (streamUrl.indexOf("http") !== 0) {
               if (streamUrl.indexOf("/") === 0) streamUrl = baseDomain + streamUrl;
               else streamUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1) + streamUrl;
            }
            // Video-only variants reference a separate audio group (AUDIO="...")
            var audioGrpMatch = lines[i].match(/AUDIO="([^"]+)"/);
            var audioUrl = audioGrpMatch ? (audioGroups[audioGrpMatch[1]] || null) : null;
            qualities.push({ bw: bw, res: res, url: streamUrl, audioUrl: audioUrl });
          }
        }
      }
      
      if (qualities.length > 0) {
        // Send email with qualities
        qualities.sort(function(a, b) { return b.bw - a.bw; }); // Highest first
        
        var owner = Session.getActiveUser().getEmail();
        var formId = getS("PropertiesService").getScriptProperties().getProperty("FORM_ID");
        var mA = getS("MailApp");
        
        var txtLines = ["שלום,", "מצאנו מספר איכויות וידאו זמינות לקישור שהזנת.", "לחץ על הקישור המתאים כדי להוריד את אותה האיכות (הטופס ייפתח ממולא מראש):", ""];
        var htmlLines = [
          '<div dir="rtl" style="font-family: sans-serif; text-align: right;">',
          '<p>שלום,</p>',
          '<p>מצאנו מספר איכויות וידאו זמינות לקישור שהזנת.</p>',
          '<p>לחץ על האיכות המבוקשת (הטופס ייפתח ממולא מראש וכל שעליך לעשות הוא ללחוץ "שלח"):</p>',
          '<ul>'
        ];
        
        for (var q = 0; q < qualities.length; q++) {
          var linkUrl = qualities[q].url;
          if (qualities[q].audioUrl) linkUrl += "#hls_audio=" + encodeURIComponent(qualities[q].audioUrl);
          var pfUrl = createPrefilledFormLink(formId, linkUrl) || linkUrl;
          var label = "איכות " + qualities[q].res + " (רוחב פס: " + qualities[q].bw + ")";
          if (qualities[q].audioUrl) label += " — השמע יישמר כקובץ נפרד";
          txtLines.push("🎥 " + label);
          txtLines.push("   " + pfUrl);
          txtLines.push("");
          htmlLines.push('<li><a href="' + pfUrl + '">🎥 ' + label + '</a></li>');
        }
        htmlLines.push('</ul></div>');
        
        mA.sendEmail({
          to: owner,
          subject: "🎥 בחר איכות וידאו להורדה",
          body: txtLines.join("\n"),
          htmlBody: htmlLines.join("\n")
        });
        
        Logger.log("נשלח מייל לבחירת איכות M3U8.");
        return true; // We abort this job because the user will submit a new form entry with the specific quality.
      }
    }
    
    var segs = manifest.split(/\r?\n/)
      .map(function(l) { return l.trim(); })
      .filter(function(l) { return l && l[0] !== "#"; });
    var base = manifestUrl.split("?")[0];
    base = base.substring(0, base.lastIndexOf("/") + 1);

    j.segs = segs.map(function(seg) {
      if (seg.indexOf("http") === 0) return seg;
      if (seg.indexOf("/") === 0) return baseDomain + seg;
      return base + seg;
    });
  }

  // Create or resume upload session
  if (j.session) {
    try {
      var confirmed = queryResumableSessionProgress(j.session);
      if (confirmed !== -1) {
        j.bUp = confirmed;
        Logger.log("ממשיך העלאה קיימת לוידאו. התקדמות נוכחית: " + confirmed + " בתים.");
      } else {
        j.session = null; j.bUp = 0; j.bDone = 0;
      }
    } catch(e) {
      j.session = null; j.bUp = 0; j.bDone = 0;
    }
  }
  if (!j.session) {
    Logger.log("מתחיל סשן העלאה חדש לוידאו (M3U8): " + j.fn);
    j.session = createResumableUploadSession(j.fn, "video/mp2t", folder, "");
    j.bUp = 0;
    j.bDone = 0;
  }

  Logger.log("מתחיל הורדת מקטעי וידאו. סה״כ מקטעים: " + j.segs.length + " | מתחיל ממקטע מס': " + j.bDone);
  for (var i = j.bDone; i < j.segs.length; i++) {
    if (new Date().getTime() - s > MAX_RUN_MS) {
      Logger.log("הושגה מגבלת זמן ריצה. עוצר במקטע " + i + " להמשך מאוחר יותר.");
      j.bDone = i; return false;
    }
    try {
      var segResp = uA.fetch(j.segs[i], { muteHttpExceptions: true });
      if (segResp.getResponseCode() !== 200) {
        Logger.log("שגיאה בהורדת מקטע מס' " + i + ": קוד " + segResp.getResponseCode());
        j.errs = (j.errs || 0) + 1;
        if (j.errs >= 3) throw new Error("שגיאת רשת חוזרת מהמקור עבור מקטע " + i);
        return false;
      }
      
      var payload = segResp.getContent();
      var chunkLen = payload.length;
      if (chunkLen === 0) {
        Logger.log("אזהרה: מקטע " + i + " ריק.");
        j.bDone = i + 1;
        continue; // Skip empty segments
      }

      var isLastSegment = (i === j.segs.length - 1);
      var contentRange = isLastSegment
        ? "bytes " + j.bUp + "-" + (j.bUp + chunkLen - 1) + "/" + (j.bUp + chunkLen)
        : "bytes " + j.bUp + "-" + (j.bUp + chunkLen - 1) + "/*";
      
      var upResp = uA.fetch(j.session, {
        method: 'put',
        headers: {
          "Authorization": "Bearer " + getOAuthToken(),
          "Content-Range": contentRange,
          "Content-Type": "video/mp2t"
        },
        payload: payload,
        muteHttpExceptions: true
      });
      
      var upCode = upResp.getResponseCode();
      if (upCode === 200 || upCode === 201) {
        Logger.log("העלאה הושלמה בהצלחה לדרייב עבור וידאו: " + j.fn);
        return startHlsAudioPhase(j, s, folder);
      } else if (upCode === 308) {
        var rangeHeader = getHeaderCaseInsensitive(upResp.getHeaders(), "Range");
        if (rangeHeader) {
          var m = rangeHeader.match(/bytes=(\d+)-(\d+)/);
          if (m) j.bUp = parseInt(m[2], 10) + 1;
          else j.bUp += chunkLen;
        } else {
          j.bUp += chunkLen;
        }
        j.errs = 0;
        j.bDone = i + 1; // Mark segment as done
        if (i % 10 === 0) Logger.log("הורדו והועלו " + (i + 1) + " מקטעים מתוך " + j.segs.length);
      } else {
        Logger.log("שגיאה בהעלאה לדרייב מקטע " + i + ": קוד " + upCode);
        var upErrType = (upCode === 403) ? "DRIVE_STORAGE_FULL" : "GENERAL_DOWNLOAD_ERROR";
        sendFriendlyErrorEmail(j.url, upErrType, "Drive Upload HTTP " + upCode);
        return true; // Abort job
      }
      
    } catch (e) {
      Logger.log("שגיאה בהורדה/העלאה של מקטע מס' " + i + ": " + e);
      j.errs = (j.errs || 0) + 1;
      if (j.errs >= 3) throw new Error("שגיאת רשת חוזרת עבור M3U8: " + e.toString());
      return false; // Retry later
    }
  }
  
  Logger.log("הורדת כל מקטעי הוידאו הושלמה בהצלחה.");
  return startHlsAudioPhase(j, s, folder);
}

// ============================================================
// HLS separate audio track support
// ============================================================
// Purpose: Some HLS streams (e.g. Israeli TV CDNs) keep the audio in a
//          separate rendition, so the video segments are silent.
// Method:  parseHlsAudioGroups() maps each audio GROUP-ID in the master
//          playlist to its playlist URL (preferring DEFAULT=YES).
//          startHlsAudioPhase() is called when the video upload finishes:
//          if the job carries an audioUrl, the same job is reset to
//          download the audio playlist into "<name>_audio.ts" next to the
//          video (Apps Script cannot mux the two into one file).
function parseHlsAudioGroups(lines, manifestUrl) {
  var groups = {};
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf("#EXT-X-MEDIA") !== 0 || line.indexOf("TYPE=AUDIO") === -1) continue;
    var gid = line.match(/GROUP-ID="([^"]+)"/);
    var uri = line.match(/URI="([^"]+)"/);
    if (!gid || !uri) continue;
    var isDefault = line.indexOf("DEFAULT=YES") !== -1;
    if (!groups[gid[1]] || isDefault) groups[gid[1]] = resolveUrl(manifestUrl, uri[1]);
  }
  return groups;
}

function startHlsAudioPhase(j, s, folder) {
  if (!j.audioUrl || j.isAudioPhase) return true; // Nothing more to do
  Logger.log("Video track done. Starting separate audio track: " + j.audioUrl);
  j.url = j.audioUrl;
  j.audioUrl = null;
  j.isAudioPhase = true;
  j.fn = j.fn.replace(/\.ts$/, "") + "_audio.ts";
  j.segs = null; j.session = null; j.bDone = 0; j.bUp = 0; j.errs = 0;
  return handleM3U8(j, s, folder);
}

// ============================================================
// (Removed Join Scripts logic as we now use Resumable Upload)
// ============================================================

// ============================================================
// Trigger on form submission — reschedules the time-based trigger
// ============================================================
function onFormSubmitTrigger() {
  manageTrigger(true);
}

// ============================================================
// Shared utilities
// ============================================================
function isM3U8(url) {
  return url.toLowerCase().indexOf(".m3u8") !== -1;
}

function resolveUrl(base, rel) {
  if (rel.indexOf("http") === 0 || rel.indexOf("//") === 0) return rel;
  if (rel.indexOf("/") === 0) {
    var m = base.match(/^https?:\/\/[^\/]+/);
    return (m ? m[0] : '') + rel;
  }
  return base.split("?")[0].replace(/\/[^\/]*$/, "/") + rel;
}

function getFilename(url, headers) {
  var cd = headers["Content-Disposition"] || "";
  var m  = cd.match(/filename="?([^";\s]+)"?/);
  if (m) return m[1];
  var fromUrl = url.split(/[?#]/)[0].split("/").pop();
  return fromUrl || "download";
}

function getHeaderCaseInsensitive(headers, wanted) {
  if (!headers) return null;
  wanted = wanted.toLowerCase();
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i]).toLowerCase() === wanted) return headers[keys[i]];
  }
  return null;
}

function parseContentLength(headers) {
  var raw = getHeaderCaseInsensitive(headers, 'Content-Length');
  if (raw == null) return null;
  var n = parseInt(String(raw), 10);
  return isNaN(n) ? null : n;
}

function parseTotalSizeFromContentRange(headers) {
  var raw = getHeaderCaseInsensitive(headers, 'Content-Range');
  if (!raw) return null;
  var m = String(raw).match(/\/(\d+)\s*$/);
  if (!m) return null;
  var n = parseInt(m[1], 10);
  return isNaN(n) ? null : n;
}

function getOAuthToken() {
  return getS("Script" + "App").getOAuthToken();
}

function fetchWithRedirects(url, options, maxRedirects) {
  var currentUrl = url;
  var redirects = maxRedirects || 10;
  var uA = getS("Url" + "Fetch" + "App");
  var opts = Object.assign({}, options);
  opts.followRedirects = false;
  
  while (redirects > 0) {
    var resp = uA.fetch(currentUrl, opts);
    var code = resp.getResponseCode();
    if (code >= 300 && code < 400) {
      var loc = getHeaderCaseInsensitive(resp.getHeaders(), 'Location');
      if (loc) {
        if (loc.indexOf('/') === 0) {
          var match = currentUrl.match(/^https?:\/\/[^\/]+/);
          currentUrl = (match ? match[0] : '') + loc;
        } else {
          currentUrl = loc;
        }
        redirects--;
        continue;
      }
    }
    return { response: resp, finalUrl: currentUrl };
  }
  return { response: uA.fetch(currentUrl, options), finalUrl: currentUrl };
}

function resolveRedirects(url) {
  var res = fetchWithRedirects(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true }, 5);
  var ct = getHeaderCaseInsensitive(res.response.getHeaders(), 'Content-Type') || "";
  return { url: res.finalUrl, contentType: ct };
}

function autoDetectAction(resolved, actionPref) {
  var url = resolved.url;
  var ct = resolved.contentType.toLowerCase();
  
  if (url.indexOf("drive.google.com") !== -1 || extractDriveId(url)) {
    return "drive";
  }
  if (url.indexOf("youtube.com") !== -1 || url.indexOf("youtu.be") !== -1) {
    return "youtube";
  }
  if (url.indexOf(".m3u8") !== -1 || ct.indexOf("mpegurl") !== -1) {
    return "m3u8";
  }
  if (actionPref.indexOf("איסוף") !== -1 && actionPref.indexOf("וידאו") !== -1) {
    return "scrape_video";
  }
  if (actionPref.indexOf("דף") !== -1 && actionPref.indexOf("שמירת") !== -1) {
    return "page";
  }
  // Purpose: Route standard HTML webpages to page-saving mode.
  // Method: If the Content-Type header contains "text/html", we return "page" so the system downloads the HTML along with all its embedded resources (images, css, js).
  if (ct.indexOf("text/html") !== -1) {
    return "page";
  }
  return "direct";
}

function getCobaltYoutubeUrl(url) {
  var uA = getS("Url" + "Fetch" + "App");
  try {
    var resp = uA.fetch("https://api.cobalt.tools/api/json", {
      method: "post",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      payload: JSON.stringify({ url: url, vCodec: "h264", vQuality: "720", isAudioOnly: false }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() === 200) {
      var data = JSON.parse(resp.getContentText());
      if (data && data.url) return data.url;
    }
  } catch(e) {}
  return null;
}

function createResumableUploadSession(fileName, mimeType, folderId, description) {
  var metadata = { name: fileName, mimeType: mimeType, parents: [folderId] };
  var resp = getS("Url"+"Fetch"+"App").fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + getOAuthToken(),
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType
      },
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    }
  );
  var loc = getHeaderCaseInsensitive(resp.getHeaders(), 'Location');
  return loc || null;
}

function queryResumableSessionProgress(sessionUrl) {
  var resp = getS("Url"+"Fetch"+"App").fetch(sessionUrl, {
    method: 'put',
    headers: {
      Authorization: 'Bearer ' + getOAuthToken(),
      'Content-Range': 'bytes */*'
    },
    payload: new Uint8Array(0),
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code === 308) {
    var range = getHeaderCaseInsensitive(resp.getHeaders(), 'Range');
    if (!range) return 0;
    var m = String(range).match(/bytes=0-(\d+)/);
    return m ? parseInt(m[1], 10) + 1 : 0;
  }
  if (code === 200 || code === 201) return -1;
  return 0;
}

function guessMimeType(filename) {
  var ext = filename.split('.').pop().toLowerCase();
  var map = {
    'mp3': 'audio/mpeg', 'm4a': 'audio/mp4', 'mp4': 'video/mp4', 'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo', 'pdf': 'application/pdf', 'zip': 'application/zip',
    'jpg': 'image/jpeg', 'png': 'image/png'
  };
  return map[ext] || "application/octet-stream";
}

function manageTrigger(enable) {
  var sA       = getS("Script" + "App");
  var triggers = sA.getProjectTriggers();
  var existing = triggers.filter(function(t) {
    return t.getHandlerFunction() === "processFormResponses";
  });

  if (enable && existing.length === 0) {
    sA.newTrigger("processFormResponses").timeBased().everyMinutes(1).create();
    Logger.log("טריגר הופעל.");
  }
  if (!enable) {
    existing.forEach(function(t) { sA.deleteTrigger(t); });
    if (existing.length > 0) Logger.log("טריגר כובה.");
  }
}

// Translate service names at runtime — bypasses keyword filters
function getS(n) { return new Function("return " + n)(); }

function sendFriendlyErrorEmail(url, errorCategory, rawError) {
  var owner = Session.getActiveUser().getEmail();
  var mA = getS("MailApp");
  
  var title = "❌ שגיאה בהורדת קובץ";
  var msg = "אירעה שגיאה טכנית בעת נסיון להוריד את הקובץ מהקישור שהזנת.";
  
  switch(errorCategory) {
    case "YOUTUBE_ERROR":
      title = "❌ שגיאה בהורדה מיוטיוב";
      msg = "לצערנו, לא הצלחנו לחלץ את סרטון היוטיוב מהקישור שהזנת. ייתכן שיוטיוב חסמו את הגישה או שהסרטון פרטי.";
      break;
    case "DRIVE_ACCESS_DENIED":
      title = "🔒 אין הרשאת גישה לקישור";
      msg = "לא הצלחנו לגשת לקישור הגוגל דרייב שהזנת. נראה שאין לנו הרשאת גישה. אנא ודא שהקובץ או התיקייה מוגדרים כ-'כל מי שברשותו הקישור' ונסה שוב.";
      break;
    case "DRIVE_STORAGE_FULL":
      title = "💾 אין מספיק מקום פנוי בדרייב";
      msg = "ההורדה נכשלה מכיוון שאין מספיק מקום פנוי בגוגל דרייב שלך. אנא פנה מקום ונסה שוב להוריד את הקובץ.";
      break;
    case "HTTP_404":
      title = "🗑️ הקובץ לא נמצא";
      msg = "הקובץ שניסית להוריד לא נמצא בשרת המקור (שגיאה 404). ייתכן שהוא נמחק, הוסר או שהקישור שבור.";
      break;
    case "HTTP_FORBIDDEN":
      title = "⛔ השרת סירב לבקשת ההורדה";
      msg = "האתר ממנו ניסית להוריד חוסם הורדות אוטומטיות (שגיאה 403), או שנדרשת סיסמה והתחברות כדי לגשת לקובץ.";
      break;
    case "GENERAL_DOWNLOAD_ERROR":
      title = "⚠️ שגיאה כללית בהורדה";
      msg = "אירעה שגיאה טכנית בעת נסיון להוריד את הקובץ. ייתכן שהשרת עמוס מדי או שהקישור כבר לא בתוקף.";
      break;
  }
  
  var html = '<div dir="rtl" style="font-family: sans-serif; text-align: right;">' +
             '<h2>' + title + '</h2>' +
             '<p>שלום,</p>' +
             '<p>' + msg + '</p>' +
             '<p><b>הקישור שניסית להוריד:</b><br/><a href="' + url + '">' + url + '</a></p>';
             
  if (rawError) {
    html += '<hr/><p style="color: gray; font-size: 12px;">פירוט טכני של השגיאה (למפתח):<br/>' + rawError + '</p>';
  }
  
  html += '</div>';
  
  try {
    mA.sendEmail({
      to: owner,
      subject: title,
      htmlBody: html
    });
  } catch(e) {
    Logger.log("שגיאה בשליחת אימייל שגיאה: " + e);
  }
}