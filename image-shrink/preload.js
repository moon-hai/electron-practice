const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('image', {
  resize: (options) => {
    ipcRenderer.send('image:minimize', options)
  },

  doneResize: (cb) => {
    ipcRenderer.on('image:done', cb)
  }
})
