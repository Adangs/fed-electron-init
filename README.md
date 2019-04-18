# fed-electron-init
使用electron + electron-vue + vue cli3 + vue-cli-plugin-electron-builder 初始化一个简单的桌面客户端应用

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

## 版本更新检测
window版本中支持版本检测升级功能；使用`vue cli3 与 vue-cli-plugin-electron-builder`需要在`vue.config.js`中配置以下内容才能生成对应的`latest.yml`文件；
```$json
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'APP NAME',
        appId: 'APP ID',
        copyright: 'Copyright',
        publish: [
          {
            'provider': 'generic',
            'url': 'https://**.***.com/download/'
          }
        ]
      }
    }
  }
  // builderOptions内对应cli2中在package.json的build内容
```

## 客户端下载
> [<h4>Window x64 版下载</h4>](https://okminer-static.oss-cn-hangzhou.aliyuncs.com/download/helper/%E7%9F%BF%E5%B7%A5%E5%8A%A9%E6%89%8B%20Setup%201.1.0.exe)
> [<h4>Mac dmg 版下载</h4>](https://okminer-static.oss-cn-hangzhou.aliyuncs.com/download/helper/%E7%9F%BF%E5%B7%A5%E5%8A%A9%E6%89%8B-1.1.0.dmg)

<img width='100%' src='https://raw.githubusercontent.com/Adangs/fed-electron-init/master/src/assets/images/demo-png.png'>

## 参考文档
- electron-vue：https://simulatedgreg.gitbooks.io/electron-vue/cn/
- Vue CLI Plugin Electron Builder： https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/