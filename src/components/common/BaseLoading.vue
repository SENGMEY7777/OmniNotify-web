<template>
  <div
    v-if="fullscreen"
    class="loading-fullscreen-overlay"
    role="status"
    aria-live="polite"
  >
    <div class="loading-box">
      <div
        class="spinner-ring"
        :style="{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          borderWidth: `${thickness}px`,
          borderTopColor: color,
        }"
      ></div>
      <p v-if="text" class="loading-text">{{ text }}</p>
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div
    v-else-if="overlay"
    class="loading-container-overlay"
    role="status"
    aria-live="polite"
  >
    <div class="loading-box">
      <div
        class="spinner-ring"
        :style="{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          borderWidth: `${thickness}px`,
          borderTopColor: color,
        }"
      ></div>
      <p v-if="text" class="loading-text">{{ text }}</p>
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else class="loading-inline" role="status" aria-live="polite">
    <div
      class="spinner-ring"
      :style="{
        width: `${spinnerSize}px`,
        height: `${spinnerSize}px`,
        borderWidth: `${thickness}px`,
        borderTopColor: color,
      }"
    ></div>
    <span v-if="text" class="loading-text">{{ text }}</span>
    <span class="visually-hidden">Loading...</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [String, Number],
    default: 'md', // 'sm', 'md', 'lg' or custom number in px
  },
  color: {
    type: String,
    default: '#7945e9',
  },
  thickness: {
    type: [Number, String],
    default: 2.5,
  },
  text: {
    type: String,
    default: '',
  },
  overlay: {
    type: Boolean,
    default: false,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
})

const spinnerSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  switch (props.size) {
    case 'sm':
      return 16
    case 'lg':
      return 40
    case 'md':
    default:
      return 24
  }
})
</script>

<style scoped>
.loading-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-container-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-radius: inherit;
}

.loading-fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner-ring {
  border-style: solid;
  border-color: rgba(121, 69, 233, 0.16);
  border-radius: 50%;
  box-sizing: border-box;
  animation: standard-spin 0.65s linear infinite;
  flex-shrink: 0;
}

.loading-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #64748b;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes standard-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
