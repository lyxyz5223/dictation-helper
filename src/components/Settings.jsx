import { useState } from 'react'
import { loadSpeechConfig, saveSpeechConfig } from '../utils/speech.js'

// 设置弹窗, 配置语音合成引擎与参数
function Settings({ onClose }) {
  const [config, setConfig] = useState(loadSpeechConfig)

  const update = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    saveSpeechConfig(config)
    onClose()
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="modal-card settings-card"
        role="dialog"
        aria-modal="true"
        aria-label="设置"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>设置</h2>
        <div className="settings-group">
          <label className="settings-label">发音引擎</label>
          <div className="option-group">
            <button
              type="button"
              className={
                config.engine === 'youdao' ? 'btn option active' : 'btn option'
              }
              onClick={() => update('engine', 'youdao')}
            >
              网易有道词典
            </button>
            <button
              type="button"
              className={
                config.engine === 'browser' ? 'btn option active' : 'btn option'
              }
              onClick={() => update('engine', 'browser')}
            >
              浏览器语音
            </button>
          </div>
        </div>

        {config.engine === 'youdao' && (
          <div className="settings-group">
            <label className="settings-label">有道口音</label>
            <div className="option-group">
              <button
                type="button"
                className={
                  config.accent === 1 ? 'btn option active' : 'btn option'
                }
                onClick={() => update('accent', 1)}
              >
                美音
              </button>
              <button
                type="button"
                className={
                  config.accent === 2 ? 'btn option active' : 'btn option'
                }
                onClick={() => update('accent', 2)}
              >
                英音
              </button>
            </div>
          </div>
        )}

        {config.engine === 'browser' && (
          <div className="settings-group">
            <label className="settings-label">
              语速: {config.rate.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={config.rate}
              onChange={(e) => update('rate', Number(e.target.value))}
            />
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings