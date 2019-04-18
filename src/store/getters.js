export default {
  loading: state => state.app.loading,
  progress: state => state.app.progress,

  dialog: state => state.dialog,

  token: state => state.user.token,
  roles: state => state.user.roles
}
