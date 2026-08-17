const CONFIG_KEY = 'dictation-helper:speech'

// 默认语音配置, 使用网易有道词典 API
const DEFAULT_CONFIG = {
  engine: 'youdao', // youdao 有道词典, browser 浏览器语音
  accent: 1, // 有道口音: 1 美音, 2 英音
  rate: 0.9, // 浏览器语音语速
}

// 读取语音配置, 解析失败时回退默认值
export function loadSpeechConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

// 保存语音配置
export function saveSpeechConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

// 使用有道词典 API 播放发音, 返回是否成功
function speakWithYoudao(text, accent) {
  const audio = new Audio(
    `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${accent}`,
  )
  audio.play()
  return true
}

// 使用浏览器语音合成朗读文本, 返回是否成功
function speakWithBrowser(text, lang, rate) {
  if (!('speechSynthesis' in window)) {
    return false
  }
  // 先停止上一次朗读, 避免语音叠加
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
  return true
}

// 根据配置朗读文本, 默认使用有道词典
export function speak(text, lang) {
  const config = loadSpeechConfig()
  if (config.engine === 'youdao') {
    return speakWithYoudao(text, config.accent)
  }
  return speakWithBrowser(text, lang, config.rate)
}
