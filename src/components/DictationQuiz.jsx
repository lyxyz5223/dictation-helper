import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { speak, stopSpeaking } from '../utils/speech.js'

// 从会话存储读取听写状态, 刷新后不丢失
function loadSession() {
  try {
    const raw = sessionStorage.getItem('dictation-session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// 听写进行页, 依次答题并提交
function DictationQuiz({ lists }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const list = lists.find((item) => item.id === id)
  const [session] = useState(loadSession)
  const [quiz] = useState(session?.quiz ?? [])
  const [mode] = useState(session?.mode ?? 'voice')
  const [index, setIndex] = useState(session?.index ?? 0)
  const [answers, setAnswers] = useState(session?.answers ?? [])

  const currentWord = quiz[index]
  const remaining = quiz.filter((_, i) => answers[i]?.trim() === '').length
  const allDone = quiz.length > 0 && remaining === 0

  // 语音模式下切题时自动朗读当前词, 清理时停止避免重复播放
  useEffect(() => {
    if (mode === 'voice' && currentWord) {
      speak(currentWord.text, list.lang)
    }
    return stopSpeaking
  }, [mode, index, currentWord, list.lang])

  // 更新当前题的答案并同步会话
  const updateAnswer = (value) => {
    setAnswers((prev) => {
      const next = prev.map((item, i) => (i === index ? value : item))
      sessionStorage.setItem(
        'dictation-session',
        JSON.stringify({ ...session, answers: next, index }),
      )
      return next
    })
  }

  // 上一题, 第一题时不可用
  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1)
    }
  }

  // 下一题, 到末尾时回到第一个未完成的题目
  const goNext = () => {
    if (allDone) {
      return
    }
    const nextIndex =
      index < quiz.length - 1 ? index + 1 : answers.findIndex((item) => item.trim() === '')
    setIndex(nextIndex)
  }

  // 全部完成后保存结果并跳转结果页
  const handleSubmit = () => {
    if (!allDone) {
      return
    }
    const results = quiz.map((word, i) => ({
      word,
      input: answers[i].trim(),
      correct:
        answers[i].trim().toLowerCase() === word.text.trim().toLowerCase(),
    }))
    sessionStorage.setItem('dictation-result', JSON.stringify(results))
    sessionStorage.removeItem('dictation-session')
    navigate(`/dictate/${id}/result`)
  }

  return (
    <div className="dictation-asking">
      <div className="dot-progress">
        {quiz.map((_, i) => (
          <span
            key={i}
            className={[
              'dot',
              answers[i]?.trim() ? 'done' : '',
              i === index ? 'current' : '',
            ].join(' ')}
          />
        ))}
      </div>
      <p className="progress-text">
        第 {index + 1} / {quiz.length} 题, 剩余 {remaining} 题
      </p>

      <div className="question-card">
        <div className="prompt-top">
          {mode === 'voice' ? (
            <button
              type="button"
              className="btn-speak-big"
              onClick={() => speak(currentWord.text, list.lang)}
              aria-label="播放发音"
            >
              <span className="play-triangle" />
            </button>
          ) : (
            <p className="chinese-hint">{currentWord.translation}</p>
          )}
          <p className="question-hint">
            {mode === 'voice'
              ? '播放发音后, 输入你听到的内容'
              : '根据释义输入对应的词条'}
          </p>
        </div>
        <input
          className="answer-input"
          value={answers[index] || ''}
          onChange={(e) => updateAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (allDone) {
                handleSubmit()
              } else {
                goNext()
              }
            }
          }}
          placeholder="在此输入答案"
          autoFocus
        />
      </div>

      <div className="bottom-actions">
        <button
          type="button"
          className="btn"
          onClick={goPrev}
          disabled={index === 0}
        >
          上一题
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={goNext}
          disabled={allDone}
        >
          下一题
        </button>
        <button
          type="button"
          className="btn btn-submit"
          onClick={handleSubmit}
          disabled={!allDone}
        >
          提交
        </button>
      </div>
    </div>
  )
}

export default DictationQuiz