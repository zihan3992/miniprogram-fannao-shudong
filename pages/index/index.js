const { cloud, ensureLogin } = require('../../utils/cloud')

Page({
  data: {
    bugs: [],
    fruits: 0,
    bugsCount: 0
  },
  onShow() { this.refresh() },
  async refresh() {
    try {
      await ensureLogin()
      const { data: bugs } = await cloud.database.from('worries')
        .select('id, content, mood')
        .eq('resolved', false)
        .order('created_at', { ascending: true })
        .limit(8)
      const { count: fruits } = await cloud.database.from('worries')
        .select('id', { count: 'exact', head: true })
        .eq('resolved', true)
      this.setData({ bugs: bugs || [], bugsCount: (bugs || []).length, fruits: fruits || 0 })
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败，请检查网络', icon: 'none' })
    }
  },
  onBugTap(e) {
    const b = this.data.bugs[e.currentTarget.dataset.idx]
    if (!b) return
    wx.showModal({
      title: '🐛 一只烦恼虫',
      content: (b.content || '').slice(0, 120) + '\n\n去「捡虫」页帮TA吧，解决后结出心愿果 🍎',
      confirmText: '去帮TA',
      cancelText: '再等等',
      success: r => { if (r.confirm) wx.switchTab({ url: '/pages/pick/pick' }) }
    })
  },
  goWrite() { wx.switchTab({ url: '/pages/write/write' }) },
  goPick() { wx.switchTab({ url: '/pages/pick/pick' }) },

  onShareAppMessage() {
    return {
      title: '🌳 烦恼树洞·心愿果｜把心事挂上树，会有同学帮你变成果实',
      path: '/pages/index/index',
    }
  },
  onShareTimeline() {
    return {
      title: '🌳 烦恼树洞·心愿果：写下烦恼，等一颗心愿果',
    }
  }
})
