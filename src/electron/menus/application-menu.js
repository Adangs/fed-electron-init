const { Menu, app, shell, dialog } = require('electron')

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

function addUpdateMenuItems (items, position) {
  if (process.mas) return

  const version = app.getVersion()
  let updateItems = [{
    label: `Version ${version}`,
    enabled: false
  }, {
    label: 'Checking for Update',
    enabled: false,
    key: 'checkingForUpdate'
  }, {
    label: 'Check for Update',
    visible: false,
    key: 'checkForUpdate',
    click: () => {
      require('electron').autoUpdater.checkForUpdates()
    }
  }, {
    label: 'Restart and Install Update',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click: () => {
      require('electron').autoUpdater.quitAndInstall()
    }
  }]

  items.splice.apply(items, [position, 0].concat(updateItems))
}

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

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: '退出',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Command+Q'
        } else {
          return 'Ctrl+Shift+Q'
        }
      })(),
      click: () => {
        app.quit()
      }
    }]
  })

  addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

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
