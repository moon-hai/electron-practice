const path = require('path')
const os = require('os')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imagePngquant = require('imagemin-pngquant')
const slash = require('slash')
const { app, BrowserWindow, Menu, MenuItem, globalShortcut, ipcMain, shell } = require('electron')

process.env.NODE_ENV = 'development'
const isDev = process.env.NODE_ENV === 'development'
const isMac = process.platform === 'darwin'

let mainWindow
let aboutWindow

function createMainWindow () {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 800,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    backgroundColor: 'white',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('./app/index.html')
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
}

function creatAboutWindow () {
  aboutWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 400,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true
    }
  })

  aboutWindow.loadFile('./app/about.html')
  // aboutWindow.webContents.openDevTools()
}

// menu
const menu = [
  ...(isMac ?
    [
      {
        label: app.name,
        submenu: [
          {
            label: 'About',
            click: creatAboutWindow
          }
        ]
      }
    ]
    : []),

    ...(!isMac ?
      [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: creatAboutWindow
            }
          ]
        }
      ]
      : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+W',
        click: () => app.quit()
      }
    ]
  }
]

app.whenReady().then(() => {
  createMainWindow()

  mainWindow.on('closed', () => mainWindow = null)

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  // global shortcuts
  // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
  // globalShortcut.register('CmdOrCtrl+Shift+I', () => mainWindow.toggleDevTools())

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

ipcMain.on('image:minimize', (e, options) => {
  shrinkImage(options)
})

async function shrinkImage ({ imgPath, quality }) {
  try {
    const pngQuality = quality / 100

    await imagemin([slash(imgPath)], {
      destination: path.join(__dirname, 'imageshrink'),
      plugins: [
        imageminMozjpeg({ quality }),
        imagePngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    })

    mainWindow.webContents.send('image:done')
  } catch(err) {
    console.log(err)
  }
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
