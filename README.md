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

Always use the personal form link sent to your email to request downloads. The form asks for the link and the type of action you want to perform. Here is how to choose the right option for different types of links:

- **Google Drive File or Folder:** 
  - **What to choose:** "Copy from Drive" (העתקה מדרייב).
  - **Folder options:** If the link is for a folder, an additional question appears asking what to do. You can choose to **"Copy all files"**, which will delve into all subfolders and copy everything to your Drive, or **"Send me an email with the file list"**. If you choose the email option, the script will scan the entire folder and send you an email containing a fully detailed list of all files, including all subfolders and the individual files inside those subfolders, along with direct links to each. This lets you browse the contents safely and request only specific files later.

- **Direct File Download (PDF, Zip, Audio, etc.):** 
  - **What to choose:** "Download file from the internet" (הורדת קובץ מהאינטרנט).
  - **Large Files (over 40MB):** If the file you are downloading is very large, measuring over 40MB, the script will automatically split it into smaller numbered parts (e.g., `.001`, `.002`) to handle limits. It will save these parts in a newly created folder on your Drive, along with a `.bat` file (for Windows), a `.sh` file (for Mac/Linux), and a `.txt` readme file explaining exactly how to easily execute them with one click to instantly combine all parts back into the single original file locally on your computer.
  - **Note on regular videos:** If your link is to a regular, single video file hosted on a site (like an `.mp4` or `.mkv` file), you should also use this option. 

- **Saved Webpage (Offline viewing):** 
  - **What to choose:** "Save webpage" (שמירת דף אינטרנט).
  - **How it works:** If an informational article or page is blocked, paste the link. The script will parse the page and download a complete HTML file along with all its images into a new offline folder in your Drive.

