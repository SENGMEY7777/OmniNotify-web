<template>
  <div class="spinner-container" :class="{ 'with-label': Boolean(label) }" role="status">
    <div
      class="spinner-ring"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${thickness}px`,
        borderTopColor: color,
      }"
    ></div>
    <span v-if="label" class="spinner-label">{{ label }}</span>
    <span v-else class="sr-only">Loading...</span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 20,
  },
  thickness: {
    type: [Number, String],
    default: 2.5,
  },
  color: {
    type: String,
    default: '#8751ff',
  },
  label: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.spinner-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner-ring {
  border-style: solid;
  border-color: rgba(135, 81, 255, 0.18);
  border-radius: 50%;
  box-sizing: border-box;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.spinner-label {
  font-size: 13.5px;
  color: #64748b;
  font-weight: 500;
}

.sr-only {
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
