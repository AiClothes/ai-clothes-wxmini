import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import Taro from "@tarojs/taro";
import {api, getHeaders} from "../utils/api";

export const useUserStore = create()(
    immer((set) => ({
        check_login: false,
        onChangeCheckLogin: (r) =>
            set((state) => {
                state.check_login = r
            }),
        is_login: false,
        onChangeLogin: (r) =>
            set((state) => {
                state.is_login = r
            }),
        user_info: null,
        onChangeUserInfo: (r) =>
            set((state) => {
                state.user_info = r
            }),
        onLoadUserInfo: async () => {
            const user_response = await Taro.request({
                url: `${api('/api-user/v1/user/wx-profile')}`,
                header: {...getHeaders()},
                method: 'POST',
                data: {}
            });
            console.log('user_response', user_response);
            const {data: r} = user_response || {};
            const {data: user_data} = r;
            if (user_data) {
                set((state) => {
                    state.user_info = user_data;
                    state.is_login = true;
                });
            }
        }
    })),
)
