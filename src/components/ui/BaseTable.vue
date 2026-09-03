<template>
    <div class="table-wrapper">
        <table class="base-table">
            <caption v-if="caption" class="visually-hidden">{{ caption }}</caption>
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.key" scope="col" :class="column.headerClass">
                        {{ column.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loading">
                    <td class="table-message" :colspan="columns.length">Loading...</td>
                </tr>
                <tr v-else-if="!rows.length">
                    <td class="table-message" :colspan="columns.length">{{ emptyMessage }}</td>
                </tr>
                <tr v-for="(row, rowIndex) in rows" v-else :key="getRowKey(row, rowIndex)">
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
    width: 100%;
    overflow-x: auto;
    border: 1px solid #e3e5e9;
    border-radius: 12px;
    background: #fff;
}

.base-table {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    color: #152033;
    font-size: 16px;
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
    padding: 32px 20px;
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

@media (max-width: 600px) {
    .base-table th {
        font-size: 14px;
    }
}
</style>
