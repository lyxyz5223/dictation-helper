import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { loadLists, saveLists } from './utils/storage.js'
import { themes } from './data/themes.js'
import ListManager from './components/ListManager.jsx'
import ListEditor from './components/ListEditor.jsx'
import DictationSetup from './components/DictationSetup.jsx'
import DictationQuiz from './components/DictationQuiz.jsx'
import DictationResult from './components/DictationResult.jsx'
import './App.css'

function App() {
  const [lists, setLists] = useState(loadLists)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'sand',
  )
  const navigate = useNavigate()
  const location = useLocation()

  // 列表变化时同步写入本地存储
  useEffect(() => {
    saveLists(lists)
  }, [lists])

  // 主题变化时同步到根元素与本地存储
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // 保存时若列表已存在则更新, 否则作为新列表加入
  const handleSave = (updated) => {
    setLists((prev) => {
      const exists = prev.some((item) => item.id === updated.id)
      return exists
        ? prev.map((item) => (item.id === updated.id ? updated : item))
        : [...prev, updated]
    })
    navigate('/')
  }

  const handleDelete = (id) => {
    setLists((prev) => prev.filter((item) => item.id !== id))
  }

  // 从路径解析听写页的列表, 用于顶部标题
  const dictId = location.pathname.startsWith('/dictate/')
    ? location.pathname.split('/')[2]
    : null
  const dictList = dictId ? lists.find((item) => item.id === dictId) : null
  // 结果页使用正常页面滚动, 不锁高一屏
  const isDictate =
    Boolean(dictList) && !location.pathname.endsWith('/result')
  const isHome = location.pathname === '/'

  return (
    <main className={`app${isDictate ? ' app-dictate' : ''}`}>
      <div className="top-bar">
        {!isHome && (
          <button
            type="button"
            className="btn btn-back"
            onClick={() => navigate('/')}
            aria-label="返回"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
        )}
        {isDictate && dictList && (
          <h1 className="asking-title">{dictList.name}</h1>
        )}
        <div className="top-bar-actions">
          <div className="theme-switcher" role="group" aria-label="选择主题">
            {themes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  item.id === theme ? 'theme-dot active' : 'theme-dot'
                }
                data-theme-id={item.id}
                title={item.name}
                aria-label={item.name}
                onClick={() => setTheme(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={<ListManager lists={lists} onDelete={handleDelete} />}
        />
        <Route
          path="/edit/:id"
          element={<ListEditor lists={lists} onSave={handleSave} />}
        />
        <Route
          path="/dictate/:id"
          element={<DictationSetup lists={lists} />}
        />
        <Route
          path="/dictate/:id/quiz"
          element={<DictationQuiz lists={lists} />}
        />
        <Route
          path="/dictate/:id/result"
          element={<DictationResult />}
        />
      </Routes>
    </main>
  )
}

export default App
