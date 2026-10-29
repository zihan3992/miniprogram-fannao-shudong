const { cloud, ensureLogin } = require('../../utils/cloud')

Page({
  data: { list: [], myFruits: 0 },
  onShareAppMessage() {
    return {
      title: '👑 爱心榜更新了！看看谁结的果子最多',
      path: '/pages/index/index',
    }
  },

  onShow() { this.load() },
  async load() {
    wx.showLoading({ title: '摘果子…' })
    try {
      await ensureLogin()
      const { data } = await cloud.database.from('worries')
        .select('claimed_by')
        .eq('resolved', true)
        .limit(500)
      wx.hideLoading()
      const count = {}
      ;(data || []).forEach(w => {
        if (w.claimed_by) count[w.claimed_by] = (count[w.claimed_by] || 0) + 1
      })
      const avatars = ['🦊', '🐼', '🐰', '🐢', '🐻', '🐯', '🐨', '🐮', '🐷', '🐸']
      const titles = [[100, '树洞之光'], [30, '果园守护神'], [10, '护林员']]
      const list = Object.keys(count).map((k, i) => {
        const n = count[k]
        const t = titles.find(x => n >= x[0])
        return {
          uid: k,
          name: '小可爱' + String(i + 1).padStart(2, '0'),
          avatar: avatars[i % avatars.length],
          fruits: n,
          title: t ? t[1] : '萌芽者'
        }
      }).sort((a, b) => b.fruits - a.fruits)
      this.setData({ list })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    }
  }
})
