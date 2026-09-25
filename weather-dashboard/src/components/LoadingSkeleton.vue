<template>
  <div class="skeleton-wrapper">
    <div class="skeleton-card">
      <div class="skeleton-row">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-sub"></div>
      </div>
      <div class="skeleton-main">
        <div class="skeleton skeleton-icon"></div>
        <div>
          <div class="skeleton skeleton-temp"></div>
          <div class="skeleton skeleton-desc"></div>
        </div>
      </div>
      <div class="skeleton-details">
        <div v-for="i in 6" :key="i" class="skeleton skeleton-detail"></div>
      </div>
    </div>
    <div class="skeleton-forecast">
      <div class="skeleton skeleton-forecast-title"></div>
      <div class="skeleton-forecast-grid">
        <div v-for="i in 5" :key="i" class="skeleton skeleton-forecast-item"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrapper { display: flex; flex-direction: column; gap: 24px; }
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skeleton-card {
  background: rgba(255,255,255,0.1); border-radius: 24px; padding: 28px;
}
.skeleton-row { margin-bottom: 20px; }
.skeleton-title { height: 28px; width: 200px; margin-bottom: 8px; }
.skeleton-sub { height: 16px; width: 140px; }
.skeleton-main { display: flex; gap: 16px; margin-bottom: 24px; }
.skeleton-icon { width: 100px; height: 100px; border-radius: 50%; }
.skeleton-temp { height: 60px; width: 120px; margin-bottom: 8px; }
.skeleton-desc { height: 20px; width: 160px; }
.skeleton-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.skeleton-detail { height: 80px; border-radius: 14px; }
.skeleton-forecast { background: rgba(255,255,255,0.1); border-radius: 24px; padding: 24px; }
.skeleton-forecast-title { height: 22px; width: 150px; margin-bottom: 16px; }
.skeleton-forecast-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.skeleton-forecast-item { height: 180px; border-radius: 18px; }
</style>
