<template>
    <article class="card-image-panel">
        <img class="card-image" :src="cards[currentIndex].src" :alt="cards[currentIndex].alt" />
        <span class="card-counter">{{ currentIndex + 1 }}/{{ cards.length }}</span>
        <button class="card-control previous" type="button" aria-label="Show previous card" @click="showPrevious">
            <span aria-hidden="true">&#8249;</span>
        </button>
        <button class="card-control next" type="button" aria-label="Show next card" @click="showNext">
            <span aria-hidden="true">&#8250;</span>
        </button>
    </article>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    src: {
        type: String,
        default: '/my-card.svg',
    },
})

const cards = [
    { src: '/my-card.svg', alt: 'Primary bank card' },
    { src: '/my-card-2.svg', alt: 'Secondary bank card' },
]
const currentIndex = ref(0)

const showPrevious = () => {
    currentIndex.value = (currentIndex.value - 1 + cards.length) % cards.length
}

const showNext = () => {
    currentIndex.value = (currentIndex.value + 1) % cards.length
}
</script>

<style scoped>


.card-image-panel {
    width: 100%;
    position: relative;
    overflow: hidden;
    border: 1px solid #e3e5e9;
    border-radius: 14px;
    background: #fff;
    height: auto;
}

.card-image {
    display: block;
    width: 100%;
    height: 270px !important;
}

.card-counter,
.card-control {
    position: absolute;
    bottom: 20px;

}

.card-counter {
    left: 28px;
    color: #687487;
    font-size: 20px;
    font-weight: 600;
}

.card-control {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 1px solid #e3e5e9;
    border-radius: 50%;
    color: #687487;
    background: #fff;
    font-size: 30px;
    line-height: 1;
    cursor: pointer;
}

.card-control:hover {
    background: #faf9ff;
}

.card-control:focus-visible {
    outline: 3px solid rgb(135 81 255 / 25%);
    outline-offset: 2px;
}

.previous {
    right: 82px;
}

.next {
    right: 24px;
}
</style>
