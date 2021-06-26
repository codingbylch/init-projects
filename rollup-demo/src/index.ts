import "core-js/modules/es.promise";
import axios from 'axios';
import service from '../utils/request'
import { transform, ish5Path, isCooling, VERSION, specialBabelPath } from '../utils/common'
import Toast from '../utils/toast'

/* 调用方传参 */
interface Options {
    scence_id: string // 场景id
    path: string // 自定义的Path
    // isCustomPath: boolean // 是否自定义Path, 若为否，则识别当前页面URL并转化为path
    appid?: string // 目标小程序id
    onSuccess?: (res: SuccessRes) => void // 唤起小程序成功的回调
    onFail?: (err: Error) => void // 唤起失败的回调
    isAllowTips?: boolean // 是否允许兜底提示, 是则兜底由sdk控制, 否则调用方根据返回信息自己展示
    // isDefaultTips?: boolean // 是否默认兜底提示
    customTips?: string // 自定义兜底提示
    tipsDuration?: number // 提示的持续时间，默认2000ms
    isNeedCooling?: boolean // 是否加入冷却时间
    isCommonCool?: boolean // 是否设置公共冷却
    coolingTime?: number // 冷却时间间隔，默认30min
    coolUniqueValue?: string // 非公共冷却时间所需的唯一值
    isBeta?: boolean
}

/** 后端入参 */
interface QueryOptions {
    path: string // 传给后端的带参小程序路径
    scenceId: string // 场景id
    type?: string // 填写jd或者jx, 默认jd
    v: string // 前端版本号
    // appid?: string // 目标小程序id
}

/** 后端返回的数据格式 */
interface Response {
    code: 0
    success?: boolean
    data?: MiniLinkVo // 数据
    subCode: number // 结果状态
    message?: string // 结果描述
}

/** 后端返回的数据的data */
interface MiniLinkVo {
    openlink: string // 打开小程序的地址
}

interface PPMSData {
    pageId?: number
    data: {
        ppmsItemId: number,
        ppms_itemName: string,
        url: string
        regmatch: string
        wxappurl: string
        params: string
        jumptype: string
        __modifytime__: string
    }[]
}

// 失败回调返回参数
interface Error {
    subCode: number,
    message: string
}

// 成功回调返回参数
interface SuccessRes {
    rawUrl: string
    wxPath: string
    openLink: string
}

enum ErrorTypes {
    FAIL_TRANSFORM = -1, // 地址转换失败
    FAIL_REQUEST = -2, // 请求接口失败
}

enum WXTypes {
    WX_GOUWU = "34020",
    WX_PINGOU = "34022",
    WX_KAIPL = "34274"
}


/**
 * @description: 非微信环境H5跳转小程序函数
 * @param {Options} options 传入的参数，对象形式
 * @return {*} Promise形式返回
 */
export default async function GuideMiniProgram(options: Options) {
    try {
        if (typeof options !== 'object') throw new Error('所传options可能不是对象，请检查');
        const { scence_id, appid = WXTypes.WX_GOUWU, path, isAllowTips, customTips, tipsDuration, onSuccess, onFail, isNeedCooling, isCommonCool, coolingTime, coolUniqueValue, isBeta } = options
        // 0.参数检查
        if (!scence_id) throw new Error('所传scence_id为空！')
        if (Object.keys(WXTypes).every(item => {
            return WXTypes[item] !== appid
        })) throw new Error('所传appid不支持！')
        if (!path) throw new Error('所传path为空！')

        // 0.1冷却时间过滤请求
        if (isNeedCooling && isCooling(isCommonCool, coolingTime, coolUniqueValue)) {
            const error = {
                subCode: ErrorTypes.FAIL_TRANSFORM,
                message: `已设置开启并处于冷却时间，间隔${coolingTime || 30}分钟后再试`
            }
            onFail && onFail(error)
            return
        }


        // 1.对传入的h5链接进行转换
        const { recode, gotoUrl } = await path2WXminiPath(path, appid);
        if (recode) { // 转为小程序路径失败时返回
            const error = {
                subCode: ErrorTypes.FAIL_TRANSFORM,
                message: '所传h5链接转换为小程序路径失败，请联系产品或开发人员'
            }
            onFail && onFail(error)
            return
            // return Promise.reject(error)
        }

        // 2.请求后端接口的data函数
        const queryOptions: QueryOptions = {
            scenceId: scence_id,
            path: gotoUrl,
            v: VERSION
            // appid,
            // cookies: document.cookie,
            // user_agent: navigator.userAgent
        }

        queryScheme(queryOptions, isBeta)
            .then((res: Response) => {
                console.log("res", res);
                // 看后端接口结构再写逻辑
                // 若返回scheme，则跳转；并向业务方传递参数（其实成功跳的话就不会继续执行了）
                if (res.code === 0 && res.subCode === 0) {
                    const openlink = res.data && res.data.openlink || ''
                    const success = {
                        rawUrl: path,
                        wxPath: gotoUrl,
                        openLink: openlink
                    }
                    onSuccess && onSuccess(success)
                    openlink && evokeWXProgram(openlink);
                    setTimeout(() => {
                        Toast.show(isAllowTips, customTips, tipsDuration)
                    }, 3000);
                    // resolve(success);
                }
                else {
                    // 否则不跳；并向业务方传递参数
                    const error = {
                        subCode: res.subCode,
                        message: res.message || ''
                    }
                    onFail && onFail(error)
                    Toast.show(isAllowTips, "失败了哦，微信搜索京东购物进入小程序吧~", tipsDuration)
                    // reject(error);
                }
            })
            .catch((err: Error) => {
                // 网络请求失败
                console.log("请求后端接口失败，原因：", err);
                const error = {
                    subCode: ErrorTypes.FAIL_REQUEST,
                    message: '请求后端接口失败，可能是网络原因'
                }
                onFail && onFail(error)
                Toast.show(isAllowTips, "网络不通畅哦，请稍后试试吧~", tipsDuration)
                // reject(error)
            });
        // return new Promise((resolve, reject) => {

        // })
    } catch (error) {
        console.log('error', error)
    }
}

