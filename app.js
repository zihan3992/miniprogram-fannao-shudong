const { cloud, ensureLogin } = require('./utils/cloud')

App({
  globalData: {},
  onLaunch() {
    ensureLogin().catch(err => {
      wx.showToast({ title: err.message || '登录失败，请重进小程序', icon: 'none' })
    })
  }
})
