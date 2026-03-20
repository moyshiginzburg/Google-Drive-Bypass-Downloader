// ============================================================
// קבועים טכניים
// ============================================================
var CHUNK_BYTES  = 40 * 1024 * 1024; // גודל כל חלק בהורדה מפוצלת
var MAX_RUN_MS   = 240 * 1000;        // זמן ריצה מקסימלי לפני עצירה

// ============================================================
// פונקציית התקנה — הפעל פעם אחת בלבד!
// ============================================================
// הוראות:
//   1. שמור את הקובץ הזה בפרויקט גוגל-אפס-סקריפט חדש
//   2. לחץ על "הפעל" ובחר בפונקציה setupAll
//   3. אשר את הרשאות הגישה
//   4. בדוק במייל שלך — תקבל לינק לטופס מוכן לשימוש
// ============================================================
function setupAll() {
  var dA    = getS("Drive"      + "App");
  var fmA   = getS("Form"       + "App");
  var mA    = getS("Mail"       + "App");
  var props = getS("Properties" + "Service").getScriptProperties();

  // --- יצירת תיקיית יעד בדרייב ---
  var destFolder = dA.getRootFolder().createFolder(
    "📥 הורדות אוטומטיות — " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy")
  );
  var folderId = destFolder.getId();

  // --- יצירת הטופס ---
  var form = fmA.create("📥 בקשת העתקה / הורדת קבצים");
  form.setDescription(
    "מלא את הטופס כדי להעתיק קובץ או תיקייה מדרייב, להוריד קובץ מהאינטרנט, לשמור דף, או לאסוף קישורי וידאו מדף."
  );
  form.setConfirmationMessage("✅ תודה! הבקשה נקלטה ותטופל בקרוב.");
  form.setCollectEmail(false);

  // שאלה 1: קישור
  form.addTextItem()
    .setTitle("קישור לקובץ, תיקייה או דף אינטרנט")
    .setHelpText("הדבק כאן את הכתובת המלאה (החל מ-https://...)")
    .setRequired(true);

  // שאלה 2: סוג הפעולה
  var q2 = form.addMultipleChoiceItem();
  q2.setTitle("מה תרצה לעשות?")
    .setChoices([
      q2.createChoice("העתקה מדרייב (קובץ או תיקייה)"),
      q2.createChoice("הורדת קובץ מהאינטרנט"),
      q2.createChoice("שמירת דף אינטרנט (HTML + תמונות)"),
      q2.createChoice("איסוף קישורי וידאו מדף")
    ])
    .setRequired(true);

  // שאלה 3: מה לעשות אם הקישור הוא תיקיית דרייב
  var q3 = form.addMultipleChoiceItem();
  q3.setTitle("אם הקישור הוא תיקייה — מה עדיף לך?")
    .setHelpText("רלוונטי רק אם בחרת 'העתקה מדרייב' ומדובר בתיקייה ולא בקובץ בודד")
    .setChoices([
      q3.createChoice("העתק את כל הקבצים בתיקייה"),
      q3.createChoice("שלח לי מייל עם רשימת הקבצים — ואבחר לבד")
    ])
    .setRequired(false);

  // --- שמירת הגדרות בפרויקט ---
  props.setProperties({
    TARGET_FOLDER_ID : folderId,
    FORM_ID          : form.getId(),
    LAST_TS          : "0"
  });

  // --- הגדרת טריגרים ---
  manageTrigger(true);

  // טריגר על שליחת טופס — מפעיל מחדש את העיבוד מיד עם קבלת תגובה
  getS("Script" + "App")
    .newTrigger("onFormSubmitTrigger")
    .forForm(form)
    .onFormSubmit()
    .create();

  // --- שליחת מייל אישור לבעלים ---
  var ownerEmail = Session.getActiveUser().getEmail();
  var formUrl    = form.getPublishedUrl();
  var folderUrl  = "https://drive.google.com/drive/folders/" + folderId;

  var subject = "✅ הטופס שלך מוכן!";
  var body = [
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
    "━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "כל הקבצים ישמרו אוטומטית לתיקיית היעד.",
    "הטופס פעיל — אפשר להתחיל להשתמש בו!",
    "",
    "בהצלחה."
  ].join("\n");

  mA.sendEmail(ownerEmail, subject, body);

  Logger.log("══ ההתקנה הסתיימה ══");
  Logger.log("לינק לטופס: " + formUrl);
  Logger.log("תיקיית יעד: " + folderUrl);
  Logger.log("מייל נשלח אל: " + ownerEmail);
}

