<template>
  <div class="m-tools">
    <!--子标题-->
    <x-title>Add SSH Access</x-title>
    <!--主要内容-->
    <div class="m-form inline">
      <el-form ref="form" :inline="true" :model="formData" :rules="rules">
        <el-form-item label="起始IP" prop="start">
          <el-input v-model="formData.start" placeholder="请输入起始IP" @keypress.enter.native="initList"></el-input>
        </el-form-item>
        <el-form-item label="结束IP" prop="end">
          <el-input v-model="formData.end" placeholder="与起始IP必须在同一网段" @keypress.enter.native="initList"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="initList">生成IP列表</el-button>
          <el-button type="success" :disabled="isExecute" @click="execute">批量执行</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list">
      <ul v-if="list && list.length">
        <li v-for="item in list" :key="item.name">
          <p>
            <em>{{ item.name }}</em>
            <el-tooltip :content="item.msg" :disabled="item.status !== 'danger'">
              <el-tag :type="item.status">{{ status[item.status] }}</el-tag>
            </el-tooltip>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { XTitle } from '~/components'
// 校验IP规则
const pattern = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/
const request = require('request').defaults({ jar: true })
const cheerio = require('cheerio')

export default {
  name: 'index',
  components: {
    XTitle
  },
  props: {},
  data () {
    return {
      formData: {
        start: null,
        end: null
      },
      list: null, // ip列表
      index: 0, // 当前执行序号
      isStatus: false,
      status: {
        success: '成功',
        danger: '失败',
        info: '未执行'
      },
      rules: {
        start: [
          { required: true, pattern: pattern, trigger: 'blur', message: '请输入正确的IP地址' }
        ],
        end: [
          { required: true, pattern: pattern, trigger: 'blur', message: '请输入正确的IP地址' }
        ]
      }
    }
  },
  computed: {
    // 是否可执行
    isExecute () {
      return !(this.list && this.list.length && this.isStatus)
    }
  },
  watch: {},
  created () {

  },
  methods: {
    // 初始化列表
    initList () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const start = this.formData.start.split('.')
          const end = this.formData.end.split('.')
          const before = [start[0], start[1], start[2]].join('.')
          if (before !== [end[0], end[1], end[2]].join('.')) {
            this.formData.end = null
            this.$refs['form'].clearValidate()
            return this.$message({
              message: '请输入相同的IP网段',
              type: 'warning'
            })
          }
          this.isStatus = true
          this.list = []
          this.index = 0
          for (let i = start[3]; i < Number(end[3]) + 1; i++) {
            this.list.push({
              name: [before, i].join('.'),
              status: 'info',
              msg: null
            })
          }
        } else {
          console.log('submit error!!!')
        }
      })
    },
    // 批量执行
    async execute () {
      this.isStatus = false
      const body = this.list[this.index]
      // ip是否存在
      const isIp = await new Promise((resolve, reject) => {
        request({
          method: 'GET',
          url: `http://${body.name}/cgi-bin/luci/`,
          timeout: 1000
        }, (error) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(true)
          }
        })
      })
      if (!isIp) {
        return this.next({ success: false, msg: '矿机不存在' })
      }
      // 基础参数
      const options = {
        url: `http://${body.name}/cgi-bin/luci/`,
        timeout: 2000,
        form: {
          luci_username: 'root',
          luci_password: 'abcde54321'
        }
      }
      const store = {}
      // 登录成功后，获取cookie
      const cookie = await new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.request.headers.cookie)
          }
        })
      })
      // 如果无cookie，那么通知前端处理失败
      if (!cookie) {
        console.error('获取cookie失败')
        return this.next({ success: false, msg: '获取cookie失败' })
      } else {
        // 格式化cookie
        store.cookie = cookie.split('=')[1]
        console.log('执行[login]成功~', store.cookie)
      }
      // 获取token
      const token = await new Promise((resolve, reject) => {
        request({
          method: 'GET',
          url: `http://${body.name}/cgi-bin/luci/admin/status/processes`,
          headers: { Cookie: cookie }
        }, (error, res, html) => {
          if (error) {
            console.error('获取【token】失败')
            return resolve(false)
          } else {
            // 查找是否已经启动dropbear 服务
            if (html.indexOf('dropbear') !== -1) {
              return resolve(false)
            } else {
              // 格式化body内容，通过jq方式查找页面元素内容
              // https://github.com/cheeriojs/cheerio
              const $ = cheerio.load(html)
              const token = $('input[name="token"]').val()
              return resolve(token)
            }
          }
        })
      })
      // 校验token
      if (token) {
        store.token = token
      } else {
        console.error('服务已经存在')
        return this.next({ success: false, msg: '服务已经存在' })
      }
      // 添加 Dropbear
      const addKey = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci/admin/system/admin`,
          form: {
            'token': store.token,
            'cbi.submit': 1,
            'cbi.cts.dropbear.dropbear.': 'Add'
          }
        }, (error, res, html) => {
          if (error) {
            return resolve(false)
          } else {
            // 格式化body内容，通过jq方式查找页面元素内容
            // https://github.com/cheeriojs/cheerio
            const $ = cheerio.load(html)
            const key = $('#cbi-dropbear input').eq(0).attr('name')
            const name = key.split('.')
            return resolve(name[name.length - 1])
          }
        })
      })
      console.log('添加Dropbear', addKey)

      // Save & Apply
      const save = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci/admin/system/admin`,
          form: {
            'token': store.token,
            'cbi.submit': 1,
            [`cbid.dropbear.${addKey}.Port`]: 22,
            [`cbi.cbe.dropbear.${addKey}.PasswordAuth`]: 1,
            [`cbid.dropbear.${addKey}.PasswordAuth`]: 'on',
            [`cbi.cbe.dropbear.${addKey}.RootPasswordAuth`]: 1,
            [`cbid.dropbear.${addKey}.RootPasswordAuth`]: 'on',
            [`cbi.cbe.dropbear.${addKey}.GatewayPorts`]: 1,
            'cbi.apply': 'Save & Apply'
          }
        }, (error, res) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.statusCode)
          }
        })
      })
      console.log('Save & Apply', save)
      // 提交失败
      if (save !== 200) {
        console.error('Save Apply Error!')
        return this.next({ success: false, msg: 'Save Apply Error!' })
      }
      // apply_rollback
      const apply = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci/admin/uci/apply_rollback`,
          form: {
            sid: store.cookie,
            token: store.token
          }
        }, (error, res) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.statusCode)
          }
        })
      })
      console.log('apply_rollback', apply)
      // apply_rollback 失败
      if (apply !== 200) {
        return this.next({ success: false, msg: 'apply_rollback Error!' })
      }
      // confirm
      const confirm = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci/admin/uci/confirm`,
          form: {
            sid: store.cookie,
            token: store.token
          }
        }, (error, res) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.statusCode)
          }
        })
      })
      console.log('confirm', confirm)
      // confirm 失败
      if (confirm !== 200) {
        console.error('confirm Error!')
        return this.next({ success: false, msg: 'confirm Error!' })
      } else {
        console.info('执行[Dropbear Instance]成功~')
      }
      // 添加 startup
      const startup = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci/admin/system/startup`,
          form: {
            'token': store.token,
            'cbi.submit': 1,
            'cbid.rc.1.rcs': '# Put your custom commands here that should be executed once\n' +
              '# the system init finished. By default this file does nothing.\n' +
              '\n' +
              '# okkong\n' +
              'if [ `grep -c "ash" /etc/passwd` -eq "1" ];then\n' +
              ' echo "in"\n' +
              ' sed -i "/root/c root:x:0:0:root:/root:/bin/sh" /etc/passwd\n' +
              'else\n' +
              ' echo "out"\n' +
              'fi\n' +
              '\n' +
              'if [ `grep -c "/bin/sh" /etc/shells` -eq "0" ];then\n' +
              ' echo "/bin/sh">>/etc/shells\n' +
              ' echo "sh in"\n' +
              'else\n' +
              ' echo "sh out"\n' +
              'fi\n' +
              'exit 0'
          }
        }, (error, res) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.statusCode)
          }
        })
      })
      if (startup !== 200) {
        return this.next({ success: false, msg: 'startup Error!' })
      } else {
        console.info('执行[Local Startup]成功~')
      }
      // Reboot
      const reboot = await new Promise((resolve, reject) => {
        request({
          method: 'POST',
          url: `http://${body.name}/cgi-bin/luci//admin/system/reboot/call`,
          form: {
            token: store.token
          }
        }, (error, res) => {
          if (error) {
            return resolve(false)
          } else {
            return resolve(res.statusCode)
          }
        })
      })
      if (reboot !== 200) {
        return this.next({ success: false, msg: 'Reboot Error!' })
      } else {
        console.info('执行[Reboot]成功~')
      }
      console.log(`[ip ${body.ip}]执行成功~`)
      this.next({ success: true, msg: '执行成功~' })
    },
    // 执行下一个
    next (res) {
      if (res.success) {
        this.list[this.index].status = 'success'
      } else {
        Object.assign(this.list[this.index], {
          status: 'danger',
          msg: res.msg
        })
        console.error(res.msg)
      }
      this.index++
      if (this.index < this.list.length) {
        this.execute()
      } else {
        this.isStatus = false
        console.log('全部执行完成~')
        return this.$message({
          message: '全部执行完成~',
          type: 'success'
        })
      }
    }
  }
}
</script>
