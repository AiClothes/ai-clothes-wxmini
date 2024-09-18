export default defineAppConfig({
    pages: [
        // 入口页
        'pages/index/index',
        // 登陆页
        'pages/login/index',
        // 产品详情页 / 作品详情页 直接复用
        'pages/product/index',
        // 作品详情
        'pages/product_work/index',
        // 抠图处理页
        'pages/photoshop/index',
        // 排版页面
        'pages/set_type/index',
        // 作品信息页
        'pages/work_detail/index',
        // 作品创作页
        // 兑换秘钥
        'pages/exchange_key/index',
        // 关于我们
        'pages/about/index',
        // 充值金币
        'pages/gold/index',
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    }
})
