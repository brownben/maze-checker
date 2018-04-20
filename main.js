const { app, BrowserWindow, Menu } = require('electron')
const ipc = require('electron').ipcMain
const path = require('path')
const url = require('url')

let win

function createWindow () {
    win = new BrowserWindow(
        {
            width: 800,
            height: 600,
            minWidth: 365,
            minHeight: 90,
            frame: false,
            icon: './assets/WOD White.png',
            show: false,
        })
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
    }))
    win.on('ready-to-show', function () {
        win.show()
        win.webContents.send('resize', win.getSize())
        win.focus()
    })
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

// Context Menu
var contextMenu = [{
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy',
},
{
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut',
},
{
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste',
},
{ type: 'separator' },
{
    label: 'Toggle Menu',
    click: () => { win.webContents.send('toggle-menu', 'true') },
}]

const ContextMenu = Menu.buildFromTemplate(contextMenu)
app.on('browser-window-created', function (event, win) {
    win.webContents.on('context-menu', function (e, params) {
        ContextMenu.popup(win, params.x, params.y)
    })
})

// Menu Titlebar Icons
var maximized = false
ipc.on('window', function (event, arg) {
    if (arg === 'maximize') {
        if (maximized === false) {
            win.maximize()
            maximized = true
            event.sender.send('window', 'maximized')
        }
        else {
            win.unmaximize()
            maximized = false
            event.sender.send('window', 'minimized')
        }
    }
    else if (arg === 'minimize') {
        win.minimize()
    }
})

ipc.on('resize', function (event, arg) {
    event.sender.send('resize', win.getSize())
})
