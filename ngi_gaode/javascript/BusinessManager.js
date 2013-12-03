/**
 * @author wangyonggang
 * @class
 * @description 业务管理类
 */
var BusinessManager = {
    /**
     * @function 默认状态下的地图效果
     * @description 默认状态下的地图显示，即主界面默认效果包括：１，显示地图；２，添加自车位置覆盖物；３，注册拖动地图事件；４,注册放大缩小地图事件（接口似不支持；５，自车覆盖物及地图中心随ＧＰＳ改变而改变
     */
    default_map_ini:function () {
        MapEvent.showLocation();
        MapEvent.setIniMapState();
    },
    /**
     * @function 双光柱地图效果
     * @description
     */
    init_lightCross:function () {
        thisPage.clearMapMainInterface();
        Event.mapObj.setRotation(0);
//        MapEvent.add_current_overlay();
        MapEvent.add_target_overlay();
        DoubleLightMapEvent.drawLneAddDistanceTime();
        UtilFunc.setUiDoubleLight();
        MapDataHandler.saveHistoryTarget();
    },
    /**
     * @function 未导航地图效果
     * @description
     */
    init_Map:function () {
        MapEvent.displayChosenScale();
        Event.mapObj.clearOverlaysByType('polyline');
        Event.mapObj.removeOverlays('target');
        Event.mapObj.setStatus({dragEnable:true});
        this.panMapToCurrentCar();
        Event.mapObj.setStatus({dragEnable:true });
        // TODO：如果要在双光柱页显示交通信息气泡不应该在这里设置
        /*  var currentState = GLOBAL.Event.NGIStateManager.getCurrentState();
         if(currentState == GLOBAL.Constant.NGIStates.LightCross){
         var zoomLevel = Event.mapObj.getZoom();
         GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoomLevel);//显示交通信息气泡
         MapEvent.display_scale();
         }*/
    },
    panMapToCurrentCar:function () {
        var currentOverlay = Event.mapObj.getOverlays('current'),
            lng = currentOverlay.position.lng,
            lat = currentOverlay.position.lat;
        Event.mapObj.panTo(new MMap.LngLat(lng, lat));
    }, /**
     * @function 导航地图初始效果
     * @description
     */
    navi_Map:function () {
        var zoomLevel = Event.mapObj.getZoom();
        //设置地图中心点为自车位置，双光柱界面地图中心点为路的中点。
        Event.mapObj.setStatus({dragEnable:false});
        this.panMapToCurrentCar();
        MapEvent.displayChosenScale(); // by Zhen Xia
        GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoomLevel);
        if (!Event.mapObj.getOverlays('target')) {
            MapEvent.add_target_overlay();
        }
    },
    /**
     * @function 模拟导航设置
     * @description
     */
    emulator_Map:function () {
        Event.mapObj.setStatus({dragEnable:false});
        GLOBAL.Constant.nav_obj.ResumeEmulator();
        MapEvent.displayChosenScale();
    },
    /**
     * 搜索结果点击事件监听器   changed by zhanghongliang
     * @param lng
     * @param lat
     * @param name
     * @param address
     * @param tel
     */
    rsItemListener:function (config) {
        var coord_target = new MMap.LngLat(config.lng, config.lat);
        Event.mapObj.setCenter(coord_target);
        var distance = MapEvent.determin_distance(coord_target);
        config.distance = distance;
        GLOBAL.Constant.poi_search_result = config;
//        MapEvent.add_current_overlay();
        Event.mapObj.setStatus({dragEnable:false});
        MapEvent.setZoom_17();
    },
    /**
     * @function 显示详细信息
     * @description
     */
    showViewPoiDetailScreen:function () {
        if ($('#iframeDiv').is(':hidden')) {
            $('<div id="detailsDiv" class="w800 h480" style="position:absolute;top:0px;display:none;z-index:1001"></div>').appendTo('#map');
            $('#detailsDiv')
                .load('details.html')
                .show();
        } else {
            frames[0].window.location.href = "detail.html";
        }
    },
    //    load页面的返回按钮事件
