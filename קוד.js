/**
 * Main function triggered when form is submitted.
 * Purpose: Extract file/folder ID from the submitted link, identify if it's a folder or file,
 * and create a copy in the user's Drive root folder.
 * 
 * Method of operation:
 * 1. Gets the first (and only) response from the form
 * 2. Extracts the file/folder ID from the submitted link using regex
 * 3. Determines if it's a folder by checking if "folder" appears in the link before the ID
 * 4. Handles Google Docs/Sheets links (docs.google.com or sheets.google.com) differently
 * 5. Calls appropriate copy function based on file type
 * 
 * @param {Object} e - Event object containing form response data
 */
function onFormSubmit(e) {
  Logger.log('טופס נשלח. מתחיל בעיבוד...');
  
  var formResponse = e.response;
  if (!formResponse) {
    Logger.log('שגיאה: לא התקבלה תגובה מהטופס');
    return;
  }

  var itemResponses = formResponse.getItemResponses();
  if (!itemResponses || itemResponses.length === 0) {
    Logger.log('שגיאה: לא התקבלו תשובות מהטופס');
    return;
  }

  // Get the first (and only) response - the link
  var link = itemResponses[0].getResponse();
  Logger.log('קישור שהתקבל: ' + link);

  if (!link || link.trim().length === 0) {
    Logger.log('שגיאה: לא התקבל קישור תקין');
    return;
  }

  // Extract ID from the link
  var id = extractIdFromLink(link);
  if (!id) {
    Logger.log('שגיאה: לא ניתן לחלץ ID מהקישור: ' + link);
    return;
  }

  Logger.log('ID שחולץ: ' + id);

  // Check if it's a folder by looking for "folder" in the link before the ID
  var isFolder = isFolderLink(link, id);
  Logger.log('האם זו תיקייה? ' + isFolder);

  // Check if it's a Google Docs or Sheets link
  var isGoogleDoc = link.includes('docs.google.com');
  var isGoogleSheet = link.includes('sheets.google.com');

  if (isFolder) {
    copyFolder(id);
  } else if (isGoogleDoc || isGoogleSheet) {
    copyGoogleDocOrSheet(id, isGoogleDoc);
  } else {
    copySingleFile(id);
  }
}

/**
 * Extracts file or folder ID from a Google Drive/Docs/Sheets link.
 * Purpose: Parse various Google link formats and extract the unique identifier.
 * 
 * Method of operation:
 * Handles multiple link formats:
 * - drive.google.com/file/d/FILE_ID
 * - drive.google.com/drive/folders/FOLDER_ID
 * - docs.google.com/document/d/FILE_ID
 * - sheets.google.com/spreadsheets/d/FILE_ID
 * - Shortened links with id= parameter
 * Uses regex patterns to find ID strings that are 25+ characters long.
 * 
 * @param {string} link - The Google Drive/Docs/Sheets link
 * @return {string|null} The extracted ID or null if not found
 */
function extractIdFromLink(link) {
  if (!link) {
    return null;
  }

  // Try specific patterns first for better accuracy
  
  // Pattern 1: /d/FILE_ID (for files in drive.google.com or docs.google.com or sheets.google.com)
  var dPattern = /\/d\/([a-zA-Z0-9_-]{25,})/;
  var dMatch = link.match(dPattern);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  // Pattern 2: /folders/FOLDER_ID (for folders)
  var folderPattern = /\/folders\/([a-zA-Z0-9_-]{25,})/;
  var folderMatch = link.match(folderPattern);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Pattern 3: id=FILE_ID (for shortened links or query parameters)
  var idParamPattern = /[?&]id=([a-zA-Z0-9_-]{25,})/;
  var idParamMatch = link.match(idParamPattern);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 4: /document/d/FILE_ID or /spreadsheets/d/FILE_ID (explicit Docs/Sheets format)
  var docPattern = /\/(?:document|spreadsheets)\/d\/([a-zA-Z0-9_-]{25,})/;
  var docMatch = link.match(docPattern);
  if (docMatch && docMatch[1]) {
    return docMatch[1];
  }

  // Fallback: try to find any long alphanumeric string (25+ chars) that looks like an ID
  // This handles edge cases and unusual link formats
  var fallbackPattern = /([a-zA-Z0-9_-]{25,})/g;
  var fallbackMatches = link.match(fallbackPattern);
  if (fallbackMatches && fallbackMatches.length > 0) {
    // Return the longest match (most likely to be the actual ID)
    var longestMatch = fallbackMatches[0];
    for (var i = 1; i < fallbackMatches.length; i++) {
      if (fallbackMatches[i].length > longestMatch.length) {
        longestMatch = fallbackMatches[i];
      }
    }
    return longestMatch;
  }

  return null;
}

/**
 * Determines if a link points to a folder by checking if "folder" appears before the ID.
 * Purpose: Identify folder links to handle them differently from file links.
 * 
 * Method of operation:
 * Checks if the word "folder" (case-insensitive) appears in the link
 * before the position of the extracted ID.
 * 
 * @param {string} link - The Google Drive link
 * @param {string} id - The extracted ID from the link
 * @return {boolean} True if the link is for a folder, false otherwise
 */
