<script setup>
defineProps({
	name: { type: String, required: true },
	size: { type: [Number, String], default: 24 },
})
</script>

<template>
	<svg class="tabler-icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<template v-if="name === 'dashboard' || name === 'home'"><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></template>
		<template v-else-if="name === 'mail'"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" /></template>
		<template v-else-if="name === 'bell'"><path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3l2 2H4l2-2v-3a7 7 0 0 1 4-6M9 20h6" /></template>
		<template v-else-if="name === 'template' || name === 'layout'"><path d="M4 4h16v16H4zM4 9h16M9 9v11" /></template>
		<template v-else-if="name === 'users'"><path d="M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M18 14a5 5 0 0 1 3 4" /></template>
		<template v-else-if="name === 'user'"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></template>
		<template v-else-if="name === 'clipboard' || name === 'file-text'"><path d="M9 5h6M9 4h6v3H9zM6 5H5v15h14V5h-1M8 12h8M8 16h5" /></template>
		<template v-else-if="name === 'shield-lock' || name === 'shield'"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /></template>
		<template v-else-if="name === 'settings'"><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><circle cx="12" cy="12" r="3" /></template>
		<template v-else-if="name === 'logout'"><path d="M10 17l5-5l-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></template>
		<template v-else-if="name === 'bolt'"><path d="M13 2L3 14h9l-1 8l10-12h-9z" /></template>
		<template v-else-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16l4 4" /></template>
		<template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
		<template v-else-if="name === 'menu'"><path d="M4 6h16M4 12h16M4 18h16" /></template>
		<template v-else-if="name === 'layout-sidebar' || name === 'sidebar'"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M9 4l0 16" /></template>
		<template v-else-if="name === 'x'"><path d="M18 6l-12 12M6 6l12 12" /></template>
		<template v-else-if="name === 'check'"><path d="M5 12l5 5l10 -10" /></template>
		<template v-else-if="name === 'sun'"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></template>
		<template v-else-if="name === 'moon'"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></template>
		<template v-else-if="name === 'chevron-left'"><path d="M15 6l-6 6l6 6" /></template>
		<template v-else-if="name === 'chevron-right'"><path d="M9 6l6 6l-6 6" /></template>
		<template v-else-if="name === 'chevron-down'"><path d="M6 9l6 6l6-6" /></template>
		<template v-else-if="name === 'chevron-up'"><path d="M6 15l6-6l6 6" /></template>
		<template v-else-if="name === 'send'"><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></template>
		<template v-else-if="name === 'clock'"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></template>
		<template v-else-if="name === 'calendar'"><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /></template>
		<template v-else-if="name === 'alert-circle'"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></template>
		<template v-else-if="name === 'credit-card' || name === 'wallet'"><path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M3 10l18 0" /><path d="M7 15l.01 0" /><path d="M11 15l2 0" /></template>
		<template v-else-if="name === 'cash' || name === 'dollar'"><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></template>
		<template v-else-if="name === 'hash' || name === 'tag'"><path d="M5 9l14 0" /><path d="M5 15l14 0" /><path d="M11 4l-4 16" /><path d="M17 4l-4 16" /></template>
	</svg>
</template>