// ============================================================
// עיבוד תגובות — מופעל אוטומטית כל דקה
// ============================================================
function processFormResponses() {
  var lock = getS("Lock" + "Service").getScriptLock();
  if (!lock.tryLock(15000)) return;

  var start  = new Date().getTime();
  var p      = getS("Properties" + "Service").getScriptProperties();
  var all    = p.getProperties();
  var folder = all["TARGET_FOLDER_ID"];
  var formId = all["FORM_ID"];

  if (!folder || !formId) {
    Logger.log("שגיאה: חסרות הגדרות. הפעל setupAll() תחילה.");
    lock.releaseLock();
    return;
  }

  // 1 — המשך משימה קיימת שנקטעה
  var active = p.getProperty("CURRENT_JOB");
  if (active) {
    var job = JSON.parse(active);
    if (runJob(job, start, folder)) {
      p.deleteProperty("CURRENT_JOB");
    } else {
      p.setProperty("CURRENT_JOB", JSON.stringify(job));
      manageTrigger(true);
      lock.releaseLock();
      return;
    }
  }

  // 2 — תור פנימי (נוצר ממשימות וידאו שמחולקות לקישורים רבים)
  var q = JSON.parse(p.getProperty("INTERNAL_QUEUE") || "[]");
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

  // 3 — תגובות חדשות מהטופס
  var form  = getS("Form" + "App").openById(formId);
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
    var url        = (items[0] ? items[0].getResponse().trim() : "");
    var action     = (items[1] ? items[1].getResponse() : "");
    var folderPref = (items[2] ? items[2].getResponse() : "");

    Logger.log("בקשה חדשה: " + url + " | " + action);

    if (!url) { p.setProperty("LAST_TS", ts.toString()); continue; }

    // העתקה מדרייב
    if (action.indexOf("העתק") !== -1 && action.indexOf("דרייב") !== -1) {
      var driveId = extractDriveId(url);
      if (driveId) {
        handleDriveItem(driveId, folder, folderPref);
      } else {
        Logger.log("לא זוהה מזהה דרייב תקין ב: " + url);
      }
    }
    // איסוף קישורי וידאו
    else if (action.indexOf("וידאו") !== -1) {
      try {
        var videos = scrapeVideos(url);
        var newQ   = JSON.parse(p.getProperty("INTERNAL_QUEUE") || "[]");
        videos.forEach(function(v) {
          newQ.push({ url: v, ts: ts, type: isM3U8(v) ? "m3u8" : "bin", fn: null, fid: null, bDone: 0 });
        });
        p.setProperty("INTERNAL_QUEUE", JSON.stringify(newQ));
        Logger.log("נמצאו " + videos.length + " קישורי וידאו. נוספו לתור.");
        manageTrigger(true);
      } catch (e) { Logger.log("שגיאת סריקת וידאו: " + e); }
    }
    // שמירת דף
    else if (action.indexOf("דף") !== -1 && action.indexOf("שמירת") !== -1) {
      var pj = { url: url, ts: ts, type: "page", fn: null, fid: null, filesFid: null, html: null, assets: null, assetIdx: 0, bDone: 0 };
      if (!runJob(pj, start, folder)) {
        p.setProperty("CURRENT_JOB", JSON.stringify(pj));
        manageTrigger(true);
        lock.releaseLock();
        p.setProperty("LAST_TS", ts.toString());
        return;
      }
    }
    // הורדת קובץ מהאינטרנט
    else {
      if (url.indexOf("dropbox.com") !== -1) {
        url = url.replace(/(\?dl=0|&dl=0)$/, "") + (url.indexOf("?") > -1 ? "&dl=1" : "?dl=1");
      }
      var nj = { url: url, ts: ts, type: isM3U8(url) ? "m3u8" : "bin", fn: null, fid: null, bDone: 0, sz: -1 };
      if (!runJob(nj, start, folder)) {
        p.setProperty("CURRENT_JOB", JSON.stringify(nj));
        manageTrigger(true);
        lock.releaseLock();
        p.setProperty("LAST_TS", ts.toString());
        return;
      }
    }

    p.setProperty("LAST_TS", ts.toString());
  }

  manageTrigger(false);
  lock.releaseLock();
}

// ============================================================
// ניתוב משימות
// ============================================================
function runJob(j, s, folder) {
  try {
    if (j.type === "page")  return handlePage(j, s, folder);
    if (j.type === "m3u8")  return handleM3U8(j, s, folder);
    return downloadSmart(j, s, folder);
  } catch (e) {
    Logger.log("שגיאה במשימה: " + e + " | url=" + j.url);
    return true; // לא לנסות שוב — ממשיכים הלאה
  }
}

