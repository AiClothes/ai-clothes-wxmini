import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Toast, SafeArea, Input, InputNumber} from "@nutui/nutui-react-taro"
import './index.scss'
import Taro, {navigateBack, navigateTo, useRouter} from "@tarojs/taro";
import {api, getHeaders} from "../../utils/api";
import {useGlobalStore} from "../../store/global";
import {IconFont} from "@nutui/icons-react-taro";
import {useUserStore} from "../../store/user";
import {toLogin} from "../../utils/toLogin";

function Gold() {

    const router = useRouter();

    const {select_tab, onChangeSelectTab} = useGlobalStore();
    const {
        is_login, onChangeLogin,
        user_info, onChangeUserInfo, onLoadUserInfo,
    } = useUserStore();

    const [loading_data, setLoadingData] = useState(false);
    const [data, setData] = useState(null);

    const {product_specifications = [], product_images = [], product_sell_long_images = [], product_specification_combinations = []} = data || {};

    const [self, setSelf] = useState();
    const [select, setSelect] = useState();
    const select_item = product_specification_combinations && product_specification_combinations.find((item) => item.id === select);
    const {id, price, product_specification_combination_details = []} = select_item || {};
    let cd = product_specification_combination_details[0];
    const {specification_value} = cd || {};
    const {value: specification_value_name, specification_id, id: specification_value_id} = specification_value || {};

    // 加载商品
    const loadData = async (id) => {
        let query = {
            id: id,
        };
        console.log(`query`, query);
        // 发起请求
        const response = await Taro.request({
            url: `${api('/api-product/v1/product/wx-find-one')}`,
            header: {...getHeaders()},
            method: 'POST',
            data: query,
        });
        const {data: r} = response;
        const {data: res} = r || {};
        console.log(`res`, res);
        if (res) {
            setData({...res});
        }
    }

    useEffect(() => {
        console.log('router', router);
        (async () => {
            setLoadingData(true);
            await Promise.all([
                loadData(1),
            ]);
            setLoadingData(false);
        })();
    }, [router]);

    if (!data) return (<>
        <View className="gold">
        </View>

        <Toast
            type={'loading'}
            duration={0}
            content={'获取金币信息中...'}
            visible={loading_data}
        />
    </>)

    return (<>
        <View className="gold">
            <View className="gold-container">
                <View className="gold-container-top">
                    <View style={{position: `relative`}}>
                        <Image
                            src="https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/zhifu.png"
                            mode="widthFix"
                            width="100%"
                            // radius="50%"
                        />
                        <View className="gold-detail">
                            <View className="gold-detail-user">
                                <View>
                                    <Image
                                        src={user_info && user_info.avatar ? user_info.avatar : `https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/un_login.png`}
                                        mode="scaleToFill"
                                        width="60"
                                        height="60"
                                        radius="50%"
                                    />
                                </View>
                                <View style={{marginLeft: `30rpx`}}>
                                    <View>{user_info && user_info.nickname || "新用户"}</View>
                                </View>
                            </View>
                            <View style={{marginTop: `60rpx`, marginLeft: `40rpx`}}>
                                当前余额
                            </View>
                            <View className="gold-detail-price">
                                <IconFont fontClassName="iconfont" classPrefix='icon' name="price" size={24}/>
                                <View style={{marginLeft: `16rpx`, marginTop: `8rpx`}}>{(user_info && user_info.gold && user_info.gold.toFixed(2)) || '0.00'}</View>
                            </View>
                        </View>
                    </View>
                    <View style={{display: `flex`, flexWrap: `wrap`}}>
                        {product_specification_combinations && product_specification_combinations.map((item, index) => {
                            const {id, price, product_specification_combination_details = []} = item || {};
                            return (
                                <View key={index} className="gold-detail-price-f">
                                    <View
                                        style={{
                                            backgroundColor: select === id ? `#FEBE5D` : `#FFDA86`,
                                            display: `flex`,
                                            alignItems: `center`,
                                            justifyContent: `center`,
                                            height: `100%`,
                                        }}
                                        onClick={() => {
                                            setSelect(id);
                                        }}>
                                        <IconFont fontClassName="iconfont" classPrefix='icon' name="price" size={24}/>
                                        <View style={{marginLeft: `16rpx`, marginTop: `8rpx`}}>{price === 1 ? '自定义金额' : price.toFixed(2)}</View>
                                    </View>
                                    {/*<View style={{position: `absolute`, }}>*/}
                                    {/*    {value}个金币*/}
                                    {/*</View>*/}
                                </View>
                            )
                        })}
                    </View>
                </View>
                <View className="gold-to-create-wrapper">
                    <View className="gold-to-create">
                        {/*<Space style={{width: `100%`, justifyContent: `space-between`, alignItems: `center`}}>*/}
                        <View style={{display: `flex`, alignItems: `center`, width: `100%`, marginRight: `24rpx`}}>
                            {select_item && select_item.price === 1 && (<>
                                <View className="gold-to-create-input">
                                    <InputNumber
                                        type="number"
                                        placeholder="请输入金额"
                                        style={{width: `100%`}}
                                        value={self}
                                        onChange={(e) => {
                                            setSelf(e);
                                        }}
                                    />
                                    <View style={{
                                        display: `flex`, alignItems: `center`,
                                        // width: `200rpx`
                                        width: `50%`
                                    }}>
                                        ={(self || 1) * 10}金币
                                    </View>
                                </View>
                            </>)}
                            {(select_item && select_item.price !== 1) && (<>
                                <View className="gold-to-create-price">
                                    <IconFont fontClassName="iconfont" classPrefix='icon' name="price" size={20}/>
                                    <View className="gold-to-create-price-f">{(select_item && select_item.price && select_item.price.toFixed(2)) || '0.00'}</View>
                                    <View>
                                        ={(select_item && select_item.price || 0) * 10}金币
                                    </View>
                                </View>
                            </>)}
                        </View>
                        <Button size="large" shape="square" type="primary" fill="outline" color="#5596D2" onClick={async () => {
                            if (!select_item) {
                                wx.showToast({
                                    title: "请选择充值金额",
                                });
                                return;
                            }

                            // 获取当前时间戳
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-based index
                            const date = String(now.getDate()).padStart(2, '0');
                            const hours = String(now.getHours()).padStart(2, '0');
                            const minutes = String(now.getMinutes()).padStart(2, '0');
                            const seconds = String(now.getSeconds()).padStart(2, '0');
                            const timestamp = `${year}${month}${date}${hours}${minutes}${seconds}`;

                            // 生成一个 100000 到 999999 的随机数
                            const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

                            // 组合成订单号
                            const orderNumber = `${timestamp}${randomNumber}`;
                            let params = {
                                userId: user_info.id,
                                openid: user_info.openid,
                                orderNumber: orderNumber,
                                // totalFee: 0.01,
                                description: select_item.id === 6 ? `购买${Number(self || 1) * 10}个金币` : `购买${select_item.price * 10}个金币`,
                                specification_combination_id: select_item.id,
                                self: self || 1,
                            }
                            console.log('params', params)
                            // 发起请求
                            const response = await Taro.request({
                                url: `${api('/api-order/v1/order/wxpay')}`,
                                header: {...getHeaders()},
                                method: 'POST',
                                data: params,
                            });
                            const {data: r} = response;
                            const {data} = r || {};
                            if (data) {
                                try {
                                    // 得到接口返回的数据，向微信发起支付
                                    const result = await wx.requestPayment({
                                        ...data,
                                    });
                                    wx.showToast({
                                        title: "支付成功",
                                    });
                                    console.log("支付结果：", result);

                                    let product = {
                                        "order_no": orderNumber,
                                        "user_id": `${user_info.id + 20240101}`,
                                        // "user_info": "{\"nickname\":\"新用户\",\"id\":1}",
                                        "user_info": JSON.stringify({
                                            "nickname": user_info.nickname,
                                            "id": user_info.id,
                                        }),
                                        "address": "线上商品",
                                        "consignee": user_info.nickname,
                                        "consignee_phone": "线上商品",
                                        "remark": "暂无备注",
                                        "payment_id": 1,
                                        "logistic_id": 1,
                                        "order_products": [
                                            {
                                                "product_id": 1,
                                                "product_name": "金币",
                                                "product_image": "https://base-1327679787.cos.ap-guangzhou.myqcloud.com/sp/product/1724281959575/2e7bd747-63aa-4f38-bcbe-2583c0e6d223.jpg",
                                                "detail": {...data},
                                                "work_id": null,
                                                "work_info": null,
                                                "specification_combination_id": select_item.id,
                                                "product_price": select_item.price,
                                                "specification_value_id": specification_value_id,
                                                "specification_value_name": specification_value_name,
                                                "product_num": select_item.id === 6 ? Number(self || 1) : 1,
                                                "product_total_price": select_item.price
                                            }
                                        ]
                                    }
                                    // 发起请求
                                    const response = await Taro.request({
                                        url: `${api('/api-order/v1/order/create-wx')}`,
                                        header: {...getHeaders()},
                                        method: 'POST',
                                        data: product,
                                    });

                                    // 重新加载用户信息
                                    try {
                                        onLoadUserInfo();
                                    } catch (e) {
                                        toLogin({});
                                    }
                                } catch (err) {
                                    console.log("支付失败：", err);
                                    wx.showToast({
                                        title: "支付失败",
                                    });
                                }
                            }
                        }}>
                            支付
                        </Button>
                        {/*</Space>*/}
                        {/*<SafeArea position="bottom"/>*/}
                    </View>
                </View>
            </View>
        </View>
        {/*<SafeArea position="bottom"/>*/}
    </>)
}

export default Gold
