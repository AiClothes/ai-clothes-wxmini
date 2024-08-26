import {ScrollView, View} from "@tarojs/components";
import './work.scss';
import {Button, Input, Tabs, Image, Row, Col, Sticky, Ellipsis, Space, Grid, Toast} from "@nutui/nutui-react-taro";
import React, {useEffect, useRef, useState} from "react";
import {useShopStore} from "../../../store/shop";
import {Add, Follow, HeartFill} from "@nutui/icons-react-taro";
import Taro, {chooseMedia, navigateTo} from "@tarojs/taro";
import {useUserStore} from "../../../store/user";
import {Empty} from "../../../components/empty";
import {useWorkStore} from "../../../store/work";
import {upload} from "../../../utils/upload";
import {uuid} from "../../../utils/uuid";
import {api, getHeaders} from "../../../utils/api";
// import * as uuid from "uuid";

// 这个有bug
// function WorkItem({work}) {
//
//     const {id} = work;
//
//     return (
//         <Grid.Item onClick={() => {
//             // 跳转到新页面
//             navigateTo({
//                 url: `/pages/product/index?id=${id}`
//             }).then((r) => {
//                 console.log(`已跳转`, r);
//             })
//         }}>
//             <Image width={`100%`} mode="widthFix" src={`https://img.qiaoxuesi.com/upfiles/893_1881c1dad731db019a5a3c6c0f225845.jpeg`}/>
//         </Grid.Item>
//     )
// }

function Works({category, data}) {

    const [final_works, setFinalWorks] = useState([]);

    useEffect(() => {
        setFinalWorks(data);
        console.log('data', data)
    }, [data]);

    return (
        <Grid columns={2} gap={4}>
            {final_works.map((work, index) => {
                // return <WorkItem key={index} work={work}/>
                const {content, id: _id, title, is_collect, product_id} = work || {};
                return (
                    <Grid.Item key={_id} style={{position: `relative`, border: `1px solid #F8F8F8`}} onClick={() => {
                        console.log('category', category, work)
                        if (category === 0) {
                            // 跳转到新页面
                            navigateTo({
                                url: `/pages/work_detail/index?id=${_id}`
                            }).then((r) => {
                                console.log(`已跳转作品详情`, r);
                            })
                        } else {
                            // 跳转到新页面
                            navigateTo({
                                url: `/pages/product_work/index?product_id=${product_id}&work_id=${_id}`
                            }).then((r) => {
                                console.log(`已跳转商品作品详情`, r);
                            })
                        }
                    }}>
                        <Image width={`100%`} loading={true} mode="widthFix" src={content}/>

                        {is_collect && (
                            <Button
                                style={{position: `absolute`, right: `10px`, bottom: `10px`}}
                                type="default" fill={`solid`} shape={`round`} color={`transparent`}
                                icon={<HeartFill color={`#FF0000`}/>} size={`xlarge`}
                            />
                        )}
                    </Grid.Item>
                )
            })}
        </Grid>
    )
}