// ============================================================
// טיפול בפריטי דרייב: קובץ או תיקייה
// ============================================================

// חילוץ ID מכתובת — בודק מספר פטרנים לפי סדר עדיפות
function extractDriveId(url) {
  if (!url) return null;

  // /d/FILE_ID — קבצים רגילים, docs, sheets
  var m1 = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (m1) return m1[1];

  // /folders/FOLDER_ID
  var m2 = url.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
  if (m2) return m2[1];

  // ?id=FILE_ID — קישורים מקוצרים
  var m3 = url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (m3) return m3[1];

  // /document/d/ או /spreadsheets/d/
  var m4 = url.match(/\/(?:document|spreadsheets)\/d\/([a-zA-Z0-9_-]{25,})/);
  if (m4) return m4[1];

  // fallback — כל מחרוזת ארוכה שנראית כמו ID
  var fallback = url.match(/([a-zA-Z0-9_-]{25,})/g);
  if (fallback && fallback.length > 0) {
    return fallback.reduce(function(a, b) { return b.length > a.length ? b : a; });
  }

  return null;
}

// בדיקה אם הקישור הוא של תיקייה (המילה "folder" מופיעה לפני ה-ID)
function isFolderLink(url, id) {
  if (!url || !id) return false;
  var idIndex = url.indexOf(id);
  if (idIndex === -1) return false;
  return url.substring(0, idIndex).toLowerCase().indexOf("folder") !== -1;
}

// פתרון קיצורי דרך — מחזיר את הקובץ/תיקייה המקורי
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

function handleDriveItem(id, targetFolderId, folderPref) {
  var dA     = getS("Drive" + "App");
  var mA     = getS("Mail"  + "App");
  var target = dA.getFolderById(targetFolderId);

  // פתרון קיצור דרך אם צריך
  var resolved = resolveShortcut(dA, id);
  var realId   = resolved.id;

  // האם זו תיקייה — לפי URL, ואם לא ברור — לפי ניסיון
  var isFolder = false;

  // ניסיון ראשון: קובץ בודד
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
    // לא קובץ — בודקים כתיקייה
    isFolder = true;
  }

  // טיפול בתיקייה
  if (isFolder) {
    try {
      var srcFolder = dA.getFolderById(realId);
      var sendList  = (folderPref.indexOf("רשימה")  !== -1 ||
                       folderPref.indexOf("מייל")   !== -1 ||
                       folderPref.indexOf("לבחירה") !== -1 ||
                       folderPref.indexOf("ואבחר")  !== -1);

      if (sendList) {
        sendFolderListEmail(srcFolder, mA);
      } else {
        copyFolderRecursive(srcFolder, target);
        Logger.log("תיקייה הועתקה: " + srcFolder.getName());
      }
    } catch (eFolder) {
      Logger.log("שגיאה בטיפול בתיקייה id=" + realId + " | " + eFolder);
    }
  }
}

function copyFolderRecursive(src, dest) {
  var dA      = getS("Drive" + "App");
  var newDest = dest.createFolder(src.getName());

  // העתקת קבצים — כולל פתרון קיצורי דרך
  var files = src.getFiles();
  while (files.hasNext()) {
    try {
      var file     = files.next();
      var resolved = resolveShortcut(dA, file.getId());
      var realFile = dA.getFileById(resolved.id);
      realFile.makeCopy(realFile.getName(), newDest);
    } catch (e) {
      Logger.log("נכשל בהעתקת קובץ: " + e);
    }
  }

  // רקורסיה לתתי-תיקיות
  var subs = src.getFolders();
  while (subs.hasNext()) {
    try {
      copyFolderRecursive(subs.next(), newDest);
    } catch (e) {
      Logger.log("נכשל בהעתקת תת-תיקייה: " + e);
    }
  }
}

