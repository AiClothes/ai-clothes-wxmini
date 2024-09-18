import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Checkbox, Input, TextArea, ActionSheet, Toast} from "@nutui/nutui-react-taro"
import './design.scss'
import Taro, {base64ToArrayBuffer, navigateBack, navigateTo, useRouter} from "@tarojs/taro";
import {Checked, IconFont} from "@nutui/icons-react-taro";
import {api, getHeaders} from "../../../utils/api";
import {uuid} from "../../../utils/uuid";
import {uploadBase64} from "../../../utils/upload";
import {useWorkStore} from "../../../store/work";
import {useUserStore} from "../../../store/user";
import {toLogin} from "../../../utils/toLogin";

function Design() {

    const MajorStyle = {
        UNLIMITED: '不限定风格',
        ART_PAINTING: '艺术绘画类',
        GAME_ANIME: '游戏动漫类',
        PROFESSIONAL_REALISM: '专业写实类'
    };

    const StyleDetails = {
        [MajorStyle.UNLIMITED]: {
            不限定风格: '000'
        },
        [MajorStyle.ART_PAINTING]: {
            水墨画: '101',
            概念艺术: '102',
            油画1: '103',
            '油画2（梵高）': '118',
            水彩画: '104',
            像素画: '105',
            厚涂风格: '106',
            插图: '107',
            剪纸风格: '108',
            '印象派1（莫奈）': '109',
            印象派2: '119',
            '2.5D': '110',
            古典肖像画: '111',
            黑白素描画: '112',
            赛博朋克: '113',
            科幻风格: '114',
            暗黑风格: '115',
            '3D': '116',
            蒸汽波: '117'
        },
        [MajorStyle.GAME_ANIME]: {
            日系动漫: '201',
            怪兽风格: '202',
            唯美古风: '203',
            复古动漫: '204',
            游戏卡通手绘: '301'
        },
        [MajorStyle.PROFESSIONAL_REALISM]: {
            通用写实风格: '401'
        }
    };

    let style_list = [];
    Object.keys(StyleDetails).map(key => {
        const styles = StyleDetails[key];
        Object.keys(styles).map(k => {
            style_list.push({
                major_style: MajorStyle[key],
                style: styles[k],
                name: k
            })
        })
    });

    const bili = [
        {name: '1:1', value: '1:1', resolutions: ['1024:1024', '768:768']},
        {name: '3:4', value: '3:4', resolutions: ['768:1024']},
        {name: '4:3', value: '4:3', resolutions: ['1024:768']},
        {name: '3:5', value: '3:5', resolutions: ['768:1280']},
        {name: '5:3', value: '5:3', resolutions: ['1280:768']},
        {name: '9:16', value: '9:16', resolutions: ['720:1280', '1080:1920']},
        {name: '16:9', value: '16:9', resolutions: ['1280:720', '1920:1080']},
    ];

    const {
        WorkCreateType, WorkType,
        onLoadWorkList,
    } = useWorkStore();

    const {
        is_login, onChangeLogin,
        user_info, onChangeUserInfo, onLoadUserInfo,
    } = useUserStore();

    const router = useRouter();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(style_list[0].style);
    const [ratio, setRatio] = useState(bili[0].value);
    const [resolution, setResolution] = useState(bili[0].resolutions[0]);

    const [reverse, setReverse] = useState('default');
    const [negative_prompt, setNegativePrompt] = useState('');

    const [show_all_style, setShowAllStyle] = useState(false);

    const [show_no_money, setShowNoMoney] = useState(false);

    const [loading_photoshop, setLoadingPhotoshop] = useState(false);
    const [loading_submit, setLoadingSubmit] = useState(false);
    const [photoshop_info, setPhotoshopInfo] = useState({type: 'fail', show: false, content: 'AI绘图失败！'});
    const [loading_create_photoshop, setLoadingCreatePhotoshop] = useState(false);

    useEffect(() => {
        console.log('router', router)
    }, [router]);

    return (<>
        <View className="design">
            <View className="design-container">
                {user_info && <View className="design-container-text">
                    <View className="design-price-real">
                        <IconFont fontClassName="iconfont" classPrefix='icon' name="price" size={18}/>
                        <View className="design-price-real-f">{user_info.gold.toFixed(2)}</View>
                    </View>
                </View>}
                <View className="design-prompt-wrapper">
                    <TextArea className="design-prompt" showCount value={prompt} onChange={(value) => setPrompt(value)} autoSize={false} placeholder={`请输入...`}/>
                    {prompt && (
                        <View className="design-prompt-clear" onClick={() => {
                            setPrompt('');
                        }}>
                            清除
                        </View>
                    )}
                </View>
                <Button shape={`square`} type="default" fill="none" color="#F6F6F6" style={{borderRadius: `18rpx`, backgroundColor: `#f6f6f6`, color: `#1a1a1a`, marginTop: `24rpx`}} icon={<IconFont fontClassName="iconfont" classPrefix='icon' name="magic-line"/>}>
                    咒语助手
                </Button>
                {/*模型样式*/}
                <View className="design-style-wrapper">
                    <View className="design-style-title">
                        模型和样式
                    </View>
                    <View className="design-style-container">
                        {style_list.filter((r, i) => !show_all_style ? i < 5 : true).map(s => {
                            const {major_style, style: _style, name} = s;
                            return (
                                <View className="design-style" key={_style} onClick={() => {
                                    setStyle(_style);
                                }}>
                                    {name}
                                    {style === _style && <View style={{position: `absolute`, top: `6px`, right: `6px`}}>
                                        <Checked color={`#0085FF`}/>
                                    </View>}
                                </View>
                            )
                        })}
                        {!show_all_style && <View className="design-style" style={{color: '#9E9E9E'}} onClick={() => setShowAllStyle(true)}>
                            更多...
                        </View>}
                    </View>
                </View>
                {/*图片比例*/}
                <View className="design-bili-wrapper">
                    <View className="design-bili-title">
                        图片比例
                    </View>
                    <View className="design-bili-container">
                        <View className="design-bili">
                            {bili.map(b => {
                                const {name, value, resolutions} = b;
                                return (
                                    <View className="design-bili-item" key={value} style={{
                                        backgroundColor: value === ratio ? `#EAF5FF` : `#F6F6F6`,
                                    }} onClick={() => {
                                        setRatio(value);
                                        setResolution(resolutions[0]);
                                    }}>
                                        <View className="design-bili-bili">
                                            <View style={{height: `36px`, width: `100%`}}>
                                                <View style={{aspectRatio: value.replace(':', ' / '), border: `2px solid #0085FF`, maxWidth: `100%`, maxHeight: `100%`, margin: `auto`}}></View>
                                            </View>
                                            <View style={{marginTop: `4px`}}>{name}</View>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                        <View className="design-bili" style={{justifyContent: `flex-start`}}>
                            {bili.find(r => r.value === ratio) && bili.find(r => r.value === ratio).resolutions.map(r => {
                                return <View className="design-bili-resolution" key={r} style={{
                                    backgroundColor: r === resolution ? `#EAF5FF` : `#F6F6F6`,
                                }} onClick={() => setResolution(r)}
                                >
                                    像素：{r.replace(':', '*') + 'px'}
                                </View>
                            })}
                        </View>
                    </View>
                </View>
                {/*反向词*/}
                <View className="design-reverse-wrapper">
                    <View className="design-reverse-title">
                        反向词
                    </View>
                    <View className="design-reverse-container">
                        <Button shape={`square`} type="default" fill="none" color="#F6F6F6" style={{borderRadius: `18rpx`, backgroundColor: `#f6f6f6`, color: `#1a1a1a`}} icon={reverse === 'default' ? <Checked color={`#0085FF`}/> : null} onClick={() => {
                            setReverse('default');
                            setNegativePrompt('');
                        }}>
                            默认反向词
                        </Button>
                        <Button shape={`square`} type="default" fill="none" color="#F6F6F6" style={{borderRadius: `18rpx`, backgroundColor: `#f6f6f6`, color: `#1a1a1a`, marginLeft: `12px`}} icon={reverse !== 'default' ? <Checked color={`#0085FF`}/> : null} onClick={() => {
                            setReverse('self');
                        }}>
                            自定义反向词
                        </Button>
                    </View>
                    {reverse !== 'default' && <View className="design-prompt-wrapper">
                        <TextArea className="design-prompt" showCount value={negative_prompt} onChange={(value) => setNegativePrompt(value)} autoSize={false} placeholder={`请输入...`}/>
                        {negative_prompt && (
                            <View className="design-prompt-clear" onClick={() => {
                                setNegativePrompt('');
                            }}>
                                清除
                            </View>
                        )}
                    </View>}
                </View>
            </View>
            <View className="design-start">
                <Button style={{}} block shape={`square`} type="primary" color="#5596D2" size="large" onClick={async () => {
                    // 前端校验是否够金币
                    // setShowNoMoney(true);
                    if (!is_login) {
                        toLogin({});
                        return;
                    }
                    if (user_info && user_info.gold < 10) {
                        setShowNoMoney(true);
                        return;
                    }

                    setLoadingPhotoshop(true);

                    if (!prompt) {
                        setLoadingPhotoshop(false);
                        setPhotoshopInfo({
                            ...photoshop_info,
                            type: 'fail',
                            show: true,
                            content: '请输入咒语！',
                        });
                        setTimeout(() => {
                            setPhotoshopInfo({
                                ...photoshop_info,
                                show: false
                            });
                        }, 2000);
                        return;
                    }

                    // 绘图
                    let query = {
                        text: prompt,
                        ng_text: negative_prompt ? negative_prompt : '',
                        major_style: style_list.find(r => r.style === style).major_style,
                        style: style_list.find(r => r.style === style).name,
                        resolution_ratio: resolution,
                    };
                    console.log(`query`, query);
                    // 发起请求
                    const response = await Taro.request({
                        url: `${api('/api-common/v1/common/ai-draw')}`,
                        header: {...getHeaders()},
                        method: 'POST',
                        data: query,
                    });
                    const {data: r} = response;
                    const {data: foreground_image} = r || {};
                    console.log(`foreground_image`, foreground_image);

                    setLoadingPhotoshop(false);
                    if (foreground_image) {
                        setLoadingCreatePhotoshop(true);
                        // 转换为文件
                        let base64Url = `data:image/png;base64,${foreground_image}`; // 图片base64以实际为准
                        let m = /data:image\/(\w+);base64,(.*)/.exec(base64Url) || [];
                        let format = m[1]; // 取出文件后缀 png
                        let _file_name = `${uuid()}.${format}`;
                        let bodyData = m[2]; // 取出真实base64值 iVBORw0xxx
                        let fileBuf = base64ToArrayBuffer(bodyData);
                        let trade_url = await uploadBase64({file: fileBuf, file_path: `/user/my_works/ai_photoshop/${new Date().getTime()}/${_file_name}`});
                        console.log(`trade_url`, trade_url);
                        const query = {
                            name: '未命名',
                            description: '',
                            content: trade_url,
                            create_type: WorkCreateType.CREATE_BY_TEXT,
                            source: WorkType.BUILD,
                            // 必传
                            // create_parent_id: Number(data.id),
                        };
                        console.log(`query`, query);
                        // 发起请求
                        const response = await Taro.request({
                            url: `${api('/api-user/v1/user-work/create')}`,
                            header: {...getHeaders()},
                            method: 'POST',
                            data: query
                        });
                        const {data: r} = response;

                        setLoadingCreatePhotoshop(false);

                        setPhotoshopInfo({
                            ...photoshop_info,
                            type: r ? 'success' : 'fail',
                            show: true,
                            content: r ? 'AI绘图作品创建成功！快去查看吧~' : 'AI绘图作品创建失败！',
                        });

                        // 重新加载用户信息
                        try {
                            onLoadUserInfo();
                        } catch (e) {
                            toLogin({});
                        }

                        if (r) onLoadWorkList({current: 1, init: true, init_mode: 0});

                    } else {
                        setPhotoshopInfo({
                            ...photoshop_info,
                            type: 'fail',
                            show: true,
                            content: 'AI绘图失败！',
                        });
                    }

                    setTimeout(() => {
                        setPhotoshopInfo({
                            ...photoshop_info,
                            show: false
                        });
                    }, 2000);
                }}>
                    开始生产
                </Button>
            </View>
        </View>

        <ActionSheet
            visible={show_no_money}
            cancelText=""
            onSelect={() => {
                setShowNoMoney(false)
            }}
            onCancel={() => setShowNoMoney(false)}
        >
            <View className="design-ac2">
                <View className="design-ac2-edit">
                    余额不足，请进行充值或兑换秘钥
                </View>
                <View className="design-ac2-option">
                    <View className="design-do">
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" fill={`outline`} size="large" onClick={() => {
                            setShowNoMoney(false);
                            navigateTo({
                                url: `/pages/gold/index`
                            }).then((r) => {
                                console.log(`已跳转充值`, r);
                            });
                        }}>
                            充值
                        </Button>
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" size="large" onClick={async () => {
                            navigateTo({
                                url: `/pages/exchange_key/index`
                            }).then((r) => {
                                console.log(`已跳转兑换秘钥`, r);
                            })
                            setShowNoMoney(false);
                        }}>
                            兑换密钥
                        </Button>
                    </View>
                </View>
                {/* 底部安全区 */}
                {/*<SafeArea position="bottom"/>*/}
            </View>
        </ActionSheet>

        <Toast
            type={'loading'}
            duration={0}
            content={'AI绘图中...'}
            visible={loading_photoshop}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'创建AI绘图作品中...'}
            visible={loading_create_photoshop}
        />

        <Toast
            type={photoshop_info.type}
            duration={0}
            content={photoshop_info.content}
            visible={photoshop_info.show}
        />

        {loading_submit && (
            <Toast
                type={'loading'}
                duration={0}
                content={'生成作品中...'}
                visible={loading_submit}
            />
        )}
    </>)
}

export default Design
