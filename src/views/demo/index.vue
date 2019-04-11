<template>
  <div class="m-content-all">
    <dl>
      <dt>filters</dt>
      <dd>
        {{ date | formatDate }}
      </dd>
    </dl>
    <dl>
      <dt>全局组件</dt>
      <dd>
        <x-null />
      </dd>
    </dl>
    <dl>
      <dt>全局请求</dt>
      <dd>
        <p>
          <button @click="onFetch">
            {{ loading ? '正在请求...' : '点击请求，快速点击重复请求会被拦截' }}
          </button>
        </p>
        <p>
          <button @click="onCancel">主动拦截某个请求</button>
        </p>
      </dd>
    </dl>
    <dl>
      <dt>引用图片</dt>
      <dd>
        <p><img src="../../assets/images/logo.png" alt="logo"></p>
        <p class="bg-img"></p>
      </dd>
    </dl>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { XNull } from '../../components'
import API from '~/api/index'

export default {
  name: 'Demo',
  components: {
    XNull
  },
  data () {
    return {
      date: new Date()
    }
  },
  computed: {
    ...mapGetters([
      'loading'
    ])
  },
  created () {
    this.$store.dispatch('app/getAPI')
  },
  methods: {
    async onFetch () {
      console.log('开始请求')
      const res = await this.$http({
        url: 'success'
      })
      // alert(JSON.stringify(res))
      console.log(res)
    },
    onCancel () {
      // 主动拦截某个请求
      this.$store.dispatch('app/removePending', {
        url: API['success'],
        cancel: true
      })
    }
  }
}
</script>

<style lang="scss">
  button{ background: #ddd;}
  .bg-img{ width: 200px; height: 200px; background: url('../../assets/images/logo.png') no-repeat; background-size: cover}
  dd{
    p{ padding-bottom: 10px;}
  }
</style>
