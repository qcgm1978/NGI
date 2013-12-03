GLOBAL.namespace('PathOptions');
(function (Obj) {
    Obj.stopNavigation = function () {
        var constant = parent.window.GLOBAL.Constant;
        if (parent.window.iframeObj != undefined) {
            parent.GLOBAL.Constant.nav_obj.StopEmulator();
            parent.GLOBAL.Constant.nav_obj.StopGpsNavi();
//            调用统一方法，modified by zhanghongliang
            parent.uiManager.unNaviInitialState();
            parent.businessManager.init_Map();
            parent.window.iframeObj.remove();
        }
        return true;
    };
})(GLOBAL.PathOptions);
$(function () {
    //绑定终止导航图标点击事件
    $('img[alt="终止导航"]')
        .click(function () {
            var config={
                id:"prompt_box",
                msg:GLOBAL.Constant.prompt_terminationOfNavigation,
                sureCallback:callbackMethod
            } ;
            GLOBAL.layer.createNew(config).show();
        });
    function callbackMethod(){
        parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Map, GLOBAL.PathOptions.stopNavigation);
    }
    /**
     * @event 设置返程图标显示状态，绑定返程图标点击事件.
     */
    if (parent.window.GLOBAL.Constant.nav_obj.tbt_enable_ret && !parent.window.GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
        $('img[alt="返程"]')
            .click(function () {
                /**
                 * @description 重置控制返程图标显示的本地变量，因为返程后是否继续显示返程需要重新计算导航的移动距离
                 */
                var constant = parent.window.GLOBAL.Constant;
                constant.poi_search_result.lng = constant.nav_obj.start.x;
                constant.poi_search_result.lat = constant.nav_obj.start.y;
                constant.nav_obj.handlePageLogic=parent.GLOBAL.NavClass.displayDoubleLightLayer;
                parent.window.iframeObj.remove();
                try {
                    parent.window.GpsNav.prepareRequestPath();
                }
                catch (e) {
                    TestClass.outputInfo(e.message);
                }
            });
    }
    else {
        var config = {
            ele:$('img[alt="返程"]'),
            attr:'src'
        };
        Tab.gray_img(config);
    }
    //绑定全图浏览图标点击事件
    $('img[alt="全图浏览"]')
        .click(function () {
            parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapOverview, parent.window.GLOBAL.Event.NavScreenEvent.showMapOverviewScreen);
        })
        .mouseover(function () {
            $(this).css('cursor', 'pointer');
        });
    /**
     * @event 绑定分段浏览点击事件
     */
    $('img[alt="分段浏览"]')
        .click(function () {
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.RoadSegInfo, parent.window.GLOBAL.Event.NavScreenEvent.showRoadSegInfoScreen);
        })
        .mouseover(function (e) {
            $(this).css('cursor', 'pointer');
        });

    /**
     * @event 绑定模拟导航图标点击事件,如果在模拟导航状态，不允许用户再次点击模拟导航，否则容易发生错误
     */
    $('img[alt="模拟导航"]')
        .click(function () {
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation, parent.window.GLOBAL.Event.NavScreenEvent.showEmulatorScreen);
        })
        .mouseover(function (e) {
            $(this).css('cursor', 'pointer');
        });

});