/**
 * @description: 请求后端接口函数，最好返回一个Promise
 * @param {QueryOptions} queryOptions 
 * @return {Promise}
 */
function queryScheme(queryOptions: QueryOptions, isBeta: boolean = false) {
    return service({
        url: '',
        method: 'get',
        params: {
            appid: 'mini-jd',
            functionId: 'h5OpenMiniBySdkGetMiniLink',
            sign: '',
            t: new Date().getTime(),
            body: queryOptions,
            clientType: 'm',
            client: 'm',
            clientVersion: ''
        },
        isBeta
    })
}

function evokeWXProgram(urlScheme: string = '') {
    // 传入url-scheme，跳转至微信小程序
    window.location.href = urlScheme;
}

/**
 * @description: h5链接转小程序路径
 * @param {string} url h5链接
 * @return {object} 
 * recode: 0-转换成功；1-转换失败，gotoUrl为原链接
 * gotoUrl：转换后的小程序路径 或 原h5链接
 * jtype：转换后对应打开小程序的方式参数
 */
async function path2WXminiPath(url: string = '', appid = '') {
    // 若不是h5链接, 直接返回
    if (!ish5Path(url)) return {
        recode: 0,
        gotoUrl: url
    }

    let recode = 1, jtype = '', gotoUrl = url;
    // 1.获取适配链接规则数据
    const ppmsAdapters = await getPPMSadapter()
    localStorage.setItem('ppmsAdapters', JSON.stringify(ppmsAdapters || ''))
    // 2.链接转换成小程序路径
    const adapteObj = transformWxapp(url, appid)
    gotoUrl = adapteObj.url || '';
    jtype = adapteObj.type || '';
    // 3.保留url上通用参数
    if (gotoUrl) {
        gotoUrl = keepCommonParams(url, gotoUrl);  //保留url上通用参数（如ptag,pps等）
        recode = 0;
    }
    return {
        recode,
        gotoUrl,
        jtype
    }
}

// 请求ppms配置的适配链接规则数据
function getPPMSadapter() {
    const ppmsData = WXTypes.WX_GOUWU // 购物小程序
    const url = `https://wq.360buyimg.com/data/ppms/js/ppms.pagev${ppmsData}.jsonp`
    return axios.get(url).then((res) => {
        let ppmsData = res && JSON.parse((res as unknown as string).replace(/^showPageData34020\(|\);/g, '')).data || [];
        return ppmsData
    })
}

