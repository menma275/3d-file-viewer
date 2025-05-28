import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { v4 as uuidv4 } from 'uuid'
import Store from 'electron-store'
import ollama from 'ollama'
import type { FolderPath, FolderSchema, FileSchema } from '../types/index'
import { readFile, readdir, stat } from 'node:fs/promises'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ipcMain.on('ping', () => console.log('pong'))

  // 任意のフォルダを選択
  ipcMain.handle('dialog:openFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// handle folder paths -----------------
const folderPathStore = new Store<FolderSchema>()

ipcMain.handle('folderPath:get', async () => {
  return folderPathStore.get('folders', [])
})

ipcMain.handle('folderPath:add', async (_, folderPath: string) => {
  const exsisting = folderPathStore.get('folders', [])

  const isDuplicate = exsisting.some((f) => f.folderPath === folderPath)
  if (isDuplicate) return

  const newFolder: FolderPath = {
    id: uuidv4(),
    customName: folderPath.split('/').pop() || '',
    folderPath
  }
  folderPathStore.set('folders', [...exsisting, newFolder])
})

// handle file datas -----------------
const fileDataStore = new Store<FileSchema>()

ipcMain.handle('ollama:embed', async (_, prompt: string) => {
  const response = await ollama.embeddings({
    model: 'nomic-embed-text',
    prompt
  })
  return response
})

ipcMain.handle('readFile', async (_, filePath) => {
  return await readFile(filePath, 'utf-8')
})

ipcMain.handle('fileStat', async (_event, filePath) => {
  const fileStat = await stat(filePath)
  return {
    birthtime: fileStat.birthtime.toISOString(),
    mtime: fileStat.mtime.toISOString()
  }
})

ipcMain.handle('readDir', async (_, dirPath) => {
  return await readdir(dirPath)
})

ipcMain.handle('fileDatas:get', async () => {
  return fileDataStore.get('fileDatas', [])
})

ipcMain.handle('fileDatas:add', async (_, newFileDataList) => {
  const exsistingFile = fileDataStore.get('fileDatas', [])
  const merged = [...exsistingFile, ...newFileDataList]
  fileDataStore.set('fileDatas', merged)
})

// handle axis datas ----------
// const axisNameStore = new Store<VectorNames>()
//
// ipcMain.handle('axisName:get', async () => {
//   return axisNameStore.get('axisNames')
// })