function isFolderLink(link, id) {
  if (!link || !id) {
    return false;
  }

  var idIndex = link.indexOf(id);
  if (idIndex === -1) {
    return false;
  }

  // Check if "folder" appears before the ID (case-insensitive)
  var linkBeforeId = link.substring(0, idIndex).toLowerCase();
  return linkBeforeId.includes('folder');
}

/**
 * Copies a folder and all its contents to the user's Drive root folder.
 * Purpose: Recursively copy a folder structure with all files and subfolders, handling shortcuts.
 * 
 * Method of operation:
 * 1. Gets the source folder by ID (may be a shortcut to a folder)
 * 2. If it's a shortcut, resolves it to the original folder
 * 3. Creates a new folder with the same name in the root
 * 4. Recursively copies all files and subfolders using copyFolderContents
 * 
 * @param {string} folderId - The ID of the folder (or shortcut to folder) to copy
 */
function copyFolder(folderId) {
  Logger.log('מנסה להעתיק תיקייה עם ID: ' + folderId);
  try {
    var sourceFolder;
    
    // First, try to get it as a file to check if it's a shortcut
    try {
      var sourceItem = DriveApp.getFileById(folderId);
      
      // Check if this is a shortcut to a folder
      if (sourceItem.getMimeType() === 'application/vnd.google-apps.shortcut') {
        var targetId = sourceItem.getTargetId();
        if (targetId) {
          try {
            // Try to get the target as a folder
            sourceFolder = DriveApp.getFolderById(targetId);
            Logger.log('קיצור דרך לתיקייה זוהה. מעתיק את התיקייה המקורית: "' + sourceFolder.getName() + '"');
          } catch (error) {
            Logger.log('שגיאה בקבלת התיקייה המקורית מקיצור הדרך: ' + error.message);
            return;
          }
        } else {
          Logger.log('שגיאה: לא ניתן לקבל את ה-ID של התיקייה המקורית מקיצור הדרך');
          return;
        }
      } else {
        // Not a shortcut, try to get it as a folder directly
        sourceFolder = DriveApp.getFolderById(folderId);
      }
    } catch (fileError) {
      // If getFileById fails, try to get it as a folder directly
      try {
        sourceFolder = DriveApp.getFolderById(folderId);
      } catch (folderError) {
        Logger.log('שגיאה בקבלת התיקייה: ' + folderError.message);
        return;
      }
    }
    
    var destFolder = DriveApp.getRootFolder();
    var newFolder = destFolder.createFolder(sourceFolder.getName());
    
    copyFolderContents(sourceFolder, newFolder);
    Logger.log('התיקייה "' + sourceFolder.getName() + '" הועתקה בהצלחה.');
  } catch (error) {
    Logger.log('שגיאה בהעתקת התיקייה: ' + error.message);
  }
}

/**
 * Gets the original file if the provided file is a shortcut, otherwise returns the file itself.
 * Purpose: Resolve shortcuts to their target files so we can copy the original files instead of shortcuts.
 * 
 * Method of operation:
 * 1. Checks if the file is a shortcut by examining its MIME type
 * 2. If it's a shortcut (MIME type: application/vnd.google-apps.shortcut), gets the target file ID
 * 3. Retrieves and returns the original target file
 * 4. If it's not a shortcut, returns the file itself
 * 
 * @param {File} file - The file to check (may be a shortcut or regular file)
 * @return {File} The original file if it's a shortcut, or the file itself if it's not
 */
function getOriginalFile(file) {
  if (!file) {
    return null;
  }
  
  var mimeType = file.getMimeType();
  
  // Check if this is a shortcut
  if (mimeType === 'application/vnd.google-apps.shortcut') {
    var targetId = file.getTargetId();
    if (targetId) {
      try {
        // Try to get the target file
        var targetFile = DriveApp.getFileById(targetId);
        Logger.log('קיצור דרך זוהה: "' + file.getName() + '" מפנה לקובץ: "' + targetFile.getName() + '"');
        return targetFile;
      } catch (error) {
        Logger.log('שגיאה בקבלת הקובץ המקורי מקיצור הדרך "' + file.getName() + '": ' + error.message);
        // If we can't get the target, return the shortcut itself
        return file;
      }
    }
  }
  
  // Not a shortcut, return the file itself
  return file;
}

/**
 * Recursively copies all files and subfolders from source folder to destination folder.
 * Purpose: Handle deep folder structures by copying all nested content, including resolving shortcuts to original files.
 * 
 * Method of operation:
 * 1. Copies all files in the source folder to the destination
 * 2. For each file, checks if it's a shortcut and resolves it to the original file before copying
 * 3. Recursively processes all subfolders by calling itself for each subfolder
 * 4. Handles errors gracefully, logging failures but continuing with other items
 * 
 * @param {Folder} source - The source folder to copy from
 * @param {Folder} dest - The destination folder to copy to
 */
