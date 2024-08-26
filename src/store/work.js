import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import Taro from "@tarojs/taro";
import {api, getHeaders} from "../utils/api";

export const useWorkStore = create()(
    immer((set, getState) => ({

        // 特殊数据[作品的创建类型]
        WorkCreateType: {
            NONE: 'NONE',
            // 图生图
            CREATE_BY_IMAGE: 'CREATE_BY_IMAGE',
            // 文生图
            CREATE_BY_TEXT: 'CREATE_BY_TEXT',
            // 抠图 这个是用其他作品抠出来的
            PHOTOSHOP: 'PHOTOSHOP',
            // 合成型的，如生产的商品
            COMPOSITE: 'COMPOSITE'
        },
        // 特殊数据[作品的类型]
        WorkType: {
            // 自己构建的作品 如AI绘图使用创建的
            BUILD: 'BUILD',
            // 上传自己的本地作品
            UPLOAD: 'UPLOAD',
            // 生成的产品（用商品生产的）
            BUILD_PRODUCT: 'BUILD_PRODUCT'
        },

        // 分类
        category: 0,
        onChangeCategory: (r) =>
            set((state) => {
                state.category = r
            }),
        // 作品分类（收藏/衣服作品）
        category_list: [
            {id: 0, name: '图案'},
            {id: 1, name: '衣服'}
        ],
        // 作品看全部还是看收藏
        // 商品列表
        loading_work: false,
        work_list: {
            0: {
                // 0 = 全部 1 = 收藏
                mode: 0,
                init: false,
                count: 0,
                list: [],
                current: 1,
                init_fav: false,
                count_fav: 0,
                list_fav: [],
                current_fav: 1,
            },
            1: {
                // 0 = 全部 1 = 收藏
                mode: 0,
                init: false,
                count: 0,
                list: [],
                current: 1,
                init_fav: false,
                count_fav: 0,
                list_fav: [],
                current_fav: 1,
            }
        },
        onChangeWorkMode: (r) => {
            set((state) => {
                state.work_list[state.category].mode = r
            })
        },
        onLoadWorkList: async (params) => {
            set((state) => {
                state.loading_work = true;
            });
            // 参数需要有当前category传入
            // 调用api
            console.log(`onLoadWorkList`, params, getState());
            const {current, init: initial, init_mode = undefined} = params;
            const {WorkCreateType, category, work_list} = getState();
            let {mode = 0, list = [], list_fav = []} = work_list[category] || {};
            const query = {
                create_type: category === 0 ? [WorkCreateType.NONE, WorkCreateType.CREATE_BY_IMAGE, WorkCreateType.CREATE_BY_TEXT, WorkCreateType.PHOTOSHOP] : [WorkCreateType.COMPOSITE],
                current: current,
            };
            if (typeof init_mode !== 'undefined') {
                if (init_mode === 1) query.is_collect = true;
            } else {
                if (mode === 1) query.is_collect = true;
            }
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
            let _list = [];
            if (typeof init_mode !== 'undefined') {
                if (init_mode === 0) {
                    _list = initial ? [...data] : list.concat(data);
                } else {
                    _list = initial ? [...data] : list_fav.concat(data);
                }
            } else {
                if (mode === 0) {
                    _list = initial ? [...data] : list.concat(data);
                } else {
                    _list = initial ? [...data] : list_fav.concat(data);
                }
            }
            // await new Promise((resolve)=>{
            //     setTimeout(()=>{
            //         resolve();
            //     }, 3000);
            // })
            set((state) => {
                if (typeof init_mode !== 'undefined') {
                    state.work_list[category][init_mode === 0 ? 'init' : 'init_fav'] = true;
                    state.work_list[category][init_mode === 0 ? 'list' : 'list_fav'] = _list;
                    state.work_list[category][init_mode === 0 ? 'count' : 'count_fav'] = count;
                    state.work_list[category][init_mode === 0 ? 'current' : 'current_fav'] = current;
                } else {
                    state.work_list[category][mode === 0 ? 'init' : 'init_fav'] = true;
                    state.work_list[category][mode === 0 ? 'list' : 'list_fav'] = _list;
                    state.work_list[category][mode === 0 ? 'count' : 'count_fav'] = count;
                    state.work_list[category][mode === 0 ? 'current' : 'current_fav'] = current;
                }
                state.loading_work = false;
            });
        },
        create_loading: false,
        onCreateWork: async (params) => {
            set((state) => {
                state.create_loading = true;
            });
            const {WorkCreateType, WorkType,} = getState();
            const {url} = params;
            const query = {
                name: '未命名',
                description: '',
                content: url,
                create_type: WorkCreateType.NONE,
                source: WorkType.UPLOAD,
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
            set((state) => {
                state.create_loading = false;
            });
        },
    })),
)
