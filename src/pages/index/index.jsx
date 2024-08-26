import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Tabbar, SafeArea, Image, Dialog} from "@nutui/nutui-react-taro"
import './index.scss'
import {useGlobalStore} from "../../store/global";
import Taro, {getStorageSync, setNavigationBarTitle} from "@tarojs/taro";
import {Work} from "./components/work";
import {Shop} from "./components/shop";
import {My} from "./components/my";
import {api, getHeaders} from "../../utils/api";
import {useUserStore} from "../../store/user";
import Design from "./components/design";
import {Loading} from "@nutui/icons-react-taro";
import {toLogin} from "../../utils/toLogin";

function Index() {

    const {
        select_tab, onChangeSelectTab,
        show_index_dialog_count, show_index_dialog, mini_program_config, onLoadMiniProgramConfig, onChangeIndexDialog,
    } = useGlobalStore();

    const {
        check_login, onChangeCheckLogin,
        is_login, onChangeLogin,
        user_info, onChangeUserInfo
    } = useUserStore();

    const tabs = [
        {
            name: '橱窗',
            key: 'shop',
            icon: {
                off: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/shop.png',
                on: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/shop_on.png'
            }
        },
        {
            name: '创作',
            key: 'design',
            icon: {
                off: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/design.png',
                on: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/design_on.png'
            }
        },
        {
            name: '作品',
            key: 'cloth',
            icon: {
                off: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/cloth.png',
                on: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/cloth_on.png'
            }
        },
        {
            name: '我的',
            key: 'user',
            icon: {
                off: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/user.png',
                on: 'https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/user_on.png'
            }
        }
    ];

    // 全局唯一一次的登陆检测状态
    useEffect(() => {
        (async () => {
            // 读取本地的access_token
            const access_token = getStorageSync('access_token');
            if (access_token) {
                try {
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
                    if (user_data) {
                        // 修改全局登录状态
                        onChangeLogin(true);
                        onChangeUserInfo(user_data);
                        console.log('已登录');
                    } else {
                        console.log('未登录');
                    }
                } catch (e) {
                    toLogin({});
                }
            } else {
                console.log('未登录');
            }
            onChangeCheckLogin(true);
        })()
    }, []);

    useEffect(() => {
        (async () => {
            if (show_index_dialog_count === 0) {
                await onLoadMiniProgramConfig();
            }
        })();
    }, []);

    const {title, subtitle, content, image} = mini_program_config;

    if (!check_login) {
        return <Loading/>;
    }

    return (<>
        <View className="home">
            {/* 橱窗 */}
            {select_tab === 0 && <Shop/>}
            {/* 创作 */}
            {select_tab === 1 && <Design/>}
            {/* 作品 */}
            {select_tab === 2 && <Work/>}
            {/* 我的 */}
            {select_tab === 3 && <My/>}
            {/* 底部安全区 */}
            <SafeArea position="bottom"/>
        </View>
        <Tabbar fixed value={select_tab} onSwitch={(value) => {
            console.log(`value`, value);
            onChangeSelectTab(value);
            const title = tabs[value].name;
            // 设置微信小程序的标题
            setNavigationBarTitle({
                title: title
            }).then((r) => {
                console.log('切换标题完成', r);
            })
        }}>
            {tabs.map((tab, index) => {
                const {name, key, icon,} = tab;
                const {off, on} = icon;
                return (
                    <Tabbar.Item key={key} title={name} icon={<Image src={index === select_tab ? on : off} width={24} height={24}/>}/>
                )
            })}
        </Tabbar>

        <Dialog
            className="index-dialog"
            title={title}
            visible={show_index_dialog}
            hideConfirmButton={true}
            // onConfirm={() => onChangeIndexDialog(false)}
            cancelText={'我知道了'}
            onCancel={() => onChangeIndexDialog(false)}
        >
            <>
                <div style={{display: `flex`, alignItems: `center`, justifyContent: `center`}}>
                    {subtitle}
                </div>
                <div
                    style={{
                        // minHeight: '96px',
                        borderRadius: '8px',
                        marginTop: '13px',
                        // display: 'flex',
                        // alignItems: 'center',
                        // justifyContent: 'center',
                        backgroundColor: '#F8F8F8',
                        color: '#BFBFBF',
                        padding: `12px`
                    }}
                >
                    {content}
                </div>
                <Image width={`100%`} mode="widthFix" src={image}/>
            </>
        </Dialog>
    </>)
}

export default Index
