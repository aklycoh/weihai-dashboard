import { DATA_SOURCES } from '../config/dashboard';

export const loadStoredArray = (key, fallback) => {
  if (typeof window === 'undefined') {
    return { data: fallback, source: DATA_SOURCES.DEMO };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { data: fallback, source: DATA_SOURCES.DEMO };
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { data: parsed, source: DATA_SOURCES.STORED };
    }
  } catch {
    // 本地缓存异常时回退到演示数据。
  }

  return { data: fallback, source: DATA_SOURCES.DEMO };
};

export const persistArray = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};
