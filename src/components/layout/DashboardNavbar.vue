<script setup>
import TablerIcon from '@/components/common/TablerIcon.vue'
</script>

<template>
	<header class="dashboard-navbar">
		<label class="search-field">
			<TablerIcon name="search" size="20" />
			<input type="search" placeholder="Search transaction, Budget ..." aria-label="Search transactions and budgets" />
			<kbd aria-label="Command K">⌘ K</kbd>
		</label>
		<div class="navbar-actions">
			<div class="utility-actions">
				<button class="icon-button" type="button" aria-label="Toggle theme">
					<TablerIcon name="sun" size="21" />
				</button>
				<button class="icon-button notification-button" type="button" aria-label="Notifications">
					<TablerIcon name="bell" size="21" />
					<span class="notification-dot" aria-hidden="true"></span>
				</button>
			</div>

			<div class="profile-info">
				<button class="profile-button" type="button" aria-label="Open Gustavo's profile menu">
				<span class="avatar" aria-hidden="true">G</span>
				<strong>Gustavo</strong>
				<span class="chevron" aria-hidden="true"></span>
			</button>
			</div>
		</div>
	</header>
</template>

<style scoped>


.dashboard-navbar {
	min-height: 75px;
	padding: 0 36px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
	background: #fff;
	border-bottom: 1px solid #e2e5ea;
}

.search-field,
.utility-actions,
.profile-button {
	display: flex;
	align-items: center;
	height: 50px;
}

.search-field {
	width: min(330px, 100%);
	height: 50px;
	gap: 20px;
	padding: 0 20px 0 23px;
	border: 1px solid #dfe2e8;
	border-radius: 13px;
	color: #657086;
	box-shadow: 0 1px 2px rgb(21 32 51 / 3%);
}

.search-field:focus-within {
	border-color: #996dff;
	box-shadow: 0 0 0 3px rgb(153 109 255 / 12%);
}

.search-field input {
	min-width: 0;
	font-weight: normal !important;
	flex: 1;
	border: 0;
	outline: 0;
	font-size: 13px !important;
	color: #51555c;
	background: transparent;
	font: 500 13px/1 "Geist", sans-serif;
}

.search-field input::placeholder {
	color: #657086;
	opacity: 1;
}

.search-icon {
	width: 20px;
	height: 20px;
	flex: 0 0 20px;
	border: 2px solid #748096;
	border-radius: 50%;
	position: relative;
}

.search-icon::after {
	content: "";
	width: 8px;
	height: 2px;
	position: absolute;
	right: -6px;
	bottom: -3px;
	background: #748096;
	transform: rotate(45deg);
}

kbd {
	flex: 0 0 auto;
	padding: 6px 10px;
	border: 1px solid #dfe2e8;
	border-radius: 6px;
	color: #657086;
	background: #fff;
	font: 500 16px/1 "Geist", sans-serif;
}

.navbar-actions {
	display: flex;
	align-items: center;
	gap: 14px;
}

.utility-actions,
.profile-button {
	min-height: 50px;
	border: 1px solid #dfe2e8;
	border-radius: 18px;
	background: #fff;
	box-shadow: 0 2px 0 #eef0f3, 0 0 0 5px #f5f6f8;
}

.utility-actions {
	overflow: hidden;
}

.icon-button {
	width: 84px;
	height: 48px;
	display: grid;
	place-items: center;
	border: 0;
	border-right: 1px solid #eef0f3;
	background: transparent;
	cursor: pointer;
}

.icon-button:last-child {
	border-right: 0;
}

.icon-button:hover,
.profile-button:hover {
	background: #faf9ff;
}

.sun-icon {
	width: 19px;
	height: 19px;
	border: 2px solid #253247;
	border-radius: 50%;
	box-shadow: 0 -9px 0 -7px #253247, 0 9px 0 -7px #253247, 9px 0 0 -7px #253247, -9px 0 0 -7px #253247;
}

.bell-icon {
	width: 19px;
	height: 21px;
	border: 2px solid #748096;
	border-bottom: 0;
	border-radius: 12px 12px 4px 4px;
	position: relative;
}

.bell-icon::after {
	content: "";
	width: 23px;
	height: 2px;
	position: absolute;
	left: -4px;
	bottom: -3px;
	background: #748096;
	border-radius: 2px;
}

.notification-button {
	position: relative;
}

.notification-dot {
	width: 13px;
	height: 13px;
	position: absolute;
	top: 16px;
	right: 22px;
	border: 2px solid #fff;
	border-radius: 50%;
	background: #f3354b;
}

.profile-button {
	min-width: 241px;
	gap: 12px;
	padding: 7px 22px 7px 8px;
	color: #152033;
	cursor: pointer;
	font: 500 20px/1 "Geist", sans-serif;
}

.avatar {
	width: 45px;
	height: 45px;
	display: grid;
	place-items: center;
	border-radius: 10px;
	color: #fff;
	background: linear-gradient(145deg, #f2b18f 5%, #896153 48%, #303746 49%, #252b39 100%);
	font-size: 18px;
	font-weight: 700;
}

.chevron {
	width: 11px;
	height: 11px;
	margin-left: auto;
	border-right: 2px solid #748096;
	border-bottom: 2px solid #748096;
	transform: rotate(45deg) translateY(-3px);
}

@media (max-width: 720px) {
	.dashboard-navbar {
		min-height: 86px;
		padding: 14px 18px;
		flex-wrap: wrap;
	}

	.search-field {
		order: 2;
		width: 100%;
	}

	.navbar-actions {
		margin-left: auto;
	}

	.utility-actions {
		display: none;
	}

	.profile-button {
		min-width: 0;
		min-height: 48px;
		padding-right: 14px;
	}

	.search-field {
		flex-basis: 100%;
		width: 100%;
		height: 50px;
	}

	.avatar {
		width: 38px;
		height: 38px;
	}
}
</style>
