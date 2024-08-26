import React, {useEffect, useState} from 'react'
import {View, WebView} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Checkbox, Input, SafeArea} from "@nutui/nutui-react-taro"
import './index.scss'
import {getStorageSync, setNavigationBarTitle, useRouter} from "@tarojs/taro";
import {useGlobalStore} from "../../store/global";
import {getWebViewUrl} from "../../utils/api";

function SetType() {

    const router = useRouter();
    const {params} = router;
    const {id, work_id} = params;

    const {select_tab, onChangeSelectTab} = useGlobalStore();
    const [access_token, setAccessToken] = useState('');

    useEffect(() => {
        console.log('router', router)
        // webview.postMessage({
        //     data: {
        //         foo: 'bar'
        //     }
        // });
        const _access_token = getStorageSync('access_token');
        setAccessToken(_access_token)
    }, [router]);

    return (<>
        <View className="set_type">
            <WebView id="myWebview" className="set_type-container" src={`${getWebViewUrl()}/home?id=${id}&work_id=${work_id}&token=${access_token}`} onMessage={(e) => {
                console.log(`[set_type] onMessage: `, e);
                const {detail} = e;
                const {data = []} = detail;
                if (data.find(r => r.type === "changeStyle")) {
                    onChangeSelectTab(0);
                    // 设置微信小程序的标题
                    setNavigationBarTitle({
                        title: '橱窗'
                    }).then((r) => {
                        console.log('切换标题完成', r);
                    })
                }
            }}/>
            {/* 底部安全区 */}
            <SafeArea position="bottom"/>
        </View>
    </>)
}

export default SetType
