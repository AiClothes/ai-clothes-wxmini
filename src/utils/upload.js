const COS = require('../utils/cos-wx-sdk-v5.js');
import Taro from "@tarojs/taro";
import {api, getHeaders} from "./api";

export const getToken = async () => {
    const response = await Taro.request({
        url: `${api('/api-common/v1/common/upload-user-file')}`,
        header: {...getHeaders()},
        method: 'POST',
        data: {}
    });
    const {data: r} = response;
    return r;
};

export const upload = async ({file, file_path}) => {
    const cos = new COS({
        // getAuthorization 必选参数
        SimpleUploadMethod: 'putObject', // 强烈建议，高级上传、批量上传内部对小文件做简单上传时使用putObject
        getAuthorization: async function (options, callback) {
            let data = null;
            let credentials = null;
            try {
                const res = await getToken();
                console.log(`token`, res);
                const {data: resData} = res || {};
                data = resData;
                credentials = data.credentials;
            } catch (e) {

            }
            if (!data || !credentials) {
                // 上传信息获取失败！请重试！
            }
            const _callback_params = {
                TmpSecretId: credentials.tmpSecretId,
                TmpSecretKey: credentials.tmpSecretKey,
                SecurityToken: credentials.sessionToken,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
            };
            console.log(`_callback_params`, _callback_params);
            callback(_callback_params);
        }
    });

    return new Promise((resolve, reject) => {
        cos.uploadFile({
            /* 填写自己的 bucket，必须字段 */
            Bucket: 'base-1327679787',
            /* 存储桶所在地域，必须字段 */
            Region: 'ap-guangzhou',
            /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */
            Key: file_path,
            // 上传文件对象
            FilePath: file,
            /* 触发分块上传的阈值，超过5MB使用分块上传，小于10MB使用简单上传。可自行设置，非必须 */
            SliceSize: 1024 * 1024 * 5,
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, function (err, data) {
            if (err) {
                console.log('上传失败', err, data);
                reject(err);
            } else {
                console.log('上传成功', data);
                const {Location} = data || {};
                resolve(`https://${Location}`);
            }
        });
    })
}

export const uploadBase64 = async ({file, file_path}) => {
    const cos = new COS({
        // getAuthorization 必选参数
        SimpleUploadMethod: 'putObject', // 强烈建议，高级上传、批量上传内部对小文件做简单上传时使用putObject
        getAuthorization: async function (options, callback) {
            let data = null;
            let credentials = null;
            try {
                const res = await getToken();
                console.log(`token`, res);
                const {data: resData} = res || {};
                data = resData;
                credentials = data.credentials;
            } catch (e) {

            }
            if (!data || !credentials) {
                // 上传信息获取失败！请重试！
            }
            const _callback_params = {
                TmpSecretId: credentials.tmpSecretId,
                TmpSecretKey: credentials.tmpSecretKey,
                SecurityToken: credentials.sessionToken,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
            };
            console.log(`_callback_params`, _callback_params);
            callback(_callback_params);
        }
    });

    return new Promise((resolve, reject) => {
        cos.putObject({
            /* 填写自己的 bucket，必须字段 */
            Bucket: 'base-1327679787',
            /* 存储桶所在地域，必须字段 */
            Region: 'ap-guangzhou',
            /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */
            Key: file_path,
            // 上传文件对象
            Body: file,
            /* 触发分块上传的阈值，超过5MB使用分块上传，小于10MB使用简单上传。可自行设置，非必须 */
            SliceSize: 1024 * 1024 * 5,
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, function (err, data) {
            if (err) {
                console.log('上传失败', err, data);
                reject(err);
            } else {
                console.log('上传成功', data);
                const {Location} = data || {};
                resolve(`https://${Location}`);
            }
        });
    })
}
