<template>
	<aside class="sidebar col-2-5 d-flex flex-column">
		<div class="logo">
			<RouterLink class="brand d-flex align-items-center" :to="{ name: 'admin-dashboard' }" aria-label="Fundex home">
				<div class="brand-mark" aria-hidden="true"><i class="brand-mark-shape"></i></div>
				Fundex
			</RouterLink>
		</div>

		<nav class="nav-list" aria-label="Main navigation">
			<ul class="nav nav-pills flex-column nav-list-items">
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" exact-active-class="active" :to="{ name: 'admin-dashboard' }">
						<IconLayoutDashboard  />Dashboard
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'notification' }">
						<IconBellRinging />Notifications
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'template' }">
						<IconListNumbers />Templates
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'manage-user' }">
						<IconUsersPlus />Users
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'delivery-log' }">
						<IconPackages />Delivery Logs
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'audit-log' }">
						<IconFileIsr />Audit Logs
					</RouterLink>
				</li>
				<li class="nav-item">
					<RouterLink class="nav-link d-flex align-items-center" active-class="active" :to="{ name: 'setting' }">
						<IconSettings />Settings
					</RouterLink>
				</li>
			</ul>
		</nav>

		<div class="sidebar-bottom mt-3">
			<section class="upgrade-card">
				<span class="title">
					<TablerIcon name="bolt" size="22" /> Upgrade to pro
				</span>
				<p class="sub-title">Get unlimited budget setup and more powerful features. Upgrade today.</p>
				<button class="btn-upgrade" type="button">Upgrade</button>
			</section>
		</div>
		<div class="btn-logout">
			<button class="logout btn d-flex align-items-center" type="button" @click="handleLogout">
				<IconLogout2 /> Log Out
			</button>
		</div>
	</aside>
</template>

<script setup>
import { IconSettings,IconBellRinging,
	IconListNumbers,IconUsersPlus,
	IconPackages,IconFileIsr
  } from '@tabler/icons-vue';
import { IconLayoutDashboard } from '@tabler/icons-vue';
import { IconLogout2 } from '@tabler/icons-vue';

function handleLogout() {
	localStorage.removeItem('token')
	localStorage.removeItem('user')
	sessionStorage.clear()
}
</script>

<style scoped>

.sub-title {
	font-size: 12px !important;
}

.title {
	font-size: 15px !important;
}

.btn-upgrade {
	background-color: white !important;
	color: black !important;
	font-size: 14px !important;
}

.btn-logout {
	margin-top: 20px !important;

}

.logout {
	gap: 3px !important;
	color: red !important;
	font-weight: 500 !important;
}

.sidebar {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 48px 30px 28px;
	border-right: 1px solid #e3e5e9;
	color: #152033;
	background: #fff;
	font-family: "Geist", sans-serif;
}

.col-2-5 {
	flex: 0 0 auto;
	width: 20.833333%;
}

.brand {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 0 10px 30px;
	color: #090d19;
	font-size: 40px;
	font-weight: 600;
	line-height: 1;
	font-family: "Geist", sans-serif;
	letter-spacing: -1px;
	text-decoration: none;
	margin-top: -22px !important;
}

.brand-mark {
	width: 40px;
	height: 40px;
	position: relative;
	display: block;
	overflow: hidden;
	border-radius: 50%;
	background: #803df0;
}

.brand-mark::before,
.brand-mark::after,
.brand-mark-shape {
	content: "";
	position: absolute;
	background: #fff;
}

.brand-mark::before {
	width: 13px;
	height: 13px;
	top: 5px;
	left: 14px;
	border-radius: 50%;
}

.brand-mark::after {
	width: 11px;
	height: 11px;
	top: 4px;
	right: 3px;
}

.brand-mark-shape {
	width: 21px;
	height: 9px;
	right: 0;
	bottom: 10px;
	transform: rotate(42deg);
}

.nav-list {
	display: grid;
}

.nav-list-items,
.nav-item {
	margin: 0;
	list-style: none;
	padding: 1px 1px;
}

.nav-item {
	display: grid;
	gap: 13px;
}

.nav-link  {
	display: flex;
	align-items: center;
	gap: 17px;
	min-height: 48px;
	padding: 12px 20px;
	color: #697489;
	font-size: 15px !important;
	font-weight: 400;
	font-family: "Geist", sans-serif;
	text-decoration: none;
}

.nav-link.active {
	color: #8751ff;
	background: #f2efff;
}

.nav-icon {
	width: 28px;
	height: 28px;
	flex: 0 0 28px;
	position: relative;
	display: block;
}