export function Work() {

    const {
        is_login, onChangeLogin,
    } = useUserStore();
    const {
        category_list,
        category, onChangeCategory,
        loading_work, work_list, onLoadWorkList, onChangeWorkMode, create_loading, onCreateWork,
    } = useWorkStore();

    const work_data = work_list[category];
    const {mode = 0, count = 0, count_fav = 0, current = 1, current_fav = 1, init = false, list: works = [], init_fav = false, list_fav: works_fav = []} = work_data || {};
    const final_works = mode === 0 ? works : works_fav;
    const final_count = mode === 0 ? count : count_fav;

    const [uploading, setUploading] = useState(false);

    const containerTopRef = useRef(null)

    const scroll = useRef(null);
    const scrollTop = useRef(0);
    // const [scrollTop, setScrollTop] = useState(0);

    const onScroll = (e) => {
        // console.log(e.detail)
        scrollTop.current = e.detail.scrollTop;
    }

    const onScrollEnd = (e) => {
        // console.log(e.detail)
    }

    const handleImportWork = () => {
        chooseMedia({
            count: 1,
            mediaType: ['image'],
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
            camera: "back",
            success: async function (res) {
                setUploading(true);
                console.log(res.tempFiles)
                console.log(res.type)
                console.log(res.tempFiles[0].tempFilePath, res.tempFiles[0].path);
                let _file_ext = res.tempFiles[0].tempFilePath.split('.').pop();
                let _file_name = `${uuid()}.${_file_ext}`;
                let trade_url = await upload({file: res.tempFiles[0].tempFilePath, file_path: `/user/my_works/upload/${new Date().getTime()}/${_file_name}`});
                console.log(`trade_url`, trade_url);
                setUploading(false);

                // 创建一个新的作品
                await onCreateWork({
                    url: trade_url,
                });

                await onLoadWorkList({current: 1, init: true})
            }
        })
    }

    useEffect(() => {
        // 先登录
        if (!is_login) {
            console.log('未登录')
            return;
        }
        // 初始化加载数据
        if ((mode === 0 && !init) || (mode === 1 && !init_fav)) onLoadWorkList({current: 1, init: true})
    }, [mode, category]);

    return (<>
        <View ref={containerTopRef} className="work">
            <Tabs
                value={category}
                onChange={(value) => {
                    onChangeCategory(value)
                }}
            >
                {category_list.map(r => {
                    return (
                        <Tabs.TabPane title={r.name} key={r.id} className="panel">
                            <View className={(category === 0 && mode === 0) ? "work-container" : "work-container2"}>
                                {((works && works.length > 0) || (works_fav && works_fav.length > 0)) && (<>
                                    <View className="work-fav">
                                        <View className="work-fav-bg">
                                            <Button type={mode === 0 ? `primary` : `default`} fill={mode === 0 ? `solid` : `none`} color={mode === 0 ? `#5596D2` : ``} onClick={() => {
                                                onChangeWorkMode(0);
                                            }}>
                                                全部
                                            </Button>
                                            <Button type={mode === 1 ? `primary` : `default`} fill={mode === 1 ? `solid` : `none`} color={mode === 1 ? `#5596D2` : ``} onClick={() => {
                                                onChangeWorkMode(1);
                                            }}>
                                                收藏
                                            </Button>
                                        </View>
                                    </View>
                                </>)}
                                {final_works.length === 0 && <Empty description={mode === 0 ? `您还没有作品，请前往创作或导入噢！` : `您还没有收藏作品，请先去收藏噢！`}/>}
                                {final_works.length > 0 && (<>
                                    <ScrollView ref={scroll} className="work-items" scrollY scrollWithAnimation scrollTop={scrollTop.current} onScroll={onScroll} onScrollEnd={onScrollEnd} scrollAnchoring={true}>
                                        <Works category={category} data={final_works}/>
                                        {((final_count - final_works.length > 0) && !loading_work) && (<>
                                            <View className="work-items-load-more" onClick={async () => {
                                                console.log(`加载更多...`, scroll, scrollTop)
                                                let _top = scrollTop.current;
                                                await onLoadWorkList({current: current + 1, init: false})
                                                // setScrollTop();
                                                setTimeout(() => {
                                                    scrollTop.current = _top;
                                                }, 100)
                                            }}>
                                                加载更多...
                                            </View>
                                        </>)}
                                    </ScrollView>
                                </>)}
                            </View>
                            {(category === 0 && mode === 0) && (<>
                                <View className="work-create">
                                    {final_works.length === 0 && (<>
                                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" fill={`outline`} size="large" icon={<Add/>} onClick={() => handleImportWork()}>
                                            导入作品
                                        </Button>
                                        <Button style={{width: `49%`}} shape={`square`} type="primary" color="#5596D2" size="large">
                                            前往创作
                                        </Button>
                                    </>)}
                                    {final_works.length > 0 && (<>
                                        <Button block shape={`square`} type="primary" color="#5596D2" size="large" icon={<Add/>} onClick={() => handleImportWork()}>
                                            导入作品
                                        </Button>
                                    </>)}
                                </View>
                            </>)}
                        </Tabs.TabPane>
                    )
                })}
            </Tabs>
        </View>

        <Toast
            type={'loading'}
            duration={0}
            content={'加载作品中...'}
            visible={loading_work}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'上传作品中...'}
            visible={uploading}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'创建作品中...'}
            visible={create_loading}
        />
    </>)
}
