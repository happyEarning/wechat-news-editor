import IdentityCard from './IdentityCard'

let validator = {
    // 检测是否中文
    checkZh(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /^[\u4e00-\u9fa5]$/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('请输入中文'));
        } else {
            callback();
        }
    },
    // 检测中文姓名
    checkZhName(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /^[\u4e00-\u9fa5]{1,5}$/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('请输入中文姓名'));
        } else {
            callback();
        }
    },
    // 检测英文姓名
    checkEnName(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /^([A-Za-z]+\s?)*[A-Za-z]$/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('请输入英文姓名'));
        } else {
            callback();
        }
    },
    // 检测手机号码
    checkPhone(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('手机号码格式不正确'));
        } else {
            callback();
        }
    },
    // 检测邮编
    checkZipCode(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /(^[0-9]{6}$)/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('邮编格式不正确'));
        } else {
            callback();
        }
    },
    // 检测邮箱
    checkEmail(rule, value, callback) {
        rule.label = rule.label || '该内容';
        let reg = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
        if (value === '' || value === undefined) {
            callback(new Error(rule.label + '不能为空'));
        } else if (!reg.test(value)) {
            callback(new Error('邮箱地址格式不正确'));
        } else {
            callback();
        }
    },
    // 检测银行卡号
    checkBackCode(rule, value, callback){
        if (value === '' || value === undefined || value === null) {
            callback(new Error('银行卡号不能为空'));
            return;
        }
        if (isNaN(value)) {
            callback(new Error('请输入数字值'));
            return;
        }
        if (value.length < 16 || value.length > 19) {
            callback(new Error('银行卡号为16至19位数字'));
        } else {
            callback();
        }
    },
     // 检测身份证号
     checkIdCode(rule, value, callback){
        value = value.trim()
        if (value === '' || value === undefined) {
            callback();
            return;
        }
        let result = IdentityCard.checkIdNum(value)
        if (result!==true) {
            callback(new Error(result));
        } else {
            callback();
        }
    },

}

export default validator;