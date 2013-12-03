/**
 * @fileoverview 地图显示及操作类
 * @author 张红亮，程盼望
 **/
/**
 * @class GpsNav
 */
var GpsNav = {
    initializeDemoTbt:function () {
        var constant = GLOBAL.Constant, requestContext = {
            requestPath:true,
            error:MapEvent.loadError,
            hideLaneEle:function () {
                $('#mark').html('');
            },
            errorOnePath:function () {
                thisPage.request_path_failed();
            }
        };
        //初始化导航类，获取全局对象GLOBAL.Constant.nav_obj和tbt
        GLOBAL.Constant.nav_obj = new NavFrame(requestContext);
        //为html5 获取经纬度信息的接口配置有效的回调函数
        var config = this.generateNviArg();
        var gpsNav = new GLOBAL.WatchGPS(config);
        //通过浏览器获取gps方法的返回id，在程序运行期间始终推送gps信息
        try {
            GLOBAL.Constant.nav_obj.watchId = gpsNav.inspectCurrentGPS();
        } catch (e) {
            var err = new GLOBAL.common.error.ErrorMsgToServer(e);
            err.pushMessage();
        }
    },
    /**
     * @return [object] config 包括两个方法，GPS导航时，用html5接口轮询服务器获得position对象成功或失败时执行的函数
     **/
    generateNviArg:function () {
        var constant = GLOBAL.Constant, that = this;
        var config = {
            onSuccess:function (position) {
                GLOBAL.WatchGPS.currGPS = GLOBAL.WatchGPS.generateGPS(position);
                try {
                    if (GLOBAL.WatchGPS.currGPS == null) {
                        return;
                    }
                    that.pushGpsInfo(GLOBAL.WatchGPS.currGPS);
                } catch (error) {
                    error.callback = function () {
                        if (!tbt.SetGPSInfo) {
                            throw new Error('no obtain gps infomation');
                        }
                    };
                    var err = new GLOBAL.common.error.ErrorMsgToServer(error);
                    err.pushMessage();
                }
                GLOBAL.WatchGPS.lastGPS = GLOBAL.WatchGPS.currGPS;
                GLOBAL.WatchGPS.currGPS = null;
            },
            onError:function (error) {
                if (!GLOBAL.WatchGPS.currGPS && GLOBAL.WatchGPS.lastGPS) {
                    that.pushGpsInfo(GLOBAL.WatchGPS.lastGPS);
                }
            }
        };
        return config;
    },

    pushGpsInfo:function (curr) {
        tbt.SetGPSInfo(curr.longitude, curr.latitude, curr.speed, curr.direction, curr.year, curr.month, curr.day, curr.hour, curr.minute, curr.second);
    },
    prepareRequestPath:function () {
        var constant = GLOBAL.Constant;
        GLOBAL.Constant.nav_obj.promptBoxWhenRequest.show();
        if (JSON.parse(localStorage['tbt_state'])) {
            GLOBAL.Constant.nav_obj.StopGpsNavi();
        }
        this.requestPath();
    },
    requestPath:function () {
        var constant = GLOBAL.Constant;
        try {
            GLOBAL.Constant.nav_obj.start = {
                x:JSON.parse(localStorage['Map_lng']),
                y:JSON.parse(localStorage['Map_lat'])
            };
            GLOBAL.common.saveDestination();
            GLOBAL.Constant.nav_obj.end = {
                x:localStorage['Map_poi_lng'],
                y:localStorage['Map_poi_lat']
            };
            //time 请求发起时间，用于判断请求是否超时
            GLOBAL.Constant.nav_obj.startRequestTime = new Date();
            GLOBAL.Constant.nav_obj.RequestPath();
        }
        catch (e) {
//            alert(e.stack);
//            关闭请求路径对话框
            GLOBAL.Constant.nav_obj.promptBoxWhenRequest.hide();
            var err = new GLOBAL.common.error.ErrorMsgToServer(e);
            err.pushMessage();
        }
    }
};
/**
 * @class 地图数据处理类
 */
MapDataHandler = {
    /**
     * @description 存储历史目的地，即当前的目的地经纬度、名称、地址、电话
     */
    saveHistoryTarget:function () {
        var constant = GLOBAL.Constant, common = GLOBAL.common;
        if (eval(localStorage['Map_poi_info'])) {
            var config = common.LocalSave.read('Map_poi');
            UtilFunc.add_favor_history(config);
            localStorage['Map_poi_info'] = false;
        } else {
            /**
             * @description 存储目的地信息到历史目的地收藏夹
             * @event 逆地理编码，获得名称、地址、电话信息
             */
            try {
                Tab.coord_regeocode(GLOBAL.Constant.poi_search_result.lng, GLOBAL.Constant.poi_search_result.lat, UtilFunc.store_poi_data);
            } catch (e) {
                console.log(e.message);
            }
        }
    }

};
/**
 @class 工具函数类
 */

