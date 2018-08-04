const {app, BrowserWindow, ipcMain} = require("electron");

// global reference to windows to prevent closing on js garbage collection
let editorWindow, displayWindow;

function createWindow() {
	editorWindow = new BrowserWindow({width: 1920, height: 1080});
	displayWindow = new BrowserWindow({width: 1920, height: 1080, autoHideMenuBar: true});

	editorWindow.loadFile("./aleph_modules/core/index.html");
	displayWindow.loadFile("./aleph_modules/core/displayWindow.html");

	// dereference windows on close
	editorWindow.on("closed", () => {
	      editorWindow = null;
	});

	displayWindow.on("closed", () => {
		displayWindow = null;
	});

}

app.on("ready", createWindow);

// quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
	  app.quit();
	}		
});

ipcMain.on("changeMode", (event, args) => {
	displayWindow.webContents.send("modeSelector", args);
});

ipcMain.on("listMidi", (event, args) => {
	editorWindow.webContents.send("displayMidi", args);
});

ipcMain.on("selectMidiDevice", (event, args) => {
	displayWindow.webContents.send("selectMidiDevice", args);
});

ipcMain.on("addMidiMapping", (event, args) => {
	displayWindow.webContents.send("addMidiMapping", args);
});