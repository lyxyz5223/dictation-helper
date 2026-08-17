import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 列表管理页, 展示全部听写列表并提供听写、编辑、删除入口
function ListManager({ lists, onDelete }) {
  const navigate = useNavigate()
  const [confirmList, setConfirmList] = useState(null)

  // 新建列表, 跳转到新建编辑页
  const handleCreate = () => {
    navigate('/edit/new')
  }

  // 跳转到指定列表的编辑页
  const handleEdit = (list) => {
    navigate(`/edit/${list.id}`)
  }

  // 跳转到指定列表的听写页
  const handleDictate = (list) => {
    navigate(`/dictate/${list.id}`)
  }

  return (
    <div className="list-manager">
      <header className="page-header">
        <h1>听写助手</h1>
        <button
          type="button"
          className="btn btn-icon btn-primary"
          title="新建列表"
          aria-label="新建列表"
          onClick={handleCreate}
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </header>

      {lists.length === 0 ? (
        <p className="empty-tip">暂无列表, 点击"新建列表"开始创建</p>
      ) : (
        <ul className="list-grid">
          {lists.map((list) => (
            <li key={list.id} className="list-card">
              <div className="list-card-head">
                <h2>{list.name}</h2>
                <span className="list-meta">{list.words.length} 个词条</span>
              </div>
              <div className="list-card-actions">
                <button
                  type="button"
                  className="btn btn-icon btn-primary"
                  title="开始听写"
                  aria-label="开始听写"
                  onClick={() => handleDictate(list)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    aria-hidden="true"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn btn-icon"
                  title="编辑"
                  aria-label="编辑"
                  onClick={() => handleEdit(list)}
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
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-danger"
                  title="删除"
                  aria-label="删除"
                  onClick={() => setConfirmList(list)}
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmList && (
        <div className="modal-mask" onClick={() => setConfirmList(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="删除确认"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>删除列表</h2>
            <p>确定要删除列表"{confirmList.name}"吗? 该操作无法撤销</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmList(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onDelete(confirmList.id)
                  setConfirmList(null)
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListManager
