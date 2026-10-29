// 云服务客户端：全应用唯一实例
// endpoint 与 publishableKey 来自 WorkBuddy 云服务 publicConfig
const { createMiniProgramWorkBuddyCloud } = require('@tencent-ai/workbuddy-cloud-sdk/miniprogram')
const { createDiagnosticWx } = require('./workbuddy-cloud-diagnostics')

const cloud = createMiniProgramWorkBuddyCloud({
  endpoint: 'https://mp-api.app.workbuddy.host',
  publishableKey: 'wbpk_yysM0oYdHMN54S8Iy6rL9R_GrWbZTsym8uxM72BzIKg36AqnFDzMHoO',
  wx: createDiagnosticWx(wx),
})

let loginPromise = null

// 微信静默登录：wx.login 换 code → WorkBuddy 会话
function ensureLogin() {
  if (loginPromise) return loginPromise
  loginPromise = new Promise((resolve, reject) => {
    cloud.auth.getSession().then(({ data: session }) => {
      if (session) return resolve(session)
      wx.login({
        async success({ code }) {
          try {
            const appid = wx.getAccountInfoSync().miniProgram.appId
            const { data: s, error } = await cloud.auth.signInWithWechat(code, appid)
            if (error) {
              console.error('[WorkBuddy Cloud] login failed', JSON.stringify({
                stage: 'wechat-login-handler',
                message: error.message || '微信登录失败，请重试',
              }))
              return reject(new Error('微信登录失败，请重试'))
            }
            resolve(s)
          } catch (e) {
            console.error('[WorkBuddy Cloud] login failed', JSON.stringify({
              stage: 'wechat-login-handler',
              message: e instanceof Error ? e.message : '微信登录失败，请重试',
            }))
            reject(new Error('微信登录失败，请重试'))
          }
        },
        fail(err) {
          console.error('[WorkBuddy Cloud] login failed', JSON.stringify({
            stage: 'wx.login',
            message: err.errMsg,
          }))
          reject(new Error(err.errMsg || '微信登录失败'))
        },
      })
    }).catch(err => reject(err))
  })
  // 失败后允许重试
  loginPromise.catch(() => { loginPromise = null })
  return loginPromise
}

module.exports = { cloud, ensureLogin }
