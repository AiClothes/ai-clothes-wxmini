import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import Taro from "@tarojs/taro";
import {api, getHeaders} from "../utils/api";

export const useShopStore = create()(
    immer((set, getState) => ({
        // 初始化
        is_init: false,
        onChangeIsInit: (r) =>
            set((state) => {
                state.is_init = r
            }),
        // 搜索框
        search: '',
        onChangeSearch: (r) =>
            set((state) => {
                state.search = r
            }),
        // 分类
        category: 0,
        onChangeCategory: (r) =>
            set((state) => {
                state.category = r
            }),
        // 分类列表
        loading_category: false,
        category_list: [
            {id: 0, name: '全部'},
        ],
        onLoadCategory: async () => {
            const {category_list} = getState();
            set((state) => {
                state.loading_category = true;
            })
            // 调用api
            const query = {};
            console.log(`query`, query);
            // 发起请求
            const response = await Taro.request({
                url: `${api('/api-product/v1/product-category/wx-find-all')}`,
                header: {...getHeaders()},
                method: 'POST',
                data: query
            });
            const {data: r} = response;
            const {data: res} = r || {};
            const {list: data = [], count} = res || {};
            set((state) => {
                state.loading_category = false;
                if (category_list.length === 1) {
                    state.category_list = category_list.concat(data);
                }
            })
        },
        // 商品列表
        loading_product: true,
        product_list: {
            0: {
                count: 0,
                current: 1,
                ended: false,
                list: [
                    // {
                    //     id: 1,
                    //     price: 100,
                    //     pay_count: 100,
                    //     description: 'Ai一键生成短袖高磅纯棉T恤10种配色立体剪裁肌理奶白打卡机那可就低年级卡',
                    //     image: 'https://img.qiaoxuesi.com/upfiles/893_1881c1dad731db019a5a3c6c0f225845.jpeg',
                    // },
                ]
            }
        },
        onLoadProductList: async (params) => {
            const {current, is_login, is_init} = params;
            // 参数需要有当前category传入
            const {category, category_list, product_list} = getState();
            // 调用api
            console.log(`onLoadProductList`, r);
            set((state) => {
                state.loading_product = true;
            })
            // 调用api
            const query = {
                category_id: category === 0 ? undefined : category_list[category].id,
                // category_id: category_list[category].id,
            };
            console.log(`query`, query);
            // 发起请求
            const response = await Taro.request({
                url: `${api(`/api-product/v1/product/${!is_login ? 'wx-find-all' : 'wx-find-list'}`)}`,
                header: {...getHeaders()},
                method: 'POST',
                data: query,
            });
            const {data: r} = response;
            const {data: res} = r || {};
            const {list: data = [], count} = res || {};

            let p = product_list[category];
            console.log(`p`, p);
            if (!p) {
                p = {
                    count: 0,
                    current: 1,
                    ended: false,
                    list: []
                }
            }
            p = JSON.parse(JSON.stringify(p));
            // state.product_list[category].list = is_init ? [...data] : [...product_list[category].list, ...data];
            p.list = is_init ? [...data] : [...data, ...p.list,];
            p.count = count;
            p.current = current;
            p.ended = p.list.length >= count;

            set((state) => {
                state.product_list[category] = p;

                state.loading_product = false;
            })
        },
    })),
)
