<template>
	<div class="page">
		管理后台
	</div>
</template>

<script>
export default {
	name: "list",
	created() {
		// this.fetchData()
	},
	activated() {
		const breadcrumbs = [];
		this.$store.commit('updateBreadcrumb', breadcrumbs)
	},
	data() {
		return {
		}
	},
	methods: {
	},
}

</script>

<style scoped>
.page {
	padding: 20px;
}
</style>
