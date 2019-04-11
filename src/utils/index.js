import Cookies from 'js-cookie'

// 设置cookie
export function setCookie (name, value) {
  return Cookies.set(name, value)
}
// 设置cookie
export function getCookie (name) {
  return Cookies.get(name)
}
// 删除cookie
export function removeCookie (name) {
  return Cookies.remove(name)
}
