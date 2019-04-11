<template>
  <section class="g-layout-all">
    <!--通用头部-->
    <x-layout-header />
    <section class="g-layout-content">
      <!--<section class="g-layout-aside">-->
        <!--左侧菜单-->
      <!--</section>-->
      <section class="g-layout-main">
        <!-- 主要内容 -->
        <transition name="fade" mode="out-in">
          <router-view :key="key" />
        </transition>
      </section>
    </section>
  </section>
</template>

<script>
import { XLayoutHeader } from './components'

export default {
  name: 'Layout',
  components: {
    XLayoutHeader
  },
  computed: {
    key () {
      return this.$route.fullPath
    }
  },
  created () {

  },
  methods: {

  }
}
</script>
