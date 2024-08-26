import React, {useEffect, useState} from 'react'
import {View, WebView} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, SafeArea, ActionSheet, ImagePreview, TextArea, Input, Toast} from "@nutui/nutui-react-taro"
import './index.scss'
import {useRouter} from "@tarojs/taro";

function Photoshop() {

    const router = useRouter();

    useEffect(() => {
        console.log('router', router)
    }, [router]);

    return (<>
        <View className="photoshop">
            <WebView className="photoshop-container" src='https://mp.weixin.qq.com/' onMessage={(e)=>{
                console.log(`[photoshop] onMessage: `, e);
            }} />
            {/* 底部安全区 */}
            <SafeArea position="bottom"/>
        </View>
    </>)
}

export default Photoshop
