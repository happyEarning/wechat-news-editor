import lrz from 'lrz'
import template from './dashboard.html'
import Command from '../../range/command'

/**
 * Created by peak on 2017/2/10.
 */
export default {
    template,
    data() {
        return {
            imageUrl: '',
            upload: {
                status: 'ready', // progress,success,error,abort
                errorMsg: null,
                progressComputable: false,
                complete: 0
            },
            imgCount: 0,
            imgPageNo: 1,
            imgList: [],
            tabItem:'resource'
        }
    },
    created() {
        console.log('created img')
        this.getImages()
        this.getImageCount()
    },
    methods: {
        reset() {
            this.upload.status = 'ready'
        },
        insertImageUrl() {
            if (!this.imageUrl) {
                return
            }
            this.$parent.execCommand(Command.INSERT_IMAGE, this.imageUrl)
            this.imageUrl = null
        },
        pick() {
            this.$refs.file.click()
        },
        setUploadError(msg) {
            this.upload.status = 'error'
            this.upload.errorMsg = msg
        },
        process() {
            const component = this
            const config = this.$options.module.config
            // compatibility with older format
            // {
            //     server: null,
            //     fieldName: 'image',
            //     compress: true,
            //     width: 1600,
            //     height: 1600,
            //     quality: 80
            // }
            // ----------- divider ----------------
            // {
            //     upload: {
            //         url: null,
            //         headers: {},
            //         params: {},
            //         fieldName: {}
            //     },
            //     compress: {
            //         width: 1600,
            //         height: 1600,
            //         quality: 80
            //     },
            // }

            if (!config.upload && typeof config.server === 'string') {
                config.upload = { url: config.server }
            }
            if (config.upload && !config.upload.url) {
                config.upload = null
            }
            if (config.upload && typeof config.fieldName === 'string') {
                config.upload.fieldName = config.fieldName
            }

            if (typeof config.compress === 'boolean') {
                config.compress = {
                    width: config.width,
                    height: config.height,
                    quality: config.quality
                }
            }

            const file = this.$refs.file.files[0]
            if (file.size > config.sizeLimit) {
                this.setUploadError(this.$parent.locale['exceed size limit'])
                return
            }
            this.$refs.file.value = null

            if (config.compress) {
                config.compress.fieldName = config.upload && config.upload.fieldName
                    ? config.upload.fieldName : 'image'
                lrz(file, config.compress).then((rst) => {
                    if (config.upload) {
                        component.uploadToServer(rst.file)
                    } else {
                        component.insertBase64(rst.base64)
                    }
                }).catch((err) => {
                    this.setUploadError(err.toString())
                })
                return
            }
            // 不需要压缩
            // base64
            if (!config.upload) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    component.insertBase64(e.target.result)
                }
                reader.readAsDataURL(file)
                return
            }
            // 上传服务器
            component.uploadToServer(file)
        },
        insertBase64(data) {
            this.$parent.execCommand(Command.INSERT_IMAGE, data)
        },
        uploadToServer(file) {
            const config = this.$options.module.config

            const formData = new FormData()
            formData.append(config.upload.fieldName || 'image', file)

            if (typeof config.upload.params === 'object') {
                Object.keys(config.upload.params).forEach((key) => {
                    const value = config.upload.params[key]
                    if (Array.isArray(value)) {
                        value.forEach((v) => {
                            formData.append(key, v)
                        })
                    } else {
                        formData.append(key, value)
                    }
                })
            }

            const xhr = new XMLHttpRequest()

            xhr.onprogress = (e) => {
                this.upload.status = 'progress'
                if (e.lengthComputable) {
                    this.upload.progressComputable = true
                    const percentComplete = e.loaded / e.total
                    this.upload.complete = (percentComplete * 100).toFixed(2)
                } else {
                    this.upload.progressComputable = false
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 300) {
                    this.setUploadError(`request error,code ${xhr.status}`)
                    return
                }

                try {
                    let responseData = JSON.parse(xhr.responseText)

                    let imgUrl =Site.http.imgBaseUrl + responseData.picture.url+'?'+encodeURIComponent(responseData.picture.wxUrl)
                    // const url = config.uploadHandler(xhr.responseText)
                    // console.log(responseData)
                    // if (url) {
                        this.$parent.execCommand(Command.INSERT_IMAGE, imgUrl)
                    // }
                } catch (err) {
                    this.setUploadError(err.toString())
                } finally {
                    this.upload.status = 'ready'
                }
            }

            xhr.onerror = () => {
                // find network info in brower tools
                this.setUploadError('request error')
            }

            xhr.onabort = () => {
                this.upload.status = 'abort'
            }

            xhr.open('POST', config.upload.url)
            if (typeof config.upload.headers === 'object') {
                Object.keys(config.upload.headers).forEach((k) => {
                    xhr.setRequestHeader(k, config.upload.headers[k])
                })
            }
            xhr.send(formData)
        },
        getImages() {
            Site.http.get('rest/pictures', { query:JSON.stringify({type:'image'}),limit: 8, skip: (this.imgPageNo - 1) * 8 }, data => {
                console.log(data)
                this.imgList = data.map(item=>{
                    item.url = Site.http.imgBaseUrl+item.url
                    return item
                });
            })
        },
        getImageCount() {
            Site.http.get('rest/pictures/count', {query:JSON.stringify({type:'image'})}, data => {
                console.log(data)
                this.imgCount = data.count
            })
        },
        selectImg(item) {
            console.log(item)
            let imgUrl = item.url+'?'+encodeURIComponent(item.wxUrl)
            this.$parent.execCommand(Command.INSERT_IMAGE, imgUrl)
        },
        prevImages() {
            if(this.imgPageNo <= 1) return
            this.imgPageNo = this.imgPageNo - 1 
            this.getImages()
        },
        nextImages() {
            let totalPage = Math.round(this.imgCount / 8) || 1
            if(this.imgPageNo >= totalPage) return
            this.imgPageNo = this.imgPageNo + 1
            this.getImages()
        }
    }
}
