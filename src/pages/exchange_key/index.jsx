import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import {Avatar, Button, Space, Image, Swiper, Checkbox, Input, Toast} from "@nutui/nutui-react-taro"
import './index.scss'
import Taro, {useRouter} from "@tarojs/taro";
import {Add} from "@nutui/icons-react-taro";
import {api, getHeaders} from "../../utils/api";
import {useUserStore} from "../../store/user";

function ExchangeKey() {

    const router = useRouter();

    const {
        check_login, onChangeCheckLogin,
        is_login, onChangeLogin,
        user_info, onChangeUserInfo
    } = useUserStore();

    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState('');

    const [success, setSuccess] = useState(false);
    const [fail, setFail] = useState(false);
    const [fail1, setFail1] = useState(false);

    function isValidKey(key) {
        // 定义一个正则表达式来匹配指定格式的密钥
        const regex = /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;
        return regex.test(key);
    }

    const submit = async () => {
        if (!isValidKey(key)) {
            setFail1(true);
            setTimeout(() => {
                setFail1(false);
            }, 2000);
            return;
        }
        setLoading(true);
        let query = {
            user_id: user_info.id,
            key: key,
        };
        console.log(`query`, query);
        // 发起请求
        const response = await Taro.request({
            url: `${api('/api-user/v1/secret-key/use')}`,
            header: {...getHeaders()},
            method: 'POST',
            data: query,
        });
        const {data: r} = response;
        const {data: res} = r || {};
        console.log(`res`, res);
        if (res) {
            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } else {
            setFail(true);
            setTimeout(() => {
                setFail(false);
            }, 2000);
        }
        setLoading(false);
    }

    useEffect(() => {
        console.log('router', router)
    }, [router]);

    return (<>
        <View className="exchange_key">
            <View className="exchange_key-container">
                <View className="exchange_key-container-input-wrapper">
                    <View className="exchange_key-container-text">
                        请输入兑换码
                    </View>
                    <Input
                        className="exchange_key-container-input"
                        value={key}
                        onChange={(val) => setKey(val)}
                        placeholder="0000-0000-0000-0000"
                        maxLength={19}
                    />
                    <Button style={{width: `100%`}} shape={`square`} type="primary" color="#5596D2" size="large" loading={loading} onClick={() => submit()}>
                        确认兑换
                    </Button>
                </View>
            </View>
        </View>

        <Toast
            type={'loading'}
            duration={0}
            content={'提交中...'}
            visible={loading}
        />

        <Toast
            type={'success'}
            duration={0}
            content={'兑换成功！'}
            visible={success}
        />

        <Toast
            type={'fail'}
            duration={0}
            content={'兑换失败！'}
            visible={fail}
        />

        <Toast
            type={'fail'}
            duration={0}
            content={'请检查兑换秘钥是否正确！'}
            visible={fail1}
        />
    </>)
}

export default ExchangeKey
