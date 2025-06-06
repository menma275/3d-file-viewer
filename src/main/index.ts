import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { v4 as uuidv4 } from 'uuid'
import Store from 'electron-store'
import { OllamaEmbeddings, ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from "@langchain/core/prompts"
import type { FolderPath, FolderSchema, FileSchema, CustomVectorSchema } from '../types/index'
import { readFile, readdir, stat } from 'node:fs/promises'

//let ollamaProcess: ReturnType<typeof spawn> | null = null

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
ipcMain.handle('ollama:embed', async (_, prompt: string): Promise<number[]> => {
  try {
    const embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text'
    })
    const result = await embeddings.embedQuery(prompt)
    return result
  } catch (err) {
    console.error('埋め込み取得中にエラー:', err)
    return []
  }
})

ipcMain.handle('ollama:vision', async (_, imagePath: string): Promise<{ content: string, base64: string }> => {
  try {
    const buffer = await readFile(imagePath); // 画像をバイナリで読み込む
    const base64Image = buffer.toString('base64')
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`

    const chat = new ChatOllama({
      model: 'llava', // Vision対応モデル
      // model: 'gemma3', // Vision対応モデル（他のやつのがいいかも一旦gemma3）
      temperature: 0
    })

    const result = await chat.invoke([
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageDataUrl }
          },
          {
            type: 'text',
            text: 'You are an image analysis system. Output only the description of the image contents in plain text. Do not include any greetings, explanations, or extra text.'
          }
        ]
      }
    ])
    if (typeof result.content === 'string') {
      return {
        content: result.content,
        base64: base64Image
      }
    } else return { content: '', base64: '' }
  } catch (err) {
    console.error('画像読み込み or モデル処理エラー:', err)
    return { content: '画像の読み込みまたは処理に失敗しました。', base64: '' }
  }
})

// `You are a scoring system. Do not add any explanations, greetings, or extra text.
      // Score the following content from 0.000 to 1.000 for each of the given words.
      // Return only a JSON array of numbers in the same order as the words.
      // Do not include any additional text or formatting.
      // for example
      // Content: "***file1***I'm not really impressed, but it wasn't horrible either., ***file2***I want to become human soon."
      // Respond in JSON format like this:
      // ***file1***
      // {{
      //   "word1": 0.224,
      //   "word2": 0.003,
      //   "word3": 0.503
      // }}
      // ***file2***
      // {{
      //   "word1": 0.102,
      //   "word2": 0.332,
      //   "word3": 0.607
      // }}
      //   Words: {customVec}
      //   Content: {content}`

ipcMain.handle('ollama:custom', async (_, files: string, customVecs: string[]): Promise<string> => {
  try {
    console.log('解析開始')
    const prompt = PromptTemplate.fromTemplate(
      `You are a scoring system. Do not add any explanations, greetings, or extra text.
      You will be given multiple text files and a list of words.

      Your task:
      1. For each file, score the content from 0.000 to 1.000 for each word which is {customVec}.
      2. Return each file's result as a separate block.
      3. Each block should start with the filename (e.g. "1.txt"), then output a JSON object of the scores for that file.
      4. Do not merge all scores into a single JSON. Keep each file's result isolated.

      Example:
      Input:
      Words: ["para1", "para2", "para3"]
      Content:
      ***1.txt***I'm not really impressed, but it wasn't horrible either., ***2.txt***I want to become human soon.

      Output:
      1.txt
      {{
        "word1": 0.224,
        "word2": 0.003,
        "word3": 0.503
      }}
      2.txt
      {{
        "word1": 0.102,
        "word2": 0.332,
        "word3": 0.607
      }}

      Words: {customVec}
      Content: {content}`
    )
    const chatModel = new ChatOllama({
      model: 'gemma3',
      maxRetries: 2,
      temperature: 0
    })

    const chain = prompt.pipe(chatModel)
    const result = await chain.invoke({
      customVec: JSON.stringify(customVecs),
      content: files
    })

    if (typeof result.content === 'string') {
      return result.content
    } else {
      return 'contentがstringではありません'
    }
  } catch (err) {
    console.error('ChatOllamaエラー:', err)
    return ''
  }
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

ipcMain.handle('fileDatas:delete', async () => {
  const store = new Store()
  store.delete('fileDatas')
})

ipcMain.handle('fileDatas:get', async () => {
  // const store = new Store()
  // store.delete('fileDatas')
  // store.delete('folders')
  return fileDataStore.get('fileDatas', [])
})

ipcMain.handle('fileDatas:add', async (_, newFileDataList) => {
  fileDataStore.set('fileDatas', newFileDataList)
})

// handle axis datas ----------
const customVectorSchemaStore = new Store<CustomVectorSchema[]>()

ipcMain.handle('customVectorStore:get', async () => {
  return customVectorSchemaStore.get('customVectors')
})

ipcMain.handle('customVectorStore:add', async (_, customVectorName: string) => {
  const exsisting = customVectorSchemaStore.get('customVectors', [])
  const customVector: CustomVectorSchema = {
    id: uuidv4(),
    name: customVectorName
  }
  const isDuplicate = exsisting.some((v: CustomVectorSchema) => v.name === customVectorName)
  if (isDuplicate) return

  return customVectorSchemaStore.set('customVectors', [...exsisting, customVector])
})

// handle open file in finder/explorer ----------
ipcMain.handle('showItemInFolder', async (_, filePath: string) => {
  // shell.openPath(filePath)
  shell.showItemInFolder(filePath)
})

// base64
ipcMain.handle('base64', async (_, filePath: string) => {
  const buffer = await readFile(filePath); // 画像をバイナリで読み込む
  const base64Image = buffer.toString('base64')
  const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const imageDataUrl = `data:${mimeType};base64,${base64Image}`

  return imageDataUrl
})
