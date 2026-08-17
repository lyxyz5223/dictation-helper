import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// 打乱数组, 用于随机顺序听写
function shuffle(source) {
  const result = [...source]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 听写设置页, 选择模式与顺序后开始听写
function DictationSetup({ lists }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const list = lists.find((item) => item.id === id)
  const [mode, setMode] = useState('voice') // voice 语音听写, chinese 释义默写
  const [order, setOrder] = useState('sequence') // sequence 顺序, random 随机

  // 生成题目序列并保存会话, 跳转到听写页
  const handleStart = () => {
    const quiz = order === 'random' ? shuffle(list.words) : [...list.words]
    const session = {
      listId: id,
      mode,
      order,
      quiz,
      answers: Array(quiz.length).fill(''),
      index: 0,
    }
    sessionStorage.setItem('dictation-session', JSON.stringify(session))
    navigate(`/dictate/${id}/quiz`)
  }

  return (
    <div className="dictation-setup">
      <div className="setup-card">
        <h2>{list.name}</h2>
        <p className="setup-meta">共 {list.words.length} 个词条</p>
        <div className="setup-options">
          <div className="option-block">
            <span className="option-label">听写模式</span>
            <div className="option-group">
              <button
                type="button"
                className={mode === 'voice' ? 'btn option active' : 'btn option'}
                onClick={() => setMode('voice')}
              >
                语音听写
              </button>
              <button
                type="button"
                className={
                  mode === 'chinese' ? 'btn option active' : 'btn option'
                }
                onClick={() => setMode('chinese')}
              >
                释义默写
              </button>
            </div>
            <p className="option-desc">
              {mode === 'voice'
                ? '朗读发音, 听音输入对应内容'
                : '显示释义, 输入对应词条'}
            </p>
          </div>
          <div className="option-block">
            <span className="option-label">出题顺序</span>
            <div className="option-group">
              <button
                type="button"
                className={
                  order === 'sequence' ? 'btn option active' : 'btn option'
                }
                onClick={() => setOrder('sequence')}
              >
                顺序
              </button>
              <button
                type="button"
                className={
                  order === 'random' ? 'btn option active' : 'btn option'
                }
                onClick={() => setOrder('random')}
              >
                随机
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleStart}
        >
          开始听写
        </button>
      </div>
    </div>
  )
}

export default DictationSetup