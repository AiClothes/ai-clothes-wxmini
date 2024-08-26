import {View} from "@tarojs/components";
import {Image} from "@nutui/nutui-react-taro";

export function Empty({description = '暂无相关内容'}) {
    return (<>
        <View>
            <Image width={`100%`} mode="widthFix" src={`https://base-1327679787.cos.ap-guangzhou.myqcloud.com/wxmini/client/empty_shop.png`}/>
        </View>
        <View className="empty">
            {description}
        </View>
    </>)
}
