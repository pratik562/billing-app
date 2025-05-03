const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const isDev = require("electron-is-dev");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

let mainWindow;

// ✅ Setup logging
const logFilePath = path.join(app.getPath("logs"), "app.log");
const logToFile = (message) => {
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
};

// ✅ Log environment variables
logToFile(`EMAIL_USER: ${process.env.EMAIL_USER || "❌ MISSING"}`);
logToFile(`EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Exists" : "❌ MISSING"}`);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.resolve(__dirname, "assets/icons/app-icon.ico"),
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = isDev
    ? "http://localhost:5173"
    : `file://${path.resolve(__dirname, "render", "dist", "index.html")}`;
  mainWindow.loadURL(indexPath);

  // ✅ Open DevTools ONLY in development
  if (isDev) mainWindow.webContents.openDevTools();


  // mainWindow.loadURL(`file://${path.resolve(__dirname, "render", "dist", "index.html")}`);
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 📂 Handle getting PDF path
ipcMain.handle("get-pdf-path", async (_, filename) => {
  const documentsPath = app.getPath("documents");
  return path.join(documentsPath, filename);
});

// 💾 Save PDF to custom path
ipcMain.handle("save-pdf", async (_, filepath, uint8Array) => {
  try {
    await fs.promises.writeFile(filepath, Buffer.from(uint8Array));
    return true;
  } catch (err) {
    logToFile("❌ Failed to save PDF: " + err.message);
    return false;
  }
});

// 🔍 Check if file exists
ipcMain.handle("check-file", async (_, filepath) => {
  return fs.existsSync(filepath);
});

// ✉️ Send Email with Debugging
ipcMain.handle("send-email", async (_, data) => {
  try {
    logToFile("🚀 Sending email to: " + data.to);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Shopper Bill Book" <pratikvaghasiya562@gmail.com>',
      to: data.to,
      subject: data.subject,
      html: data.body,
    };

    const info = await transporter.sendMail(mailOptions);
    logToFile("✅ Email sent successfully: " + info.response);
    return { success: true };
  } catch (error) {
    logToFile("❌ Email Error: " + error.message);
    return { success: false, error: error.message };
  }
});