//    @author zhanghongliang
    returnLoadContainerScreen:function (config) {
        frames[0].$(config.id).remove();
        return true;
    },
    /**
     * @function
     * @description  显示全图浏览业务处理
     */
    showMapOverviewScreen:function () {
        Event.mapObj.setRotation(0);
        GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();
        var pathArray = MapEvent.getPathArray();
        GLOBAL.common.MapUtil.setPathZoom(Event.mapObj, pathArray);
        Event.mapObj.setStatus({dragEnable:true});
        MapEvent.setPolylineState(true);
        MapEvent.setOverlayStateById({id:'target', state:true});
        MapEvent.changePointArrow(GLOBAL.Constant.nav_obj);
        MapEvent.displayScale();
    },
    /**
     * @function
     * @description  分段道路信息地图浏览
     */
    showMapRoadSegmentScreen:function () {
        var config = GLOBAL.common.LocalSave.read('Map_seg_center'), navState = JSON.parse(localStorage['tbt_state']);
        Event.mapObj.setStatus({dragEnable:false});
        MapEvent.setPolylineState(true);
        MapEvent.setOverlayStateById({id:'target', state:true});
        if (!navState) {
            var arrGuideList = tbt.GetNaviGuideList();
            //添加转折marker覆盖物
            MapEvent.AddMarkerOverlays(arrGuideList);
//            添加自车覆盖物，保证自车在start红点覆盖物上方
            MapEvent.add_current_overlay();
            MapEvent.add_destn_direction();
        }
        Event.mapObj.setCenter(new MMap.LngLat(config.lng, config.lat));
        MapEvent.setZoom_17();
        Event.mapObj.setRotation(0);
        var currentLngLat = {
            fLatitude:localStorage['Map_lat'],
            fLongitude:localStorage['Map_lng']
        };
        GLOBAL.NavClass.updatePointingDirection(currentLngLat);
        $('#poi_current').val(config.name);
        var zoom = Event.mapObj.getZoom();
        GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoom);//显示交通信息气泡
    },
    /**
     * @function
     * @description  显示模拟导航界面
     */
    showEmulatorScreen:function () {
        GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus = true;
        GLOBAL.Constant.nav_obj.StartEmulator();
        tbt.SetEmulatorSpeed(GLOBAL.Constant.tbt_speed_high);
        Event.mapObj.setStatus({dragEnable:false});
        MapEvent.setZoom_17();
    },
    /**
     * @function
     * @description  显示GpsInfo界面
     */
    showGpsInfoScreen:function () {
        frames[0].window.location.href = '../main_menu/assist/gps.html';
        iframeObj.show();
    },
//    load页面元素绑定事件
    bindLoadPageEvent:function (config) {
        $(config.container).
            find('img[alt="返回按钮"]')
            .live('click', function (e) {
                GLOBAL.Event.NGIStateManager.goToPreviousState(BusinessManager.returnLoadContainerScreen, {id:config.container});
                return false;
            });
        $(config.container).find('h1').text(GLOBAL.Constant.title_nearby);
        this.handleData(config);
        var configUi = {
            allImgs:'img',
            arrEffectEleExceptImg:['#searchTable td'],
            context:config.container
        };
        var ele = new GLOBAL.common.EleEventUiClass(configUi);
        ele.bindEleClickUiEvent();
    },
    TilesArray:[], //地图Tile信息数组
    //缓存地图
    setTileUrl:function (x, y, z) {
        var domainsNumber = 4 , domain = -1 , tiles = this.TilesArray;
        for (var i = 0, len = tiles.length; i < len; i++) {//检查Tile是否已经加载过
            if (tiles[i].x == x && tiles[i].y == y && tiles[i].z == z) {
                domain = tiles[i].domain;
                break;
            }
        }
        if (domain == -1) {//没有加载过，保存该tile
            domain = Math.ceil(Math.random() * domainsNumber);
            tiles.push({"domain":domain, "x":x, "y":y, "z":z});//保存tile信息
        }
        return "http://webrd0" + domain + ".is.autonavi.com/appmaptile?x=" + x + "&y=" + y + "&z=" + z + "&lang=zh_cn&size=1&scale=1&style=7";
    },
//    mvc:controller
    //    poi查询监听器,changed by zhanghongliang
    searchPoiButtonListener:function (config) {
        var searchInstance = config.searchInstance;
        $('iframe')
            .attr('src', "../main_menu/destn/POISearchResult.html")
            .one('load', {searchInstance:searchInstance}, function (e) {
                var configData = {
                    searchInstance:e.data.searchInstance,
                    container:frames[0].document,
                    data:e.data.searchInstance.getDataByPage(1)
                };
                var resultPage = new PoiPageServiceClass(configData);
                resultPage.setResultPage();
                iframeObj.show();
            });
        return true;
    },
    setRetBtnEvent:function () {
        var that = this;
        $(this)
            .find('img[alt="返回按钮"]')
//                    取消iframeClass对返回按钮的绑定
            .attr('alt', '')
            .click(function () {
                parent.GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                    $(that).remove();
                    return true;
                });
            }
        );
    },
    setNoDataPoiLayer:function (instance) {
        var state = instance.noData || !instance.dataState
        if (state) {
            parent.layerPoi.hideProcessLayer();
            parent.layerPoi.showDataFormatError();
        }
    },
    noDataHandler:function () {
        if (this.noData) {
            parent.layerPoi.noDataHandler();
            return true;
        }
        return false;
    }
};
businessManager = Class.create(BusinessManager);
