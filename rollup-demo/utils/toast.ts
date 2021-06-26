// Toast.js

interface TProps {
    customTips?: string // 自定义兜底提示
    tipsDuration?: number // 持续时间
}
let ToastContain: HTMLDivElement | undefined

function Toast(props: TProps) {
    let tosatContainId = 'toast-contain__' + Date.now()
    if (!ToastContain) {
        // 单例模式
        ToastContain = document.createElement('div');
        ToastContain.setAttribute('id', tosatContainId); 
        document.body.append(ToastContain);
    } else return;
    let id = 'toast__' + Date.now();
    let toast = document.createElement('div');
    toast.setAttribute('id', id);
    toast.innerHTML = `${props.customTips || '如果没有跳转成功，请打开微信访问京东购物小程序'}`;

    toast.style.position = 'absolute';
    toast.style.padding = '10px 20px';
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%,-50%)';
    toast.style.textAlign = 'center';
    toast.style.backgroundColor = 'rgba(7,17,27,0.66)';
    toast.style.fontSize = '14px';
    toast.style.borderRadius = '6px'
    toast.style.color = 'rgb(255,255,255)'
    toast.style.zIndex = "10000"


    ToastContain.append(toast);

    setTimeout(() => {
        (document.getElementById(tosatContainId) as HTMLElement).remove();
        ToastContain = undefined;
    }, props.tipsDuration || 2000);
}
export default {
    /**
     * @description: 展示toast
     * @param {boolean} isAllowTips 是否展示
     * @param {string} customTips 自定义提示词
     * @param {number} tipsDuration 持续时间
     * @return {*}
     */
    show(isAllowTips: boolean | undefined, customTips: string | undefined, tipsDuration: number | undefined) {
        isAllowTips && Toast({ customTips, tipsDuration });
    }
};
