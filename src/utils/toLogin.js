import {navigateTo} from "@tarojs/taro";

export const toLogin = ({}) => {
    // 未登录 跳转到新页面
    navigateTo({
        url: `/pages/login/index`
    }).then((r) => {
        console.log(`已跳转登录`, r);
    })
}
