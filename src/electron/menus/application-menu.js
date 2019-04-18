const { Menu, app, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

const version = app.getVersion()
let win
let updateSource = 'menu' // 更新事件触发来源  menu:通过菜单触发 vue:通过vue页面触发
let template = [{
  label: '编辑',
  submenu: [{
    label: '剪切',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'CmdOrCtrl+X'
      } else {
        return 'Ctrl+X'
      }
    })(),
    role: 'cut'
  }, {
    label: '复制',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'CmdOrCtrl+C'
      } else {
        return 'Ctrl+C'
      }
    })(),
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'CmdOrCtrl+V'
      } else {
        return 'Ctrl+V'
      }
    })(),
    role: 'paste'
  }]
}, {
  label: '工具',
  submenu: [{
    label: '刷新',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'CmdOrCtrl+R'
      } else {
        return 'F5'
      }
    })(),
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.reload()
      }
    }
  }, {
    label: '全屏',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: '检查',
    accelerator: 'F12',
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }]
}]

function findReopenMenuItem () {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(item => {
    if (item.submenu) {
      item.submenu.items.forEach(item => {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}

// mac 添加退出
if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name + ' v' + version,
    submenu: [{
      label: '退出',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      }
    }]
  })
}
// win 添加更新菜单
if (process.platform === 'win32') {
  template.push({
    label: '帮助',
    submenu: [{
      label: `当前版本 v${version}`,
      enabled: false
    }, {
      label: '检查更新',
      accelerator: 'Ctrl+U',
      click: (item, focusedWindow) => {
        // 执行自动更新检查
        win = focusedWindow
        updateSource = 'menu'
        autoUpdater.checkForUpdates()
      }
    }]
  })
}

/**
 * @abstract 自动检测更新
 */
const updateUrl = 'https://okminer-static.oss-cn-hangzhou.aliyuncs.com/download/helper/'
function initAutoUpdate () {
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(updateUrl)
  // 下面是自动更新的整个生命周期所发生的事件
  // 错误
  autoUpdater.on('error', (message) => {
    showDialog({
      type: 'error',
      msg: '更新失败，请联系客服人员'
    })
  })
  // 触发更新事件回调
  autoUpdater.on('checking-for-update', () => {
    // 主动发送消息给渲染进程函数
    win.webContents.send('checking-for-update', updateSource)
  })
  // 有版本更新事件回调
  autoUpdater.on('update-available', (message) => {
    // 主动发送消息给渲染进程函数
    win.webContents.send('update-available', message, updateSource)
  })
  // 没有版本更新事件回调
  autoUpdater.on('update-not-available', (message) => {
    win.webContents.send('update-not-available', message, updateSource)
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', (progress, updateSource) => {
    // 主动发送消息给渲染进程函数
    // progress -->
    // {
    //   bytesPerSecond: 3721624
    //   delta: 3665200
    //   percent: 16.618819472606397
    //   total: 44788067
    //   transferred: 7443248
    // }
    win.webContents.send('download-progress', progress)
  })
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', () => {
    // 主动发送消息给渲染进程函数
    win.webContents.send('update-downloaded')
  })
}
initAutoUpdate()

// 显示提示框
function showDialog (res, callback) {
  const options = {
    type: res.type || 'info',
    title: res.title || '提示',
    buttons: res.buttons || ['好'],
    message: res.msg
  }
  dialog.showMessageBox(Object.assign(options, res), callback)
}
/**
 * @abstract 主进程监听渲染进程传来的信息
 */
ipcMain.on('send-checking-for-update', (event, arg) => {
  updateSource = 'vue'
  // 执行自动更新检查
  autoUpdater.checkForUpdates()
})
// 安装更新包
ipcMain.on('update-downloaded', (event, arg) => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})