function copyFolderContents(source, dest) {
  var files = source.getFiles();
  while (files.hasNext()) {
    try {
      var file = files.next();
      // Get the original file if this is a shortcut, otherwise get the file itself
      var fileToCopy = getOriginalFile(file);
      
      if (fileToCopy) {
        fileToCopy.makeCopy(fileToCopy.getName(), dest);
        if (file.getMimeType() === 'application/vnd.google-apps.shortcut') {
          Logger.log('הועתק קובץ מקורי מקיצור דרך: ' + fileToCopy.getName());
        } else {
          Logger.log('הועתק קובץ: ' + fileToCopy.getName());
        }
      }
    } catch (error) {
      Logger.log('נכשל בהעתקת קובץ: ' + file.getName() + '. שגיאה: ' + error.message);
    }
  }
  
  var folders = source.getFolders();
  while (folders.hasNext()) {
    try {
      var subFolder = folders.next();
      var newSubFolder = dest.createFolder(subFolder.getName());
      copyFolderContents(subFolder, newSubFolder);
      Logger.log('הועתקה תת-תיקייה: ' + subFolder.getName());
    } catch (error) {
      Logger.log('נכשל בהעתקת תת-תיקייה: ' + subFolder.getName() + '. שגיאה: ' + error.message);
    }
  }
}

/**
 * Copies a Google Docs or Google Sheets file to the user's Drive root folder.
 * Purpose: Handle Google Docs and Sheets files specifically, ensuring proper copy creation, including shortcuts.
 * 
 * Method of operation:
 * 1. Gets the file by ID using DriveApp
 * 2. Checks if it's a shortcut and resolves it to the original file
 * 3. Uses makeCopy() method which works for Google Docs/Sheets files
 * 4. Places the copy in the root folder
 * 
 * @param {string} fileId - The ID of the Google Docs or Sheets file (or shortcut to it)
 * @param {boolean} isGoogleDoc - True if it's a Google Doc, false if it's a Google Sheet
 */
function copyGoogleDocOrSheet(fileId, isGoogleDoc) {
  Logger.log('מנסה להעתיק ' + (isGoogleDoc ? 'מסמך Google Docs' : 'גיליון Google Sheets') + ' עם ID: ' + fileId);
  try {
    var file = DriveApp.getFileById(fileId);
    
    // Get the original file if this is a shortcut
    var fileToCopy = getOriginalFile(file);
    if (!fileToCopy) {
      Logger.log('שגיאה: לא ניתן לקבל את הקובץ');
      return;
    }
    
    var name = fileToCopy.getName();
    var mimeType = fileToCopy.getMimeType();
    var destFolder = DriveApp.getRootFolder();
    
    Logger.log('סוג הקובץ: ' + mimeType);
    Logger.log('שם הקובץ: ' + name);
    
    if (file.getMimeType() === 'application/vnd.google-apps.shortcut') {
      Logger.log('קיצור דרך זוהה. מעתיק את הקובץ המקורי.');
    }
    
    // makeCopy() works for Google Docs and Sheets files
    // It creates a proper copy that the user owns
    var newFile = fileToCopy.makeCopy(name, destFolder);
    Logger.log('הקובץ "' + name + '" הועתק בהצלחה. ID של העותק: ' + newFile.getId());
  } catch (error) {
    Logger.log('שגיאה בהעתקת הקובץ: ' + error.message);
    Logger.log('פרטי השגיאה: ' + JSON.stringify(error));
  }
}

/**
 * Copies a single file (non-Google Docs/Sheets) to the user's Drive root folder.
 * Purpose: Handle regular files (PDFs, images, etc.) by creating a copy, including shortcuts.
 * 
 * Method of operation:
 * 1. Gets the file by ID using DriveApp
 * 2. Checks if it's a shortcut and resolves it to the original file
 * 3. Creates a copy with the same name in the root folder
 * 
 * @param {string} fileId - The ID of the file (or shortcut to file) to copy
 */
function copySingleFile(fileId) {
  Logger.log('מנסה להעתיק קובץ עם ID: ' + fileId);
  try {
    var file = DriveApp.getFileById(fileId);
    
    // Get the original file if this is a shortcut
    var fileToCopy = getOriginalFile(file);
    if (!fileToCopy) {
      Logger.log('שגיאה: לא ניתן לקבל את הקובץ');
      return;
    }
    
    var name = fileToCopy.getName();
    var destFolder = DriveApp.getRootFolder();
    
    if (file.getMimeType() === 'application/vnd.google-apps.shortcut') {
      Logger.log('קיצור דרך זוהה. מעתיק את הקובץ המקורי: "' + name + '"');
    }
    
    var newFile = fileToCopy.makeCopy(name, destFolder);
    Logger.log('הקובץ "' + name + '" הועתק בהצלחה.');
  } catch (error) {
    Logger.log('שגיאה בהעתקת הקובץ: ' + error.message);
  }
}