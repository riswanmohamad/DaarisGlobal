/**
 * Daaris Global - Configuration File
 * 
 * HOW TO SET UP YOUR GOOGLE DRIVE FOLDER:
 * 1. Create a folder in Google Drive
 * 2. Upload all your educational offer images to this folder
 * 3. Right-click the folder → Share → "Anyone with the link" can view
 * 4. Copy the folder link - it looks like: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
 * 5. Extract YOUR_FOLDER_ID and paste it below
 * 6. Get a Google API Key from: https://console.cloud.google.com/apis/credentials
 * 7. Enable Google Drive API for your project
 * 8. Add the API key below
 * 
 * IMAGE NAMING:
 * The filename (without extension) will be used as the offer name.
 * Example: "Summer Program 2026.jpg" will display as "Summer Program 2026"
 * https://drive.google.com/drive/folders/1dLpwx5dUb4lgj3Bx7H9oLTO2G4qb_sEM?usp=drive_link
 */

const CONFIG = {
    // Site settings
    siteName: "Daaris Global",
    
    // Google Drive API settings
    googleApiKey: "AIzaSyB3szWPnvkPrym5O3v35nRbxIkrnqj9fZo",
    // Your shared folder ID
    googleDriveFolderId: "1dLpwx5dUb4lgj3Bx7H9oLTO2G4qb_sEM",
    
    // API endpoints
    googleDriveApiUrl: "https://www.googleapis.com/drive/v3/files",
    googleDriveThumbnailUrl: "https://drive.google.com/thumbnail?id=",
    googleDriveViewUrl: "https://drive.google.com/uc?export=view&id="
};

// Freeze the config to prevent accidental modifications
Object.freeze(CONFIG);
