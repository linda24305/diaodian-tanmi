<template>
  <aside class="side-nav">
    <router-link to="/" class="brand">
      <div class="logo">
        <svg viewBox="0 0 64 64" width="32" height="32">
          <rect width="64" height="64" rx="14" fill="var(--moss-deep)" />
          <path d="M16 18 L48 18 L48 46 L40 46 L34 52 L28 46 L16 46 Z" fill="#e8dcc4" />
          <circle cx="32" cy="30" r="3" fill="var(--ember)" />
          <path d="M32 33 L32 40" stroke="var(--ember)" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <div class="brand-text">
        <h1>钓点探秘</h1>
        <p>记录每一次出发</p>
      </div>
    </router-link>

    <nav class="nav-list">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ exact: item.exact }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>

    <div class="nav-foot">
      <div class="card-quote">
        <p class="eyebrow">今日箴言</p>
        <p class="quote-text">"江上柳如烟，<br />雁飞残月天。"</p>
        <p class="quote-author">— 钓叟</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
const navItems = [
  { path: '/', label: '探秘地图', icon: '🗺️', exact: true },
  { path: '/add', label: '新增钓点', icon: '📍' },
  { path: '/profile', label: '我的钓点', icon: '🎒' }
]
</script>

<style scoped>
.side-nav {
  width: 232px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  padding: 24px 16px 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 24px;
  text-decoration: none;
  color: var(--ink);
  border-bottom: 1px solid var(--line-soft);
  margin-bottom: 16px;
}
.logo {
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.brand-text h1 {
  font-size: 17px;
  margin: 0;
  line-height: 1.1;
}
.brand-text p {
  font-size: 11px;
  color: var(--ink-mute);
  margin: 3px 0 0;
  letter-spacing: 0.08em;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--r-md);
  text-decoration: none;
  color: var(--ink-soft);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}
.nav-item:hover {
  background: var(--surface-2);
  color: var(--ink);
}
.nav-item.router-link-exact-active {
  background: var(--moss);
  color: #f4ede0;
  box-shadow: var(--shadow-sm);
}
.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
}
.nav-badge {
  margin-left: auto;
  background: var(--ember);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
}

.nav-foot {
  margin-top: auto;
  padding-top: 20px;
}
.card-quote {
  background: linear-gradient(160deg, var(--surface-2), var(--surface-3));
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  padding: 14px 14px 12px;
  position: relative;
}
.card-quote::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px dashed rgba(42, 53, 40, 0.18);
  border-radius: 8px;
  pointer-events: none;
}
.card-quote .eyebrow {
  margin-bottom: 6px;
}
.quote-text {
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 4px 0 6px;
}
.quote-author {
  font-size: 11px;
  color: var(--ink-mute);
  text-align: right;
  margin: 0;
}
</style>