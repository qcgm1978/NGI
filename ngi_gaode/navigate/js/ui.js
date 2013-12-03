/**
 * @class ThisPage类继承自Core.js中的Class类
 * @function {function} initialize 初始化
 * @function {function} initializeDOM 初始化DOM元素
 * @function {function} initializeEvent 事件绑定
 **/

(function () {
    var ThisPage = {
        initialize:function () {
            /**
             * @param 设置选择路径的默认值
             **/
            localStorage['route_type'] = GLOBAL.Constant.iRapid;
            this.retMapIni = function (state) {
                if (!GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
                    businessManager.panMapToCurrentCar();
                }
                if (state == 'mapIni') {
                    uiManager.unNaviInitialState();
                    MapEvent.setPolylineState(false);
                    MapEvent.setOverlayStateById({
                        id:'target',
                        state:false
                    });
                    MapEvent.setOverlayStateById({
                        id:'destnDirection',
                        state:false
                    });
                    MapEvent.setTurnMarkerState({state:false});
                    Event.mapObj.setStatus({dragEnable:true});
                    MapEvent.displayChosenScale();
                    Event.mapObj.setRotation(0);
                }
                else {
                    MapEvent.setOverlayStateById({
                        id:'target',
                        state:true
                    });
                    Event.mapObj.setStatus({dragEnable:false});
                    MapEvent.setPolylineState(true);
                    MapEvent.setOverlayStateById({id:'target', state:true});
                    //MapEvent.setTurnMarkerState({state: true});
                    MapEvent.displayChosenScale();
                    GLOBAL.NavClass.updatePointingDirection();
                    $('#emulatorNaviCurrRoad').hide();
                    MapEvent.setOverlayStateById({
                        id:'destnDirection',
                        state:true
                    });
                    MapEvent.setTurnMarkerState({state:true});
                    MapEvent.changePointArrow(GLOBAL.Constant.nav_obj);
                    $('svg').show();
                    if (GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
                        GLOBAL.Constant.nav_obj.ResumeEmulator();
                        return;
                    }
                    uiManager.naviInitialState();
                }
            };
            //初始化状态机，初始状态为map
            GLOBAL.Event.NGIStateManager = new NGIStateManager(GLOBAL.Constant.NGIStates.Map);
            var href = location.href , i = href.indexOf('/navigate'), path = href.substring(0, i);
            GLOBAL.Constant.WebPath = path + '/'; //获取站点根目录路径
        },
        initializeDOM:function () {
            var arr_ele = ['#zoom_in_light_cross', '#zoom_out_light_cross', '#zoom_out img', '#zoom_in img', '#center figcaption', '#light_cross_html', '#gprs img', '.navi_menu li', '#gpsNaviCurrRoad', '#crossCursor', '#iframeDiv', '#center', '#current_pos', '#poi_current', '#navi_menu_warp_left,#navi_menu_warp_right', '#navi_menu_warp', '#bg_light_cross', '#subsection', '#details', '#right figure', '#reach_time', '#add_favor', '#rim', '#pull_back_btn img', '#menu_extend', '#menu_extend img', '#menu_first', '#name input', '#search img:first', '#simulator img[alt="停止模拟"]', '#simulator img[alt="模拟速度"]', '#mark', '#input_first', '#nav', '#ret', '#compass'],
                arr_prop = ['zoom_in_light_cross', 'zoom_out_light_cross', 'zoom_out_img', 'zoom_in_img', 'center_figcaption', 'light_cross_html', 'gprs_img', 'navi_menu_li', 'gpsNaviCurrRoad', 'target', 'iframeDiv', 'center', 'current_pos', 'poi_current', 'navi_menu_warp_lr', 'navi_menu_warp', 'bg_light_cross', 'subsection', 'details', 'right_figure', 'reach_time', 'add_favor', 'rim', 'lower_left_button', 'menu_extend', 'menu_extend_img', 'menu_first', 'name_input', 'search_img', 'stop_navi', 'simulator_speed', 'mark', 'input_first', 'nav', 'ret', 'compass'];
            $.each(arr_ele, function (i, n) {
                this['$' + arr_prop[i]] = $(n);
            }.proxy(this));


            /**
             * @class 主界面ui显示，从不同页面进入实现不同功能状态下的地图ui
             * @description {function} normal 页面正常切换状态下的主界面显示
             * @description {function} view_detail （从搜索页面或收藏页面、详细信息页面的地图查看按钮进入）
             * @description {function} simulator 模拟导航状态，ui设置，需先调用ui.interface.route方法
             * @description {function} gps 真实GPS导航状态，ui额外设置
             **/
            ui.interface = {
                iniState:this.retMapIni,
                marker:this.change_direction_icon,
                request_path_failed:this.request_path_failed,
                request_path_now:this.request_path_now,
                lightCross:this.lightCross
            };
            this.$compass.bind('click', this.setCompass);
        },

        initCompass:function () {
            //初始化罗盘模式或地图向北模式的图标
            var compass = localStorage['Navi_Compass_Mode'];
            if (compass == 'NorthUp') {
                //加载指南针北向上图片
                this.$compass.attr('src', 'images/images/compass.png');
            } else {
                //加载车头向上图片
                this.$compass.attr('src', 'images/images/compass01.png');
//                Event.mapObj.setRotation(0);
//                $('#current').css('-webkit-transform', 'rotate(0deg)');
            }
            //初始化罗盘模式或地图向北模式的图标
//            localStorage['Navi_Compass_Mode'] = 'NorthUp';
//            this.$compass.attr('src', 'images/images/compass.png');
//            if (Event.mapObj)
//                Event.mapObj.setRotation(0);
//            $('#current').css('-webkit-transform', 'rotate(0deg)');
        },


        initializeEvent:function () {
            var statemanager = GLOBAL.Event.NGIStateManager, navscreenevent = GLOBAL.Event.NavScreenEvent,
                constant = GLOBAL.Constant, ngistates = GLOBAL.Constant.NGIStates;
            //快速路线、常规路线点击切换事件
            $('#fastSection, #normalSection, #fastLine, #normalLine').click(this.selectPathEle);
            //绑定返回按钮点击事件
            this.$ret.click(function () {
                thisPage.reSetNormalEvent();
                statemanager.goToPreviousState(navscreenevent.showInitMapScreen);
            });

            //绑定导航图片点击事件
            this.$nav.click(function () {
                statemanager.goToNextState(ngistates.Navigation, function () {
                    MapEvent.choosePathSetColor();
                    navscreenevent.showNaviMapScreen();
                    thisPage.reSetNormalEvent();
                    return true;
                });
                MapEvent.navDirectly();
            });
            /**
             * @description 点击路线详细按钮图片事件
             **/
            this.$input_first.click(function () {
                statemanager.goToNextState(ngistates.RoadSegInfo, navscreenevent.showRoadSegInfoScreen);
            });
            //显示GpsInfo信息
            $('#scale,#satellite').click(function () {
                //      statemanager.goToNextState(ngistates.GpsInfo,navscreenevent.showGpsInfoScreen);
            });
            //导航状态预计到达时间面板设置
            this.$reach_time
                .mouseover(function () {
                    $(this).css('cursor', 'pointer');
                })
                .click(function () {
                    statemanager.goToNextState(ngistates.PathOptions, navscreenevent.showPathOptionsScreen);
                });
            //进入分段浏览界面
            this.$right_figure.click(function () {
                statemanager.goToNextState(ngistates.RoadSegInfo, navscreenevent.showRoadSegInfoScreen);
            });

            //绑定查找按钮点击事件

            this.$search_img.click(function () {
                statemanager.goToNextState(ngistates.PoiSearchByKeyword, navscreenevent.showPoiSearchByKeywordScreen);
            });
            //绑定详细按钮点击事件
            this.$details.click(function () {
                statemanager.goToNextState(ngistates.ViewPoiDetail, navscreenevent.showViewPoiDetailScreen);
            });
            //左侧（#left元素事件）结束--}.proxy(this));

            //{-- 导航栏元素事件开始
            //重构：Rename Method 根据原有注释重新命名，并将注释中的常数说明转变为参数传入，即在location画面，当用户10秒内无操作，面板自动收缩。//如果设置了自动收缩面板功能，则在导航状态下亦收缩，该功能后期完善
            //this.pull_nav_menu_auto(10000);

            //绑定左下角按钮点击事件
            this.$lower_left_button.live('click', function () {
                this.click_lower_left_button();
            }.proxy(this));
            //设置放大缩小按钮功能
            MapEvent.setMapZoom('images/images/scale_up_gray.png', "images/images/scale_down.png");
            //绑定主菜单兼设终点按钮点击事件
            this.$menu_first.live('click', function () {
                this.click_menu_termination(this);
            }.proxy(this));
            //绑定周边检索按钮点击事件
            this.$rim.live('click', function () {
                statemanager.goToNextState(ngistates.PoiSearchNearby, navscreenevent.showNearBySearchScreen);
            });
            //绑定收藏按钮点击事件
            this.$add_favor.live('click', function () {
                statemanager.goToNextState(ngistates.AddToFavorites, navscreenevent.showAddToFavoritesScreen, { 'regeocodeCallback':this.add_data});
            }.proxy(this));
            //为目的地位置图标绑定事件
            this.$target.click(function () {
                //获取地图中心坐标，显示地址
                MapEvent.get_center();
                Tab.coord_regeocode(GLOBAL.Constant.poi_search_result.lng, GLOBAL.Constant.poi_search_result.lat, function (data) {
                    var list = data ? data.list : null;//判断是否取到数据

                    if (list) {
                        //if(list[0].poilist){//poi sdk与map abc regeo返回结果结构不一致
                        //var poi = list[0].poilist[0];
                        var poi = list[0];
                        var city = data.city;
                        var info = "";
                        if (poi.address) {
                            info += '<b>' + poi.address + '</b>' + '<br/>';
                        }
                        info += city + poi.name + '附近';
                        var inforWindow = new MMap.InfoWindow({
                            offset:new MMap.Pixel(-104, -105),
                            content:'<span style="font:12px/16px Verdana, Helvetica, Arial, sans-serif;">' + info + '</span>'
                        });
                        inforWindow.open(Event.mapObj, new MMap.LngLat(GLOBAL.Constant.poi_search_result.lng, GLOBAL.Constant.poi_search_result.lat));
                    }
                    //}
                });
            });
            //显示时间，目前使用系统时间，如GPS提供，优先显示GPS时间。
            Tab.startTime($('.navi_menu'));
            //分段浏览返回主界面页面，上一条和下一条按钮图片点击事件
            this.$subsection.click({ordinal:false, oldOrdinal:false}, function (e) {
                if (e.data.oldOrdinal != GLOBAL.Constant.newSubsection) {
                    e.data.oldOrdinal = GLOBAL.Constant.newSubsection;
                    e.data.ordinal = false;
                }
                var ordinal = e.data.ordinal;
                ordinal = (ordinal !== false ? ordinal : GLOBAL.common.LocalSave.read('Map_seg_center').ordinal);
                e.data.ordinal = ordinal;
                var $target = $(e.target),
                    i_item = ordinal - 1,
                    /**
                     * @function 动态获取行程Guide列表，路径重算时保证其存在，否则可能该条路径会被动态删除。以后可通过对重算进行判断决定是否重新计算(优化)。即根据GLOBAL.Constant.nav_obj.bReroute
                     * @obj_sub {Array} GuideItem数组
                     */
                        obj_sub = tbt.GetNaviGuideList();
                if ($target.attr('alt') == '上一条' && i_item > 0) {
                    var prev = obj_sub[i_item - 1];
                    Event.mapObj.setCenter(new MMap.LngLat(prev.startLon, prev.startLat));
                    thisPage.$poi_current.val(prev.roadName || constant.no_name_road);
                    e.data.ordinal--;
                }
                if ($target.attr('alt') == '下一条' && i_item < obj_sub.length) {
                    if (i_item == obj_sub.length - 1) {
                        Event.mapObj.setCenter(new MMap.LngLat(Event.mapObj.getOverlays('target').position.lng, Event.mapObj.getOverlays('target').position.lat));
                        thisPage.$poi_current.val(constant.destination);
                        e.data.ordinal = obj_sub.length + 1;
                    }
                    else {
                        var next = obj_sub[i_item + 1];
                        Event.mapObj.setCenter(new MMap.LngLat(next.startLon, next.startLat));
                        thisPage.$poi_current.val(next.roadName || constant.no_name_road);
                        e.data.ordinal++;
                    }
                }
                GLOBAL.NavClass.updatePointingDirection();
            });
            /**
             * @description 动态光柱按钮点击事件
             **/
                //导航栏元素事件结束 --}
                //{-- 右侧（#right)元素事件开始
            this.$bg_light_cross.click(function () {
                /**
                 @description 保存剩余距离和剩余时间
                 */
                var lightBarStateArr = GLOBAL.Constant.ViewDistanceArr, length = lightBarStateArr.length, currentLightBar = localStorage['Map_tbt_view'];
                var nextLightBarIndex = (lightBarStateArr.indexOf(currentLightBar) + 1) % length;//循环切换状态
                localStorage['Map_tbt_view'] = lightBarStateArr[nextLightBarIndex];
                //更新lightbar
                uiManager.showLightBar();
                /* var routeRemainDis = $('#routeRemainDis').html(),
                 routeRemainTime = GLOBAL.Constant.nav_obj.tbt_remain_miniute,common = GLOBAL.common;
                 common.LocalSave.save('Map_routeRemainDis', routeRemainDis);
                 common.LocalSave.save('Map_routeRemainTime', routeRemainTime);
                 statemanager.goToNextState(ngistates.TrafficCondition,navscreenevent.showTrafficConditionScreen);*/
            });


            //设置右侧收缩扩展功能。重构：Extract Method, Rename Method
            this.$menu_extend.click(function () {
                var re = /open\.png$/g;
                if (re.test($(this).find('img').attr('src'))) {
                    thisPage.display_assist_menu();
                } else {
                    thisPage.hide_assist_menu();
                }
            });
            //设置交通信息情报板点击事件
            $('#traffic_panel_toggle img').click(
                function () {
                    if ($(this).attr('alt') == '关闭情报板') {//关闭情报板
                        $(this).attr('alt', "打开情报板");
                        $(this).attr('src', "images/images/bubble_disable.png");
                        GLOBAL.Traffic.messagePanel.setTrafficPanelOn(false);
                        GLOBAL.Traffic.messagePanel.delete_traffic_bubbles();
                    }
                    else {//打开情报板
                        $(this).attr('alt', "关闭情报板");
                        $(this).attr('src', "images/images/bubble_enable.png");
                        GLOBAL.Traffic.messagePanel.setTrafficPanelOn(true);
                        var zoomLevel = Event.mapObj.getZoom();
                        GLOBAL.Traffic.messagePanel.add_traffic_bubbles(zoomLevel);
                    }
                }
            );
//            4s按钮点击搜索
            $('#four_s').click(function () {
                layerPoi.showProcessLayer();
                GLOBAL.common.saveMapCenter();
                var configSearchRim = {
                        type:GLOBAL.Constant.type_4s,
                        range:GLOBAL.Constant.search_4s_distance,
                        callback:function () {
                            layerPoi.hideProcessLayer();
                            if (parent.businessManager.noDataHandler.call(this)) {
                                return;
                            }
                            var config = {
                                searchInstance:this
                            };
                            GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchResult, businessManager.searchPoiButtonListener, config);
                        }
                    },
                    searchRim = new PoiSearchClass(configSearchRim);
                searchRim.handleEvent();
                businessManager.setNoDataPoiLayer(searchRim);
            });
            //停止模拟按钮图片点击事件
            this.$stop_navi.click(function () {
                GLOBAL.Constant.nav_obj.StopEmulator();
                GLOBAL.NavClass.restartGpsNav(constant.nav_obj);
            });
            /**
             * @description 模拟速度按钮图片点击事件，设置模拟导航的速度
             * @param iEmulatorSpeed 所设置的车速，单位公里/小时
             */
            this.$simulator_speed.toggle(
                function () {
                    $(this).attr('src', GLOBAL.Constant.lower_speed);
                    if (tbt) {
                        tbt.SetEmulatorSpeed(GLOBAL.Constant.tbt_speed_low);
                    }
                },
                function () {
                    $(this).attr('src', GLOBAL.Constant.middle_speed);
                    if (tbt) {
                        tbt.SetEmulatorSpeed(GLOBAL.Constant.tbt_speed_middle);
                    }
                },

                function () {
                    $(this).attr('src', GLOBAL.Constant.high_speed);
                    if (tbt) {
                        tbt.SetEmulatorSpeed(GLOBAL.Constant.tbt_speed_high);
                    }
                }
            );
        },

        //左侧#left元素工具函数
        /**
         * @description 根据网络情况，显示#gprs img元素显示图片
         **/
//        judgeGRPS:function () {
//            var timer_reloadMMap;
//            if (GLOBAL.common.checkNetBySdk({
//                typeOfServerObj:typeof MMap
//            })) {
//                console.log('no internet connection or connection to map server failed');
//                var timer_reloadMMap = setInterval(function () {
//                    reloadMMap();
//                }, 10000);   //10秒运行一次
//                function reloadMMap() {
//                    var constant = GLOBAL.Constant;
//                    $('script').each(function (index, elsements) {
//
//                        if ($(this).attr('src').indexOf(GLOBAL.Constant.source_sdk_link_02) >= 0) {
//                            $(this).remove();
//                            return false;
//                        }
//                    });
//                    var script = '<script type="text/javascript" src=' + GLOBAL.Constant.source_sdk_link_02 + '></script>';
//                    $('head').after(script);
//                    if (typeof MMap != 'undefined') {
//                        clearInterval(timer_reloadMMap);
//                    }
//
//                }
//
//                //连接不上网络，目前设置为自动刷新
//                //location.reload();
//            }
//            else {
//                //显示GPRS状态
//                this.$gprs_img.attr('src', 'images/images/gprs01.png');
//            }
//        },

        //左侧元素工具函数结束--}
        //{--菜单栏工具函数开始
        //点击左下角按钮处理函数
        click_lower_left_button:function (config) {

            var constant = GLOBAL.Constant, obj = GLOBAL.Constant.alt_lower_left_button,
                alt = this.$lower_left_button.attr('alt');
            switch (alt) {
                //绑定返回地图初始状态图片点击事件
                case obj.ini:
                {
                    if (Event.mapObj.getOverlaysByType('polyline').length == 0) {
                        this.$center.hide();
                        this.$details.hide();
                        this.expand_menu();
//                        MapEvent.pan_center(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                        BusinessManager.panMapToCurrentCar();
                    }
                    else {
                        if (ui.route) {
                            ui.route();
                        }
                    }
                    Event.mapObj.clearOverlaysByType('polyline');
                    businessManager.panMapToCurrentCar();
                    ;
                    break;
                }
                case obj.expand:
                {
                    this.expand_menu();
                    break;
                }
                case obj.expand_simulator:
                {
                    var layer = GLOBAL.layer.createNew({
                        id:'confirm_box',
                        msg:GLOBAL.Constant.prompt_forbid,
                        sureCallback:reEmulator
                    });

                    function reEmulator() {
                        GLOBAL.Constant.nav_obj.ResumeEmulator();
                    }

                    layer.show();
                    constant.nav_obj.Pause();
                    break;
                }
                case obj.contract:
                {
                    this.pull_back_menu(this);
                    break;
                }
                case obj.menu:
                {
                    this.expand_menu(this);
                    this.$lower_left_button.attr({
                        'alt':obj.road
                    });
                    break;
                }
                case obj.road:
                {
                    this.pull_back_menu(this);
                    this.$navi_menu_warp_lr.hide();
                    this.$navi_menu_warp.show();
                    this.$navi_menu_li.slice(2, 5).hide();
                    this.$current_pos.show();
                    this.$gpsNaviCurrRoad.val(this.$name_input.attr('nextRoad'));
                    this.$lower_left_button.attr({
                        'alt':obj.menu
                    });
                    break;
                }

                case obj.ret_pre:
                {
                    var nextState = GLOBAL.Event.NGIStateManager.getNextState();
                    var state = GLOBAL.Constant.NGIStates;
                    switch (nextState) {
                        case state.RoadSegInfo :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                                iframeObj.show();
                                return true;
                            });
                            break;
                        case state.PoiSearchResult :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                                iframeObj.show();
                                return true;
                            });
                            break;
                        case state.ViewPoiDetail :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                                iframeObj.show();
                                return true;
                            });
                            break;
                        case state.PathOptions :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                                iframeObj.show();
                                return true;
                            });
                            break;
                        default:
                            console.log('unexpected state: ' + nextState);
                            break;
                    }
                    break;
                }

                default:
                {
                    console.log('undefined value');
                    break;
                }
            }
        },
        //点击主菜单兼设终点按钮处理函数
        click_menu_termination:function () {
            if (this.$menu_first.attr('alt') == '设终点按钮') {
//                不能使用该方法，该方法会改变constant.poi_search_result的非经纬度值，导致进入详细页面错误
//                thisPage.save_poi_data();
                GLOBAL.Constant.poi_search_result.lng = MapEvent.get_center().lng;
                GLOBAL.Constant.poi_search_result.lat = MapEvent.get_center().lat;
                GLOBAL.Constant.nav_obj.handlePageLogic = GLOBAL.NavClass.displayDoubleLightLayer;
                GpsNav.prepareRequestPath();
            }
            else if (this.$menu_first.attr('alt') == '主菜单按钮') {
                GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MainMenu, GLOBAL.Event.NavScreenEvent.showMainMenuScreen);
            }
        },

        //加载路径时调用
        request_path_now:function () {
            GLOBAL.layer.createNew({id:"confirm_box", msg:constant.prompt_request}).show();
        },
        //路径规划失败调用函数
        request_path_failed:function () {
            function rePFailed() {
                Event.mapObj.setStatus({dragEnable:true});
                MapEvent.drag(Event.mapObj);
            }

            GLOBAL.layer.createNew({id:"confirm_box", msg:constant.prompt_netFail, sureCallback:rePFailed}).show();
        },