- **Streaming Video / Fragmented Video (HLS / m3u8):** 
  - **What to choose:** "Collect video links from page" (איסוף קישורי וידאו מדף).
  - **When to use this:** Many modern video courses and streaming sites do not provide one single video file. Instead, the video is split into hundreds of tiny little segments (often ending in `.m3u8` or `.ts`) that are played sequentially. Standard download methods cannot handle this. By choosing this option, the script will find and download all these tiny segments for you. *(Remember, if it's a regular, whole video file, use the "Direct File Download" option instead)*.

## Troubleshooting (Where are my files?)
If you submitted the form and the requested files did not appear in your Google Drive, you can check what went wrong:
1. Go back to your script project at [script.google.com](https://script.google.com).
2. Click on the **Executions** tab (a list icon with a play button) on the left sidebar.
3. You will see a table of recent runs. Look for the most recent run of the `processFormResponses` function (or `setupAll` if you were trying to install). Check the status column to see if it says "Failed" or "Completed".
4. Click anywhere on that specific execution row to expand it.
5. In the expanded view, carefully read the **Logs**. The logs will explain exactly what happened (for example, link access denied, file too large, invalid format, etc.).

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

השאר והשתמש כל הזמן בקישור לטופס האוטומטי שנישלח אליך למייל. המערכת מנגישה את התהליך כך שהוא מתאים לכל משתמש. בטופס תתבקש להדביק את הקישור ולבחור איזו פעולה לעשות. הנה פירוט מלא:

- **קובץ או תיקייה ב-Google Drive:** 
  - **מה לבחור בטופס:** סמן את האפשרות "העתקה מדרייב (קובץ או תיקייה)".
  - **אם זה קישור לתיקייה:** הטופס יציג בפניך שאלה נוספת בה תישאל מה לעשות עם התיקייה. תוכל לבחור באפשרות **"העתק את כל הקבצים"** ואז המערכת תעתיק מסודר מכל תתי-התיקיות ישירות לדרייב שלך, או שתוכל לבחור לקבל **"מייל עם רשימת הקבצים"**. אם תבחר במייל, המערכת תסרוק את התיקייה ותשלח אליך הודעה מסודרת הכוללת את כל הקבצים בתיקייה הראשית, ובנוסף רשימה של **כל תתי-התיקיות ושל כל הקבצים הנמצאים עמוק בתוכן** יחד עם קישור ישיר לכל אחד מהם! כך תוכל לבחור להעתיק בעצמך רק קבצים ספציפיים שמעניינים אותך.

- **הורדת קובץ משירותי אחסון / חלץ מהאינטרנט:**
  - **מה לבחור בטופס:** סמן את האפשרות "הורדת קובץ מהאינטרנט".
  - **מתי משתמשים:** מצוין לקישורים ישירים להורדה (כמו קובץ PDF, ארכיון Zip, או קובץ קול). 
  - **מה קורה בקבצים גדולים (מעל 40 מגה)?** מכיוון שישנן הגבלות על זיכרון בפלטפורמה, לגבי קובץ רשת ששוקל יותר מ-40MB הסקריפט נוהג בחכמה: הוא יוריד ויפצל אותו לחלקים קטנים וממוספרים (כגון `.001`, `.002` וכו'). כל החלקים יישמרו בתיקייה ייעודית בדרייב אליה יתווסף קובץ הסבר (README.txt) בעברית, וכן שני קבצי סקריפט קטנים (למשתמשי חלונות ולמשתמשי מק/לינוקס). כשתוריד את כל התיקייה יחדיו למחשב שלך, תוכל פשוט להפעיל את אחד הסקריפטים והוא יאחד אוטומטית את כל החלקים בחזרה לקובץ המקורי ברגע אחד וללא מאמץ!
  - **הערה חשובה במקרה של וידאו רגיל:** גם אם הקישור שקיבלת מוביל לקובץ וידאו יחיד ומוכר (כמו סרטון בסיומת `.mp4` או `.mkv` המאוחסן באתר), **יש לבחור באפשרות זו** של הורדת קובץ משום שמדובר בקובץ רגיל לכל דבר.

- **הורדת דף אינטרנט מתורגם/חסום:**
  - **מה לבחור בטופס:** סמן את האפשרות "שמירת דף אינטרנט (HTML + תמונות)".
  - **איך זה עובד:** תכניס קישור לכתבה או מדריך טקסט (שעשוי להיות חסום אצלך בדפדפן הרגיל). הסקריפט ייגש לדף ה-HTML עם כל התמונות שעליו, יוריד אותן לשרתי גוגל ויארוז הכל לתיקייה אחת נגישה אצלך בדרייב שתוכל לפתוח ולקרוא גם כשהאתר עצמו איננו פתוח.

- **קורסים בסטרימינג ווידאו מקוטע (HLS / m3u8):**
  - **מה לבחור בטופס:** סמן באפשרות "איסוף קישורי וידאו מדף".
  - **הסבר פשוט - למה זה נועד:** אתרי קורסים ווידאו רבים לא מגישים "קובץ וידאו אחד רגיל" שאפשר להוריד. במקום זה, הם חותכים את הווידאו למאות חתיכות (מקטעים) זעירות שמשודרות לדפדפן ברצף (לרוב קבצים עם סיומות מוזרות כמו `m3u8` או `.ts`). פעולות הורדה רגילות פשוט יכשלו שם כי אין קובץ אחד מושלם לקחת. אולם אם תבחר באפשרות זו – הסקריפט יעשה את העבודה הקשה של איתור כל מאות המקטעים הזעירים הללו והורדה של כולם אל תיקייה מיוחדת עבורך. *(כפי שצוין לפני כן, עבור קובץ וידאו "רגיל" אחד שלם שאינו מפוצל, יש לבחור בפעולת הורדת הקבצים הרגילה)*.

<a id="faq"></a>

## איתור שגיאות (לאן נעלמו לי הקבצים?)
אם מילאת את הטופס, חיכית מספיק זמן והקובץ המיוחל מעולם לא צץ ב-Google Drive, הנה הדרך לבדוק מה השתבש:
1. היכנס חזרה לממשק הסקריפט שלך (דרך האתר: [script.google.com](https://script.google.com) והפרויקט שלך).
2. בסרגל הצדדי, לחץ על לשונית ה-**Executions** (הפעלות - סמל של רשימה עם לחצן פליי עליו).
3. מולך תופיע רשימה של ההרצות האחרונות. מצא את ההרצה שכותרת הפונקציה שלה היא `processFormResponses` במועד המתאים. הסתכל על הסטטוס באותה השורה ("Failed" לנכשל או "Completed" להושלם).
4. לחץ על השורה הספציפית הזו כדי לפתוח ולצפות במטריקה פנימית.
5. במסך שנפתח, הסתכל בחלק של ה-**Logs** (היומן). קרא בעיון מה כתוב שם: ייתכן שהסקריפט מצא שהקישור אינו זמין עוד להורדה, שאסור לו לגשת (אין הרשאת שיתוף כללית), שהקובץ גדול מכפי הקיבולת המקסימלית, או כל שגיאה אחרת המסבירה את הסיבה לתקלה.

</div>
