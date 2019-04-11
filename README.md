# fed-electron-init
使用electron + electron-vue 初始化一个简单的桌面客户端应用

使用`request`批量模拟局域网内的矿机登录管理后台并且执行相关操作


## 安装全局依赖
```
npm install -g yarn
```
```
yarn config set registry https://registry.npm.taobao.org --global
yarn config set disturl https://npm.taobao.org/dist --global
```
```
yarn global add @vue/cli
yarn global add electron@latest
```
## 运行当前项目
```
yarn

yarn electron:serve

yarn electron:build
```

## 新建一个项目步骤
1、使用 Vue CLI3 初始化一个vue项目

2、在当前vue项目中添加依赖`yarn add -dev vue-cli-plugin-electron-builder`

3、初始化electron-builder`vue add electron-builder`

4、添加依赖`yarn add --dev electron-icon-builder`

5、添加客户端图标原始图标`public/icon.png`

6、`package.json`添加脚本
```json
"electron:generate-icons": "electron-icon-builder --input=./public/icon.png --output=build --flatten"
```

7、生成客户端图标各个尺寸图标`yarn electron:generate-icons`

8、在`src/background.(js|ts)`中引入图标
```js
// Import path module (at the top of your file, below 'use-strict')
import path from 'path'

// Replace
win = new BrowserWindow({ width: 800, height: 600 })
// With
win = new BrowserWindow({
  width: 800,
  height: 600,
  icon: path.join(__static, 'icon.png')
})
// 参考 https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#icons
```

9、Dev 
```
yarn electron:serve
```

10、Build （会根据当前开发环境系统生成对应的应用安装包）
```
yarn electron:build
```

<img width='100%' src='https://raw.githubusercontent.com/Adangs/fed-electron-init/master/src/assets/images/demo-png.png'>

## 参考文档
- electron-vue：https://simulatedgreg.gitbooks.io/electron-vue/cn/
- Vue CLI Plugin Electron Builder： https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/