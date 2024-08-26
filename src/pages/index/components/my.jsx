import {View} from "@tarojs/components";
import './my.scss';
import {Button, Input, Tabs, Image, Row, Col, Sticky, Ellipsis, Space, Grid, Cell} from "@nutui/nutui-react-taro";
import {useEffect, useRef, useState} from "react";
import {useUserStore} from "../../../store/user";
import {ArrowRight, IconFont, Warning} from "@nutui/icons-react-taro";
import {toLogin} from "../../../utils/toLogin";
import {navigateTo} from "@tarojs/taro";

export function My() {

    const {
        is_login, onChangeLogin,
        user_info, onChangeUserInfo,
    } = useUserStore();

    // TODO 初始化获取自己的金额信息
    useEffect(() => {
        // 先登录
        // if (!is_login) return toLogin({})
        // 初始化加载数据
        // onLoadWorkList()
    }, []);

    return (<>
        <View className="my">
            {!is_login && (<>
                <View className="my-login" onClick={() => {
                    if (!is_login) return toLogin({})
                }}>
                    {/*https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/un_login.jpg*/}
                    <View className="my-login-pic">
                        <View>
                            <Image
                                src="https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/un_login.png"
                                mode="scaleToFill"
                                width="80"
                                height="80"
                                radius="50%"
                            />
                        </View>
                        <View style={{marginLeft: `30rpx`}}>
                            请登录
                        </View>
                    </View>
                </View>
            </>)}
            {is_login && user_info && (<>
                <View className="my-login">
                    {/*https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/un_login.jpg*/}
                    <View className="my-login-pic">
                        <View>
                            <Image
                                src={user_info.avatar ? user_info.avatar : `https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/un_login.png`}
                                mode="scaleToFill"
                                width="80"
                                height="80"
                                radius="50%"
                            />
                        </View>
                        <View style={{marginLeft: `30rpx`}}>
                            <View>昵称：{user_info.nickname}</View>
                            <View style={{fontSize: `12px`, color: `#999999`}}>UID：{user_info.id + 20240101}</View>
                        </View>
                    </View>
                    <View className="my-login-price">
                        <View className="my-login-price-real">
                            <IconFont fontClassName="iconfont" classPrefix='icon' name="price" size={18}/>
                            <View className="my-login-price-real-f">{user_info.gold.toFixed(2)}</View>
                        </View>
                        <Button shape={`square`} type="primary" color="#FF7A00" style={{borderRadius: `4rpx`}}>
                            充值
                        </Button>
                    </View>
                    <View className="my-login-intro">
                        说明：绘图10金币/次 抠图5金币/次
                    </View>
                </View>
            </>)}
            <Cell.Group>
                <Cell
                    // className="nutui-cell-clickable"
                    title={<View className="my-cell-container"><IconFont style={{marginRight: `0rpx`}} fontClassName="iconfont" classPrefix='icon' name="yuechi" size={18}/>兑换秘钥</View>}
                    align="center"
                    extra={<ArrowRight/>}
                    onClick={() => {
                        navigateTo({
                            url: `/pages/exchange_key/index`
                        }).then((r) => {
                            console.log(`已跳转兑换秘钥`, r);
                        })
                    }}
                />
                <Cell
                    // className="nutui-cell-clickable"
                    title={<View className="my-cell-container"><Warning style={{marginRight: `8rpx`}} size={14}/>关于我们</View>}
                    align="center"
                    extra={<ArrowRight/>}
                    onClick={() => {
                        navigateTo({
                            url: `/pages/about/index`
                        }).then((r) => {
                            console.log(`已跳转我得`, r);
                        })
                    }}
                />
            </Cell.Group>
        </View>
    </>)
}
