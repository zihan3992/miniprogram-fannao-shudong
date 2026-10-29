const { cloud, ensureLogin } = require('../../utils/cloud')
const { checkContent } = require('../../utils/moderation')
const STICKERS = ['🤗', '💪', '🌟', '📚', '🎧']

Page({
  data: {
    current: null,
    stickers: STICKERS,
    reply: '',
    loading: false
  },
  onShow() { if (!this.data.current) this.pickOne() },

  onShareAppMessage() {
    return {
      title: '🙋 帮我一起解忧？树上有只烦恼虫在等你',
      path: '/pages/index/index',
    }
  },

  async pickOne() {
    wx.showLoading({ title: '摇树中…' })
    try {
      await ensureLogin()
      const { data } = await cloud.database.from('worries')
        .select('id, content, mood, need')
        .eq('resolved', false)
        .order('created_at', { ascending: true })
        .limit(5)
      wx.hideLoading()
      if (!data || !data.length) {
        this.setData({ current: null })
        return wx.showToast({ title: '树上暂时没有虫啦 🎉', icon: 'none' })
      }
      this.setData({ current: data[Math.floor(Math.random() * data.length)] })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    }
  },

  onInput(e) { this.setData({ reply: e.detail.value }) },
  addSticker(e) { this.setData({ reply: this.data.reply + e.currentTarget.dataset.s }) },

  async send() {
    const { current, reply, loading } = this.data
    if (!current || loading) return
    const text = reply.trim()
    const check = checkContent(text)
    if (!check.ok) return wx.showToast({ title: check.message, icon: 'none' })
    this.setData({ loading: true })
    wx.showLoading({ title: '送出温暖…' })
    try {
      const session = await ensureLogin()
      const me = session && session.user && session.user.id
      // 认领 + 化虫结果：仅当仍是未认领的虫时允许（RLS 双保险，防两人抢同一只）
      const { data: updated } = await cloud.database.from('worries')
        .update({
          claimed_by: me || 'anonymous',
          reply: text,
          resolved: true,
          replied_at: new Date().toISOString(),
        })
        .eq('id', current.id)
        .eq('resolved', false)
        .select('id')
      wx.hideLoading()
      if (!updated || !updated.length) {
        wx.showToast({ title: '手慢了，虫被别人捡走啦', icon: 'none' })
      } else {
        wx.showModal({
          title: '🍎 太棒了！',
          content: '这只虫已化作一颗心愿果，计入你的爱心值，上榜啦！',
          showCancel: false
        })
        this.setData({ current: null, reply: '' })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '发送失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