UtilFunc = {
    setRegularOptionGray:function (config) {
        $('[data="normal"]').css('opacity', config.opacity);
        if (config.opacity != 1) {
            $('[data="normal"]').off();
        }
    },
    setUiDoubleLight:function () {
        GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();//by Zhen Xia,双光柱界面隐藏交通信息情报板气泡
        //新增语句：设置地图到合适缩放级别
        //Event.mapObj.setFitView();
        var pathArray = MapEvent.getPathArray();
        GLOBAL.common.MapUtil.setPathZoom(Event.mapObj, pathArray);
        //显示比例尺
        MapEvent.displayScale();
    },
    /**
     * @description 获取信息成功后执行该回调函数
     **/
    store_poi_data:function (data) {
        try {
            //var poi = data.list[0].poilist[0];//poi sdk与mapabc api结果结构不同
            var poi = data.list[0];
            UtilFunc.add_favor_history(poi);
        }
        catch (err) {
            console.log(err.message);
            UtilFunc.add_favor_history();
        }
    },
    add_favor_history:function (poi) {
        var constant = GLOBAL.Constant, config = null;
        if (typeof poi !== 'undefined') {
            config = {
                type:GLOBAL.Constant.favor_history,
                name:poi.name,
                lng:GLOBAL.Constant.poi_search_result.lng,
                lat:GLOBAL.Constant.poi_search_result.lat,
                address:poi.address,
                tel:poi.tel
            };
            /* @description 调用实例方法，处理请求存储的数据*/
            new FavoriteService().saveFavor(config);
        }
        GLOBAL.common.savePoiData(config);
    },

    addNormalData:function (lenTime) {
        var objConfig = this.unitConversion(lenTime);
        $('#normalRouteDis').text(objConfig.length);
        $('#normalRouteTime').text(objConfig.time);
    },
    addTmcData:function (config) {
        var objConfig = this.unitConversion(config);
        $('#TMCRouteTime').text(objConfig.time);
        $('#TMCRouteDis').text(objConfig.length);
    },
    unitConversion:function (config) {
        var constant = GLOBAL.Constant, configUnit = {};
        try {
            configUnit.length = Tab.unit_conversion(config.length, 1),
                configUnit.time = GLOBAL.common.formatMinute(config.time)
        }
        catch (e) {
            configUnit.length = GLOBAL.Constant.null_value , configUnit.time = GLOBAL.Constant.null_value;
        }
        ;
        return configUnit;
    },
    forbiddenChoiceDrawOne:function (configNormal) {
        //可能改成隐藏选择元素
        $('[data="normal"]').off();
        var len = $('#normalRouteDis').text(),
            time = $('#normalRouteTime').text();
        $('#TMCRouteDis').text(len);
        $('#TMCRouteTime').text(time);
        MapEvent.drawOnePath();
    }
};
/**
 * @class 双光柱页面地图事件
 */
DoubleLightMapEvent = {
    drawLneAddDistanceTime:function () {
        var constant = GLOBAL.Constant, configNormal, configRapid;
        try {
            //处理收到的快速路径信息
            tbt.SelectRoute(GLOBAL.Constant.iRapid);
            GLOBAL.Constant.nav_obj.rapidPathArray = MapEvent.getCoordsArray({tbt:tbt});
            configRapid = {
                length:tbt.GetRouteLength(),
                time:tbt.GetRouteTime()
            };
            //处理收到的普通路径信息
            tbt.SelectRoute(GLOBAL.Constant.iNormal);
            GLOBAL.Constant.nav_obj.normalPathArray = MapEvent.getCoordsArray({ tbt:tbt});
            configNormal = {
                length:tbt.GetRouteLength(),
                time:tbt.GetRouteTime()
            };
            //默认选中的是快速路线
            localStorage['route_type'] = GLOBAL.Constant.iRapid;
            UtilFunc.addNormalData(configNormal);
            if (configNormal.length == configRapid.length && configNormal.time == configRapid.time) {
                UtilFunc.addTmcData(configRapid);
                MapEvent.drawOnePath(GLOBAL.Constant.nav_obj.rapidPathArray);
                UtilFunc.setRegularOptionGray({ opacity:0.4 });
            } else {
                //TODO 如果快速路线时间长于普通路线,则普通路线的时间强制等于快速路线的时间,
                configRapid.time = configRapid.time > configNormal.time ? configNormal.time : configRapid.time;
                UtilFunc.addTmcData(configRapid);
                MapEvent.drawMultiPath([GLOBAL.Constant.iNormal, GLOBAL.Constant.iRapid]);
            }
        } catch (e) {
            console.log("Error occured in dealing with route, the error is:" + JSON.stringify(e));
        }
    }
};
/**
 * @class 地图操作类
 * @static
 **/
