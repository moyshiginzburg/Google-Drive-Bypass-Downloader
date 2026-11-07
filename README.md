# Google Drive Bypass Downloader

This project provides a Google Apps Script bound to a Google Form that helps you download files, folders, and webpages that are blocked by local computer filtering. It bypasses these local blocks by downloading the content directly on Google's servers and saving a safe copy directly to your personal Google Drive.

> **Easy installation:** For the simplest setup method (via the Form editor menu), see the [project landing page](https://moyshiginzburg.github.io/Google-Drive-Bypass-Downloader/).

## Installation via Apps Script Editor (Advanced)

If you prefer to run the setup directly from the Apps Script code editor:

1. Open the Google Form that this script is bound to.
2. In the Form editor, click the three-dot menu **⋮** at the top right and select **"Script editor"** to open the Apps Script editor.
3. In the top toolbar, make sure the function `setupAll` is selected in the dropdown next to the **Run** button.
4. Click **Run**.
5. A prompt will appear asking for authorization. Click **Review permissions**. Choose your Google account, click **Advanced**, and then click the link at the bottom (e.g., **Go to project (unsafe)**). **Approve all required permissions and click Allow.** This is required only once.
6. Check your Gmail inbox — you will receive a confirmation email with your destination Drive folder.
7. **Important:** To start using the form, return to the Form editor and click the purple **Send** (or Publish) button at the top right to enable responses.

### Troubleshooting: Running `setupAll` via a Trigger

If running `setupAll` manually fails (e.g., due to a timeout or block), schedule it via a trigger:

1. In the Apps Script editor, click the **Triggers** icon (clock) on the left sidebar.
2. Click **Add Trigger** at the bottom right.
3. Configure:
   - **Function:** `setupAll`
   - **Deployment:** `Head`
   - **Event source:** `Time-driven`
   - **Type:** `Specific date and time`
   - **Date/time:** Enter a time ~2 minutes from now in `YYYY-MM-DD HH:MM` format.
4. Click **Save**. Approve permissions when prompted. The setup will run automatically at the specified time.
5. **Important:** Once it runs, return to the Form editor and click the purple **Send** (or Publish) button at the top right to enable responses.

## How to Use the Form

Using the system is incredibly simple. You only need the personal form link that was sent to your email during installation.

**Just paste the link!** The form has only one field. There is no need to select what type of file you are downloading. The system features a **Smart Auto-Detect** engine that automatically identifies the content:

- **Direct Files & Webpages:** If you paste a direct download link (PDF, Zip, MP4) or a regular webpage, the system will download or save it directly to your Google Drive. It seamlessly handles large files using Google's Resumable Upload API.
- **YouTube Videos:** Note that downloading from YouTube is currently not supported.
- **Google Drive Folders:** If you paste a link to a Google Drive folder, the system will scan it and **send you an email**. The email will contain buttons to either download the entire folder at once, or browse the subfolders and files to pick exactly what you want to download with one click.
- **Streaming Video (HLS / m3u8):** If you paste a link to a streaming video playlist, the system will parse the available resolutions and **send you an email**. You can simply click the quality you prefer in the email to start the download. If the stream keeps its audio in a separate track, the audio is saved as a second file (`..._audio.ts`) next to the video (it cannot be merged inside Apps Script; any player such as VLC can load it as an external audio track, or merge with `ffmpeg -i video.ts -i video_audio.ts -c copy out.mp4`).
- **URL Shorteners:** The system automatically resolves shortened links (like bit.ly) to discover the true destination.

## Error Notifications

You never have to wonder where your files went. If an error occurs during the download process (e.g., the Google Drive link requires permission, your Drive storage is full, or the website blocked the download), you will **immediately receive a friendly email** explaining exactly what went wrong and how to fix it.

---
---

<div dir="rtl" align="right">

# מוריד קבצים ודפים לדרייב

סקריפט אוטומטי המאפשר להוריד קבצים ודפי אינטרנט שחסומים בשל מערכות סינון מקומיות. הסקריפט עוקף זאת על ידי ביצוע ההורדה על שרתי גוגל ויצירת עותק ישירות ב-Google Drive שלך.

> **התקנה קלה:** לדרך ההתקנה הפשוטה ביותר (דרך תפריט עורך הטופס), ראו את [דף הפרויקט](https://moyshiginzburg.github.io/Google-Drive-Bypass-Downloader/).

## התקנה דרך עורך הקוד (למתקדמים)

1. פתח את טופס ה-Google שהסקריפט מקושר אליו.
2. בעורך הטופס, לחץ על תפריט שלוש הנקודות **⋮** בפינה הימנית העליונה ובחר **"Script editor"**.
3. בסרגל העליון, ודא שהפונקציה `setupAll` מוגדרת בתפריט הנפתח ליד כפתור ההפעלה.
4. לחץ על **Run** (הפעל).
5. יופיע חלון בקשת הרשאות. לחץ על **Review permissions**, בחר חשבון, לחץ על **Advanced** ואז על הקישור למטה. **אשר את כל ההרשאות ולחץ Allow.** נדרש פעם אחת בלבד.
6. היכנס לתיבת המייל — תמתין הודעה עם אישור ההתקנה ותיקיית היעד בדרייב.
7. **חשוב:** כדי שהטופס יתחיל לפעול, חזור לעורך הטופס ולחץ על **הכפתור הסגול 'פרסום' (או Send)** למעלה.

### התקנה באמצעות טריגר (במקרה של שגיאה)

1. לחץ על **Triggers** (שעון) בתפריט הצד.
2. לחץ **Add Trigger**.
3. הגדר: פונקציה `setupAll`, פריסה `Head`, מקור `Time-driven`, סוג `Specific date and time`, תאריך ושעה בפורמט `YYYY-MM-DD HH:MM` (כ-2 דקות מעכשיו).
4. לחץ **Save** ואשר הרשאות. ההתקנה תרוץ אוטומטית בזמן שנקבע.
5. **חשוב:** לאחר שההתקנה מסתיימת, חזור לעורך הטופס ולחץ על **הכפתור הסגול 'פרסום' (או Send)** כדי לפתוח אותו לתגובות.

## איך להשתמש בטופס?

השימוש במערכת הוא פשוט מאי פעם. השתמש בקישור לטופס האוטומטי שנשלח אליך למייל. בטופס יש **שדה אחד בלבד** - שדה הקישור! 

**פשוט הדבק את הקישור!** המערכת מצוידת במנגנון **זיהוי חכם (Auto-Detect)** שיודע לנתח לבד את הקישור ולבצע את הפעולה המתאימה:

- **קבצים ישירים ודפי אינטרנט:** אם תדביק קישור להורדת קובץ (PDF, Zip, MP4) או קישור לכתבה/דף אינטרנט, המערכת תזהה זאת ותוריד את הקובץ (או תשמור את הדף כקובץ HTML מלא עם תמונות) ישירות לדרייב. המערכת תומכת בקבצי ענק ללא צורך בפיצול.
- **סרטוני יוטיוב:** שימו לב, המערכת אינה תומכת בהורדה מיוטיוב כרגע.
- **תיקיות מגוגל דרייב:** אם תדביק קישור לתיקייה בדרייב, המערכת תסרוק אותה ו**תשלח אליך מייל**. במייל יופיעו כפתורים להורדת התיקייה כולה בלחיצה אחת, או רשימה של כל הקבצים ותתי-התיקיות כדי שתוכל לבחור בלחיצה פשוטה מה להוריד. לחיצה על כפתור תפתח את הטופס ממולא מראש וכל מה שיישאר לך זה ללחוץ "שלח"!
- **וידאו בסטרימינג (HLS / m3u8):** אם תדביק קישור של וידאו מקוטע (קורסים וכד'), המערכת תזהה את איכויות הוידאו הזמינות ו**תשלח אליך מייל**. פשוט בחר את האיכות הרצויה מהמייל להורדה. אם השמע בשידור נמצא ברצועה נפרדת, הוא יישמר כקובץ נוסף (`..._audio.ts`) לצד הוידאו (אי אפשר לאחד אותם בתוך הסקריפט; ניתן לנגן יחד ב-VLC או לאחד עם ffmpeg).
- **קישורים מקוצרים:** המערכת פותחת אוטומטית קישורים מקוצרים (כמו bit.ly) כדי להגיע ליעד האמיתי בעצמה.

<a id="faq"></a>

## התראות שגיאה חכמות למייל

אתה כבר לא צריך לתהות לאן נעלמו הקבצים שלך. אם יש בעיה כלשהי בהורדה (למשל: אין הרשאת צפייה לקישור הדרייב שהזנת, נגמר לך המקום באחסון של גוגל, או ששרת האתר סירב להורדה) - המערכת **תשלח אליך מיד אימייל בעברית פשוטה וברורה** המסביר בדיוק למה ההורדה נכשלה ומה עליך לעשות כדי לתקן זאת.

</div>
