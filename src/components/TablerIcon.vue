<script setup>
defineProps({
	name: { type: String, required: true },
	size: { type: [Number, String], default: 24 },
})
</script>

<template>
	<svg class="tabler-icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<template v-if="name === 'dashboard'"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></template>
		<template v-else-if="name === 'bell'"><path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3l2 2H4l2-2v-3a7 7 0 0 1 4-6M9 20h6" /></template>
		<template v-else-if="name === 'template'"><path d="M4 4h16v16H4zM4 9h16M9 9v11" /></template>
		<template v-else-if="name === 'users'"><path d="M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M18 14a5 5 0 0 1 3 4" /></template>
		<template v-else-if="name === 'clipboard'"><path d="M9 5h6M9 4h6v3H9zM6 5H5v15h14V5h-1M8 12h8M8 16h5" /></template>
		<template v-else-if="name === 'logout'"><path d="M10 17l5-5l-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></template>
		<template v-else-if="name === 'bolt'"><path d="M13 2L3 14h9l-1 8l10-12h-9z" /></template>
		<template v-else-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16l4 4" /></template>
		<template v-else-if="name === 'sun'"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></template>
	</svg>
</template>
