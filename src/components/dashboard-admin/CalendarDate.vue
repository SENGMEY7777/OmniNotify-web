<template>
    <article class="calendar-panel" aria-label="Calendar">
        <div class="calendar-header">
            <div>
                <h2>{{ monthName }} {{ displayedYear }}</h2>
            </div>
            <div class="calendar-controls">
                <button type="button" aria-label="Previous month" @click="changeMonth(-1)">&#8249;</button>
                <button type="button" aria-label="Reset to Today" class="today-btn" @click="resetToToday">Today</button>
                <button type="button" aria-label="Next month" @click="changeMonth(1)">&#8250;</button>
            </div>
        </div>
        <div class="weekdays" aria-hidden="true">
            <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>
        <div class="calendar-grid">
            <button
                v-for="day in calendarDays"
                :key="day.key"
                type="button"
                class="date-cell"
                :class="{
                    muted: day.muted,
                    selected: isSelected(day),
                    'is-today': isToday(day)
                }"
                :aria-label="day.label"
                :aria-pressed="isSelected(day)"
                @click="selectDate(day)"
            >
                {{ day.date }}
            </button>
        </div>
        <div class="calendar-footer">
            <span class="selected-label">Filter: <strong>{{ selectedDateLabel }}</strong></span>
        </div>
    </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: [Date, String],
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'select-date', 'reset-date'])

const today = new Date()
const displayedMonth = ref(today.getMonth())
const displayedYear = ref(today.getFullYear())
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

watch(() => props.modelValue, (val) => {
    if (val) {
        const d = new Date(val)
        if (!isNaN(d.getTime())) {
            selectedDate.value = d
            displayedMonth.value = d.getMonth()
            displayedYear.value = d.getFullYear()
        }
    }
})

const monthName = computed(() => new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(displayedYear.value, displayedMonth.value, 1)))
const selectedDateLabel = computed(() => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(selectedDate.value))

const calendarDays = computed(() => {
    const firstDay = new Date(displayedYear.value, displayedMonth.value, 1).getDay()
    const daysInMonth = new Date(displayedYear.value, displayedMonth.value + 1, 0).getDate()
    const daysInPreviousMonth = new Date(displayedYear.value, displayedMonth.value, 0).getDate()
    const days = []

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        const date = daysInPreviousMonth - index
        days.push(createDay(date, displayedMonth.value - 1, displayedYear.value, true))
    }

    for (let date = 1; date <= daysInMonth; date += 1) {
        days.push(createDay(date, displayedMonth.value, displayedYear.value, false))
    }

    let nextDate = 1
    while (days.length < 42) {
        days.push(createDay(nextDate, displayedMonth.value + 1, displayedYear.value, true))
        nextDate += 1
    }

    return days
})

const createDay = (date, month, year, muted) => {
    const value = new Date(year, month, date)
    return {
        date,
        key: value.toISOString(),
        value,
        muted,
        label: new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(value),
    }
}

const isSelected = (day) => day.value.toDateString() === selectedDate.value.toDateString()
const isToday = (day) => day.value.toDateString() === today.toDateString()

const selectDate = (day) => {
    selectedDate.value = day.value
    displayedMonth.value = day.value.getMonth()
    displayedYear.value = day.value.getFullYear()
    emit('update:modelValue', day.value)
    emit('select-date', day.value)
}

const resetToToday = () => {
    const now = new Date()
    selectedDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    displayedMonth.value = now.getMonth()
    displayedYear.value = now.getFullYear()
    emit('update:modelValue', selectedDate.value)
    emit('select-date', selectedDate.value)
    emit('reset-date')
}

const changeMonth = (offset) => {
    const nextMonth = new Date(displayedYear.value, displayedMonth.value + offset, 1)
    displayedMonth.value = nextMonth.getMonth()
    displayedYear.value = nextMonth.getFullYear()
}
</script>

<style scoped>
.calendar-panel {
    flex: 0 0 calc(33.333333% - 12px);
    padding: 24px;
    border: 1px solid #e3e5e9;
    border-radius: 14px;
    background: #fff;
}

.calendar-header,
.calendar-controls {
    display: flex;
    align-items: center;
}

.calendar-header {
    justify-content: space-between;
    gap: 12px;
}

.calendar-label {
    margin: 0 0 6px;
    color: #697489;
    font-size: 13px;
}

.calendar-header h2 {
    margin: 0;
    color: #152033;
    font-size: 20px;
}

.calendar-controls {
    gap: 6px;
}

.calendar-controls button {
    width: 32px;
    height: 32px;
    border: 1px solid #e3e5e9;
    border-radius: 50%;
    color: #687487;
    background: #fff;
    font-size: 23px;
    line-height: 1;
    cursor: pointer;
}

.calendar-controls button:hover,
.calendar-controls button:focus-visible {
    background: #f0efff;
    outline: none;
}

.weekdays,
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
}

.weekdays {
    margin-top: 24px;
    color: #8993a5;
    font-size: 11px;
    font-weight: 600;
}

.calendar-grid {
    gap: 4px 2px;
    margin-top: 10px;
}

.date-cell {
    aspect-ratio: 1;
    border: 0;
    border-radius: 50%;
    color: #152033;
    background: transparent;
    font-size: 13px;
    cursor: pointer;
}

.date-cell:hover,
.date-cell:focus-visible {
    background: #f0efff;
    outline: none;
}

.calendar-controls button.today-btn {
    width: auto;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #8751ff;
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
}

.calendar-controls button.today-btn:hover {
    background: #ede9fe;
}

.date-cell.selected {
    color: #fff !important;
    background: #8751ff !important;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(135, 81, 255, 0.35);
}

.date-cell.is-today:not(.selected) {
    border: 2px solid #8751ff;
    font-weight: 800;
    color: #8751ff;
    background: #f5f3ff;
}

.date-cell.muted {
    color: #c1c7d1;
}

.calendar-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
}

.selected-label {
    font-size: 12.5px;
    color: #64748b;
}

.selected-label strong {
    color: #8751ff;
}

@media (max-width: 1000px) {
    .calendar-panel {
        flex-basis: auto;
    }
}
</style>
