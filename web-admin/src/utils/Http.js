import Vue from 'vue'
import axios from 'axios'

let baseURL = '';

if(location.href.indexOf('badoutec')>-1){
	baseURL = 'http://rt.badoutec.com/services';
}else{
	baseURL = 'http://rt.badoutec.com/services';
}

axios.defaults.withCredentials = true;
let Http = {
	imgBaseUrl : 'http://rt.badoutec.com/media/',
	baseURL: baseURL,
	header: {
		'Content-Type': 'application/json; charset=utf-8'
	},
	/**
	 * 程序中请求数据用此方法
	 * @param  {array}   api  Apis中的数据    
	 * @param  {object}   data     传参
	 * @param  {Function} callback 回调函数
	 * @return {[type]}            
	 */
	request(api, data, callback, error) {
		if (api instanceof Array) {
			var reqBody = {}, reqBodyKeys = Object.keys(data)
			if(!Array.isArray(data)){
				reqBodyKeys.forEach(function (item) {
					if (data[item] !== '' && data[item] !== null) {
						reqBody[item] = data[item];
					}
				})
			}else{
				reqBody = data
			}
			let method = api[0];
			let req = {
				method: method,
				url: api[1],
				baseURL: baseURL,
				headers: this.header,
			};
			if (method == 'get') {
				req.params = reqBody
			} else {
				req.data = reqBody
			}
			return axios(req).then(function (res) {
				if (res.data && res.data.err) {
					Site.app.$notify.error({
						title: res.status,
						message: res.data.err.message
					});
					if(error){
						error()
					}
				} else {
					callback(res.data)
				}
			}).catch(function (err) {
				console.log(err)
			}.bind(this));
		}

	},
	get(api, data, callback, error) {
		this.request(['get', api], data, callback, error)
	},
	post(api, data, callback, error) {
		this.request(['post', api], data, callback, error)
	},
	patch(api, data, callback, error) {
		this.request(['patch', api], data, callback, error)
	},
	put(api, data, callback, error) {
		this.request(['put', api], data, callback, error)
	},
	delete(api, data, callback, error) {
		this.request(['delete', api], data, callback, error)
	}

}

export default Http
