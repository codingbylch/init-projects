export const VERSION = '1.0.2' // 版本号
export const BETA_URL = "https://beta-wqapi.jd.com/api"
export const ONLINE_URL = "https://wqapi.jd.com/api"

//以下是主购小程序写在代码里的主要流程配置（历史原因，有部分后期增加的在ppms维护）,对应上面代码JD.wxapp.transform.xxx
const reg1 = /(?:https?:)?\/\/(?:(?:(?:wq(?:m?item)?\.jd\.(?:com|hk)|(?:m\.jingxi\.com))\/m?item\/view)|(?:wqs\.jd\.com\/item\/jd\.shtml)|(?:item\.m\.jd\.com\/item\/jxview)).*[?&]sku=(\d+)/i,  //商详链接
    reg11 = /(?:https?:)?\/\/(?:(?:item\.jd\.com\/|(?:(?:m?item(?:\.m)?\.(?:jd|paipai)\.(?:com|hk)|(?:m|mitem)\.(?:yiyaojd|jkcsjd)\.com)\/product\/)))(\d+)\.html/i,  //商详（M站|PC）,包含医药商详
    reg111 = /(?:https?:)?\/\/(?:m?item(?:\.m)?\.(?:jd|jkcsjd)\.(?:com|hk)\/ware\/view\.action).*[?&]wareId=(\d+)/i, //旧版M商详
    reg2 = /(?:https?:)?\/\/(?:wqs\.jd\.com|st\.jingxi\.com)\/my\/index/i,  //个人中心
    reg3 = /(?:https?:)?\/\/(?:(?:(?:wq(?:sou)?\.jd\.com|m\.jingxi\.com)\/search\/searchn)|(?:wqs\.jd\.com\/search\/index)).*[?&]key=([^&#]*)/i,  //搜索
    reg4 = /(?:https?:)?\/\/(?:(?:(?:wq(?:deal)?\.jd\.com|m\.jingxi\.com)\/deal\/mshopcart\/mycart)|(?:wqs\.jd\.com\/my\/cart\/jdshopcart))/i,  //购物车
    reg5 = /(?:https?:)?\/\/(?:(?:(?:wq(?:deal2?)?\.jd|m\.jingxi)\.com\/deal\/(?:confirmorder|msubmit)\/(?!adview))|(?:(?:wqs\.jd|st\.jingxi)\.com\/order\/wq\.confirm\.shtml))([^?]*)/i,  //结算（包含拼购结算，排除广告商详//wqdeal.jd.com/deal/confirmorder/adview）
    //reg6 = /(?:https?:)?\/\/wqs\.jd\.com\/order\/s_confirm_otc\.shtml/i,  //otc结算
    reg7 = /(?:https?:)?\/\/(?:wqs\.jd\.com|st\.jingxi\.com)\/pingou\/item\.shtml.*[?&]sku=(\d+)/i,  //拼购商详
    reg8 = /(?:https?:)?\/\/(?:wqs\.jd\.com|st\.jingxi\.com)\/pingou\/detail\.shtml(\?[^?]*)/i,  //拼购详情
    reg10 = /(?:https?:)?\/\/(?:wqs\.jd\.com|st\.jingxi\.com)\/shoppingv2\/shopping\.html[^#]*(\#wq.gwq)?/i,  //购物圈首页
    reg12 = /(?:https?:)?\/\/(?:wq.jd.com|m\.jingxi\.com)\/(?:mcoss\/)?wxportal\/(?:index|mainentry).*/i,  //微信首页
    reg15 = /(?:https?:)?\/\/union-click\.jd\.com\//i,  //cps联盟链接
    urls = {  //小程对应url
        index: '/pages/index/index',  //首页
        detail: '/pages/item/detail/detail',  //商详
        my: '/pages/my/index/index',  //个人中心
        cart: '/pages/cart/cart/cart',  //购物车
        search: '/pages/search/list/list',  //搜索
        pgsearch: '/pages/pingou_second/search/search',  //拼购搜索（拼购小程序适用）
        buy: '/pages/pay/index/index',  //结算（参数：http://git.jd.com/wxapp/wxapp/wikis/pay-index-params）
        account: '/pages/my/account/account',  //绑定页
        pgitem: '/pages/item/detail/detail',  //拼购商详（wqvue版本后跟普通商详一个链接）
        pgdetail: '/pages/pingou/detail/index',  //拼购详情
        shop: '/pages/shop/index/index',  //店铺首页
        gwqpage: '/pages/gwq/index',  //购物圈首页
        category: '/pages/cate/cate',  //分类页
        pgmy: '/pages/pingou/account/index',  //拼购个人中心
        coupon: '/pages/my/coupon/coupon',  //我的优惠券
        proxy: '/pages/union/proxy/proxy'  //代理中转页（参数spreadUrl=[encode 过后的页面URL]）
    };

export const transform = {
    index: function (url: string) {  //首页
        var m = url.match(reg12);
        return m ? urls.index : '';
    },
    detail: function (url: string, tar?: any) {  //商详页
        var m = url.match(reg1);
        !m && (m = url.match(reg11));
        !m && (m = url.match(reg111));
        if (m) {
            var ispg = /ispg=1/.test(url);  //是否是拼购商品
            var param = [],
                namep = '',
                coverp = '';
            if (tar) {
                namep = tar.getAttribute('item_name');
                coverp = tar.getAttribute('item_cover');
            }
            if (!namep) {
                var nameMatch = url.match(/name=([^&#]*)/);
                if (nameMatch && nameMatch.length > 1 && nameMatch[1]) {  //是否带了商品标题
                    namep = nameMatch[1];
                }
            }
            if (!coverp) {
                var coverMatch = url.match(/cover=([^&#]*)/);
                if (coverMatch && coverMatch.length > 1 && coverMatch[1]) {  //是否带了商品图片
                    coverp = coverMatch[1];
                }
            }
            namep && param.push('name=' + namep);
            if (coverp) {
                var imgurl = decodeURIComponent(coverp);
                if (/^(https?:)?\/\//.test(imgurl)) {  // 填的完整链接
                    imgurl = imgurl.replace(/^http:/, 'https:');
                    if (/^\/\//.test(imgurl)) {
                        imgurl = 'https:' + imgurl;
                    }
                    coverp = encodeURIComponent(imgurl);
                }
                // else { // $.img涉及公共头处理图片的公共函数，可不用关注
                //     coverp = encodeURIComponent('https:' + $.img.getScaleImg(imgurl, 350, 350));
                // }
                param.push('cover=' + coverp);
            }
            return (ispg ? urls.pgitem : urls.detail) + '?sku=' + m[1] + (param.length > 0 ? '&' + param.join('&') : '');
        } else {
            return '';
        }
    },
    myindex: function (url: string) {  //个人中心
        var m = url.match(reg2);
        return m ? urls.my : '';
    },
    search: function (url: string) {  //搜索结果页
        var m = url.match(reg3);
        if (!m) return '';
        var param = (url.split('?')[1] || '').replace(/(^|[?&])key=[^&#]*/g, '').replace(/^&+/, '');
        var turl = m ? urls.search + '?key=' + m[1] : '';
        return turl + (param ? '&' + param : '');
    },
    cart: function (url: string) {  //购物车
        var m = url.match(reg4);
        return m ? urls.cart : '';
    },
    pgitem: function (url: string) {  //拼购商详
        var m = url.match(reg7);
        return m ? urls.pgitem + '?sku=' + m[1] : '';
    },
    pgdetail: function (url: string) {  //拼购详情
        var m = url.match(reg8);
        return m ? urls.pgdetail + m[1] : '';
    },
    gwqpage: function (url: string) {  //购物圈首页
        var m = url.match(reg10);
        return m && !m[1] ? urls.gwqpage : '';
    },
    cpslink: function (url: string) {  //cps联盟链接
        if (reg15.test(url)) {
            return urls.proxy + '?spreadUrl=' + encodeURIComponent(url);
        } else return '';
    },
    buy: function (url: string) {  //结算页（http://git.jd.com/wxapp/wxapp/wikis/pay-index-params）
        var m = url.match(reg5);
        //var motc = url.match(reg6);  //otc结算(暂时不作otc匹配)
        if (m) {
            var params = [],
                squery = '';
            //if(m){  //普通|全球购
            var isGolbal = false;
            squery = url.replace(reg5, '');
            if (m[1]) {
                isGolbal = m[1] == 'global';
            } else {
                isGolbal = !!squery.match(/globalbuy=/i);
            }
            if (isGolbal) {  //全球购商品
                params.push('category=global');
            }
            // }else{  //otc药品
            //     squery = url.replace(reg6, '');
            //     params.push('category=otcdrug');
            // }
            //sku与购买数量
            var comreg = /commlist=([^&]*)/i,
                comm = squery.match(comreg);
            if (comm) {
                var comms = comm[1].split(',');
                params.push('sku=' + comms[3] || comms[0]);  //skuid
                params.push('num=' + comms[2] || '1');  //购买数量
                if (comms.length > 7) {  //赠品
                    params.push('zp=' + comms[7]);
                }
                params.push('commlist=' + comm[1]);
            }
            //延保参数
            var ybreg = /ybcommlist=([^&]*)/i,
                ybm = squery.match(ybreg);
            if (ybm) {
                params.push('ybcommlist=' + ybm[1]);
            }
            //拼购参数
            var pgreg1 = /activeid=([^&]*)/i,
                pgpar1 = squery.match(pgreg1),
                pgreg2 = /bizkey=([^&]*)/i,
                pgpar2 = squery.match(pgreg2),
                pgreg3 = /bizval=([^&]*)/i,
                pgpar3 = squery.match(pgreg3);
            pgpar1 && params.push('activeid=' + pgpar1[1]);
            pgpar2 && params.push('bizkey=' + pgpar2[1]);
            pgpar3 && params.push('bizval=' + pgpar3[1]);

            return urls.buy + '?' + params.join('&');
        } else return '';
    }
}

/**
 * @description: 判断传入的path是否为h5链接
 * @param {string} path
 * @return {boolean}
 */
export function ish5Path(path: string = '') {
    const regex = new RegExp(/^(https?:)?\/\//) // http://xxx, https://xxx, //xxx, cc//xxx
    return regex.test(path)
}

/**
 * @description: 函数：判断是否处于冷却时间
 * @param {boolean} isCommonCool 是否设置公共冷却
 * @param {number} coolingTime 冷却时间间隔，默认30min
 * @param {string} coolUniqueValue 非公共冷却时间所需的唯一值
 * @return {boolean}
 */
export function isCooling(isCommonCool: boolean = true, coolingTime: number = 30, coolUniqueValue?: string) {
    function isCool(name: string, coolingTime: number) {
        if (sessionStorage.getItem(name)) {
            let nowTime = Date.now(), preTime = Number(sessionStorage.getItem(name));
            if (nowTime - preTime < coolingTime * 60000) {
                // 小于预设冷却时间，表示还在冷却中
                return true
            }
        }
        sessionStorage.setItem(name, String(Date.now()))
        return false
    }

    if (isCommonCool) {
        return isCool('cool_common', coolingTime)
    }
    return isCool('cool_pravite_' + coolUniqueValue, coolingTime)
}

/**
 * @description: 针对通天塔的特殊转链逻辑
 * @param {string} path
 * @return {*} 
 */
export function specialBabelPath(path: string = '') {
    const regex = new RegExp(/(pro|prodev).m.jd.com\/(mall|wq)/)
    if (regex.test(path)) return path.replace(/(mall|wq)/, 'mini')
    return path
}