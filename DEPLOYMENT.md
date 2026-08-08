# Full-Stack Deployment & Local Setup Guide

This application is built as a **Full-Stack Web App** with a **React + Vite Frontend** and an **Express (Node.js) Backend** with local JSON-based database persistence (`database.json`).

Because it has a live server backend, **it cannot be hosted on static-only hosting services like Netlify, Vercel (static tier), or GitHub Pages** using standard "drop and deploy" because they do not support running persistent Node.js servers.

Below is the complete guide to running the app locally in VS Code and deploying it to the cloud.

---

## 💻 1. How to Run Locally in VS Code

To run this project on your own computer, follow these simple steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer (v18 or higher is recommended).

### Step-by-Step Instructions
1. **Open the Project in VS Code**:
   Launch VS Code, click **File > Open Folder**, and select this project folder.

2. **Open the Integrated Terminal**:
   Press ``Ctrl + ` `` (or ``Cmd + ` `` on macOS) to open the terminal in VS Code.

3. **Install Dependencies**:
   Run the following command to download all required packages:
   ```bash
   npm install
   ```

4. **Start the Combined Full-Stack Server**:
   Instead of running Vite directly, you must run the server script which launches the Express backend and automatically integrates Vite:
   ```bash
   npm run dev
   ```

5. **Access the App**:
   Once the terminal prints `Server running on http://localhost:3000`, open your browser and navigate to:
   ```
   http://localhost:3000
   ```

*(Note: The Express server on port 3000 handles all `/api/*` requests and serves your React frontend automatically.)*

---

## 🚀 2. Deploying to the Cloud (Full-Stack Platforms)

Since the app uses an Express backend and writes to `database.json` for persistence, you must deploy it to a platform that supports Node.js services.

### Recommended Platform: **Render** (Free / Low Cost)
Render is the easiest platform to deploy this app. Follow these steps:

1. **Push your code to GitHub**:
   Create a new GitHub repository and push your project files to it.
2. **Create a Web Service on Render**:
   - Go to [Render.com](https://render.com/), sign in, and click **New > Web Service**.
   - Connect your GitHub repository.
3. **Configure the Service Settings**:
   - **Environment / Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. **Environment Variables**:
   - Add your `GEMINI_API_KEY` (if you are utilizing AI helper queries) as an environment variable in the **Environment** tab.
5. **(Optional) Add a Persistent Disk**:
   - Because `database.json` is stored locally, any server restart on a free service will reset the data.
   - On Render, you can mount a **Persistent Disk** (e.g., at `/data`) and update your database path inside your code to point to `/data/database.json` to keep all user accounts, courses, and progress safe between deploys!

### Alternative Platform: **Railway**
Railway is another excellent alternative for full-stack apps:
1. Connect your GitHub repository to [Railway.app](https://railway.app/).
2. Railway will automatically detect the `package.json` file.
3. Set your start script or use Railway's automated buildpacks to run `npm run build` and `npm run start`.

---

## 🌐 3. Why Netlify Doesn't Support Full-Stack Apps Out-of-the-Box
Netlify specializes in **Static Site Hosting**. 
- When you drop files or deploy a Vite app to Netlify, it serves the static HTML/JS/CSS files built inside the `dist/` directory.
- It **does not run** the `server.ts` Express file.
- Any network request made by the browser to `/api/*` will return a `404 Not Found` error because there is no running server to respond to it.
- To use Netlify, you would have to split your app into two parts: host the static frontend on Netlify, and host the Express backend (`server.ts`) on a service like Render, pointing your frontend `api.ts` to the Render URL.
