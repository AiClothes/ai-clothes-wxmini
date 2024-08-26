import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Checkbox, Input} from "@nutui/nutui-react-taro"
import './index.scss'
import {useRouter} from "@tarojs/taro";

function About() {

    const router = useRouter();

    const [login_mode, setLoginMode] = useState(0);

    useEffect(() => {
        console.log('router', router)
    }, [router]);

    return (<>
        <View className="about">
            <View className="about-container">
                <View className="about-container-input-wrapper">
                    <View className="about-container-text">
                        祈盛科技致力于为您带来前所未有的服装创作体验，推出了这款独特的 App。
                    </View>

                    <View className="about-container-text">
                        在这里，您的创意将不再受限。借助先进的 AI 技术，您只需轻轻一点，便能生成令人惊叹的服装图案。从抽象的艺术表达，到细腻的文化元素，AI 都能精准理解您的需求，将您脑海中的想象转化为绚丽多彩的图案。
                    </View>

                    <View className="about-container-text">
                        不仅如此，我们还能将这些独特的图案制作成真实的服装。每一件服装都承载着您的个性与故事，成为独一无二的时尚单品。
                    </View>

                    <View className="about-container-text">
                        祈盛科技始终秉持着创新、品质与服务的理念，不断优化和完善我们的 App，让您在服装创作的道路上越走越精彩。
                    </View>

                    <View className="about-container-text">
                        无论您是时尚达人，还是创意爱好者，加入我们，一起开启属于您的服装创作之旅！
                    </View>

                    <View style={{padding: `40rpx 0rpx`}}></View>

                    <View className="about-container-text2">
                        公司地址：
                    </View>
                    <View className="about-container-text2">
                        联系电话：
                    </View>
                    <View className="about-container-text2">
                        邮箱：
                    </View>
                </View>
            </View>
        </View>
    </>)
}

export default About