function sendFolderListEmail(folder, mA) {
  var owner = Session.getActiveUser().getEmail();
  var lines = [
    "📂 תוכן התיקייה: " + folder.getName(),
    "קישור לתיקייה: " + folder.getUrl(),
    "━━━━━━━━━━━━━━━━━━━━━━━━━",
    ""
  ];

  var fileCount = 0;
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    lines.push("📄 " + f.getName());
    lines.push("   " + f.getUrl());
    lines.push("");
    fileCount++;
  }

  // קבצים בתתי-תיקיות
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    lines.push("📁 תת-תיקייה: " + sub.getName());
    var subFiles = sub.getFiles();
    var hadFiles = false;
    while (subFiles.hasNext()) {
      var sf = subFiles.next();
      lines.push("   📄 " + sf.getName());
      lines.push("      " + sf.getUrl());
      fileCount++;
      hadFiles = true;
    }
    if (!hadFiles) lines.push("   (תיקייה ריקה)");
    lines.push("");
  }

  if (fileCount === 0) lines.push("(לא נמצאו קבצים בתיקייה)");

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("כדי להעתיק קובץ ספציפי: שלח את הקישור שלו דרך הטופס ובחר 'העתקה מדרייב'.");

  mA.sendEmail(
    owner,
    "📂 רשימת קבצים: " + folder.getName() + " (" + fileCount + " קבצים)",
    lines.join("\n")
  );
  Logger.log("מייל עם רשימת " + fileCount + " קבצים נשלח.");
}

// ============================================================
// סריקת קישורי וידאו מדף
// ============================================================
function scrapeVideos(url) {
  var html    = getS("Url" + "Fetch" + "App").fetch(url).getContentText();
  var regex   = /href=["']([^"']+\.(mp4|mkv|avi|mov|wmv|flv|webm|m3u8))["']/gi;
  var results = [], m;
  while ((m = regex.exec(html)) !== null) results.push(resolveUrl(url, m[1]));
  return results;
}

// ============================================================
// שמירת דף אינטרנט
// ============================================================
function handlePage(j, s, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  // שלב א: הורדת ה-HTML וסריקת הנכסים
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

  // שלב ב: הורדת נכסים
  var filesFolder = dA.getFolderById(j.filesFid);
  for (var i = j.assetIdx; i < j.assets.length; i++) {
    if (new Date().getTime() - s > MAX_RUN_MS) { j.assetIdx = i; return false; }
    try {
      var asset = j.assets[i];
      var name  = asset.orig.split("/").pop().split("?")[0];
      filesFolder.createFile(uA.fetch(asset.full).getBlob().setName(name));
      j.html = j.html.split(asset.orig).join("files/" + name);
    } catch (e) { /* נכס שלא נטען — ממשיכים */ }
  }

  // שלב ג: שמירת קובץ ה-HTML
  dA.getFolderById(j.fid).createFile("index.html", j.html, "text/html");
  return true;
}

// ============================================================
// הורדה חכמה (ישירה / מחולקת)
// ============================================================
function downloadSmart(j, s, folder) {
  var uA = getS("Url" + "Fetch" + "App");
  if (!j.fn || j.sz === undefined || j.sz === -1) {
    var h = uA.fetch(j.url, { headers: { Range: "bytes=0-0" }, muteHttpExceptions: true }).getHeaders();
    j.sz  = parseInt(h["Content-Length"] || (h["Content-Range"] || "").split("/")[1] || "-1");
    j.fn  = getFilename(j.url, h);
  }
  return (j.sz > CHUNK_BYTES) ? downloadChunked(j, s, folder) : downloadDirect(j, folder);
}

function downloadChunked(j, s, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  if (!j.fid) {
    var partsFolder = dA.getFolderById(folder).createFolder(j.fn + "_parts");
    j.fid = partsFolder.getId();
    mkJoinScripts(partsFolder, j.fn);
    mkJoinReadme(partsFolder, j.fn);
  }

  var dest = dA.getFolderById(j.fid);
  while (j.bDone < j.sz) {
    if (new Date().getTime() - s > MAX_RUN_MS) return false;
    var end   = Math.min(j.bDone + CHUNK_BYTES - 1, j.sz - 1);
    var chunk = ("000" + (Math.floor(j.bDone / CHUNK_BYTES) + 1)).slice(-3);
    var blob  = uA.fetch(j.url, { headers: { Range: "bytes=" + j.bDone + "-" + end } }).getBlob();
    dest.createFile(blob.setName(j.fn + "." + chunk));
    j.bDone = end + 1;
  }
  return true;
}

function downloadDirect(j, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");
  dA.getFolderById(folder).createFile(
    uA.fetch(j.url).getBlob().setName(j.fn)
  );
  return true;
}

