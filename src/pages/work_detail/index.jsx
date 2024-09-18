import React, {useEffect, useState} from 'react'
import {Canvas, View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, SafeArea, ActionSheet, ImagePreview, TextArea, Input, Toast} from "@nutui/nutui-react-taro"
import './index.scss'
import Taro, {base64ToArrayBuffer, navigateBack, navigateTo, useRouter} from "@tarojs/taro";
import {Add, Edit, Follow, HeartFill, Logout, Trash} from "@nutui/icons-react-taro";
import {api, getHeaders} from "../../utils/api";
import {useWorkStore} from "../../store/work";
import {upload, uploadBase64} from "../../utils/upload";
import {uuid} from "../../utils/uuid";
import {useUserStore} from "../../store/user";
import {toLogin} from "../../utils/toLogin";

function WorkDetail() {

    const router = useRouter();

    const {
        WorkCreateType, WorkType,
        onLoadWorkList,
    } = useWorkStore();

    const {
        is_login, onChangeLogin,
        user_info, onChangeUserInfo, onLoadUserInfo,
    } = useUserStore();

    const [isVisible, setIsVisible] = useState(false)
    const [isDelete, setIsDelete] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [loading_work, setLoadingWork] = useState(false);
    const [data, setData] = useState({})

    const {content = '', name = '', description = '', create_parent_id, children = [], create_type} = data || {};

    const [loading_update_work, setLoadingUpdateWork] = useState(false);
    const [editData, setEditData] = useState({name: '', description: ''});

    const [collect_info, setCollectInfo] = useState({show: false, content: '已收藏'});

    const [loading_delete_work, setLoadingDeleteWork] = useState(false);

    const [loading_photoshop, setLoadingPhotoshop] = useState(false);
    const [photoshop_info, setPhotoshopInfo] = useState({type: 'fail', show: false, content: '抠图失败！'});
    const [loading_create_photoshop, setLoadingCreatePhotoshop] = useState(false);

    const [show_no_money, setShowNoMoney] = useState(false);

    const loadWork = async (id) => {
        setLoadingWork(true);
        let query = {
            id: id,
        };
        console.log(`query`, query);
        // 发起请求
        const response = await Taro.request({
            url: `${api('/api-user/v1/user-work/wx-my-work-detail')}`,
            header: {...getHeaders()},
            method: 'POST',
            data: query,
        });
        const {data: r} = response;
        const {data: res} = r || {};
        console.log(`res`, res);
        if (res) {
            setData({...res, name: res.name === '未命名' ? '' : res.name});
            setEditData({name: res.name === '未命名' ? '' : res.name, description: res.description || ''})
        }
        setLoadingWork(false);
    }

    useEffect(() => {
        console.log('router', router);
        (async () => {
            await loadWork(Number(router.params.id));
        })();
    }, []);

    return (<>
        <View className="work_detail">
            <View className="work_detail-container">
                <View className="work_detail-image">
                    <Image width="100%" mode="widthFix" src={content} alt="" onClick={() => setShowPreview(true)}/>
                    <ImagePreview
                        images={[{src: content}]}
                        visible={showPreview}
                        onClose={() => setShowPreview(false)}
                    />
                </View>
                <View className="work_detail-option">
                    <Button className="work_detail-option-btn" type="default" fill={`outline`} shape={`round`} color={`#FF0000`} icon={<Trash/>} size={`xlarge`} onClick={() => {
                        console.log('删除');
                        setIsDelete(true)
                    }}/>
                    {/*<HeartFill />*/}
                    <Button className="work_detail-option-btn" type="default" fill={!data.is_collect ? `outline` : `solid`} shape={`round`} color={!data.is_collect ? `#221E1F` : `#ffffff`} icon={!data.is_collect ? <Follow/> : <HeartFill color={`#FF0000`}/>} size={`xlarge`} onClick={async () => {
                        console.log('收藏', Toast);
                        setLoadingUpdateWork(true);
                        let query = {
                            id: data.id,
                            is_collect: !data.is_collect,
                        };
                        console.log(`query`, query);
                        // 发起请求
                        const response = await Taro.request({
                            url: `${api('/api-user/v1/user-work/update')}`,
                            header: {...getHeaders()},
                            method: 'POST',
                            data: query,
                        });
                        const {data: r} = response;
                        const {data: res} = r || {};
                        console.log(`res`, res);
                        setLoadingUpdateWork(false);
                        if (res) {
                            setData({...data, ...res});
                            setCollectInfo({
                                ...collect_info,
                                show: true,
                                content: !data.is_collect ? '已收藏' : '已取消收藏',
                            });

                            setTimeout(() => {
                                setCollectInfo({
                                    ...collect_info,
                                    show: false,
                                });
                            }, 2000);
                        }

                        await onLoadWorkList({current: 1, init: true, init_mode: 0});
                        onLoadWorkList({current: 1, init: true, init_mode: 1});
                    }}/>
                </View>
                <View className="work_detail-edit">
                    {(name && description) && (<>
                        <View className="work_detail-edit-content1">
                            {name}
                        </View>
                        <View className="work_detail-edit-content2">
                            {description}
                        </View>
                    </>)}
                    {(!name || !description) && (
                        <View className="work_detail-edit-content">
                            编辑作品信息
                        </View>
                    )}
                    <Button className="work_detail-edit-btn" type="default" fill={`outline`} shape={`round`} color={`#221E1F`} icon={<Edit/>} size={`xlarge`} onClick={() => setIsVisible(true)}/>
                </View>
            </View>
            <View className="work_detail-do">
                {/*不是抠图来的，没有子元素的*/}
                {(children && children.length === 0 && create_type !== WorkCreateType.PHOTOSHOP) && (<>
                    <Button style={{flex: 1}} shape={`square`} type="primary" color="#5596D2" fill={`outline`} size="large" icon={<Logout/>} onClick={async () => {
                        if (!is_login) {
                            toLogin({});
                            return;
                        }
                        if (user_info && user_info.gold < 5) {
                            setShowNoMoney(true);
                            return;
                        }

                        setLoadingPhotoshop(true);

                        // 抠图
                        let query = {
                            image_url: content,
                        };
                        console.log(`query`, query);
                        // 发起请求
                        const response = await Taro.request({
                            url: `${api('/api-common/v1/common/ai-cut')}`,
                            header: {...getHeaders()},
                            method: 'POST',
                            data: query,
                        });
                        const {data: r} = response;
                        const {data: res} = r || {};
                        console.log(`res`, res);

                        const {data: origin_data} = res || {};
                        const {foreground_image} = origin_data || {};

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
                            let trade_url = await uploadBase64({file: fileBuf, file_path: `/user/my_works/photoshop/${new Date().getTime()}/${_file_name}`});
                            console.log(`trade_url`, trade_url);
                            const query = {
                                name: '未命名',
                                description: '',
                                content: trade_url,
                                create_type: WorkCreateType.PHOTOSHOP,
                                source: WorkType.BUILD,
                                // 必传
                                create_parent_id: Number(data.id),
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
                                content: r ? '抠图作品创建成功！快去查看吧~' : '抠图作品创建失败！',
                            });

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
                                content: '抠图失败！',
                            });
                        }

                        setTimeout(() => {
                            setPhotoshopInfo({
                                ...photoshop_info,
                                show: false
                            });
                        }, 2000);
                    }}>
                        抠图
                    </Button>
                </>)}
                {/*<Button style={{flex: 1}} shape={`square`} type="primary" color="#5596D2" size="large">
                    前往排版
                </Button>*/}
            </View>
            {/* 底部安全区 */}
            <SafeArea position="bottom"/>
        </View>

        <Canvas type="2d" id={`canvas-photoshop`} style={{display: 'none'}}></Canvas>

        <ActionSheet
            visible={isVisible}
            cancelText=""
            onSelect={() => {
                setIsVisible(false)
            }}
            onCancel={() => setIsVisible(false)}
        >
            <View className="work_detail-ac">
                <View className="work_detail-ac-title">
                    编辑作品信息
                </View>
                <View className="work_detail-ac-edit">
                    <View className="work_detail-ac-name">
                        <View className="work_detail-ac-name-aa">
                            作品名称
                        </View>
                        <Input className="work_detail-ac-name-i" value={editData.name} onChange={(value) => setEditData({...editData, name: value})} placeholder={`请输入...`}/>
                    </View>
                    <View className="work_detail-ac-description">
                        <View className="work_detail-ac-name-bb">
                            作品简介
                        </View>
                        <TextArea className="work_detail-ac-name-ta" showCount value={editData.description} onChange={(value) => setEditData({...editData, description: value})} autoSize={false} placeholder={`请输入...`}/>
                    </View>
                </View>
                <View className="work_detail-ac-option">
                    <View className="work_detail-do">
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" fill={`outline`} size="large" onClick={() => setIsVisible(false)}>
                            取消
                        </Button>
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" size="large" onClick={async () => {
                            setLoadingUpdateWork(true);
                            let query = {
                                id: data.id,
                                name: editData.name,
                                description: editData.description,
                            };
                            console.log(`query`, query);
                            // 发起请求
                            const response = await Taro.request({
                                url: `${api('/api-user/v1/user-work/update')}`,
                                header: {...getHeaders()},
                                method: 'POST',
                                data: query,
                            });
                            const {data: r} = response;
                            const {data: res} = r || {};
                            console.log(`res`, res);
                            setData({...data, ...res});
                            setLoadingUpdateWork(false);
                            setIsVisible(false);
                            // 直接重新加载
                            onLoadWorkList({current: 1, init: true, init_mode: data.is_collect ? 1 : 0});
                        }}>
                            确认
                        </Button>
                    </View>
                </View>
                {/* 底部安全区 */}
                {/*<SafeArea position="bottom"/>*/}
            </View>
        </ActionSheet>

        <ActionSheet
            visible={isDelete}
            cancelText=""
            onSelect={() => {
                setIsDelete(false)
            }}
            onCancel={() => setIsDelete(false)}
        >
            <View className="work_detail-ac2">
                <View className="work_detail-ac2-edit">
                    确认删除该作品吗？
                </View>
                <View className="work_detail-ac2-option">
                    <View className="work_detail-do">
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" fill={`outline`} size="large" onClick={() => setIsDelete(false)}>
                            取消
                        </Button>
                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" size="large" onClick={async () => {
                            setLoadingDeleteWork(true);
                            let query = {
                                id: data.id,
                                is_delete: true,
                            };
                            console.log(`query`, query);
                            // 发起请求
                            const response = await Taro.request({
                                url: `${api('/api-user/v1/user-work/update')}`,
                                header: {...getHeaders()},
                                method: 'POST',
                                data: query,
                            });
                            const {data: r} = response;
                            const {data: res} = r || {};
                            console.log(`res`, res);
                            setData({...data, ...res});
                            setLoadingDeleteWork(false);
                            setIsVisible(false);
                            // 直接重新加载
                            if (data.is_collect) {
                                await onLoadWorkList({current: 1, init: true, init_mode: 1});
                            }
                            onLoadWorkList({current: 1, init: true, init_mode: 0});
                            navigateBack().then((r) => {
                                console.log(`已返回路由`, r);
                            });
                        }}>
                            确认删除
                        </Button>
                    </View>
                </View>
                {/* 底部安全区 */}
                {/*<SafeArea position="bottom"/>*/}
            </View>
        </ActionSheet>

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
            content={'加载作品中...'}
            visible={loading_work}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'更新作品中...'}
            visible={loading_update_work}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'删除作品中...'}
            visible={loading_delete_work}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'抠图中...'}
            visible={loading_photoshop}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'创建抠图作品中...'}
            visible={loading_create_photoshop}
        />

        <Toast
            type={'success'}
            duration={0}
            content={collect_info.content}
            visible={collect_info.show}
        />

        <Toast
            type={photoshop_info.type}
            duration={0}
            content={photoshop_info.content}
            visible={photoshop_info.show}
        />
    </>)
}

export default WorkDetail
