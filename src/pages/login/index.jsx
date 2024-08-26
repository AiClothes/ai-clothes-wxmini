import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Checkbox, Input} from "@nutui/nutui-react-taro"
import './index.scss'
import Taro, {navigateBack, setStorageSync, useRouter} from "@tarojs/taro";
import {api, getHeaders} from "../../utils/api";
import {useUserStore} from "../../store/user";
import {useShopStore} from "../../store/shop";

function Login() {

    const router = useRouter();

    const {
        is_login, onChangeLogin,
        user_info, onChangeUserInfo
    } = useUserStore();

    const {
        is_init, onChangeIsInit,
    } = useShopStore();

    const [login_mode, setLoginMode] = useState(0);

    const [phone, setPhone] = useState('');
    const [verify, setVerify] = useState('');

    useEffect(() => {
        console.log('router', router)
    }, [router]);

    return (<>
        <View className="login">
            {login_mode === 0 && (<>
                <View className="login-container">
                    <Button type="primary" color="#5596D2" size="xlarge" block={true} onClick={() => {
                        console.log('微信登录', router);
                        wx.login({
                            success: async (res) => {
                                if (res.code) {
                                    console.log('WX登录成功！' + res.code)
                                    //发起网络请求
                                    const response = await Taro.request({
                                        url: `${api('/api-user/v1/auth/online-wx-user')}`,
                                        header: {
                                            'content-type': 'application/json'
                                        },
                                        method: 'POST',
                                        data: {
                                            code: res.code
                                        }
                                    });

                                    console.log('response', response);
                                    const {data} = response || {};
                                    const {data: r} = data || {};
                                    const {access_token} = r || {};
                                    if (access_token) {
                                        setStorageSync('access_token', access_token);
                                        // 获取用户信息
                                        const user_response = await Taro.request({
                                            url: `${api('/api-user/v1/user/wx-profile')}`,
                                            header: {...getHeaders()},
                                            method: 'POST',
                                            data: {}
                                        });
                                        console.log('user_response', user_response);
                                        const {data: r} = user_response || {};
                                        const {data: user_data} = r;
                                        // 修改全局登录状态
                                        onChangeLogin(true);
                                        onChangeUserInfo(user_data);

                                        // 修改商品的初始化状态
                                        onChangeIsInit(false);

                                        navigateBack().then((r) => {
                                            console.log(`已返回路由`, r);
                                        });
                                    }
                                } else {
                                    console.log('登录失败！' + res.errMsg)
                                }
                            }
                        })
                    }}>
                        微信一键登录/注册
                    </Button>
                    {/*<Checkbox
                        className="login-container-checkbox"
                        label="手机号登录/注册"
                        checked={false}
                        onChange={(val) => {
                            console.log('val', val);
                            if (val) {
                                console.log('手机号登录', val);
                                setLoginMode(1);
                            }
                        }}
                    />*/}
                </View>
            </>)}
            {login_mode === 1 && (<>
                <View className="login-container">
                    <View className="login-container-input-wrapper">
                        <Input
                            className="login-container-input"
                            value={phone}
                            onChange={(val) => setPhone(val)}
                            placeholder="请输入手机号"
                        />
                    </View>
                    <View className="login-container-input-wrapper">
                        <Input
                            className="login-container-input"
                            value={verify}
                            onChange={(val) => setVerify(val)}
                            placeholder="请输入验证码"
                        />
                        <Button shape="square" type="primary" fill="outline" color="#5596D2">
                            验证码
                        </Button>
                    </View>
                    <Button type="primary" color="#5596D2" size="xlarge" block={true} onClick={() => {
                        console.log('手机登录', phone, verify);
                    }}>
                        登录/注册
                    </Button>
                    <Checkbox
                        className="login-container-checkbox"
                        label="微信一键登录/注册"
                        checked={false}
                        onChange={(val) => {
                            console.log('val', val);
                            if (val) {
                                console.log('微信一键登录/注册', val);
                                setLoginMode(0);
                            }
                        }}
                    />
                </View>
            </>)}
        </View>
    </>)
}

export default Login
