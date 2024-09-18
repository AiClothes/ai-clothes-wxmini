import {ScrollView, View} from "@tarojs/components";
import './shop.scss';
import {Button, Input, Tabs, Image, Row, Col, Sticky, Ellipsis, Toast, Divider} from "@nutui/nutui-react-taro";
import React, {useEffect, useRef, useState} from "react";
import {useShopStore} from "../../../store/shop";
import {Search} from "@nutui/icons-react-taro";
import {navigateTo} from "@tarojs/taro";
import {useUserStore} from "../../../store/user";
import {Empty} from "../../../components/empty";
import {toLogin} from "../../../utils/toLogin";

function Product({product}) {

    let {id, price, pay_account = 0, pay_account2 = '', description, image} = product;
    if (pay_account2 === '0') pay_account2 = '';
    const {
        is_login, onChangeLogin,
    } = useUserStore();

    return (
        <Col span="12">
            <View className="product" onClick={() => {
                // 登陆检测
                if (!is_login) return toLogin({})
                console.log('跳转');
                // 跳转到新页面
                navigateTo({
                    url: `/pages/product/index?id=${id}`
                }).then((r) => {
                    console.log(`已跳转`, r);
                })
            }}>
                <View className="product_image">
                    <Image height={`300rpx`} mode="heightFix" src={image}/>
                </View>
                <View className="product_des">
                    {/*{description}*/}
                    <View className="product_des_content">
                        {description}
                    </View>
                    {/*<Ellipsis rows={2}/>*/}
                </View>
                <View className="product_bottom">
                    <View className="product_price">
                        ￥ {price}
                    </View>
                    <View className="product_pay_count">
                        {pay_account2 || pay_account}人付款
                    </View>
                </View>
            </View>
        </Col>
    )
}

export function Shop() {

    const {
        is_login, onChangeLogin,
    } = useUserStore();
    const {
        is_init, onChangeIsInit,
        search, onChangeSearch,
        category_list, onLoadCategory,
        category, onChangeCategory,
        product_list, onLoadProductList,

        loading_category, loading_product,
    } = useShopStore();

    const product_data = product_list[category];
    const {count = 0, current = 1, ended = false, list: products = []} = product_data || {};

    const containerTopRef = useRef(null)

    const scroll = useRef(null);
    const scrollTop = useRef(0);

    const onScroll = (e) => {
        // console.log(e.detail)
        scrollTop.current = e.detail.scrollTop;
    }

    const onScrollEnd = (e) => {
        // console.log(e.detail)
    }

    useEffect(() => {
        console.log(`search`, search);
    }, [search]);

    useEffect(() => {
        if (is_init) return;
        // 初始化加载数据
        (async () => {
            onChangeIsInit(true)
            await onLoadCategory();
            await onLoadProductList({is_login: is_login, is_init: true})
        })()
    }, [is_init]);

    return (<>
        <View ref={containerTopRef} className="shop">
            <View className="search">
                <Input
                    className="search-input"
                    type="text"
                    value={search}
                    maxLength={20}
                    onChange={(val) => onChangeSearch(val)}
                />
                <View className="search-btn">
                    <Button shape={`square`} fill={`none`} icon={<Search color={`#9E9E9E`} size={24}/>}/>
                </View>
            </View>
            <Tabs
                value={category}
                onChange={async (value) => {
                    if (!is_login) return toLogin({})
                    onChangeCategory(value)
                    await onLoadProductList({category: value, is_login: is_login, is_init: true})
                }}
            >
                {category_list.map(r => {
                    return (
                        <Tabs.TabPane title={r.name} key={r.id} className="panel">
                            <ScrollView ref={scroll} style={{height: `100%`}} scrollY scrollWithAnimation scrollTop={scrollTop.current} onScroll={onScroll} onScrollEnd={onScrollEnd} scrollAnchoring={true}>
                                {(!loading_category && !loading_product && products.length === 0) && <Empty/>}
                                <Row gutter="0">
                                    {products.map((product, index) => {
                                        return <Product key={index} product={product}/>
                                    })}
                                </Row>
                                {(!loading_category && !ended) && (<>
                                    <Divider/>
                                    <Button type={`primary`} block={true} fill={`solid`} color={`rgba(255, 255, 255, 1)`} style={{color: `#999`}} onClick={async () => {
                                        if (!is_login) return toLogin({})
                                        await onLoadProductList({current: current + 1, is_login: is_login, is_init: false})
                                    }}>
                                        -- 加载更多 --
                                    </Button>
                                </>)}
                            </ScrollView>
                        </Tabs.TabPane>
                    )
                })}
            </Tabs>
        </View>

        <Toast
            type={'loading'}
            duration={0}
            content={'加载商品列表中...'}
            visible={loading_product}
        />

        <Toast
            type={'loading'}
            duration={0}
            content={'加载商品分类中...'}
            visible={loading_category}
        />
    </>)
}
