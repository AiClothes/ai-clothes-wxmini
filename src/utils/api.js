import {getStorageSync} from "@tarojs/taro";

export const api = (path, options) => {
    let port = '';
    if (path.startsWith('/api-user/')) {
        port = `:8000`;
    }
    if (path.startsWith('/api-product/')) {
        port = `:8004`;
    }
    if (path.startsWith('/api-order/')) {
        port = `:8006`;
    }
    if (path.startsWith('/api-common/')) {
        port = `:8008`;
    }
    // return `http://127.0.0.1${port}${path}`;
    return `https://api.chishenai.cn${path}`;
}

export const getWebViewUrl = () => {
    // return `http://127.0.0.1:11001`;
    return `https://wx.chishenai.cn`;
}

export const getHeaders = () => {
    return {
        'content-type': 'application/json',
        'Authorization': `Bearer ${getStorageSync('access_token')}`
    }
}
