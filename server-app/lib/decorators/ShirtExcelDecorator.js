const moment = require('moment'),
    Excel = require('exceljs');


module.exports.fillShirtExcel = (worksheet,order) =>{
    //客户姓名
    if(order.customerRef){
        worksheet.getCell('A3').value = order.customerRef.name;
    }
    
    //合伙人
    if(order.brokerRef){
        worksheet.getCell('B3').value = order.brokerRef.name;
    }
    
    
    const receiveAddress = order.receiveAddress;
    if(receiveAddress){
        let detail = receiveAddress.province || '';
        detail += receiveAddress.city || '';
        detail += receiveAddress.detail || '';
        //收货地址
        worksheet.getCell('D3').value = detail;
        //联系人
        worksheet.getCell('E3').value = receiveAddress.contact || '';
        //联系人
        worksheet.getCell('F3').value = receiveAddress.mobile || '';
    }
    //订单编号
    worksheet.getCell('A10').value = order.factoryNo;
    
    if(order.luTaiMianLiaoRef){
        //鲁泰面料
        worksheet.getCell('C10').value = order.luTaiMianLiaoRef.no;
    }
    
    if(order.keGongMianLiao){
        //客供面料编号
        worksheet.getCell('D10').value = order.keGongMianLiao;
    }
    
    if(order.peiSeMianLiaoRef){
        //配色面料编号
        worksheet.getCell('E10').value = order.peiSeMianLiaoRef.no;
    }
    
    //配色部位
    worksheet.getCell('F10').value = order.peiSeBuWei;
    if(order.liangTi){
        //量体备注
        worksheet.getCell('B4').value = order.liangTi.beiZhu;
        //量体下摆备注
        worksheet.getCell('B11').value = order.liangTi.xiaBaiBeiZhu;
        //量体其它备注
        worksheet.getCell('D11').value = order.liangTi.qiTaBeiZhu;
        
        if(order.liangTi.jingChiCun){
            //量体信息（净尺寸）
            //身高
            worksheet.getCell('H3').value = order.liangTi.jingChiCun.shenGao;
            //体重
            worksheet.getCell('I3').value = order.liangTi.jingChiCun.tiZhong + '公斤';
            //领围
            worksheet.getCell('J3').value = order.liangTi.jingChiCun.lingWei;

            //参考领围
            let value = worksheet.getCell('J4').value;
            if(order.liangTi.jingChiCun.lingWei){
                value.result = order.liangTi.jingChiCun.lingWei + 2 ;
            }
            worksheet.getCell('J4').value = value;

            //胸围
            worksheet.getCell('K3').value = order.liangTi.jingChiCun.xiongWei;

            //参考胸围
            value = worksheet.getCell('K4').value;
            if(order.liangTi.jingChiCun.xiongWei && order.liangTi.xuanXiang && order.liangTi.xuanXiang.shenXing){
                if(order.liangTi.xuanXiang.shenXing === 'X'){
                    value.result = order.liangTi.jingChiCun.xiongWei + 10;
                }else if(order.liangTi.xuanXiang.shenXing === 'H'){
                    value.result = order.liangTi.jingChiCun.xiongWei + 12;
                }else if(order.liangTi.xuanXiang.shenXing === 'J'){
                    value.result = order.liangTi.jingChiCun.xiongWei + 8;
                }else if(order.liangTi.xuanXiang.shenXing === 'K'){
                    value.result = order.liangTi.jingChiCun.xiongWei + 14;
                }else{
                    value.result = 0;
                }
            }
            worksheet.getCell('K4').value = value;

            //腰围
            worksheet.getCell('L3').value = order.liangTi.jingChiCun.yaoWei;
            //参考腰围
            value = worksheet.getCell('L4').value;
            const xiongWei = order.liangTi.jingChiCun.xiongWei;
            const yaoWei = order.liangTi.jingChiCun.yaoWei;
            if(order.liangTi.jingChiCun.yaoWei && order.liangTi.xuanXiang && order.liangTi.xuanXiang.shenXing){
                if(order.liangTi.xuanXiang.shenXing === 'J' && xiongWei - yaoWei >= 18){
                    value.result = yaoWei + 13;
                }else if(order.liangTi.xuanXiang.shenXing === 'J' && xiongWei - yaoWei >= 10 && xiongWei - yaoWei < 18){
                    value.result = yaoWei + 9;
                }else if(order.liangTi.xuanXiang.shenXing === 'J' && xiongWei - yaoWei >= 0 && xiongWei - yaoWei < 10){
                    value.result = yaoWei + 7;
                }else if(order.liangTi.xuanXiang.shenXing === 'X' && xiongWei - yaoWei >= 18){
                    value.result = yaoWei + 14;
                }else if(order.liangTi.xuanXiang.shenXing === 'X' && xiongWei - yaoWei >= 10 && xiongWei - yaoWei < 18){
                    value.result = yaoWei + 10;
                }else if(order.liangTi.xuanXiang.shenXing === 'X' && xiongWei - yaoWei >= 0 && xiongWei - yaoWei < 10){
                    value.result = yaoWei + 8;
                }else if(order.liangTi.xuanXiang.shenXing === 'H' && xiongWei - yaoWei >= 18){
                    value.result = yaoWei + 15;
                }else if(order.liangTi.xuanXiang.shenXing === 'H' && xiongWei - yaoWei >= 10 && xiongWei - yaoWei < 18){
                    value.result = yaoWei + 11;
                }else if(order.liangTi.xuanXiang.shenXing === 'H' && xiongWei - yaoWei >= 0 && xiongWei - yaoWei < 10){
                    value.result = yaoWei + 9;
                }else if(order.liangTi.xuanXiang.shenXing === 'K' && xiongWei - yaoWei >= 18){
                    value.result = yaoWei + 17;
                }else if(order.liangTi.xuanXiang.shenXing === 'K' && xiongWei - yaoWei >= 10 && xiongWei - yaoWei < 18){
                    value.result = yaoWei + 14;
                }else if(order.liangTi.xuanXiang.shenXing === 'K' && xiongWei - yaoWei >= 0 && xiongWei - yaoWei < 10){
                    value.result = yaoWei + 11;
                }else{
                    value.result = 0;
                }
            }
            worksheet.getCell('L4').value = value;

            //肚围
            worksheet.getCell('M3').value = order.liangTi.jingChiCun.duWei;
            //底边
            worksheet.getCell('N3').value = order.liangTi.jingChiCun.diBian;

            //参考底边
            value = worksheet.getCell('N4').value;
            if(order.liangTi.jingChiCun.diBian && order.liangTi.xuanXiang && order.liangTi.xuanXiang.shenXing){
                if(order.liangTi.xuanXiang.shenXing === 'X'){
                    value.result = order.liangTi.jingChiCun.diBian + 8;
                }else if(order.liangTi.xuanXiang.shenXing === 'H'){
                    value.result = order.liangTi.jingChiCun.diBian + 9;
                }else if(order.liangTi.xuanXiang.shenXing === 'J'){
                    value.result = order.liangTi.jingChiCun.diBian + 6;
                }else if(order.liangTi.xuanXiang.shenXing === 'K'){
                    value.result = order.liangTi.jingChiCun.diBian + 11;
                }else{
                    value.result = 0;
                }
            }
            worksheet.getCell('N4').value = value;

            //后衣长
            worksheet.getCell('O3').value = order.liangTi.jingChiCun.houYiChang;

            //参考后衣长
            value = worksheet.getCell('O4').value;
            value.result = order.liangTi.jingChiCun.houYiChang;
            worksheet.getCell('O4').value = value;

            //肩宽
            worksheet.getCell('P3').value = order.liangTi.jingChiCun.jianKuan;

            //参考肩宽
            value = worksheet.getCell('P4').value;
            value.result = order.liangTi.jingChiCun.jianKuan;
            worksheet.getCell('P4').value = value;

            //长袖长
            worksheet.getCell('Q3').value = order.liangTi.jingChiCun.changXiuChang;

            //参考长袖长
            value = worksheet.getCell('Q4').value;
            value.result = order.liangTi.jingChiCun.changXiuChang;
            worksheet.getCell('Q4').value = value;

            //左腕围
            worksheet.getCell('R3').value = order.liangTi.jingChiCun.zuoWanWei;
            //右腕围
            worksheet.getCell('S3').value = order.liangTi.jingChiCun.youWanWei;
            //袖肥
            worksheet.getCell('T3').value = order.liangTi.jingChiCun.xiuFei;

            //参考袖肥
            value = worksheet.getCell('T4').value;
            if(order.liangTi.jingChiCun.xiuFei && order.liangTi.xuanXiang && order.liangTi.xuanXiang.shenXing){
                if(order.liangTi.xuanXiang.shenXing === 'X'){
                    value.result = order.liangTi.jingChiCun.xiuFei + 8;
                }else if(order.liangTi.xuanXiang.shenXing === 'H'){
                    value.result = order.liangTi.jingChiCun.xiuFei + 9;
                }else if(order.liangTi.xuanXiang.shenXing === 'J'){
                    value.result = order.liangTi.jingChiCun.xiuFei + 7;
                }else if(order.liangTi.xuanXiang.shenXing === 'K'){
                    value.result = order.liangTi.jingChiCun.xiuFei + 11;
                }else{
                    value.result = 0;
                }
            }
            worksheet.getCell('T4').value = value;

            //小臀围
            worksheet.getCell('U3').value = order.liangTi.jingChiCun.xiaoTunWei;
            //前身长
            worksheet.getCell('V3').value = order.liangTi.jingChiCun.qianShenChang;

            //参考长袖长
            value = worksheet.getCell('V4').value;
            value.result = order.liangTi.jingChiCun.qianShenChang;
            worksheet.getCell('V4').value = value;

            //前胸宽
            worksheet.getCell('W3').value = order.liangTi.jingChiCun.qianXiongKuan;
            //后背宽
            worksheet.getCell('X3').value = order.liangTi.jingChiCun.houBeiKuan;
            //短袖长
            worksheet.getCell('Y3').value = order.liangTi.jingChiCun.duanXiuChang;
            //短袖口
            worksheet.getCell('Z3').value = order.liangTi.jingChiCun.duanXiuKou;
            //号衣尺码
            worksheet.getCell('AA3').value = order.liangTi.jingChiCun.haoYiChiMa;
            //客供面料快递单号
            worksheet.getCell('AB3').value = order.liangTi.jingChiCun.keGongMianLiaoKuaiDiDanHao;
        }
        if(order.liangTi.chengYiChiCun){
            //量体信息（成衣尺寸）
            //身高
            worksheet.getCell('H5').value = order.liangTi.chengYiChiCun.shenGao;
            //体重
            worksheet.getCell('I5').value = order.liangTi.chengYiChiCun.tiZhong;
            //领围
            worksheet.getCell('J5').value = order.liangTi.chengYiChiCun.lingWei;
            //胸围
            worksheet.getCell('K5').value = order.liangTi.chengYiChiCun.xiongWei;
            //腰围
            worksheet.getCell('L5').value = order.liangTi.chengYiChiCun.yaoWei;
            //肚围
            worksheet.getCell('M5').value = order.liangTi.chengYiChiCun.duWei;
            //底边
            worksheet.getCell('N5').value = order.liangTi.chengYiChiCun.diBian;
            //后衣长
            worksheet.getCell('O5').value = order.liangTi.chengYiChiCun.houYiChang;
            //肩宽
            worksheet.getCell('P5').value = order.liangTi.chengYiChiCun.jianKuan;
            //长袖长
            worksheet.getCell('Q5').value = order.liangTi.chengYiChiCun.changXiuChang;
            //左腕围
            worksheet.getCell('R5').value = order.liangTi.chengYiChiCun.zuoWanWei;
            //右腕围
            worksheet.getCell('S5').value = order.liangTi.chengYiChiCun.youWanWei;
            //袖肥
            worksheet.getCell('T5').value = order.liangTi.chengYiChiCun.xiuFei;
            //小臀围
            worksheet.getCell('U5').value = order.liangTi.chengYiChiCun.xiaoTunWei;
            //前身长
            worksheet.getCell('V5').value = order.liangTi.chengYiChiCun.qianShenChang;
            //前胸宽
            worksheet.getCell('W5').value = order.liangTi.chengYiChiCun.qianXiongKuan;
            //后背宽
            worksheet.getCell('X5').value = order.liangTi.chengYiChiCun.houBeiKuan;
            //短袖长
            worksheet.getCell('Y5').value = order.liangTi.chengYiChiCun.duanXiuChang;
            //短袖口
            worksheet.getCell('Z5').value = order.liangTi.chengYiChiCun.duanXiuKou;
            //号衣尺码
            worksheet.getCell('AA5').value = order.liangTi.chengYiChiCun.haoYiChiMa;
            //客供面料快递单号
            worksheet.getCell('AB5').value = order.liangTi.chengYiChiCun.keGongMianLiaoKuaiDiDanHao;
        }
        /*
        if(order.liangTi.sizeRef){
            //量体信息（号衣尺寸）
            //领围
            worksheet.getCell('J6').value = order.liangTi.sizeRef.lingWei;
            //胸围
            worksheet.getCell('K6').value = order.liangTi.sizeRef.xiongWei;
            //腰围
            worksheet.getCell('L6').value = order.liangTi.sizeRef.yaoWei;
            //底边
            worksheet.getCell('N6').value = order.liangTi.sizeRef.diBian;
            //后衣长
            worksheet.getCell('O6').value = order.liangTi.sizeRef.houYiChang;
            //肩宽
            worksheet.getCell('P6').value = order.liangTi.sizeRef.jianKuan;
            //袖长
            worksheet.getCell('Q6').value = order.liangTi.sizeRef.xiuChang;
            //左腕围
            worksheet.getCell('R6').value = order.liangTi.sizeRef.zuoWanWei;
            //右腕围
            worksheet.getCell('S6').value = order.liangTi.sizeRef.youWanWei;
            //袖肥
            worksheet.getCell('T6').value = order.liangTi.sizeRef.xiuFei;
            //小臀围
            worksheet.getCell('U6').value = order.liangTi.sizeRef.xiaoTunWei;
            //前身长
            worksheet.getCell('V6').value = order.liangTi.sizeRef.qianShenChang;
            //前胸宽
            worksheet.getCell('W6').value = order.liangTi.sizeRef.qianXiongKuan;
            //后背宽
            worksheet.getCell('X6').value = order.liangTi.sizeRef.houBeiKuan;
            //短袖长
            worksheet.getCell('Y6').value = order.liangTi.sizeRef.duanXiuChang;
            //短袖口
            worksheet.getCell('Z6').value = order.liangTi.sizeRef.duanXiuKou;
            //号衣尺码
            worksheet.getCell('AA6').value = order.liangTi.sizeRef.description;
        }*/
        if(order.liangTi.tiaoZhengChiCun){
            //量体信息（调整尺寸）
            //领围
            worksheet.getCell('J6').value = order.liangTi.tiaoZhengChiCun.lingWei;
            //胸围
            worksheet.getCell('K6').value = order.liangTi.tiaoZhengChiCun.xiongWei;
            //腰围
            worksheet.getCell('L6').value = order.liangTi.tiaoZhengChiCun.yaoWei;
            //肚围
            worksheet.getCell('M6').value = order.liangTi.tiaoZhengChiCun.duWei;
            //底边
            worksheet.getCell('N6').value = order.liangTi.tiaoZhengChiCun.diBian;
            //后衣长
            worksheet.getCell('O6').value = order.liangTi.tiaoZhengChiCun.houYiChang;
            //肩宽
            worksheet.getCell('P6').value = order.liangTi.tiaoZhengChiCun.jianKuan;
            //长袖长
            worksheet.getCell('Q6').value = order.liangTi.tiaoZhengChiCun.changXiuChang;
            //左腕围
            worksheet.getCell('R6').value = order.liangTi.tiaoZhengChiCun.zuoWanWei;
            //右腕围
            worksheet.getCell('S6').value = order.liangTi.tiaoZhengChiCun.youWanWei;
            //袖肥
            worksheet.getCell('T6').value = order.liangTi.tiaoZhengChiCun.xiuFei;
            //小臀围
            worksheet.getCell('U6').value = order.liangTi.tiaoZhengChiCun.xiaoTunWei;
            //前身长
            worksheet.getCell('V6').value = order.liangTi.tiaoZhengChiCun.qianShenChang;
            //前胸宽
            worksheet.getCell('W6').value = order.liangTi.tiaoZhengChiCun.qianXiongKuan;
            //后背宽
            worksheet.getCell('X6').value = order.liangTi.tiaoZhengChiCun.houBeiKuan;
            //短袖长
            worksheet.getCell('Y6').value = order.liangTi.tiaoZhengChiCun.duanXiuChang;
            //短袖口
            worksheet.getCell('Z6').value = order.liangTi.tiaoZhengChiCun.duanXiuKou;
            //号衣尺码
            worksheet.getCell('AA6').value = order.liangTi.sizeRef?order.liangTi.sizeRef.description : '';
            //客供面料快递单号
            worksheet.getCell('AB6').value = order.liangTi.tiaoZhengChiCun.keGongMianLiaoKuaiDiDanHao;
        }
        if(order.liangTi.xuanXiang){
            //身型
            worksheet.getCell('G10').value = order.liangTi.xuanXiang.shenXing;
            console.log(worksheet.getCell('G10').font)
            //后背款式
            worksheet.getCell('H10').value = order.liangTi.xuanXiang.houBeiKuanShi;

            //长短袖
            worksheet.getCell('I10').value = order.liangTi.xuanXiang.changDuanXiu;
            //领型
            worksheet.getCell('J10').value = order.liangTi.xuanXiang.lingXing;
            //领插片
            worksheet.getCell('K10').value = order.liangTi.xuanXiang.lingChaPian;
            //袖头
            worksheet.getCell('L10').value = order.liangTi.xuanXiang.xiuTou;
            //门襟
            worksheet.getCell('M10').value = order.liangTi.xuanXiang.menJin;
            //口袋
            worksheet.getCell('N10').value = order.liangTi.xuanXiang.kouDai;
            //纽扣
            worksheet.getCell('O10').value = order.liangTi.xuanXiang.niuKou;
            //主唛
            worksheet.getCell('P10').value = order.liangTi.xuanXiang.zhuMai;
            //明线宽
            worksheet.getCell('Q10').value = order.liangTi.xuanXiang.mingXianKuan;
            //侧缝工艺
            worksheet.getCell('R10').value = order.liangTi.xuanXiang.ceFengGongYi;
            //嵌条
            worksheet.getCell('S10').value = order.liangTi.xuanXiang.qianTiao;
            //衬布
            worksheet.getCell('T10').value = order.liangTi.xuanXiang.chenBu;
            //刺绣字体
            worksheet.getCell('U10').value = order.liangTi.xuanXiang.ciXiuZiTi;
            //刺绣大小
            worksheet.getCell('V10').value = order.liangTi.xuanXiang.ciXiuDaXiao;
            //刺绣位置
            worksheet.getCell('W10').value = order.liangTi.xuanXiang.ciXiuWeiZhi;
            //刺绣内容
            worksheet.getCell('X10').value = order.liangTi.xuanXiang.ciXiuNeiRong;
            //刺绣颜色
            worksheet.getCell('Y10').value = order.liangTi.xuanXiang.ciXiuYanSe;
            //洗唛成分
            worksheet.getCell('Z10').value = order.liangTi.xuanXiang.xiMaiChengFen;
            //包装
            worksheet.getCell('AA10').value = order.liangTi.xuanXiang.baoZhuang;
            //其它
            worksheet.getCell('AB10').value = order.liangTi.xuanXiang.qiTa;
        }

    }
    //标题
    let creater = '';
    if(order.createrRef){
        creater = order.createrRef.name;
    }
    let approver = '';
    if(order.approverRef){
        approver = order.approverRef.name;
    }
    // const title = worksheet.getCell('A1').value + 
    // '    制单：' + creater + '    审核：' + approver + '    件数：' + order.num + '    日期：' + moment().format('YYYYMMDD');
    const title = worksheet.getCell('A1').value + '    件数：' + order.num + '    日期：' + moment().format('YYYYMMDD');
    worksheet.getCell('A1').value = title;

    //G5单元格特殊处理
    worksheet.getCell('G5').value = '成衣尺寸';
}