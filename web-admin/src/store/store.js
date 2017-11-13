import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

const store = new Vuex.Store({
	state:{
		user:null,
		hasLoad:false,
		breadcrumbs:[],
		orderSearch:null,
		orderLiangTi:null,
		orderDetail:null,
		orderSearchStr:''
	},
	mutations:{
		login(state,userdata){
			state.user = userdata
			state.hasLoad = true
		},
		updateBreadcrumb(state,arr){
			state.breadcrumbs = arr
		},
		setOrderSearch(state,data){
			state.orderSearch = data
		},
		clearOrderSearch(state){
			state.orderSearch = null;
		},
		setOrderSearchStr(state,data){
			state.orderSearchStr = data
		},
		clearOrderSearchStr(state){
			state.orderSearchStr = '';
		},
		setOrderLiangTi(state,data){
			state.orderLiangTi = data
		},
		clearOrderLiangTi(state){
			state.orderLiangTi = null;
		},
		setOrderDetial(state,data){
			state.orderDetail = data
		},
		clearOrderDetial(state){
			state.orderDetail = null;
		},

	}
})

export default store
