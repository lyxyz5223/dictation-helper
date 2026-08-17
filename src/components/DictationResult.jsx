import { useParams, useNavigate } from 'react-router-dom'

// 从会话存储读取听写结果
function loadResult() {
  try {
    const raw = sessionStorage.getItem('dictation-result')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 听写结果页, 展示得分统计、错题回顾与完整作答记录
function DictationResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const results = loadResult()
  const total = results.length
  const correctCount = results.filter((item) => item.correct).length
  const wrongList = results.filter((item) => !item.correct)
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100)

  return (
    <div className="dictation-result">
      <header className="page-header">
        <h1>听写结果</h1>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/dictate/${id}`)}
          >
            重新听写
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            完成
          </button>
        </div>
      </header>

      <div className="score-card">
        <p className="score-percent">{percent}%</p>
        <p className="score-meta">
          共 {total} 题, 答对 {correctCount} 题
        </p>
      </div>

      {wrongList.length > 0 ? (
        <section className="wrong-section">
          <h2>错题回顾</h2>
          <ul className="word-list">
            {wrongList.map((item, i) => (
              <li key={item.word.id} className="word-row">
                <span className="word-index">{i + 1}</span>
                <span className="word-text">{item.word.text}</span>
                <span className="word-translation">{item.word.translation}</span>
                <span className="your-answer">
                  你的答案: {item.input || '未作答'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="empty-tip">全部答对, 太棒了!</p>
      )}

      <section className="all-section">
        <h2>完整查看</h2>
        <ul className="word-list">
          {results.map((item, i) => (
            <li
              key={item.word.id}
              className={
                item.correct ? 'word-row result-correct' : 'word-row result-wrong'
              }
            >
              <span className="word-index">{i + 1}</span>
              <span className="word-text">{item.word.text}</span>
              <span className="word-translation">{item.word.translation}</span>
              <span className="your-answer">
                你的答案: {item.input || '未作答'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default DictationResult
