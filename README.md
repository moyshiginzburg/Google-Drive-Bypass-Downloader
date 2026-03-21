# Google Drive Bypass Downloader

This project provides a Google Apps Script that helps you download files, folders, and webpages that are blocked by local computer filtering. It bypasses these local blocks by downloading the content directly on Google's servers and saving a safe copy directly to your personal Google Drive.

## First-Time Installation

1. Go to [script.google.com](https://script.google.com) and click on **New project**.
2. In the code editor that opens, delete all the existing code. Copy all the content from the `main.gs` file in this repository and paste it into the editor.
3. Next, we need to update the project configuration:
   - Click on the **Project Settings** (gear icon) on the left sidebar.
   - Check the box that says **"Show 'appsscript.json' manifest file in editor"**.
   - Go back to the **Editor** (code icon `< >` on the left sidebar).
   - In the left files pane, click on the `appsscript.json` file.
   - Replace its contents completely with the text from the `appsscript.json` file provided in this repository.
4. Click the **Save project** icon (floppy disk) at the top toolbar.
5. In the top toolbar, look at the dropdown menu next to the "Debug" button and make sure the function `setupAll` is selected.
6. Click **Run**.
7. A prompt will appear asking for authorization. Click **Review permissions**. Choose your Google account, click **Advanced**, and then click the link at the bottom (e.g., **Go to Untitled project (unsafe)**). **Once you proceed, approve all required permissions and finally click Allow.** **Note:** If this step fails (e.g., due to a timeout or block), you must run the script by creating a trigger. See the "Troubleshooting: Running setupAll via a Trigger" section below for details.
8. Once execution finishes, check your Gmail inbox. You will receive an email containing the link to your newly generated, personal submission form.

### Troubleshooting: Running `setupAll` via a Trigger
Sometimes you might encounter an error or timeout trying to run `setupAll` manually. If this happens, you can schedule it to run automatically in the background using a trigger:
1. Click on the **Triggers** icon (clock icon) on the left sidebar.
2. Click the blue **Add Trigger** button at the bottom right of the screen.
3. Configure the trigger strictly with these settings:
   - **Choose which function to run:** `setupAll`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** `Time-driven`
   - **Select type of time based trigger:** `Specific date and time`
   - **Specify date and time:** You must enter the exact date and time in the `YYYY-MM-DD HH:MM` format. For example, if the current time is March 20, 2026 at 10:00 AM, type exactly `2026-03-20 10:02` to run it in two minutes.
4. Click **Save**. **Authorization:** When saving the trigger, a permission prompt will appear. Click **Review permissions**, select your account, click **Advanced**, and then the link at the bottom. **Once you proceed, approve all required permissions and finally click Allow.** Wait for the specific time to pass, and the system will run the setup automatically. The email with your form link will arrive shortly after.

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

# מוריד קבצים ודפים לדרייב

פרויקט זה מכיל סקריפט אוטומטי המאפשר לך להוריד קבצים ודפי אינטרנט שחסומים בשל מערכות סינון מקומיות המותקנות במחשב שלך. הסקריפט עוקף זאת על ידי ביצוע פעולת ההורדה על גבי השרתים של גוגל, ויצירת עותק אישי נקי ובטוח ישירות בחשבון ה-Google Drive שלך.

## הוראות התקנה בפעם הראשונה

1. היכנס לאתר [script.google.com](https://script.google.com) ולחץ על הכפתור **New project** (פרויקט חדש).
2. ייפתח עורך קוד. מחק את כל הקוד הקיים שמופיע שם כברירת מחדל, העתק לכאן את כל התוכן של הקובץ `main.gs` מהמאגר הזה, והדבק אותו בעורך.
3. כעת, עלינו לעדכן את קובץ ההגדרות:
   - בתפריט הצדדי, לחץ על סמל ה-**Project Settings** (הגדרות פרויקט - סמל גלגל שיניים).
   - סמן "וי" בתיבה שאומרת **"Show 'appsscript.json' manifest file in editor"** (הצג קובץ מניפסט).
   - לאחר מכן, חזור ל-**Editor** (עורך - סמל של `< >` בתפריט הצד).
   - ברשימת הקבצים כעת תראה קובץ בשם `appsscript.json`. לחץ עליו כדי לפתוח אותו.
   - החלף את התוכן של הקובץ הזה לחלוטין בתוכן של הקובץ `appsscript.json` שמופיע במאגר הקוד שלנו.
4. שמור את הפרויקט על ידי לחיצה על סמל השמירה (**Save project** - צורת דיסקט) בסרגל הכלים העליון.
5. בסרגל העליון, בשורת התפריטים ליד כפתור התחלת ההרצה ("Run" / "הפעל"), ודא שהפונקציה שמוגדרת כרגע להרצה היא `setupAll` (אם מופיעה פונקציה אחרת, פתח את הרשימה הנפתחת ובחר בה).
6. לחץ על **Run** (הפעל).
7. קופץ חלון בקשת הרשאות. לחץ בו על **Review permissions** (בדוק הרשאות). בחר את חשבון הגוגל שלך, לחץ על **Advanced** (מתקדם), ואז לחץ על הקישור למטה כדי לאשר מעבר לפרויקט (לדוגמה: **Go to Untitled project (unsafe)** או: המשך אל פרויקט ללא שם (לא מאובטח)). **לאחר שעברת לפרויקט יש לאשר את כל ההרשאות הנדרשות ולבסוף ללחוץ על Allow (אפשר).** **שימו לב:** אם שלב זה נכשל (למשל עקב חסימה), יש להפעיל את הסקריפט באמצעות יצירת טריגר, ראו הסבר מפורט בהמשך.
8. ההרצה תסתיים. כעת, כנס לתיבת המייל שלך (Gmail) - תחכה לך שם הודעת דוא"ל עם קישור לטופס אישי שנוצר במיוחד בשבילך.

### התקנה באמצעות טריגר (הפעלות) - במקרה של שגיאה
לעתים הרצה ידנית של פונקציית ההתקנה (`setupAll`) עשויה להחזיר שגיאה. במצב כזה תוכל לתזמן למערכת להריץ אותה משירותי הרקע בעוד כדקה:
1. לחץ על סמל ה-**Triggers** (מפעילים - סמל של שעון עצר) בתפריט הצד.
2. בצד ימין למטה של המסך, לחץ על הכפתור **Add Trigger** (הוסף מפעיל/הוסף טריגר).
3. בחלון שייפתח הגדר בדיוק את האפשרויות הבאות:
   - **Choose which function to run** (בחר פונקציה להפעלה): `setupAll`.
   - **Choose which deployment should run** (בחר מאיזו פריסה תתבצע הפעלה): `Head` (ראשית).
   - **Select event source** (בחר מקור אירוע): `Time-driven` (מבוסס זמן).
   - **Select type of time based trigger** (בחר סוג מפעיל המבוסס על זמן): `Specific date and time` (תאריך ושעה ספציפיים).
   - **Specify date and time** (ציין תאריך ושעה הנדרשים): חובה להזין את הזמן המדויק בפורמט `YYYY-MM-DD HH:MM`. כלומר, אם הזמן הנוכחי הוא ה-20 במרץ 2026 בשעה 10:00 בדיוק, תצטרך לכתוב: `2026-03-20 10:02` כדי שזה יופעל אוטומטית בעוד כשתי דקות.
4. לחץ **Save** (שמור). **אישור הרשאות:** במהלך שמירת הטריגר יופיע חלון אישור הרשאות. לחץ על **Review permissions**, בחר חשבון, לחץ על **Advanced** ואז על הקישור למטה (Go to...). **לאחר שעברת לפרויקט יש לאשר את כל ההרשאות הנדרשות ולבסוף ללחוץ על Allow (אפשר).** המתן שהשעה הקבועה תעבור - התהליך ירוץ מעצמו ותוך זמן קצר תקבל את המייל עם הטופס המיוחל.

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

## איתור שגיאות (לאן נעלמו לי הקבצים?)
אם מילאת את הטופס, חיכית מספיק זמן והקובץ המיוחל מעולם לא צץ ב-Google Drive, הנה הדרך לבדוק מה השתבש:
1. היכנס חזרה לממשק הסקריפט שלך (דרך האתר: [script.google.com](https://script.google.com) והפרויקט שלך).
2. בסרגל הצדדי, לחץ על לשונית ה-**Executions** (הפעלות - סמל של רשימה עם לחצן פליי עליו).
3. מולך תופיע רשימה של ההרצות האחרונות. מצא את ההרצה שכותרת הפונקציה שלה היא `processFormResponses` במועד המתאים. הסתכל על הסטטוס באותה השורה ("Failed" לנכשל או "Completed" להושלם).
4. לחץ על השורה הספציפית הזו כדי לפתוח ולצפות במטריקה פנימית.
5. במסך שנפתח, הסתכל בחלק של ה-**Logs** (היומן). קרא בעיון מה כתוב שם: ייתכן שהסקריפט מצא שהקישור אינו זמין עוד להורדה, שאסור לו לגשת (אין הרשאת שיתוף כללית), שהקובץ גדול מכפי הקיבולת המקסימלית, או כל שגיאה אחרת המסבירה את הסיבה לתקלה.
