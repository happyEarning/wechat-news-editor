<template>
	<div class="page">
	 该功能正在开发中。。。
	</div>
</template>

<script>
export default {
	name: "detail",
	data() {
		return {
		}
	},
	computed: {

	},
	activated: function () {
		const breadcrumbs = [{ text: "开发中", url: "" }];
		this.$store.commit('updateBreadcrumb', breadcrumbs)
	},
}

</script>

<style>
.form {
	max-width: 750px;
}

.qrcode-img {
	max-width: 250px;
}

.img-list {
	display: flex;
	flex-flow: row wrap;
	align-items: center;
}

.item-img {
	max-width: 250px;
	margin: 10px;
}
</style>