var MapEvent = {
    displayScale:function (src_gray, src) {
        if (Event.mapObj !== undefined) {
            //arr是页面实际显示的图片名称，调用相应图片，arr_scale是由3-18数字组成的数组，对应地图的缩放级别。两个数组是一一对应的关系
            var arr = GLOBAL.Constant.scale_range, index = 0, zoom = Event.mapObj.getZoom();

            //设置当前比例尺显示图片，由地图缩放级别确定
            var index = parseInt(zoom);
            var $img = $('<img>').attr('src', 'images/images/' + arr[18 - index] + '.png');
            $('#scale strong, #scale_light_cross strong').html($img);
            this.setZoomButtonState(zoom); //设置
            this.setTrafficBubbleState(zoom);//调整交通信息气泡的显示状态
        }
    },
    //设置放大、缩小按钮的状态
    setZoomButtonState:function (zoom) {
        var constant = GLOBAL.Constant, zoom_in_btn = this.getZoomInButton() , zoom_out_btn = this.getZoomOutButton();
        //设置放大、缩小按钮状态(是否需要置为灰色背景)
        if (zoom_in_btn.attr("src").match(/_gray(\.png)$/) != null && zoom != GLOBAL.Constant.iMaxZoom)
            Tab.displayNormalImg({'ele':zoom_in_btn, 'attr':'src'});
        if (zoom_out_btn.attr("src").match(/_gray(\.png)$/) != null && zoom != GLOBAL.Constant.iMinZoom)
            Tab.displayNormalImg({'ele':zoom_out_btn, 'attr':'src'});

        switch (zoom) {
            case GLOBAL.Constant.iMaxZoom://最大缩放级别
                //放大按钮不可用
                Tab.gray_img({'ele':zoom_in_btn, 'attr':'src'});
                break;
            case GLOBAL.Constant.iMinZoom://最低缩放级别
                //缩小按钮不可用
                Tab.gray_img({'ele':zoom_out_btn, 'attr':'src'});
                break;
            default:
                break;
        }
    },
    //取得放大按钮Bt
    getZoomInButton:function () {
        var zoom_in_btn = $('#zoom_in img');//地图界面按钮
        if (!zoom_in_btn.is(':visible') || !zoom_in_btn.is('img')) {
            zoom_in_btn = $('#zoom_in_light_cross');//双光柱界面按钮
        }
        return zoom_in_btn;
    },
    //取得缩小按钮
    getZoomOutButton:function () {
        var zoom_out_btn = $('#zoom_out img');//地图界面按钮
        if (!zoom_out_btn.is(':visible') || !zoom_out_btn.is('img')) {//双光柱界面缩小按钮
            zoom_out_btn = $('#zoom_out_light_cross');
        }
        return zoom_out_btn;
    },
    //调整交通信息气泡的显示状态
    setTrafficBubbleState:function (zoom) {
        //不是双光柱或全图浏览界面
        if (!$('#light_cross_html').is(':visible') && $('#poi_current').val() != '全图浏览') {
            if (zoom < GLOBAL.Constant.iMinTrafficPanelLevel)//当前比例尺高于3km，隐藏气泡
                GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();
            else
                GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoom);
        }
    },
    displayChosenScale:function () {
        Event.mapObj.setZoom(localStorage["Map_scale"]);
        this.displayScale();
    },
    deleteOverlays:function () {
        Event.mapObj.removeOverlays(['target']);
//        MapEvent.add_current_overlay();
        $(document).find('svg').hide();
    },
    changePointArrow:function (instance) {
        if (Event.mapObj.getOverlays('target')) {
            var currentLngLat = {
                fLatitude:localStorage['Map_lat'],
                fLongitude:localStorage['Map_lng']
            };
            GLOBAL.NavClass.updatePointingDirection(currentLngLat);
        }
    },
    setTurnMarkerState:function (obj) {
        var marker = Event.mapObj.getOverlaysByType('marker'), idPrefix = GLOBAL.Constant.turnMarkerIdPrefix;
        $.each(marker, function (i, n) {
            if (n.id.indexOf(idPrefix) > -1) {
                obj.state ? n.show() : n.hide();
            }
        });
    },

    /**
     * @description 以下方法可以考虑使用poly对象的 hide()方法实现
     */
    setPolylineState:function (bool) {
        var polyline = Event.mapObj.getOverlaysByType('polyline');
        $.each(polyline, function (i, n) {
            bool ? n.show() : n.hide();
        });
    },
    setOverlayStateById:function (obj) {
        var overlay = Event.mapObj.getOverlays(obj.id);
        if (overlay) {
            overlay.visible = obj.state;
            obj.state ? overlay.show() : overlay.hide();
        }
    },

    /**
     @description 添加转折mark处覆盖物
     */
    addMarkerOverlay:function (config) {
        if (Event.mapObj && config) {
            var config_mark = {
                coord:new MMap.LngLat(config.lng, config.lat),
                img:config.img,
                imageOffset:config.imageOffset,
                autoRotation:true,
                id:config.id // by Zhen Xia
            };
            var marker_mark = MapEvent.add_icon(config_mark);
            //添加终点覆盖物
            Event.mapObj.addOverlays(marker_mark);
        }
    },
    /**
     @description 添加指向目的地方向尖头
     **/
    add_destn_direction:function () {
        var destnDirection = new MMap.Marker({
            id:'destnDirection',
            position:new MMap.LngLat(Event.mapObj.getOverlays('current').position.lng, Event.mapObj.getOverlays('current').position.lat),
            icon:'images/images/direction_1.png',
            offset:new MMap.Pixel(-34, -36),
            visible:true
        });
        Event.mapObj.addOverlays(destnDirection);
    },
    /**
     @description 添加所有转折处的红色标志覆盖物
     */
    AddMarkerOverlays:function (arrMarker) {
        var arr_mark = arrMarker, that = this , idPrefix = GLOBAL.Constant.turnMarkerIdPrefix;
        $.each(arr_mark, function (i, n) {
            var config = {
                lng:n.startLon,
                lat:n.startLat,
                img:(i == 0 ? GLOBAL.Constant.mark_img_start : GLOBAL.Constant.mark_img),
                imageOffset:(i == 0 ? new MMap.Pixel(32, 27) : new MMap.Pixel(35, 31)),
                id:idPrefix + i //添加id by Zhen Xia
            };
            that.addMarkerOverlay(config);
        });
        $('#map img[src$="starting_point.png"]').parent().parent().css('z-index', 0);
    },
    getCoordsArray:function (config) {
        var tbt = config.tbt,
            glist = tbt.GetSegmentNum(), path = [];
        for (var i = 0; i < glist; i++) {
            var coors = tbt.GetSegCoor(i);
            if (coors == null) {
                return;
            }
            var s = 0;
//            TODO 如果是较长路径，每个segment只取一个点，组成一条路径，用这条路径绘制，会快很多。还没有加上尾点。多长路径简化点还未确定。北京到西藏约glist>80 上海到北京40左右。张磊说可能接口解决
//            if (glist < 40) {
            for (var m = 0; m < coors.length - 1; m += 2) {
                path.push(new MMap.LngLat(coors[m], coors[m + 1]));
            }
//            }
//            else {
//                path.push(new MMap.LngLat(coors[0], coors[1]));
//            }
        }
        return path;
    },
    setIniMapState:function () {
        this.add_current_overlay();
        this.mapOperate();
    },
    mapOperate:function () {
        if (Event.mapObj.getOverlaysByType('polyline').length > 0) {
            console.log('there are polylines on the map that affect the dragging behaviour');
        }
        this.drag(Event.mapObj);
        //绑定zoomChange事件无效？
        Event.mapObj.bind(Event.mapObj, 'zoomChange', function () {
            console.log('change');
        });
        //显示GPRS状态
        thisPage.$gprs_img.attr('src', 'images/images/gprs01.png');
    },
    drag:function (obj) {
        if (obj.getStatus().dragEnable == false) {
            obj.setStatus({dragEnable:true})
        }
        Event.mapObj.bind(Event.mapObj, 'dragging', MapEvent.drag_map);
        //Event.mapObj.bind(obj, 'mousemove', this.drag_map);
        //电容屏或手机上可能要使用touchmove事件
        Event.mapObj.bind(Event.mapObj, 'touchmove', MapEvent.drag_map);
    },
    /**
      * 鼠标在地图上拖动时，地图中心始终显示当前地图中心位置的目的地图标，在dragging或touchmove时触发
      **/
    drag_map:function (data) {
        //ui设置
        var currentState = GLOBAL.Event.NGIStateManager.getCurrentState(), constant = GLOBAL.Constant;
        if (!(currentState == GLOBAL.Constant.NGIStates.MapRoadSegment || currentState == GLOBAL.Constant.NGIStates.MapOverview)) {
            uiManager.unNaviDragState();
        }
    },
    /**
     * @description 只画一条路径，不高亮显示
     */
    drawOnePath:function (pathArray) {
        var constant = GLOBAL.Constant;
        var drawLine = new NGIPolyLine({
            path:pathArray,
            lineStyle:[GLOBAL.Constant.outer_line, GLOBAL.Constant.inner1_line, GLOBAL.Constant.inner2_line, GLOBAL.Constant.center_line]
        });
        drawLine.addMultiPolyline();
    },
    /**
     * 同时画两条路径，并高亮其中一条
     * @param typeArray [normal,rapid]
     */
    drawMultiPath:function (typeArray) {
        var constant = GLOBAL.Constant, drawLine, lineStyle = [GLOBAL.Constant.outer_line, GLOBAL.Constant.inner1_line, GLOBAL.Constant.inner2_line, GLOBAL.Constant.center_line];
        for (var i = 0; i < typeArray.length; i++) {
            var pathType = typeArray[i], path;
            if (pathType == GLOBAL.Constant.iNormal) {
                path = GLOBAL.Constant.nav_obj.normalPathArray;
            } else if (pathType == GLOBAL.Constant.iRapid) {
                path = GLOBAL.Constant.nav_obj.rapidPathArray;
            }
            drawLine = new NGIPolyLine({
                path:path,
                lineStyle:lineStyle
            });
            drawLine.addMultiPolyline();
        }
        //高亮一条路线
        Event.mapObj.getOverlays(GLOBAL.Constant.HighlightedLineId).setOptions({strokeColor:GLOBAL.Constant.iStrokeColor});
    },
    /**
     *@description 添加自车位置覆盖物
     **/
    add_current_overlay:function () {
        if (Event.mapObj) {
            var config_start = {
                id:'current',
                coord:new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']),
                img:GLOBAL.Constant.current_img,
                //自车位置覆盖物图标偏移,使其在导航时位于路径当中
                offset:new MMap.Pixel(-34, -36)
            };
            var marker_start = this.add_icon(config_start);
            Event.mapObj.addOverlays(marker_start);
            document.getElementById('current').style.pointerEvents = 'none';
        }
    },

    //添加终点位置覆盖物
    add_target_overlay:function () {
        var constant = GLOBAL.Constant;
        if (Event.mapObj) {
            var config_target = {
                coord:new MMap.LngLat(localStorage['Map_poi_lng'], localStorage['Map_poi_lat']),
                img:GLOBAL.Constant.flag_img,
                //size: new MMap.Size(156, 158),
                //imageOffset: new MMap.Pixel(24, 50),
                id:'target',
                offset:new MMap.Pixel(-19, -57)
            };
            var marker_target = this.add_icon(config_target);
            //添加终点覆盖物
            Event.mapObj.addOverlays(marker_target);
        }
    },

    //判断是否规划了路径
    determine_path:function () {
        return Event.mapObj.getOverlaysByType('polyline').length != 0;
    },
    /**
     * @description 绘制右侧动态光柱
     **/
    drawLight:function (config) {
        var arrTMC = tbt.CreateTMCBar(config.pass, config.ken);
        arrTMC = Tab.changeTmcLightCrossData(arrTMC);
        if (config.callback) {
            config.callback(arrTMC);
        }
        return arrTMC;
    },

    //设置地图缩放级别为17，及比例尺ui显示
    setZoom_17:function () {
//		var center = Event.mapObj.getCenter();
        Event.mapObj.setZoom(17);
        $('#scale img').attr('src', "images/images/50m.png");
        thisPage.$zoom_in_img.attr('src', GLOBAL.Constant.scale_up);
//		this.pan_center(center);
    },
    /**
     * 获取地图上点的位置的标注
     * @param[object] 设置覆盖物的位置、图片、大小、id等属性。包括img, size, id, coord属性，其中coord为必有属性
     * @return 标注点类型的覆盖物对象
     * markerOptions 局部变量，由函数内部定义，可通过param改变属性
     **/
    add_icon:function (config) {

        var markerOptions = {}/*new MarkerOption()*/;
        //设置覆盖物标注点类型的图片url
        if (!config.img)
            config.img = GLOBAL.Constant.current_img;
        markerOptions.icon = new MMap.Icon({
            image:config.img,
            //size:图标所在区域长宽
            size:config.size ? new MMap.Size(config.size.width, config.size.height) : new MMap.Size(68, 69),
            //图标偏移量，相对于markerOptions.offset定义的div
            imageOffset:config.imageOffset ? config.imageOffset : new MMap.Pixel(0, 0)
        });
        //else
//		markerOptions.icon = config.img;
        //设置标注点类型覆盖物的id属性
        if (config.id) {
            //如果id重复，会自动删除过去添加的同值id覆盖物
            markerOptions.id = config.id;
        }
        else {
            //markerOptions.id = Event.num_des;
//		//生成下一个标注点类型覆盖物的id属性值
//		Event.num_des ++;
        }
        markerOptions.position = config.coord;
        //对象相对于基点的偏移量。保证覆盖物图片中心位于基点中心
        markerOptions.offset = config.offset ? config.offset : new MMap.Pixel(-38, -38);
        //设置标注点类型覆盖物的宽高
        //markerOptions.imageSize = new MSize(50, 50);
        //通过经纬度坐标及参数选项确定标注点类型覆盖物的信息
        var marker = new MMap.Marker(markerOptions);

        return marker;
    },

    //移动自车位置到指定位置：1，地图中心坐标，2，实际自车位置坐标
    pan_center:function (objCenter) {
        var current = Event.mapObj.getOverlays('current'),
            poly = Event.mapObj.getOverlaysByType('polyline');
        //没有规划线路，同时目的地图标隐藏时，比例尺缩放时需移动自车位置到指定坐标
        try {
            if (poly.length == 0 && $('#crossCursor').is(':hidden')) {
                current.setPosition(new MMap.LngLat(objCenter.lng, objCenter.lat));
            }
            else if (poly.length !== 0) {
                //var	center = Event.mapObj.getCenter();
//			Event.mapObj.panTo(center);
            }
        }
        catch (e) {
            console.log(e.message);
        }
    },
    //添加实时交通图
    addTmc:function () {
        var tmc = new MMap.TileLayer({
            zIndex:10,
            //如果添加id属性，必须保证其不发生冲突，否则将不显示
            id:'traffic_layer',
            getTileUrl:function (x, y, z) {
                return "http://tm.mapabc.com/trafficengine/mapabc/traffictile?v=1.0&t=1&zoom=" + (17 - z) + "&x=" + x + "&y=" + y;
            }
        });
        //如果指定id的交通图层存在，就先删除
        if (Event.mapObj.getLayer('traffic_layer')) {
            Event.mapObj.removeLayer('traffic_layer');
        }
        //如果动态交通里的功能设定页面没有选择显示动态交通信息，则不添加交通图层，如果未设置过该选项，则本地变量未初始化
        if (!!eval(localStorage['Map_tbt_display'])) {
            Event.mapObj.addLayer(tmc);
        }
    },
    removeTmc:function () {
        if (Event.mapObj.getLayer('traffic_layer')) {
            Event.mapObj.removeLayer('traffic_layer');
        }
    },
    //获取目的地或地图中心坐标，作为当前兴趣点1，有目的地图标；2，只有自车位置图标
    get_center:function () {
        var constant = GLOBAL.Constant;
        if (Event.mapObj !== undefined) {
            var center = Event.mapObj.getCenter();
            //获得地图中心位置坐标，作为收藏和周边检索的中心点
            GLOBAL.Constant.poi_search_result.lng = center.lng;
            GLOBAL.Constant.poi_search_result.lat = center.lat;
        }
        return center;
    },
    /**
     * @event 放大地图工具函数
     */
    zoomInUtil:function () {
        var constant = GLOBAL.Constant;
        var level = Event.mapObj.getZoom();
        if (level >= GLOBAL.Constant.iMaxZoom) {
            return;
        }
        if (level < GLOBAL.Constant.iMaxZoom) {
            MapEvent.zoomInOut(GLOBAL.Constant.iLeave_zoomin);
        }
        MapEvent.displayScale();
        MapEvent.addTmc(Event.mapObj);
        //设置下载加载地图时显示的比例尺
        if (GLOBAL.Event.NGIStateManager.getCurrentState() !== GLOBAL.Constant.NGIStates.LightCross) {
            localStorage['Map_scale'] = level + 1;
        }
    },
    /**
     * @event 缩小地图工具函数
     */
    zoomOutUtil:function () {
        var constant = GLOBAL.Constant;
        var level = Event.mapObj.getZoom();
        if (level <= GLOBAL.Constant.iMinZoom) {
            return;
        }
        if (level > GLOBAL.Constant.iMinZoom) {
            MapEvent.zoomInOut(GLOBAL.Constant.iLeave_zoomout);
        }
        MapEvent.displayScale();
        MapEvent.addTmc();
        //设置下载加载地图时显示的比例尺
        if (GLOBAL.Event.NGIStateManager.getCurrentState() !== GLOBAL.Constant.NGIStates.LightCross) {
            localStorage['Map_scale'] = level - 1;
        }
    },
    /**
     @description 缩放地图并设置地图中心到原中心
     */
    zoomInOut:function (config) {
        var constant = GLOBAL.Constant;
        if (config == GLOBAL.Constant.iLeave_zoomout) {
            Event.mapObj.zoomOut();
        }
        else if (config == GLOBAL.Constant.iLeave_zoomin) {
            Event.mapObj.zoomIn();
        }
        MapEvent.changePointArrow(GLOBAL.Constant.nav_obj);
    },
    determin_distance:function (coord_target) {
        var constant = GLOBAL.Constant;
        //计算当前地图中心与自车位置距离
        var distance = 0, current = null;
        current = new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']);
        var target = coord_target || new MMap.LngLat(GLOBAL.Constant.poi_search_result.lng, GLOBAL.Constant.poi_search_result.lat);
        distance = Event.mapObj.getDistance(current, target);
        distance = Tab.unit_conversion(distance, 1);
        return distance;
    },
    choosePathSetColor:function () {
        var polylineNum = GLOBAL.Event.mapObj.getOverlaysByType('polyline').length;
        if (polylineNum > 4) {
            //只保留高亮的路径
            Event.mapObj.removeOverlays(["NGIRoute0", "NGIRoute1", "NGIRoute2", "NGIRoute3"]);
            Event.mapObj.getOverlays(GLOBAL.Constant.HighlightedLineId).setOptions({strokeColor:GLOBAL.Constant.inner1_line.strokeColor});
        }
        else {
            Event.mapObj.getOverlays("NGIRoute1").setOptions({strokeColor:GLOBAL.Constant.normal_stroke_color});
        }
    }, /**
     * @description 双光柱页面点击导航按钮后，选择导航路线，删除多余路径，设置路径颜色,开始导航
     **/
    navDirectly:function () {
        tbt.SelectRoute(localStorage['route_type']);
        GLOBAL.Constant.nav_obj.StartGpsNavi();
    },
    /**
     * @description [function] loadError 一条路径都请求不到，loadError方法，数据加载失败时调用
     */
    loadError:function () {
        var layer = GLOBAL.layer.createNew({
            id:"confirm_box",
            msg:GLOBAL.Constant.prompt_netFail,
            sureCallback:switchToMapInterface
        });
        layer.show();
    },
    //指定经纬度坐标值加载地图,1,以自车坐标为中心加载地图，2，以目的地坐标为中心加载地图
    showLocation:function (config) {
        var constant = GLOBAL.Constant;
        //如果没有传递参数，以自车位置为中心生成地图
        if (config === undefined) {
            config = {
                lng:localStorage['Map_lng'],
                lat:localStorage['Map_lat']
            }
        }
        var mapOptions = {
            //初始化地图时设置的缩放级别，目前设置为14，如果希望放大到最大级别，可设置为18
            level:Number(localStorage['Map_scale']),
            zooms:[GLOBAL.Constant.iMinZoom, GLOBAL.Constant.iMaxZoom],
            /**
             * @event 暂不设置地图的双击放大和滚轮缩放功能。
             */
            doubleClickZoom:false,
            scrollWheel:false
        };
        if (arguments[1] !== undefined) {
            mapOptions.center = new MMap.LngLat(arguments[1], arguments[0]);
        }
        else {
            mapOptions.center = new MMap.LngLat(config.lng, config.lat);
        }

        mapOptions.defaultTileLayer = new MMap.TileLayer({
            id:"cdn", //唯一ID
            zIndex:1, //图层叠加顺序
            tileSize:256
            //tileUrl:"http://webrd0{1,2,3,4}.is.autonavi.com/appmaptile?x=[x]&y=[y]&z=[z]&lang=zh_cn&size=1&scale=1&style=7" //amap取图地址
        });
        //测试id为map的对象是否存在，如果存在，加载图像
        if ($('#mmap')[0]) {
            //生成初始化地图，以当前位置或查找的poi位置为中心
            Event.mapObj = new MMap.Map('mmap', mapOptions);
            //定义地图回调函数
            Event.mapObj.defaultTileLayer.getTileUrl = function (x, y, z) {
                return businessManager.setTileUrl(x, y, z);
            }
            MapEvent.addTmc();
        }
        //显示比例尺
        MapEvent.displayScale();
        //初始化交通信息气泡开关
        GLOBAL.Event.NavScreenEvent.initTrafficMessageBubbles();
    },
    /**
     * @event 绑定放大按钮点击事件
     */
    setMapZoom:function (img_zoom_in_gray, img_zoom_out) {
        $('#zoom_in, #zoom_in_light_cross').live('click', function () {
            MapEvent.zoomInUtil();
        });
        $('#zoom_out, #zoom_out_light_cross').live('click', function () {
            MapEvent.zoomOutUtil();
        });
    },
    /**获取地图上所有polyline的形状点数组，合并成一个数组返回
     *
     * @param mapObj
     */
    getPathArray:function () {
        var polylines = Event.mapObj.getOverlaysByType('polyline'), pathArray = [];
        if (polylines.length == 4 || polylines.length == 8) {//用4条path表示一条path的情形
            if (polylines.length == 4) pathArray = polylines[0].path;
            else pathArray = polylines[0].path.concat(polylines[4].path);//用8条path表示两条path的情形
        }
        else if (polylines.length == 1 || polylines.length == 2) {//用1条path表示一条path
            if (polylines.length == 1) pathArray = polylines[0].path;
            else
                pathArray = polylines[0].path.concat(polylines[1].path);
        }
        return pathArray;
    }
}
/**
 * @param config 包含路径数组以及路线样式
 * @constructor  调用mapsdk中的函数来绘制多边线表示导航的路径
 */
