<template>
  <div v-if="totalPages > 0" class="base-pagination d-flex align-items-center justify-content-between flex-wrap gap-3">
    <!-- Info Section -->
    <div class="pagination-info">
      Showing <span class="pagination-number">{{ startRecord }}</span> to <span class="pagination-number">{{ endRecord }}</span> of <span class="pagination-number">{{ total }}</span> records
    </div>

    <!-- Page Controls -->
    <div class="pagination-controls d-flex align-items-center gap-1">
      <span v-if="loading" class="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></span>
      <!-- Previous Button -->
      <button
        type="button"
        class="page-btn page-arrow"
        :disabled="page <= 1 || loading"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <IconChevronLeft :size="18" :stroke-width="2.2" />
      </button>

      <!-- Page Numbers -->
      <template v-for="(item, index) in pageItems" :key="index">
        <span v-if="item === '...'" class="page-ellipsis" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="page-btn page-num"
          :class="{ active: item === page }"
          :disabled="loading"
          :aria-current="item === page ? 'page' : null"
          @click="goToPage(item)"
        >
          {{ item }}
        </button>
      </template>

      <!-- Next Button -->
      <button
        type="button"
        class="page-btn page-arrow"
        :disabled="page >= totalPages || loading"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <IconChevronRight :size="18" :stroke-width="2.2" />
      </button>
    </div>

    <!-- Page Size Selector -->
    <div v-if="showPageSize" class="page-size-selector d-flex align-items-center gap-2">
      <label class="page-size-label text-muted" for="page-size-select">Per page:</label>
      <select
        id="page-size-select"
        class="form-select form-select-sm page-size-select"
        :disabled="loading"
        :value="limit"
        @change="$emit('change-limit', Number($event.target.value))"
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  limit: { type: Number, default: 20 },
  loading: { type: Boolean, default: false },
  showPageSize: { type: Boolean, default: true },
})

const emit = defineEmits(['change-page', 'change-limit'])

const startRecord = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.limit + 1
})

const endRecord = computed(() => {
  return Math.min(props.page * props.limit, props.total)
})

const pageItems = computed(() => {
  const current = props.page
  const total = props.totalPages
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items = []
  items.push(1)

  if (current > 3) {
    items.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    items.push(i)
  }

  if (current < total - 2) {
    items.push('...')
  }

  items.push(total)
  return items
})

function goToPage(newPage) {
  if (newPage >= 1 && newPage <= props.totalPages && newPage !== props.page) {
    emit('change-page', newPage)
  }
}
</script>

<style scoped>
.base-pagination {
  width: 100%;
  padding-top: 18px;
  font-size: 13.5px;
  color: #64748b;
  font-family: "Geist", sans-serif;
}

.pagination-info {
  font-size: 13.5px;
  color: #64748b;
}

.pagination-number {
  font-weight: 700;
  color: #1e293b;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: #475569;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

.page-btn.active {
  background: #8751ff;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(135, 81, 255, 0.35);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-arrow {
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.page-arrow:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.page-ellipsis {
  min-width: 24px;
  text-align: center;
  color: #94a3b8;
  font-weight: 700;
}

.page-size-selector {
  font-size: 13px;
}

.page-size-select {
  width: auto;
  border-radius: 8px;
  border-color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  padding: 4px 28px 4px 10px;
}

:global([data-theme="dark"] .pagination-info) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .pagination-number) {
  color: #f8fafc !important;
}

:global([data-theme="dark"] .page-btn) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .page-btn:hover:not(:disabled):not(.active)) {
  background: #1a2234 !important;
  color: #f8fafc !important;
}

:global([data-theme="dark"] .page-btn.active) {
  background: #8751ff !important;
  color: #ffffff !important;
}

:global([data-theme="dark"] .page-arrow) {
  border-color: #2d3748 !important;
  background: #1a2234 !important;
  color: #cbd5e1 !important;
}

:global([data-theme="dark"] .page-arrow:hover:not(:disabled)) {
  background: #242f48 !important;
  color: #f8fafc !important;
  border-color: #4a5568 !important;
}

:global([data-theme="dark"] .page-size-select) {
  background-color: #1a2234 !important;
  border-color: #2d3748 !important;
  color: #f8fafc !important;
}
</style>
