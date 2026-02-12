# Deployment Guide - Tactical Stealth Solutions

Your covert web presence is ready for deployment. Follow these secure protocols to launch the site.

## Option 1: Netlify Drop (Recommended - Fastest)
This method requires no command line tools and is free.

1.  **Locate the Folder**: Open Finder and navigate to `/Users/quirinwestermeier/Documents/Antigarvity`.
2.  **Go to Netlify**: Visit [app.netlify.com/drop](https://app.netlify.com/drop).
3.  **Drag & Drop**: Drag the entire `Antigarvity` folder onto the "Drag and drop your site folder here" area.
4.  **Launch**: Netlify will instantly deploy your site.
    - *Note*: Use the generated URL (e.g., `tactical-stealth-123.netlify.app`) or connect your own domain in "Domain Settings".

## Option 2: Vercel (Professional)
If you prefer Vercel or have the CLI installed.

1.  **Install CLI** (if needed): `npm i -g vercel`
2.  **Deploy**: Run `vercel` in your terminal within the project folder.
3.  **Follow Prompts**: Select default settings (yes to everything).

## Configuration
We have already included configuration files for both platforms:
- `netlify.toml`: Handles redirects and build settings.
- `vercel.json`: Ensures clean URLs (removing `.html` extensions).
