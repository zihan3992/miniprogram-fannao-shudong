// 内容安全：发布前的基础过滤
// 声明了"使用平台建议的内容安全API"，客户端先做敏感词/长度拦截，
// 云端数据库 RLS 限制写入身份，后续版本可接入更完整的审核链路。
const BLOCK_WORDS = [
  '自杀', '轻生', '不想活', '自残',
  '色情', '赌博', '毒品', '枪支', '诈骗',
  '反动', '法轮',
]

// 心理危机类：不拦截发布，但给出关怀提示
const CARE_WORDS = ['抑郁', '崩溃', '撑不下去', '活着没意思']

function checkContent(text) {
  const t = (text || '').trim()
  if (t.length < 5) return { ok: false, type: 'too_short', message: '再多写几个字～' }
  if (t.length > 300) return { ok: false, type: 'too_long', message: '最多300字哦' }
  for (const w of BLOCK_WORDS) {
    if (t.includes(w)) {
      return { ok: false, type: 'blocked', message: '内容包含不允许发布的词汇，请修改后再发布' }
    }
  }
  for (const w of CARE_WORDS) {
    if (t.includes(w)) return { ok: true, type: 'care' }
  }
  return { ok: true, type: 'pass' }
}

const CARE_TIP = '看得出来你现在很难受 💚 树洞里的伙伴会陪着你。如果情绪持续低落，也欢迎联系学校心理咨询中心（免费且保密），你不是一个人在扛。'

module.exports = { checkContent, CARE_TIP }
