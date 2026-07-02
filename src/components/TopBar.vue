<template>
  <header class="top-bar">
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索钓点 / 区域 / 鱼种..."
        class="search-input"
        @input="onSearch"
      />
      <kbd v-if="!keyword" class="kbd">⌘K</kbd>
    </div>

    <div class="right">
      <button class="icon-btn" title="天气">
        <span>☀️</span>
        <span class="weather-temp">23°</span>
      </button>
      <button class="icon-btn" title="通知">
        <span>🔔</span>
        <span class="dot"></span>
      </button>
      <div class="avatar" title="我">👤</div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useSpots } from '@/stores/spots'

const keyword = ref('')
const { setFilter } = useSpots()

function onSearch() {
  setFilter({ keyword: keyword.value.trim() })
}
</script>

<style scoped>
.top-bar {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid var(--line-soft);
  background: var(--bg);
  gap: 24px;
}

.search-wrap {
  flex: 1;
  max-width: 420px;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0 12px;
  height: 38px;
  transition: all 0.15s;
}
.search-wrap:focus-within {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(61, 90, 71, 0.12);
}
.search-icon {
  font-size: 14px;
  color: var(--ink-mute);
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 10px;
  font-size: 13.5px;
}
.search-input::placeholder {
  color: var(--ink-mute);
}
.kbd {
  font-family: var(--font-sans);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--ink-mute);
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 15px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  transition: all 0.15s;
}
.icon-btn:hover {
  background: var(--surface);
  border-color: var(--moss-soft);
}
.weather-temp {
  font-size: 12px;
  font-weight: 600;
}
.icon-btn .dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ember);
  border: 1.5px solid var(--bg);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--moss), var(--moss-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid var(--surface);
  box-shadow: var(--shadow-sm);
}
</style>