<template>
  <div class="m-dialog-all m-dialog-download">
    <el-dialog :visible.sync="dialog.download" :title="title" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" @close="onClose">
      <el-progress :text-inside="true" :stroke-width="18" :percentage="progress.percentage"></el-progress>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'XDownload',
  data () {
    return {}
  },
  computed: {
    ...mapGetters([
      'dialog',
      'progress'
    ]),
    title () {
      return this.progress.percentage === 100 ? '下载完成' : '下载中...'
    }
  },
  methods: {
    onClose () {
      // 关闭弹出层的时候初始化掉进度
      this.progress = {
        percentage: 0, // 进度 10%
        size: 0, // 当前大小
        maxSize: 0 // 总大小
      }
    }
  }
}
</script>

<style>

</style>
