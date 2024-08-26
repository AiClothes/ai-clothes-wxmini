import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import Taro from "@tarojs/taro";
import {api, getHeaders} from "../utils/api";

export const useGlobalStore = create()(
    immer((set) => ({
        select_tab: 0,
        onChangeSelectTab: (r) =>
            set((state) => {
                state.select_tab = r
            }),
        show_index_dialog_count: 0,
        show_index_dialog: false,
        mini_program_config: {},
        onChangeIndexDialog: (v) => {
            set((state) => {
                if (v) state.show_index_dialog_count += 1
                state.show_index_dialog = v
            })
        },
        onLoadMiniProgramConfig: async () => {
            const response = await Taro.request({
                url: `${api(`/api-common/v1/common/find-one-wx`)}`,
                header: {...getHeaders()},
                method: 'POST',
                data: {id: 1},
            });
            const {data: r} = response;
            const {data: res} = r || {};
            set((state) => {
                state.mini_program_config = res;
                const {is_show} = res || {};
                if (is_show) {
                    state.show_index_dialog = true
                }
            })
        }
    })),
)
