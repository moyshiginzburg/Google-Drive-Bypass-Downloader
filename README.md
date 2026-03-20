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
7. A prompt will appear asking for authorization. Click **Review permissions**. Choose your Google account, click **Advanced**, and then click the link at the bottom (e.g., **Go to Untitled project (unsafe)**). Finally, click **Allow**.
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
4. Click **Save**. Wait for the specific time to pass, and the system will run the setup automatically. The email with your form link will arrive shortly after.

## How to Use the Form

Always use the personal form link sent to your email to request downloads. The script makes it simple for non-technical users to access different types of links:
- **Google Drive File/Folder:** Simply paste the sharing link. If it's a folder, the script will automatically bypass the shortcuts, delve into all subfolders, and copy the entire contents into a safe folder in your Drive.
- **Direct File Download:** Link to a regular file (e.g. PDF, image, Zip). It will be directly processed and downloaded to your Drive.
- **Webpage:** If an informational article or page is blocked, paste the link and select "Save webpage". The script will parse the page and download a complete HTML file along with all the images to an offline folder in your Drive.
- **Video (HLS/m3u8):** Some video courses use streaming segmented files (m3u8). Choose the video option, and the script will download the individual segments for you.

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
7. קופץ חלון בקשת הרשאות. לחץ בו על **Review permissions** (בדוק הרשאות). בחר את חשבון הגוגל שלך, לחץ על **Advanced** (מתקדם), ואז לחץ על הקישור למטה כדי לאשר מעבר לפרויקט (לדוגמה: **Go to Untitled project (unsafe)**). לבסוף, לחץ **Allow** (אפשר).
8. ההרצה תסתיים. כעת, כנס לתיבת המייל שלך (Gmail) - תחכה לך שם הודעת דוא"ל עם קישור לטופס אישי שנוצר במיוחד בשבילך.

### התקנה באמצעות טריגר (הפעלות) - במקרה של שגיאה
לעתים הרצה ידנית של פונקציית ההתקנה (`setupAll`) עשויה להחזיר שגיאה. במצב כזה תוכל לתזמן למערכת להריץ אותה משירותי הרקע בעוד כדקה:
1. לחץ על סמל ה-**Triggers** (מפעילים - סמל של שעון עצר) בתפריט הצד.
2. בצד ימין למטה של המסך, לחץ על הכפתור **Add Trigger** (הוסף מפעיל).
3. בחלון שייפתח הגדר בדיוק את האפשרויות הבאות:
   - **Choose which function to run** (בחר פונקציה להפעלה): `setupAll`.
   - **Choose which deployment should run** (בחר מאיזו פריסה תתבצע הפעלה): `Head`.
   - **Select event source** (בחר מקור אירוע): `Time-driven` (מבוסס זמן).
   - **Select type of time based trigger** (בחר סוג מפעיל המבוסס על זמן): `Specific date and time` (תאריך ושעה ספציפיים).
   - **Specify date and time** (ציין תאריך ושעה הנדרשים): חובה להזין את הזמן המדויק בפורמט `YYYY-MM-DD HH:MM`. כלומר, אם הזמן הנוכחי הוא ה-20 במרץ 2026 בשעה 10:00 בדיוק, תצטרך לכתוב: `2026-03-20 10:02` כדי שזה יופעל אוטומטית בעוד כשתי דקות.
4. לחץ **Save** (שמור). המתן שהשעה הקבועה תעבור - התהליך ירוץ מעצמו ותוך זמן קצר תקבל את המייל עם הטופס המיוחל.

## איך להשתמש בטופס?

השאר והשתמש כל הזמן בקישור לטופס שנשלח אליך למייל. המערכת מנגישה את התהליך לאנשים לא-טכניים, ואין צורך בשום הבנה מקדימה:
- **קובץ או תיקייה ב-Google Drive:** אם קיבלת קישור לתיקייה בדרייב או קובץ, פשוט הדבק אותו בטופס. המערכת תזהה אם מדובר בתיקייה (ותוציא במדויק גם תתי תיקיות רבות בפנים), ותעתיק הכל בצורה מסודרת לתיקייה פרטית בדרייב שלך. פשוט וקל.
- **הורדת קובץ משירותי אחסון / אינטרנט:** מצאת קישור להורדה ישירה מאיזה אתר? (קובץ PDF, ארכיון Zip וכו'). פשוט זרוק לטופס וההורדה תיכנס לדרייב.
- **הורדת דף אינטרנט מתורגם/חסום:** אם מצאת דף כתבה או מדריך טקסט שעשוי להיות חסום אצלך, תמסור את הקישור ובחר לשמור את "דף האינטרנט". הסקריפט ייקח את דף ה-HTML עם כל התמונות שעליו (שתכלס מורדות לשרתי גוגל) ויארוז הכל לתיקייה נגישה אצלך בדרייב שתוכל לפתוח מבלי לגלוש ישירות לאתר המקורי.
- **סטרימינג ווידאו (HLS):** קישורים לשיעורי וידאו המחולקים למקטעי וידאו זעירים (m3u8). סמן שמדובר בווידאו, והסקריפט יוריד מקטע-מקטע עבורך באופן מידי.

## איתור שגיאות (לאן נעלמו לי הקבצים?)
אם מילאת את הטופס, חיכית מספיק זמן והקובץ המיוחל מעולם לא צץ ב-Google Drive, הנה הדרך לבדוק מה השתבש:
1. היכנס חזרה לממשק הסקריפט שלך (דרך האתר: [script.google.com](https://script.google.com) והפרויקט שלך).
2. בסרגל הצדדי, לחץ על לשונית ה-**Executions** (הפעלות - סמל של רשימה עם לחצן פליי עליו).
3. מולך תופיע רשימה של ההרצות האחרונות. מצא את ההרצה שכותרת הפונקציה שלה היא `processFormResponses` במועד המתאים. הסתכל על הסטטוס באותה השורה ("Failed" לנכשל או "Completed" להושלם).
4. לחץ על השורה הספציפית הזו כדי לפתוח ולצפות במטריקה פנימית.
5. במסך שנפתח, הסתכל בחלק של ה-**Logs** (היומן). קרא בעיון מה כתוב שם: ייתכן שהסקריפט מצא שהקישור אינו זמין עוד להורדה, שאסור לו לגשת (אין הרשאת שיתוף כללית), שהקובץ גדול מכפי הקיבולת המקסימלית, או כל שגיאה אחרת המסבירה את הסיבה לתקלה.
