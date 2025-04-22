const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const isDev = require("electron-is-dev");

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // icon: path.join(__dirname, "assets/icons/app-icon.png"),
    // icon: path.join(__dirname, "assets/icons/app-icon.icns"),
    icon: path.join(__dirname, "assets/icons/app-icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.webContents.openDevTools(); 

  // mainWindow.loadURL("http://localhost:5173"); 

  mainWindow.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "render/dist/index.html")}`
  );
};

// 🔁 App Lifecycle
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
  const fullPath = path.join(documentsPath, filename);
  return fullPath;
});

// 💾 Save PDF to custom path
ipcMain.handle("save-pdf", async (_, filepath, uint8Array) => {
  try {
    await fs.promises.writeFile(filepath, Buffer.from(uint8Array));
    return true;
  } catch (err) {
    console.error("Failed to save PDF:", err);
    return false;
  }
});

// 🔍 Check if file exists
ipcMain.handle("check-file", async (_, filepath) => {
  return fs.existsSync(filepath);
});

// 🔑 Send Email with Optional Attachment
ipcMain.handle("send-email", async (_, data) => {
  const { to, subject, body } = data;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pratikvaghasiya562@gmail.com",
        pass: "xkev taxh feqs bkrd", // ✅ App Password
      },
    });

    const mailOptions = {
      from: '"Shopper Bill Book" <pratikvaghasiya562@gmail.com>',
      to,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Email Error:", error); // Log full error
    return { success: false, error: error.message };
  }
});
