const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set('~', resolve('src')) // key,value自行定义
  }
}
