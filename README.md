# Daaris Global - Educational Offers Website

A mobile-friendly website to showcase educational offers with a beautiful white and purple mixed theme. Images are loaded dynamically from Google Drive.

## Features

- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 🔍 **Search Functionality** - Filter offers by name (contains search)
- 🖼️ **Fullscreen View** - Click any offer to view it in fullscreen
- 🎨 **White & Purple Theme** - Clean and modern design
- ☁️ **Google Drive Integration** - Images load automatically from your folder
- ⚡ **Fast & Lightweight** - Vanilla HTML, CSS, and JavaScript

## Quick Start

### 1. Set Up Google Drive Folder

1. **Create a folder in Google Drive**
   - Create a new folder for your educational offer images
   - Upload all your offer images to this folder
   - Right-click the folder → "Share" → Set to "Anyone with the link can view"
   - Copy the folder URL - it looks like: `https://drive.google.com/drive/folders/1ABC123xyz`
   - Extract the folder ID (`1ABC123xyz`) - you'll need this

### 2. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create an API key
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

### 3. Configure the Website

Open `js/config.js` and update:

```javascript
const CONFIG = {
    siteName: "Daaris Global",
    
    // Add your Google API key here
    googleApiKey: "YOUR_GOOGLE_API_KEY_HERE",
    
    // Add your Google Drive folder ID here
    googleDriveFolderId: "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE",
    
    // ... rest of config
};
```

### 4. Run the Website

Simply open `index.html` in your browser, or use a local server:

```bash
npx http-server . -p 8080 -o
```

Or with npm:

```bash
npm run serve
```

## How It Works

- The website automatically fetches all images from your Google Drive folder
- Image filenames (without extension) become the offer names
- Example: `Summer Program 2026.jpg` displays as "Summer Program 2026"
- No need to manually configure each image!

## Deploying to GitHub Pages

1. Push your code to GitHub
2. Make sure `js/config.js` has your API key and folder ID
3. Go to repository Settings → Pages
4. Select your branch (usually `main`) and root folder
5. Your site will be available at `https://username.github.io/repository-name`

**Note:** Your Google API key will be visible in the source code. For security:
- Restrict your API key to specific domains in Google Cloud Console
- Set HTTP referrer restrictions to your GitHub Pages domain

## Project Structure

```
DaarisGlobal/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Stylesheet (white & purple theme)
├── js/
│   ├── config.js       # Configuration (API key & folder ID)
│   └── app.js          # Main application logic
├── package.json        # NPM configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Customization

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --primary-white: #ffffff;
    --purple-primary: #7c3aed;     /* Main purple accent */
    --purple-light: #a78bfa;       /* Light purple */
    /* ... more variables */
}
```

### Changing the Site Name

1. Update `<title>` in `index.html`
2. Update `<h1>` in the header
3. Update `siteName` in `js/config.js`

## Troubleshooting

### Images not loading?

1. Verify your Google Drive folder is shared publicly
2. Check that your API key is correct
3. Make sure Google Drive API is enabled in Google Cloud Console
4. Check browser console for error messages

### API quota exceeded?

Google Drive API has free tier limits. If you exceed them:
- Wait for the quota to reset
- Consider upgrading your Google Cloud project

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## License

MIT License - Feel free to use this for your projects!

---

Made with 💜 by Daaris Global