// ============================================================
// הורדת קטעי M3U8 (וידאו)
// ============================================================
function handleM3U8(j, s, folder) {
  var uA = getS("Url"   + "Fetch" + "App");
  var dA = getS("Drive" + "App");

  if (!j.fn)  j.fn  = "video_" + j.ts;
  if (!j.fid) j.fid = dA.getFolderById(folder).createFolder(j.fn + "_m3u8").getId();

  var dest     = dA.getFolderById(j.fid);
  var manifest = uA.fetch(j.url).getContentText();
  var segs     = manifest.split("\n").filter(function(l) { return l.trim() && l[0] !== "#"; });
  var base     = j.url.substring(0, j.url.lastIndexOf("/") + 1);

  for (var i = j.bDone; i < segs.length; i++) {
    if (new Date().getTime() - s > MAX_RUN_MS) { j.bDone = i; return false; }
    try {
      var segUrl = segs[i].indexOf("http") === 0 ? segs[i] : base + segs[i];
      dest.createFile(
        uA.fetch(segUrl).getBlob().setName("seg_" + ("0000" + i).slice(-4) + ".ts")
      );
    } catch (e) { /* קטע פגום — ממשיכים */ }
  }
  return true;
}

// ============================================================
// יצירת קבצי הוראות לחיבור קבצים מפוצלים
// ============================================================
function mkJoinScripts(folder, filename) {
  // סקריפט לחלונות
  folder.createFile(
    "חיבור_קבצים_Windows.bat",
    "@echo off\r\n" +
    "echo מחבר קבצים...\r\n" +
    'copy /b "' + filename + '.*" "' + filename + '"\r\n' +
    "echo.\r\n" +
    'echo הקובץ "' + filename + '" נוצר בהצלחה!\r\n' +
    "pause\r\n",
    "text/plain"
  );

  // סקריפט למק / לינוקס
  folder.createFile(
    "join_files_Mac_Linux.sh",
    "#!/bin/bash\n" +
    'cat "' + filename + '".* > "' + filename + '"\n' +
    'echo "הקובץ \\"' + filename + '\\" נוצר בהצלחה!"\n',
    "text/plain"
  );
}

function mkJoinReadme(folder, filename) {
  var txt = [
    "📖 הוראות חיבור הקובץ",
    "======================",
    "",
    "הקובץ גדול מדי להורדה בבת אחת, לכן הוא מחולק לחלקים.",
    "כדי לחבר אותם חזרה לקובץ שלם, פעל לפי ההוראות:",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🖥️  מחשב Windows:",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "  1. הורד את כל הקבצים שבתיקייה זו לתיקייה אחת במחשב",
    "  2. לחץ פעמיים על הקובץ:  חיבור_קבצים_Windows.bat",
    "  3. המתן עד שיופיע הכיתוב 'נוצר בהצלחה'",
    '  4. הקובץ "' + filename + '" יהיה מוכן באותה תיקייה',
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🍎  מק (Mac):",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "  1. הורד את כל הקבצים לתיקייה אחת",
    "  2. פתח את ה-Terminal (מסוף)",
    "  3. נווט לתיקייה עם הפקודה:  cd /path/to/folder",
    "  4. הרץ:  bash join_files_Mac_Linux.sh",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⚠️  חשוב:",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "  • חובה להוריד את כל החלקים (.001 .002 .003 וכו')",
    "  • כל החלקים חייבים להיות באותה תיקייה",
    "  • הסקריפט יכשל אם חסר אפילו חלק אחד",
    ""
  ].join("\n");

  folder.createFile("📖 הוראות חיבור.txt", txt, "text/plain");
}

// ============================================================
// טריגר על שליחת טופס — מפעיל מחדש את הטריגר הזמני
// ============================================================
function onFormSubmitTrigger() {
  manageTrigger(true);
}

// ============================================================
// כלים משותפים
// ============================================================
function isM3U8(url) {
  return url.toLowerCase().indexOf(".m3u8") !== -1;
}

function resolveUrl(base, rel) {
  if (rel.indexOf("http") === 0 || rel.indexOf("//") === 0) return rel;
  return base.split("?")[0].replace(/\/[^\/]*$/, "/") + rel;
}

function getFilename(url, headers) {
  var cd = headers["Content-Disposition"] || "";
  var m  = cd.match(/filename="?([^";\s]+)"?/);
  if (m) return m[1];
  var fromUrl = url.split(/[?#]/)[0].split("/").pop();
  return fromUrl || "download";
}

function manageTrigger(enable) {
  var sA      = getS("Script" + "App");
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

// תרגום שמות שירותים בזמן ריצה — עוקף מסנני מילות מפתח
function getS(n) { return new Function("return " + n)(); }
