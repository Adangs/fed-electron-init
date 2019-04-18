<template>
  <section class="g-layout-header">
    <div class="header">
      <div class="m-logo">
        <i class="ok icon-001" />
      </div>
      <h1>矿工助手</h1>
      <em v-if="version">v{{version}}</em>
    </div>
    <!--下载提示组件-->
    <x-download />
  </section>
</template>

<script>
import { XDownload } from '~/components'
const { app } = require('electron').remote
const { ipcRenderer } = require('electron')
export default {
  name: 'XLayoutHeader',
  components: {
    XDownload
  },
  props: {},
  data () {
    return {
      version: null
    }
  },
  computed: {},
  watch: {},
  created () {
    this.version = app.getVersion()
    // 初始化与主进程通信
    this.initIpcRenderer()
  },
  methods: {
    // 初始化进程与页面通信
    initIpcRenderer () {
      // 没有版本更新事件回调
      ipcRenderer.on('update-not-available', (event, message, source) => {
        // console.log('update-not-available--> ', event, message, source)
        if (source !== 'vue') {
          this.$message({
            message: `当前是最新版本，v${message.version}`,
            type: 'success'
          })
        }
      })
      // 有版本更新事件回调
      ipcRenderer.on('update-available', (event, message) => {
        // console.log('update-available--> ', event, message)
        this.$store.dispatch('dialog/set', { download: true })
      })
      // 更新下载进度
      ipcRenderer.on('download-progress', (event, message) => {
        // message -->
        // {
        //   bytesPerSecond: 3721624
        //   delta: 3665200
        //   percent: 16.618819472606397
        //   total: 44788067
        //   transferred: 7443248
        // }
        this.$store.dispatch('app/setProgress', {
          percentage: parseInt(message.percent, 10)
        })
        // console.log('download-progress--> ', event, message)
      })
      // 下载完成
      ipcRenderer.on('update-downloaded', () => {
        this.$store.dispatch('dialog/set', { download: false })
        this.$message({
          message: '更新文件已经下载完成，开始升级...',
          type: 'success',
          duration: 1000,
          onClose: () => {
            // 主动进行安装更新包
            ipcRenderer.send('update-downloaded')
          }
        })
      })
    }
  }
}
</script>

<style>

</style>
