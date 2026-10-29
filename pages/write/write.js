const { cloud, ensureLogin } = require('../../utils/cloud')
const { checkContent, CARE_TIP } = require('../../utils/moderation')

const MOODS = ['🌧️', '😞', '😶', '🥺', '😖']
const NEEDS = ['💬 一个建议', '🤗 一句安慰', '🌟 静静陪伴']

Page({
  data: { moods: MOODS, needs: NEEDS, moodIdx: -1, needIdx: -1, content: '', submitting: false },
  pickMood(e) { this.setData({ moodIdx: Number(e.currentTarget.dataset.i) }) },
  pickNeed(e) { this.setData({ needIdx: Number(e.currentTarget.dataset.i) }) },
  onInput(e) { this.setData({ content: e.detail.value }) },
  onShareAppMessage() {
    return {
      title: '🐛 想扔一只烦恼虫？来计科2班的解忧树',
      path: '/pages/index/index',
    }
  },

  async submit() {
    if (this.data.submitting) return
    const { content, moodIdx, needIdx } = this.data
    if (moodIdx < 0) return wx.showToast({ title: '选个心情吧', icon: 'none' })
    if (needIdx < 0) return wx.showToast({ title: '选个期待吧', icon: 'none' })
    const text = content.trim()
    const check = checkContent(text)
    if (!check.ok) return wx.showToast({ title: check.message, icon: 'none' })
    this.setData({ submitting: true })
    wx.showLoading({ title: '放它上树…' })
    try {
      await ensureLogin()
      const { error } = await cloud.database.from('worries').insert({
        content: text,
        mood: MOODS[moodIdx],
        need: NEEDS[needIdx],
        resolved: false,
      })
      wx.hideLoading()
      if (error) throw new Error('发布失败，请重试')
      const afterPublish = () => {
        this.setData({ moodIdx: -1, needIdx: -1, content: '', submitting: false })
        wx.switchTab({ url: '/pages/index/index' })
      }
      if (check.type === 'care') {
        wx.showModal({ title: '💚 想对你说', content: CARE_TIP, confirmText: '继续发布', cancelText: '再想想',
          success: r => { if (r.confirm) afterPublish() } })
      } else {
        wx.showModal({
          title: '🐛 已挂上树啦',
          content: '有同学捡到它并回应后，它会化作一颗心愿果 🍎',
          showCancel: false,
          success: afterPublish
        })
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: e.message || '发布失败，请重试', icon: 'none' })
    }
  }
})