// 链接转换成小程序路径
function transformWxapp(url: string = '', appid = '') {
    // 购物小程序，先走固有自动适配，其他走ppms配置
    let gotoUrl = '', jtype = '';
    if (appid === WXTypes.WX_GOUWU) {
        gotoUrl = transform.detail(url)  //匹配商详链接
        !gotoUrl && (gotoUrl = transform.index(url));  //匹配微信首页
        !gotoUrl && (gotoUrl = transform.myindex(url));  //匹配个人中心
        !gotoUrl && (gotoUrl = transform.search(url));  //匹配搜索
        !gotoUrl && (gotoUrl = transform.cart(url));  //匹配购物车
        !gotoUrl && (gotoUrl = transform.buy(url));  //匹配结算
        !gotoUrl && (gotoUrl = transform.pgitem(url));  //匹配拼购商详
        !gotoUrl && (gotoUrl = transform.pgdetail(url));  //匹配拼购详情
        !gotoUrl && (gotoUrl = transform.gwqpage(url));  //匹配购物圈首页
        !gotoUrl && (gotoUrl = transform.cpslink(url));  //匹配cps联盟链接
    }
    // 进入ppms配置的适配规则匹配
    if (!gotoUrl) {
        const adapteObj = adapteGotoUrl(url)
        if (adapteObj) {
            gotoUrl = adapteObj.url || '';
            jtype = adapteObj.jtype || '';
        }
    }
    // 兜底：若转换失败，则用h5容器(小程序h5页路径)进行包裹
    if (!gotoUrl) {
        const wxh5Prefix = '/pages/h5_wv/sns/index?encode_url=';
        // 针对通天塔的特殊转链逻辑
        gotoUrl = wxh5Prefix + specialBabelPath(url);
        jtype = '';
    }

    return {
        url: gotoUrl,
        type: jtype
    }
}

/**
 * @description: 匹配ppms规则
 * @param {string} url h5链接
 * @return {*}
 */
function adapteGotoUrl(url: string = '') {
    let ppmsas = JSON.parse(localStorage.getItem('ppmsAdapters') as string) || []
    for (var i = 0; i < ppmsas.length; ++i) {
        var adapt = ppmsas[i],
            reg = null;
        if (adapt.regmatch == 1) {  //url正则匹配
            reg = new RegExp(adapt.url.replace(/\\\\/g, '\\'));
        } else {  //url普通匹配
            reg = new RegExp(adapt.url.replace(/([\\\.\*\?\+\^\$\-\[\]\(\)\{\}])/g, '\\$1'));
        }
        var ma = url.match(reg);
        if (ma) {  //匹配当前url
            var mark = !!~adapt.wxappurl.indexOf('?') ? '&' : '?',
                params = [];
            if (adapt.params) {  //提取参数
                var ps = adapt.params.split('|');
                for (var j = 0, jlen = ps.length; j < jlen; ++j) {
                    var para = ps[j],
                        isreg = /=/.test(para);  //如果参数是url上的一部分，需要用正则匹配分组的，走 key=$1 模式
                    if (isreg) {
                        pss = para.split('=');
                        var ind = parseInt(pss[1].replace(/^\$/, '') || '0', 10);
                        if (ind > 0) {
                            params.push(pss[0] + '=' + ma[ind]);
                        }
                    } else {
                        var oriPar = para,
                            tarPar = para,
                            pss = para.split(':');  //参数是正常url参数，走 h5key:wxappkey 或 comkey 模式
                        if (pss.length > 1) {  //h5与小程序参数名不同，需区分
                            oriPar = pss[0];
                            tarPar = pss[1];
                        }
                        var parReg = new RegExp('[?&]' + oriPar + '=([^&#]*)'),
                            parMa = url.match(parReg);
                        if (parMa) {
                            params.push(tarPar + '=' + parMa[1]);
                        }
                    }
                }
            }
            return {
                url: adapt.wxappurl + (params.length > 0 ? mark + params.join('&') : ''), // 小程序路径+参数
                jtype: adapt.jumptype // 小程序跳转类型
            }
        }
    }
    return '';
}

//保留url上通用参数（如ptag,pps等）
function keepCommonParams(ourl: string = '', turl: string = '') {
    var url = turl,
        comparams = ['ptag', 'pps'];  //目前需要保留的参数
    for (var i = 0, len = comparams.length; i < len; ++i) {
        var par = comparams[i],
            parReg = new RegExp('[?&]' + par + '=', 'i');
        if (parReg.test(turl) || !parReg.test(ourl)) {  //如果目标链接上已有此参数，或原url上没有此参数，跳过
            continue;
        }
        var parReg2 = new RegExp('[?&]' + par + '=([^&#]*)', 'i'),
            parMa2 = ourl.match(parReg2),
            mark = !!~url.indexOf('?') ? '&' : '?';
        if (parMa2 && parMa2.length > 1) {
            url += mark + par + '=' + parMa2[1];
        }
    }
    return url;
}