//        该方法已废弃，直接使用common.savePoiData(config);
//        save_poi_data:function () {
//            //修改活动状态poi坐标为当前地图中心点经纬度
//            var config = {
//                lng:GLOBAL.Event.mapObj.getCenter().lng,
//                lat:GLOBAL.Event.mapObj.getCenter().lat
//            };
//            return     common.savePoiData(config);
//        },
        //导航菜单自动收缩函数
        pull_nav_menu_auto:function (seconds) {
            var pullMethod = {
                pull:function () {
                    thisPage.pull_back_menu();
                    thisPage.hide_assist_menu();
                },
                naviPull:function () {
                    iframeObj.remove();
                    thisPage.retMapIni();
                    businessManager.panMapToCurrentCar();
                    return true;
                },
                unNaviPull:function () {
                    iframeObj.remove();
                    thisPage.$center.hide();
                    thisPage.$details.hide();
                    thisPage.$poi_current.hide();
                    thisPage.expand_menu(thisPage);
                    Event.mapObj.setStatus({dragEnable:true});
                    businessManager.panMapToCurrentCar();
                    return true;
                }
            }
            var constant = GLOBAL.Constant;
            var saver = new ScreenSaver({timeout:seconds, callback:function () {
                if (thisPage.$iframeDiv.is(':visible') || constant.nav_obj.naviStatus.emulNaviStatus) {
                    return;
                }
                var currentState = GLOBAL.Event.NGIStateManager.getCurrentState();
                if (!JSON.parse(localStorage['tbt_state'])) {
                    if (currentState == GLOBAL.Constant.NGIStates.LightCross || currentState == GLOBAL.Constant.NGIStates.MapRoadSegment) {
                        return;
                    }
                    if (thisPage.$target.is(':visible')) {

                        if (currentState == GLOBAL.Constant.NGIStates.MapWithPoi) {
                            GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Map, pullMethod.unNaviPull);
                        } else {
                            pullMethod.unNaviPull();
                        }
                    } else {
                        pullMethod.pull();
                        if (typeof Event.mapObj != 'undefined') {
                            Event.mapObj.setStatus({dragEnable:true});
                        }
                    }
                } else {
                    if (currentState == GLOBAL.Constant.NGIStates.MapRoadSegment || currentState == GLOBAL.Constant.NGIStates.MapOverview || currentState == GLOBAL.Constant.NGIStates.MapWithPoi) {
                        GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation, pullMethod.naviPull);
                    } else {
                        pullMethod.pull();
                    }
                }
                //判断收缩状态，是否继续收缩

                if (this.$navi_menu_warp.is(':visible')) {
                    window.clearTimeout(saver.timerID);
                    saver.timerID = window.setTimeout(function () {
                        saver.timeout()
                    }, seconds);
                }
            }});

        },

        //导航菜单收缩函数
        pull_back_menu:function () {

            $('.navi_menu li:not(#pull_back_btn, #zoom_in, #zoom_out, #time_right, #current_pos,#assist)').hide();
            var altStr = '展开按钮', constant = GLOBAL.Constant;
            //区分导航状态和非导航状态下的情况
            if (this.$lower_left_button.attr('alt') != '显示当前道路名称') {
                if (JSON.parse(localStorage['tbt_state'])) {
                    altStr = '显示当前道路名称';
                    this.$name_input.attr('nextRoad', typeof GLOBAL.Constant.nextRoadName == 'undefined' ? this.$name_input.val() : constant.nextRoadName);
                    this.$name_input.val(this.$current_pos.text());
                    this.$current_pos.hide();
                }
            }
            if (!GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
                this.$lower_left_button.attr({
                    'src':'images/images/menu_open.png',
                    'alt':altStr
                });
                //切换背景图片为半圆形图片
                this.$navi_menu_warp.hide();
                this.$navi_menu_warp_lr.show();
            }
        },
        //导航菜单展开函数
        expand_menu:function () {
            var constant = GLOBAL.Constant;
            $('img[alt="设终点按钮"]').attr({
                'alt':'主菜单按钮',
                src:'images/images/main_menu.png'
            });
            this.$navi_menu_li.slice(2, 5).show();
            this.$navi_menu_warp.show();
            this.$navi_menu_warp_lr.hide();
            this.$name_input.attr('nextRoad', typeof GLOBAL.Constant.nextRoadName == 'undefined' ? this.$name_input.val() : GLOBAL.Constant.nextRoadName);
            this.$name_input.val(this.$current_pos.text());
            this.$lower_left_button.attr({
                'src':'images/images/menu_close.png',
                'alt':'收缩按钮'
            });
            this.$current_pos.hide();
        },

        /** 点击收藏图片按钮函数工具
         * @description
         **/
        add_data:function (data) {

            //var name= address = tel= GLOBAL.Constant.null_value ;
            var list = data.list, constant = GLOBAL.Constant;
            if (list) {
                //if(list[0].poilist){//Poi sdk与mapabc返回结果不同
                //var poi = list[0].poilist[0];
                var poi = list[0];
                var config = {
                    lng:GLOBAL.Constant.poi_search_result.lng,
                    lat:GLOBAL.Constant.poi_search_result.lat,
                    name:poi.name,
                    address:poi.address,
                    tel:poi.tel
                };
                GLOBAL.common.savePoiData(config);
                //逆地址查询属异步调用，需在回调里跳转地址
                if (iframeObj) {
                    var param = {
                        id:"iframeHTML",
                        name:"favorite",
                        src:"../main_menu/favorite/add.html"
                    };
                    iframeObj.setIframe(param);
                    iframeObj.show();
                }
                //}
            }
        },

        lightCross:function (config) {
            var arg = {
                id:'light_bar',
                total:$('#light_bar').height(),
                arr:config,
                address:'images/images/bg_',
                metric:'height'
            };
            ui.testLight = new SimulatorLight(arg);
            var configArg = ui.testLight.generateArg();
            Tab.set_bg(configArg);
        },
        /**
         @description 车道信息显示ui
         */
        trafficLane:function (len) {
            this.$mark.find('span')
                .slice(1, len - 1)
                .css('background', 'url(../navigate/images/images/road_info_middle.png) no-repeat');
            var width = this.$mark.width();
            this.$mark
                .css('left', 800 / 2 - width / 2)
                .show();
        },
        //显示右侧辅助功能菜单
        display_assist_menu:function () {
            //改变图片src属性，即更改图片
            this.$menu_extend_img.attr('src', "images/images/volume_bar_close.png");
            //显示被隐藏的部分
            this.$menu_extend_img.css({'width':'52px', 'height':'52px'});
            this.$menu_extend_img.css({'padding-left':'13px', 'padding-right':'13px', 'padding-top':'5px'});
            $('#traffic_panel_toggle, #four_s').css('display', 'block');
            $('#shortcut ul').css('background-image', 'url(images/images/volume_bar.png)');
        },
        //隐藏右侧辅助功能菜单
        hide_assist_menu:function () {
            this.$menu_extend_img.attr('src', "images/images/volume_bar_open.png");
            this.$menu_extend_img.css({'width':'73px', 'height':'63px'});
            this.$menu_extend_img.css({'padding-left':'0px', 'padding-right':'0px', 'padding-top':'0px'});
            $('#traffic_panel_toggle, #four_s').css('display', 'none');
            $('#shortcut ul').css('background-image', '');
        },
        switchToMapInterface:function () {
            uiManager.unNaviInitialState();
        },
        //点击指南针,切换地图是否进入罗盘模式
        setCompass:function () {
            var cuurentState = GLOBAL.Event.NGIStateManager.getCurrentState();
//            全图浏览和分段浏览状态指南针不能点击
            if (cuurentState == GLOBAL.Constant.NGIStates.MapOverview ||
                cuurentState == GLOBAL.Constant.NGIStates.MapRoadSegment) {
                return;
            }
            var compass = localStorage['Navi_Compass_Mode'];
            if (compass == "HeadUp") {
                //北向上状态下设置指南针和地图
                thisPage.$compass.attr('src', 'images/images/compass.png');
                localStorage['Navi_Compass_Mode'] = "NorthUp";
                //设置地图方向
                if (Event.mapObj)
                    Event.mapObj.setRotation(0);
            } else {
                //车头向上状态下设置指南针和地图
                thisPage.$compass.attr('src', 'images/images/compass01.png');
                localStorage['Navi_Compass_Mode'] = "HeadUp";
            }
        },
        clearMapMainInterface:function () {
            Event.mapObj.clearOverlaysByType("polyline");//删除polyline类型覆盖物
            //Event.mapObj.clearOverlaysByType("marker");//删除marker类型覆盖物 by Zhen Xia
            Event.mapObj.removeOverlays([ 'target']);
        },

        /**
         * @description 确保快速线路所在元素被选中
         */
        reSetNormalEvent:function () {
            var $fastSection = $('#fastSection'), $normalSection = $('#normalSection');
            $fastSection.find('img[alt="单选按钮"]').attr('src', function (i, src) {
                return thisPage.selectImg(src, true)
            });
            $normalSection.find('img[alt="单选按钮"]').attr('src', function (i, src) {
                return thisPage.selectImg(src, false)
            });
            $fastSection.css('background-image', 'url("images/images/select01_on.png")');
            $normalSection.css('background-image', 'url("images/images/select01.png")');
            $('#fastLine').css('background-image', 'url("images/images/select02_on.png")');
            $('#normalLine').css('background-image', 'url("images/images/select02.png")');
            $('#light_cross_html nav section, #light_cross_html figure').unbind().click(thisPage.selectPathEle);
        },
        selectImg:function (src, bool) {
            if (bool) {
                if (!src.match(/_on\.png$/)) {
                    return src.replace(/(\.png)/, '_on$1');
                }
                return src;
            } else {
                if (src.match(/_on\.png$/)) {
                    return src.replace(/_on(\.png)/, '$1');
                }
                return src;
            }
        },
        highLightEle:function (config) {
            config.$ele
                .css(config.attr, function (index, value) {
                    value = value.replace(/(\.png)/, '_on$1');
                    return value;
                });
            config.$ele
                .find('.Jradio')
                .attr('src', function (index, value) {
                    value = value.replace(/(\.png)/, '_on$1');
                    return value;
                })
        },
        darkenEle:function (config) {
            config.$ele
                .css(config.attr, function (index, value) {
                    value = value.replace(/\_on(\.png)/, '$1');
                    return value;
                });
            config.$ele
                .find('.Jradio')
                .attr('src', function (index, value) {
                    value = value.replace(/\_on(\.png)/, '$1');
                    return value;
                })
        },
        selectPathUi:function (config) {
            var $selectedEle = $(config.ele).eq(config.index),
                $unselectedEle = $selectedEle.siblings();
            thisPage.highLightEle({
                $ele:$selectedEle,
                attr:'background-image'
            });
            thisPage.darkenEle({
                $ele:$unselectedEle,
                attr:'background-image'
            });
        },
        togglePathState:function (index) {
            if (index == 1) {
                localStorage['route_type'] = GLOBAL.Constant.iNormal;
            }
            if (index == 0) {
                localStorage['route_type'] = GLOBAL.Constant.iRapid;
            }
        },
        selectPathEle:function () {
//如果当前元素为非选中状态（选中状态时无变化）
            if (!$(this).css('background-image').match(/\_on\.png/)) {
                var indexClick = $(this).index(),
                    configSection = {
                        ele:'#light_cross_html nav section',
                        index:indexClick
                    },
                    configFigure = {
                        ele:'#light_cross_html figure',
                        index:indexClick
                    };
                thisPage.selectPathUi(configFigure);
                thisPage.selectPathUi(configSection);
                thisPage.togglePathState(indexClick);
                thisPage.exchangeTwoPath();
            }
            if (Event.mapObj.getOverlaysByType('polyline').length <= 4) {
                thisPage.toggleSingleLineColor("NGIRoute1");
            }
        },
        toggleSingleLineColor:function (polylineId) {
            var color = Event.mapObj.getOverlays(polylineId).getOptions().strokeColor,
                newColor = color == GLOBAL.Constant.normal_stroke_color ? GLOBAL.Constant.bright_stroke_color : GLOBAL.Constant.normal_stroke_color;
            Event.mapObj.getOverlays(polylineId).setOptions({strokeColor:newColor});
        },
        /**
         * 交换两条线路的坐标数组
         */
        exchangeTwoPath:function () {
            for (var i = 0; i < 4; i++) {
                var pathNormal = Event.mapObj.getOverlays('NGIRoute' + i).getPath(),
                    pathRapid = Event.mapObj.getOverlays('NGIRoute' + (i + 4)).getPath();
                Event.mapObj.getOverlays('NGIRoute' + (i + 4)).setPath(pathNormal);
                Event.mapObj.getOverlays('NGIRoute' + (i)).setPath(pathRapid);
//                Event.mapObj.getOverlays('NGIRoute' + (i + 4)).setOptions({
//                    id:'NGIRoute' + i
//                });
//                Event.mapObj.getOverlays('NGIRoute' + (i)).setOptions({
//                    id:'NGIRoute' + (i + 4)
//                });
            }

        }
    };
    //初始化，实例化ThisPage，详见ui.js
    thisPage = Class.create(ThisPage);
})();