.dashboard-icon {
	background: radial-gradient(circle at 25% 25%, transparent 0 4px, currentColor 4px 5px, transparent 5px), radial-gradient(circle at 75% 25%, transparent 0 4px, currentColor 4px 5px, transparent 5px), radial-gradient(circle at 25% 75%, transparent 0 4px, currentColor 4px 5px, transparent 5px), radial-gradient(circle at 75% 75%, transparent 0 4px, currentColor 4px 5px, transparent 5px);
}

.transactions-icon::before,
.transactions-icon::after {
	content: "";
	position: absolute;
	width: 21px;
	height: 2px;
	left: 3px;
	background: currentColor;
}

.transactions-icon::before {
	top: 8px;
}

.transactions-icon::after {
	top: 19px;
}

.analytics-icon {
	border-left: 2px solid currentColor;
	border-bottom: 2px solid currentColor;
	background: linear-gradient(to top, currentColor 0 2px, transparent 2px) 7px 8px / 3px 14px no-repeat, linear-gradient(to top, currentColor 0 2px, transparent 2px) 14px 3px / 3px 19px no-repeat, linear-gradient(to top, currentColor 0 2px, transparent 2px) 21px 10px / 3px 12px no-repeat;
}

.budgets-icon {
	border: 2px solid currentColor;
	border-radius: 50%;
}

.budgets-icon::after {
	content: "";
	width: 12px;
	height: 12px;
	position: absolute;
	top: -2px;
	right: -2px;
	border-left: 2px solid currentColor;
	border-bottom: 2px solid currentColor;
	background: #fff;
}

.settings-icon {
	border: 2px solid currentColor;
	border-radius: 9px;
}

.settings-icon::after {
	content: "";
	width: 8px;
	height: 8px;
	position: absolute;
	top: 8px;
	left: 8px;
	border: 2px solid currentColor;
	border-radius: 50%;
}


.upgrade-card {
	padding: 28px 23px 23px;
	border-radius: 20px;
	color: #fff;
	background: linear-gradient(145deg, #12172f, #42147d);
}

.upgrade-card h2 {
	display: flex;
	align-items: center;
	gap: 14px;
	font-size: 20px;
	font-weight: 700;
	line-height: 1.2;
	font-family: "Geist", sans-serif;
}

.upgrade-card p {
	margin: 21px 0 22px;
	color: #aaa8c8;
	font-size: 17px;
	font-weight: 400;
	line-height: 1.55;
	font-family: "Geist", sans-serif;
}

.upgrade-card button {
	padding: 13px 29px;
	border: 0;
	border-radius: 11px;
	color: #152033;
	background: #fff;
	font: 700 18px "Geist", sans-serif;
	cursor: pointer;
}

/* .logout {
	display: flex;
	align-items: center;
	gap: 17px;
	width: calc(100% - 40px);
	margin: 36px 20px 0;
	padding: 0;
	border: 0;
	color: #fb3743;
	background: transparent;
	font-size: 19px;
	font-weight: 650;
	line-height: 1.2;
	font-family: inherit;
	text-align: left;
	cursor: pointer;
} */

.logout:hover {
	color: #d92332;
}

@media (max-width: 900px) {
	.sidebar {
		width: 250px;
		flex-basis: 250px;
		padding: 36px 20px 24px;
	}

	.brand {
		margin-left: 8px;
		font-size: 34px;
	}

	.nav-link {
		padding: 0 16px;
	}
}

@media (max-width: 720px) {
	.sidebar {
		width: 100%;
		min-height: 100dvh;
		flex-basis: auto;
		overflow-y: auto;
		padding: 120px 76px 44px;
	}

	.brand {
		gap: 28px;
		margin: 0 38px 130px;
		font-size: 88px;
		letter-spacing: -2px;
	}

	.brand-mark {
		width: 88px;
		height: 88px;
	}

	.brand-mark::before {
		width: 29px;
		height: 29px;
		top: 11px;
		left: 31px;
	}

	.brand-mark::after {
		width: 24px;
		height: 24px;
		top: 9px;
		right: 7px;
	}

	.brand-mark-shape {
		width: 46px;
		height: 20px;
		right: 0;
		bottom: 22px;
	}

	.nav-link {
		min-height: 64px;
		gap: 18px;
		padding: 14px 24px;
		border-radius: 16px;
		font-size: 20px !important;
	}

	.nav-item .tabler-icon {
		width: 28px;
		height: 28px;
	}

	.sidebar-bottom {
		/* margin-top: 80px; */
		height: 50px !important;
	}

	/* .logout {
		position: sticky;
		bottom: 0;
		margin-top: 36px;
		padding: 20px 0;
		background: #fff;
	} */
}
</style>
