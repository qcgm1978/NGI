/**
 * @fileOverview 该文件控制主界面加载地图逻辑
 *  COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @author hongliang.zhang, qq:     20132277
 * @version V1.0
 **/

$(function () {
    var constant = GLOBAL.Constant;
    //地图界面加载完毕执行该函数
    if (JSON.parse(localStorage['tbt_state'])) {
        var layerFirst = GLOBAL.layer.createNew({
            id:'prompt_box',
            msg:constant.prompt_recoveryByTheWay,
            sureCallback:recoverLastNav,
            cancelCallback:cancelLastNav
        });
        layerFirst.show();
    }
    if (GLOBAL.common.checkNetBySdk({
        typeOfServerObj:typeof MMap
    })) {
        try {
            GpsNav.initializeDemoTbt();
            GLOBAL.Event.NavScreenEvent.showMapScreen();
//            绑定主界面图片等元素点击ui效果
            var config = {
                allImgs:'img',
                arrNoEffectImgs:['#mmap img', "#traffic_panel_toggle img", "#message_panel", "#compass", "#scale img", "#satellite img", "#gprs img", "img[alt='停止模拟']", "img[alt='模拟速度']", "img[alt='路程图标']", "img[alt='指南针']", "img[alt='快速线路']", "img[alt='常规线路']", "img[alt='行驶里程']", "img[alt='预计用时']", "img[alt='常规路线']", "img[alt='快速路线']", "#crossCursor"],
                arrEffectEleExceptImg:["#fastSection", "#normalSection", "#fastLine", "#normalLine", ".bg_top", "#bg_light_cross", ".prompt_box img", ".confirm_box img", "a"],
                context:document
            };
            var ele = new GLOBAL.common.EleEventUiClass(config);
            ele.bindEleClickUiEvent();
//            生成poi搜索弹出框单例
            layerPoi = poiLayer.singletonInstance();
        } catch (e) {
            var err = new GLOBAL.common.error.ErrorMsgToServer(e);
            err.pushMessage();
        }
        getCurrentCity(localStorage['Map_lng'], localStorage['Map_lat']);
    } else {
        var config = {
            id:'confirm_box',
            msg:GLOBAL.Constant.prompt_netFail,
            sureCallback:netFailCallback
        };
        var layer = GLOBAL.layer.createNew(config);
        layer.show();
        /**
         * @event map.js未加载到时，进行处理。尚需余小龙确认具体需求，目前设置为用户点击确定后，跳转到安全页面。另外，可使用ui.js中的judgeGRPS处理
         */
        function netFailCallback() {
            location.href = '../safe/index.html';
        }
    }

    // 恢复上次导航对话框是与否按钮点击回调方法 added by zhanghongliang
    function recoverLastNav() {
        GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation, function () {
            //         读取上次导航终点
            GLOBAL.Constant.poi_search_result.lng = localStorage['Map_poi_lng'];
            GLOBAL.Constant.poi_search_result.lat = localStorage['Map_poi_lat'];
            GLOBAL.Constant.nav_obj.handlePageLogic = function () {
                GLOBAL.NavClass.startNavWhenFirstEnter();
            };
//            GLOBAL.Constant.resumeLastNavi = true;
            /*
             * @event 读取上次计算路径的策略，直接开始导航
             */
            GpsNav.prepareRequestPath();
            return true;
        });
    }

    function cancelLastNav() {
        localStorage['tbt_state'] = false;
        uiManager.unNaviInitialState();
    }
});
//你地址编码获取当前城市
function getCurrentCity(lng, lat) {
    if (typeof lng == "undefined" || typeof lat == "undefined") {
        console.log('invalid lng or lat');
        return;
    }
    Tab.coord_regeocode(lng, lat, function (data) {
        if (typeof data.city != "undefined") {
            var city = data.city;
            localStorage['Map_search_area'] = city;
        }
    });
}

