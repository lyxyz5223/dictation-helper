import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { genId } from '../utils/storage.js'

// 可选朗读语言
const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: '英语' },
  { value: 'zh-CN', label: '中文' },
  { value: 'ja-JP', label: '日语' },
  { value: 'ko-KR', label: '韩语' },
  { value: 'fr-FR', label: '法语' },
  { value: 'de-DE', label: '德语' },
  { value: 'es-ES', label: '西班牙语' },
]

// 解析 JSON 格式的词条数据, 支持对象/数组/字符串三种元素
function parseJsonImport(content) {
  const data = JSON.parse(content)
  if (!Array.isArray(data)) {
    return []
  }
  return data
    .map((item) => {
      if (typeof item === 'string') {
        return { text: item, translation: '' }
      }
      if (Array.isArray(item)) {
        return {
          text: String(item[0] ?? ''),
          translation: String(item[1] ?? ''),
        }
      }
      return {
        text: String(item.text ?? item.word ?? ''),
        translation: String(item.translation ?? item.meaning ?? ''),
      }
    })
    .filter((word) => word.text.trim() !== '')
}

// 解析 txt/csv 按行拆分, 支持制表符/逗号/分号分隔
function parseLineImport(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const parts = line.split(/\t|,|，|;|；/)
      if (parts.length >= 2) {
        return {
          text: parts[0].trim(),
          translation: parts.slice(1).join(' ').trim(),
        }
      }
      return { text: line, translation: '' }
    })
    .filter((word) => word.text !== '')
}

// 根据文件扩展名选择解析方式
function parseImport(content, filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'json') {
    return parseJsonImport(content)
  }
  return parseLineImport(content)
}

// 列表编辑器, 修改名称、语言与词条后保存
function ListEditor({ lists, onSave }) {
  const { id } = useParams()
  // 新建时 id 为 new, 否则从列表中找到对应项
  const isNew = id === 'new'
  const existing = isNew ? null : lists.find((item) => item.id === id)
  // 用 useState 固定初始列表, 保证新建时 id 稳定
  const [list] = useState(() =>
    isNew
      ? { id: genId(), name: '新听写列表', lang: 'en-US', words: [] }
      : existing,
  )
  const [name, setName] = useState(list.name)
  const [lang, setLang] = useState(list.lang)
  const [words, setWords] = useState(list.words)
  const [importMessage, setImportMessage] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const fileInputRef = useRef(null)

  // 更新指定词条的字段
  const updateWord = (id, field, value) => {
    setWords((prev) =>
      prev.map((word) => (word.id === id ? { ...word, [field]: value } : word)),
    )
  }

  // 末尾加号追加一个空白词条行
  const addBlankRow = () => {
    setWords((prev) => [...prev, { id: genId(), text: '', translation: '' }])
  }

  // 读取导入文件并解析, 追加到词条列表
  const handleImportFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImport(String(reader.result), file.name)
        if (imported.length === 0) {
          setImportMessage('未解析到有效词条')
          return
        }
        setWords((prev) => [
          ...prev,
          ...imported.map((word) => ({ id: genId(), ...word })),
        ])
        setImportMessage(`成功导入 ${imported.length} 个词条`)
      } catch {
        setImportMessage('导入失败, 请检查文件格式')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleSave = () => {
    // 保存时丢弃内容为空的行
    const cleaned = words.filter(
      (word) => word.text.trim() !== '' || word.translation.trim() !== '',
    )
    if (!name.trim() || cleaned.length === 0) {
      return
    }
    onSave({ ...list, name: name.trim(), lang, words: cleaned })
  }

  return (
    <div className="list-editor">
      <header className="page-header">
        <h1>编辑列表</h1>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-icon btn-primary"
            title="保存"
            aria-label="保存"
            onClick={handleSave}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </header>

      <div className="editor-form">
        <label className="field">
          <span>列表名称</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 英语四级高频词"
          />
        </label>
        <label className="field">
          <span>朗读语言</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="words-section">
        <div className="section-head">
          <h2>词条列表</h2>
          <div className="section-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setShowHelp(true)}
            >
              格式说明
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => fileInputRef.current?.click()}
            >
              导入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.csv"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>
        </div>
        {importMessage && <p className="import-message">{importMessage}</p>}
        <ul className="word-list">
          <li className="word-row word-header">
            <span className="word-index">序号</span>
            <span className="word-header-text">词条内容</span>
            <span className="word-header-translation">翻译或释义</span>
          </li>
          {words.map((word, index) => (
            <li key={word.id} className="word-row edit-row">
              <span className="word-index">{index + 1}</span>
              <input
                className="word-input word-input-text"
                value={word.text}
                onChange={(e) => updateWord(word.id, 'text', e.target.value)}
                placeholder="词条内容"
              />
              <input
                className="word-input word-input-translation"
                value={word.translation}
                onChange={(e) =>
                  updateWord(word.id, 'translation', e.target.value)
                }
                placeholder="翻译或释义"
              />
            </li>
          ))}
          <li className="add-row">
            <button
              type="button"
              className="btn btn-add"
              title="添加词条"
              onClick={addBlankRow}
            >
              +
            </button>
          </li>
        </ul>
      </section>

      {showHelp && (
        <div className="modal-mask" onClick={() => setShowHelp(false)}>
          <div
            className="modal-card modal-help"
            role="dialog"
            aria-modal="true"
            aria-label="导入格式说明"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>导入格式说明</h2>
            <div className="help-content">
              <section>
                <h3>TXT 文本</h3>
                <p>每行一个词条, 单词与翻译可用制表符/逗号/分号分隔</p>
                <pre>{`apple,苹果
banana\t香蕉
cat`}</pre>
              </section>
              <section>
                <h3>JSON</h3>
                <p>数组格式, 元素可为对象/数组/字符串</p>
                <pre>{`[{"text": "apple", "translation": "苹果"}]`}</pre>
              </section>
              <section>
                <h3>CSV 表格</h3>
                <p>每行一列, 逗号分隔单词与翻译</p>
                <pre>{`apple,苹果
banana,香蕉`}</pre>
              </section>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowHelp(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListEditor
