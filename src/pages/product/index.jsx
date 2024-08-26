import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Toast, SafeArea} from "@nutui/nutui-react-taro"
import './index.scss'
import Taro, {navigateBack, navigateTo, setNavigationBarTitle, useRouter} from "@tarojs/taro";
import {api, getHeaders} from "../../utils/api";
import {useGlobalStore} from "../../store/global";
import {useWorkStore} from "../../store/work";

function Product() {

    const router = useRouter();

    const {select_tab, onChangeSelectTab} = useGlobalStore();

    const {
        WorkCreateType, WorkType,
        onLoadWorkList,
    } = useWorkStore();

    const [current, setCurrent] = useState(0)

    const [loading_data, setLoadingData] = useState(false);
    const [data, setData] = useState(null);

    const {product_specifications = [], product_images = [], product_sell_long_images = [], product_specification_combinations = []} = data || {};

    const [select_size, setSelectSize] = useState('');

    const [select_speci, setSelectSpeci] = useState(0)
    const [swiper_list, setSwiperList] = useState([]);
    const [category_list, setCategoryList] = useState([]);

    const [loading_create_info, setLoadingCreateInfo] = useState(false);

    const loadData = async (id) => {
        setLoadingData(true);
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
            setSelectSize(res.product_specifications.find((item) => item.name === '尺码') && res.product_specifications.find((item) => item.name === '尺码').product_specification_values[0].value);
            setSwiperList(res.product_images.map((item) => item.url));

            const _category_list = [];
            res.product_specification_combinations.map((item) => {
                const {product_specification_combination_details = [], image} = item || {};
                if (item.image) {
                    const color_specification_value = res.product_specifications.find((item) => item.name === '颜色');
                    console.log(`color_specification_value`, color_specification_value);
                    const color = product_specification_combination_details.find((item) => item.specification_value.specification_id === color_specification_value.id);
                    console.log(`product_specification_combination_details`, product_specification_combination_details);
                    console.log(`color`, color);
                    let _history = _category_list.findIndex(r => r.color === color.specification_value.value);
                    if (_history > -1) {
                        _category_list[_history].swiper_list = [..._category_list[_history].swiper_list, item.image];
                    } else {
                        _category_list.push({
                            index: _category_list.length,
                            key: 'specification',
                            color: color.specification_value.value,
                            url: item.image,
                            swiper_list: [item.image],
                        });
                    }
                }
            });
            console.log(`_category_list`, _category_list);
            setCategoryList([
                {index: 0, key: 'product', url: res.product_images[0].url, swiper_list: res.product_images.map((item) => item.url)},
                ..._category_list
            ]);
        }
        setLoadingData(false);
    }

    useEffect(() => {
        console.log('router', router);
        (async () => {
            await loadData(Number(router.params.id));
        })();
    }, [router]);

    if (!data) return (<>
        <View className="product">
        </View>

        <Toast
            type={'loading'}
            duration={0}
            content={'获取商品信息中...'}
            visible={loading_data}
        />
    </>)

    return (<>
        <View className="product">
            <View className="product-container">
                <View className="product-container-scroll">
                    <Swiper
                        defaultValue={0}
                        height={400}
                        onChange={(e) => {
                            setCurrent(e.detail.current)
                        }}
                        indicator={
                            <View className="indicator">
                                {current + 1}/<View className="indicator-text">{swiper_list.length}</View>
                            </View>
                        }
                    >
                        {swiper_list.map((item) => (
                            <Swiper.Item key={item}>
                                <View className="swiper">
                                    <Image width="100%" mode="heightFix" src={item} alt=""/>
                                </View>
                            </Swiper.Item>
                        ))}
                    </Swiper>
                    <View className="product-special">
                        <View className="product-content">
                            <Space>
                                {category_list.map((item, index) => {
                                    const {key, url, color, swiper_list} = item;
                                    return (
                                        <Avatar
                                            key={index}
                                            className="product-item-select"
                                            style={{
                                                border: select_speci === index ? '1px solid #9E9E9E' : '1px solid #FFFFFF'
                                            }}
                                            // background={color}
                                            shape="square"
                                            size="normal"
                                            src={url}
                                            onClick={() => {
                                                // 修改
                                                setCurrent(0);
                                                setSelectSpeci(index);
                                                setSwiperList(swiper_list)
                                            }}
                                        />
                                    )
                                })}
                            </Space>
                        </View>
                    </View>
                    <View className="product-detail">
                        <View className="product-detail-price">
                            ￥ {data.price.toFixed(2)}
                        </View>
                        <View className="product-detail-description">
                            {data.description}
                        </View>
                        <View className="product-detail-size">
                            <Space>
                                {product_specifications.find((item) => item.name === '尺码') && product_specifications.find((item) => item.name === '尺码').product_specification_values.map((item) => {
                                    // select_size === item.value ? "none" :
                                    return (
                                        <Button
                                            key={item.id}
                                            className="product-detail-btn" shape="square" type="primary" fill={"outline"} color="#5596D2"
                                            onClick={() => {
                                                console.log(`item.value`, item.value)
                                                // setSelectSize(item.value);
                                            }}
                                        >
                                            {item.value}
                                        </Button>
                                    )
                                })}
                            </Space>
                        </View>
                        <View className="product-detail-sell-images">
                            {product_sell_long_images && product_sell_long_images.map(r => {
                                return <Image width="100%" mode="widthFix" src={r.url} alt=""/>
                            })}
                        </View>
                    </View>
                </View>
                <View className="product-to-create-wrapper">
                    <View className="product-to-create">
                        <Space style={{width: `100%`, justifyContent: `space-between`}}>
                            <Button size="xlarge" shape="square" type="primary" color="#5596D2" block={true} onClick={async () => {
                                // onChangeSelectTab(1);
                                // navigateBack().then((r) => {
                                //     console.log(`已返回路由`, r);
                                // });
                                const query = {
                                    create_type: [WorkCreateType.NONE, WorkCreateType.CREATE_BY_IMAGE, WorkCreateType.CREATE_BY_TEXT, WorkCreateType.PHOTOSHOP],
                                    current: 1,
                                };
                                console.log(`query`, query);
                                // 发起请求
                                const response = await Taro.request({
                                    url: `${api('/api-user/v1/user-work/wx-my-works')}`,
                                    header: {...getHeaders()},
                                    method: 'POST',
                                    data: query
                                });

                                const {data: r} = response;
                                const {data: res} = r || {};
                                const {list: data = [], count} = res || {};
                                if (count > 0) {
                                    navigateTo({
                                        url: `/pages/set_type/index?id=${Number(router.params.id)}`
                                    }).then((r) => {
                                        console.log(`已跳转排版`, r);
                                    })
                                } else {
                                    setLoadingCreateInfo(true);

                                    setTimeout(() => {
                                        setLoadingCreateInfo(false);
                                    }, 2000);

                                    //
                                    navigateBack().then((r) => {
                                        console.log(`已返回路由`, r);
                                        onChangeSelectTab(2);
                                        // 设置微信小程序的标题
                                        setNavigationBarTitle({
                                            title: '作品'
                                        }).then((r) => {
                                            console.log('切换标题完成', r);
                                        })
                                    });
                                }
                            }}>
                                前往排版
                            </Button>
                            <Button size="xlarge" shape="square" type="primary" fill="outline" color="#5596D2" block={true}>
                                联系客服下单
                            </Button>
                        </Space>
                        {/*<SafeArea position="bottom"/>*/}
                    </View>
                </View>
            </View>
        </View>
        <SafeArea position="bottom"/>

        <Toast
            type={'text'}
            duration={0}
            content={'请先去创作作品！'}
            visible={loading_create_info}
        />
    </>)
}

export default Product
