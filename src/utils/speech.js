// 使用浏览器语音合成朗读文本, 返回是否成功
export function speak(text, lang) {
  if (!('speechSynthesis' in window)) {
    return false
  }
  // 先停止上一次朗读, 避免语音叠加
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
  return true
}