function NGIPolyLine(config) {
    this.path = config.path;//多段线经纬度数组
    this.lineStyle = config.lineStyle; //线段的样式,支持样式数组传入
}
NGIPolyLine.StrokeColor = GLOBAL.Constant.iStrokeColor;
NGIPolyLine.mapObj = Event.mapObj;
NGIPolyLine.prototype = {
    /**
     * @param config 多边线的样式
     * 绘制一条多边线
     */
    addOnePolyline:function (config) {
        var path = this.path;
        this.id = Event.mapObj.getOverlaysByType('polyline').length;
        var line = new MMap.Polyline({
            path:path,
            id:"NGIRoute" + this.id++,
            strokeColor:config.strokeColor, //线颜色
            strokeOpacity:config.strokeOpacity, //线透明度
            strokeWeight:config.strokeWeight, //线宽
            fillOpacity:config.fillOpacity,
            fillColor:config.fillColor
        });
        Event.mapObj.addOverlays(line);
    },
    /**
     * 一次添加多条多边线
     */
    addMultiPolyline:function () {
        var lineStyle = this.lineStyle, that = this;
        $.each(lineStyle, function (i, n) {
            that.addOnePolyline(n);
        });
    }
};

GLOBAL.Event.NavScreenEvent = {
    //检索结果界面跳转到地图界面
    showSearchResultInMapScreen:function (options) {
        businessManager.rsItemListener(options);
        uiManager.view_detail();
        return true;
    },
    //主菜单界面跳转子界面事件
    showNextInterfaceScreen:function (options) {
        frames[0].location.href = '../main_menu/' + options.nextPage;
        return true;
    },
    //地图导航状态界面
    showNaviMapScreen:function () {
        uiManager.naviInitialState();
        businessManager.navi_Map();
        return true;
    },
    //地图未导航状态界面
    showInitMapScreen:function () {
        uiManager.unNaviInitialState();
        businessManager.init_Map();
        return true;
    },
    //显示双光柱界面
    showLightCrossScreen:function () {
        if (parent.window.iframeObj)
            parent.window.iframeObj.remove();
        else
            iframeObj.remove();
        uiManager.lightCross_ui();
        businessManager.init_lightCross();
        return true;
    },
    //从安全界面到主界面
    showMapScreen:function () {
        uiManager.unNaviInitialState();
        businessManager.default_map_ini();
        return true;
    },
    //显示主菜单界面
    showMainMenuScreen:function () {
        var param = {
            name:"main_menu",
            src:"../main_menu/index.html"
        };
        iframeObj.showAndSkip(param);
        return true;
    },
    //显示目的地检索界面
    showPoiSearchByKeywordScreen:function () {
        var param = {
            id:"iframeHTML",
            name:"destn",
            src:"../main_menu/destn/index.html"
        };
        iframeObj.setIframe(param);
        iframeObj.show();
        return true;
    },
    //显示周边检索界面
    showNearBySearchScreen:function () {
        MapEvent.get_center();
        var param = {
            id:"iframeHTML",
            name:"rim",
            src:"../rim/index.html"
        };
        iframeObj.setIframe(param);
        iframeObj.show();
        return true;
    },
    //显示添加到收藏界面
    showAddToFavoritesScreen:function (options) {
        var regeocodeCallback = options.regeocodeCallback;
        if ($('#details').is(':hidden')) {
            //获取地图中心坐标，作为当前兴趣点
            MapEvent.get_center();
            Tab.coord_regeocode(GLOBAL.Constant.poi_search_result.lng, GLOBAL.Constant.poi_search_result.lat, regeocodeCallback);
        }
        else {
            var param = {
                id:"iframeHTML",
                name:"favorite",
                src:"../main_menu/favorite/add.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();

        }
        return true;
    },
    //显示GpsInfo界面
    showGpsInfoScreen:function () {
        businessManager.showGpsInfoScreen();
        return true;
    },
    //显示模拟导航界面
    showEmulatorScreen:function () {
        uiManager.simulator_ui();
        businessManager.showEmulatorScreen();
        return true;
    },
    //显示分段浏览界面
    showRoadSegInfoScreen:function () {

        var param = {
            id:"iframeHTML",
            name:"subsection",
            src:"subsection.html"
        };
        iframeObj.setIframe(param);

        iframeObj.show();

        return true;
    },
    //分段道路信息地图浏览
    showMapRoadSegmentScreen:function () {
        //修改uiManager.setPageState与businessManager.showMapRoadSegmentScreen的执行顺序 by Zhen Xia
        uiManager.subsection_ui();
        businessManager.showMapRoadSegmentScreen();
        return true;
    },
    //显示全图浏览界面
    showMapOverviewScreen:function () {
        businessManager.showMapOverviewScreen();
        uiManager.full_figure();
        return true;
    },
    //显示详细信息界面
    showViewPoiDetailScreen:function () {
        businessManager.showViewPoiDetailScreen();
        return true;
    },
    //返回详细信息界面
    showReturnViewPoiDetailScreen:function () {
        iframeObj.show();
        return true;
    },
    //显示路径选项界面
    showPathOptionsScreen:function () {
        var param = {
            id:"iframeHTML",
            name:"path",
            src:"../main_menu/path/index.html"
        };
        iframeObj.setIframe(param);
        iframeObj.show();

        return true;
    },
    //显示路径状态界面
    /*showTrafficConditionScreen : function () {
     var param={
     id:"iframeHTML",
     name:"conditions.",
     src:"../main_menu/traffic/conditions.html"
     };
     iframeObj.setIframe(param);
     iframeObj.show();

     return true;
     },*/
    //双光柱，路线详细页返回
    BackToLightCrossScreen:function (options) {
        MapEvent.setPolylineState(true);
        GLOBAL.NavClass.removeTurnMarkerState();
        Event.mapObj.removeOverlays('destnDirection');
        var pathArray = MapEvent.getPathArray();
        GLOBAL.common.MapUtil.setPathZoom(Event.mapObj, pathArray);
        uiManager.lightCross_ui();
        return true;
    },
    //返回地图界面
    ShowPreviousScreen:function (options) {
        var backUrl = options.backUrl;
        if (backUrl.indexOf("navigate/index.html") >= 0) {
            iframeObj.remove();
            var nextState = GLOBAL.Event.NGIStateManager.getNextState();
            var state = GLOBAL.Constant.NGIStates;
            switch (nextState) {
                case state.MapWithPoi :
                    uiManager.view_detail();
                    break;
                case state.Navigation :
                    if (GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
                        uiManager.simulator_ui();
                        businessManager.emulator_Map();
                    } else {
                        uiManager.naviInitialState();
                        businessManager.navi_Map();
                    }
                    break;
                case state.Map :
                    uiManager.unNaviInitialState();
                    businessManager.init_Map();
                    break;
                default:
                    console.log('unexpected state: ' + nextState);
                    break;
            }
        }
        else {
            iframeHTML.document.location.href = GLOBAL.Constant.WebPath + backUrl; //通过完整路径来跳转
        }
        return true;
    },
    //点击返回地图返回到地图界面
    showReturnToMapDirectlyScreen:function (options) {
        iframeObj.remove();
        if (GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
            uiManager.simulator_ui();
            businessManager.emulator_Map();
        } else {
            if (JSON.parse(localStorage['tbt_state'])) {
                uiManager.naviInitialState();
                businessManager.navi_Map();
            } else {
                uiManager.unNaviInitialState();
                businessManager.init_Map();
            }
        }
        return true;
    },
    initTrafficMessageBubbles:function () {
        var traffic_panel_on = GLOBAL.Traffic.messagePanel.isTrafficPanelOn();
        btnToggle = $('#traffic_panel_toggle img');
        if (!traffic_panel_on) {//恢复UI状态
            btnToggle.attr('alt', "打开情报板").attr('src', "images/images/bubble_disable.png");
        } else {
            if (btnToggle.attr('alt') != "关闭情报板")//恢复出厂时，如果之前开关已关闭
                btnToggle.attr('alt', "打开情报板").attr('src', "images/images/bubble_enable.png");
            var zoomLevel = Event.mapObj.getZoom();
            GLOBAL.Traffic.messagePanel.add_traffic_bubbles(zoomLevel);
        }
    }
};