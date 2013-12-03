/**
 * 路径路况页js
 *
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: condition.js
 * @Description: 路径路况页js
 * @author wangyonggang qq:135274859 zhanghongliang qq: 20132277
 * @date 2012-8-28
 * @version V1.0 Modification History: 2012-8-28
 */
$(function () {
    Condition = {
        navObj:parent.window.GLOBAL.Constant.nav_obj,
        config:GLOBAL.common.LocalSave.read('Map_poi'),
        navclass:parent.window.GLOBAL.NavClass,
        options:{
            config:parent.GLOBAL.Constant.poi_search_result,
            total:parent.tbt.GetRouteLength(),
//            remain:parent.GLOBAL.Constant.nav_obj.remain_metre,
            $currentPath:$('#currentPath'),
            $blockquote:$('header blockquote'),
            $dt:$('dt'),
            $dd:$('dd'),
            $lightCross:$("#light_cross")
        },
        createNew:function () {
            var condition = {};
            /**
             @description 设置对象元素的值
             */
            condition.setEleValue = function () {
                var miniute = Condition.navObj.NavigationInfo.nRouteRemainTime, time = GLOBAL.common.formatMinute(miniute);
                Condition.options.$blockquote.text(Condition.config.name || GLOBAL.Constant.no_name_road);
                Condition.options.$dt.text(Tab.unit_conversion(Condition.navObj.NavigationInfo.nRouteRemainDist, 1));
                Condition.options.$dd.text(time);
                return condition;
            };
            /**
             @description 设置自车的位置
             */
            condition.setCurrentPath = function () {
                var arg = getArg();
                //显示车在路上的相对位置
                var carlocation = (Condition.navclass.getPathRemain(Condition.navObj) / Condition.navclass.getPathDistance(Condition.navObj)) * arg.total;
//                if (carlocation > arg.total - 39)
//                    carlocation = arg.total - 39; //避免车出现在光柱的外面，39是图片的宽度（可以根据图片宽度自适应，但是需要先把图片加载上）
//                else
//                    carlocation = parseInt(carlocation);//只取整数
                carlocation = carlocation > arg.total - 39 ? parseInt(arg.total - 39) : parseInt(carlocation);
                Condition.options.$lightCross.append("<img src = 'images/car_mark01.png' style='position:absolute;right:" + carlocation + "px'>");
                return condition;
            };
            /**
             @description 绘制光柱
             */
            condition.drawFullLightCross = function () {
                var arg = getArg();
                var drawFullLightCross = new SimulatorLight(arg);
                var config = drawFullLightCross.generateArg();
                try {
                    Tab.set_bg(config);
                } catch (err) {
                    console.log(err.message);
                }
                return condition;
            };
            /**
             @description 获取参数
             */
            function getArg() {

                var config = {
                    pass:Condition.navclass.getPathDistance(Condition.navObj) - Condition.navclass.getPathRemain(Condition.navObj),
                    ken:Condition.navclass.getPathRemain(Condition.navObj)
                };
                var arrLight = parent.window.tbt.CreateTMCBar(config.pass, config.ken);
                arrLight = Tab.changeTmcLightCrossData(arrLight);
                var arg = {
                    arr:arrLight,
                    id:'light_cross',
                    total:parseInt($('#light_cross').width()),
                    metric:'width',
                    address:'images/'
                };
                return arg;
            }

            return condition;
        }
    };
    Condition.createNew().setEleValue().drawFullLightCross().setCurrentPath();
});