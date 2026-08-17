import { defaultLists } from '../data/defaultLists.js'

const STORAGE_KEY = 'dictation-helper:lists'

// 从本地存储读取列表, 无数据或解析失败时回退到默认列表
export function loadLists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultLists
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultLists
  } catch {
    return defaultLists
  }
}

// 将列表写入本地存储
export function saveLists(lists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
}

// 生成唯一 id, 用于列表与词条
export function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
