<template>
	<div style="min-height:100%" class="flex">
	
		<nav-menu class="nav-menu-box"></nav-menu>
		<div class="root-route-view-box">
			<div class="header flex-a-c">
				<div class="system-name">
					后台管理系统
				</div>
				<el-dropdown @command="userOptions">
					<span class="el-dropdown-link">
						{{username}}
						<i class="el-icon-caret-bottom el-icon--right"></i>
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="a">{{username}}</el-dropdown-item>
						<el-dropdown-item command="a">{{role}}</el-dropdown-item>
						<el-dropdown-item command="logout">登出</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
			<div class="breadcrumb-box flex-a-c">
				<el-breadcrumb separator="/">
					<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
					<el-breadcrumb-item v-for="(item,index) in $store.state.breadcrumbs" :key="index" :to="{ path:item.url}">{{item.text}}</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
	
			<div class="router-view">
				<keep-alive>
					<router-view v-if="$route.meta.keepAlive"></router-view>
				</keep-alive>
				<router-view v-if="!$route.meta.keepAlive"></router-view>
			</div>
		</div>
	</div>
</template>

<script>
import NavMenu from '../components/common/NavMenu'

// 
export default {
	name: "Home",
	components: { NavMenu },
	data() {
		return {
		}
	},
	computed: {
		username: function () {
			return this.$store.state.user ? this.$store.state.user.name : ''
		},
		role(){
			return this.$store.state.user ? this.$store.state.user.role : ''
		}
	},
	created() {
		console.log('created')
	},
	methods: {
		userOptions(command) {
			if (command === 'logout') {
				Site.http.post('/biz/staff/logout',{},()=>{});
				this.$router.push({
					path: '/login'
				})
			}

		}
	},
	mounted: function () {
		// console.log(this.$store.state.user)
	}

}

</script>

<style>
.nav-menu-box {
	width: 30%;
	max-width: 200px;
	min-height: 100%;
	flex-shrink: 0;
	display: flex
}

.root-route-view-box {
	flex-grow: 2;
	background-color: #f0f0f0;
			width: 70%;
			min-width: 900px;
}

.header {
	height: 55px;
	justify-content: space-between;
	padding: 0 20px;
	background-color: #fff;
}
.el-dropdown-menu{
	font-size: 14px;
}
</style>
