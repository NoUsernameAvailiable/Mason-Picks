# Deployment Guide

Since this is a static React application built with Vite, you can deploy it to many free hosting providers. Here are the easiest options:

## Option 1: Vercel (Recommended)
Vercel is optimized for frontend frameworks and is very easy to use.

1.  **Create a GitHub Repository**:
    - Go to GitHub and create a new repository.
    - Push your code to this repository:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin <your-repo-url>
      git push -u origin main
      ```

2.  **Deploy on Vercel**:
    - Go to [vercel.com](https://vercel.com) and sign up/login.
    - Click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository.
    - Vercel will automatically detect Vite.
    - Click **"Deploy"**.

## Option 2: Netlify
Netlify is another great option for static sites.

1.  **Drag and Drop**:
    - Run `npm run build` in your terminal.
    - This creates a `dist` folder in your project.
    - Go to [netlify.com](https://netlify.com) and sign up/login.
    - Drag and drop the `dist` folder onto the Netlify dashboard.

2.  **Connect to GitHub** (for automatic updates):
    - Push your code to GitHub (same as above).
    - On Netlify, click **"Add new site"** -> **"Import an existing project"**.
    - Connect to GitHub and select your repository.
    - Build command: `npm run build`
    - Publish directory: `dist`
    - Click **"Deploy"**.

## Option 3: GitHub Pages
To deploy to GitHub Pages, you need a slight configuration change.

1.  **Update `vite.config.js`**:
    - Add the `base` property with your repository name:
      ```javascript
      import { defineConfig } from 'vite'
      import react from '@vitejs/plugin-react'

      // https://vitejs.dev/config/
      export default defineConfig({
        plugins: [react()],
        base: '/your-repo-name/', // REPLACE THIS with your repo name
      })
      ```

2.  **Push to GitHub**.

3.  **Enable Pages**:
    - Go to your repository **Settings** -> **Pages**.
    - Select **Source**: `GitHub Actions` or use a workflow to build and deploy.
    - Alternatively, install the `gh-pages` package:
      ```bash
      npm install gh-pages --save-dev
      ```
    - Add a script to `package.json`:
      ```json
      "deploy": "gh-pages -d dist"
      ```
    - Run `npm run build` then `npm run deploy`.
