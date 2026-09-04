<template>
    <div class="table-wrapper" :class="{ 'is-loading': loading }">
        <!-- Smooth Loading Overlay -->
        <transition name="fade-fast">
            <div v-if="loading" class="table-overlay-spinner" aria-live="polite">
                <BaseLoading size="md" text="Loading records..." />
            </div>
        </transition>

        <table class="base-table" :class="{ 'table-dimmed': loading }">
            <caption v-if="caption" class="visually-hidden">{{ caption }}</caption>
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.key" scope="col" :class="column.headerClass">
                        {{ column.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!rows.length && !loading">
                    <td class="table-message" :colspan="columns.length">{{ emptyMessage }}</td>
                </tr>
                <tr v-for="(row, rowIndex) in rows" :key="getRowKey(row, rowIndex)">
                    <td v-for="column in columns" :key="column.key" :class="column.cellClass">
                        <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="rowIndex">
                            {{ row[column.key] }}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import BaseLoading from '@/components/common/BaseLoading.vue'

const props = defineProps({
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    caption: { type: String, default: '' },
    emptyMessage: { type: String, default: 'No records found.' },
    loading: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: 'id' },
})

const getRowKey = (row, index) => {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(row, index)
    }

    return row[props.rowKey] ?? index
}
</script>

<style scoped>
.table-wrapper {
    position: relative;
    width: 100%;
    min-height: 200px;
    overflow-x: auto;
    border: 1px solid #e3e5e9;
    border-radius: 12px;
    background: #fff;
    transition: all 0.25s ease;
}

.table-overlay-spinner {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.76);
    backdrop-filter: blur(2px);
    border-radius: 12px;
}

.base-table {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    color: #152033;
    font-size: 16px;
    transition: opacity 0.25s ease, filter 0.25s ease;
}

.base-table.table-dimmed {
    opacity: 0.4;
    pointer-events: none;
    filter: blur(0.5px);
}

.base-table th,
.base-table td {
    padding: 15px 20px;
    text-align: left;
    vertical-align: middle;
}

.base-table th {
    color: #152033;
    background: #fff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
}

.base-table td {
    border-top: 1px solid #eef0f3;
}

.base-table tbody tr:hover {
    background: #faf9ff;
}

.table-message {
    padding: 38px 20px;
    color: #8993a5;
    text-align: center !important;
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

.fade-fast-enter-active,
.fade-fast-leave-active {
    transition: opacity 0.2s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
    opacity: 0;
}

@media (max-width: 600px) {
    .base-table th {
        font-size: 14px;
    }
}
</style>
