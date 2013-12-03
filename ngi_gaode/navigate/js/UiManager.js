// JavaScript Document
/**
 * @class
 * @description ui管理类
 * @param []
 **/
function UiManager() {
    //搜索ui显示
    this.utilSearch = {
        extendSearchParam:function (configSearch) {
            var configSearch = $.extend({
                lng:GLOBAL.Constant.poi_search_result.lng,
                lat:GLOBAL.Constant.poi_search_result.lat,
                range:Number(localStorage['Map_poi_range'])
            }, configSearch);
            return configSearch;
        }

    };
//    主界面ui显示
    this.eleSet = {
        simulator_ui_hideEleSet:$('#navi_menu_warp,#name input,#current_pos,#subsection,#center,#details').add(thisPage.$navi_menu_li.slice(2, 5)),
        simulator_ui_showEleSet:$('#navi_menu_warp_left,#navi_menu_warp_right,#simulator,#emulatorNaviCurrRoad,#gps,.navi_menu,#right,#right li, header,#search,#shortcut,#mark'),
        fullFigure_ui_hideEleSet:$('#subsection,#center,#right, #search, #current_pos,#shortcut,#mark,#navi_menu_warp').add(thisPage.$navi_menu_li.slice(2, 5)),
        naviInitialState_ui_hideEleSet:$('#navi_menu_warp_left,#navi_menu_warp_right,#emulatorNaviCurrRoad,#light_cross_html,#center,#subsection,#simulator,#details, #poi_current').add(thisPage.$navi_menu_li.slice(2, 5)),
        naviInitialState_ui_showEleSet:$('#gps,#navi_menu_warp,.navi_menu,#current_pos,#right, header,#search,#shortcut,#mark, #right li'),
        subsection_ui_hideEleSet:$('#right, #mark,#shortcut,#search,#center,#current_pos,#navi_menu_warp').add(thisPage.$navi_menu_li.slice(2, 5)).add($('#name').find('input:not("#poi_current")')),
        subsection_ui_showEleSet:$('#subsection,#navi_menu_warp_left,#navi_menu_warp_right,#poi_current'),
        lightCross_ui_hideEleSet:$('#gps,#right,#navi_menu_warp,.navi_menu,#shortcut,#navi_menu_warp_left,#navi_menu_warp_right,#map header,#center, #mark'),
        viewDetail_ui_hideEleSet:$('#gpsNaviCurrRoad, #emulatorNaviCurrRoad,#current_pos,#navi_menu_warp_left,#navi_menu_warp_right'),
        viewDetail_ui_showEleSet:$('#details[alt="详细按钮"],#name, #poi_current').add(thisPage.$navi_menu_li.slice(2, 5)),
        unNaviInitialState_ui_hideEleSet:$('#center, #mark, #name,#name p,#current_pos,#right li, #details,#mark,#simulator,#subsection,#poi_current, svg,#navi_menu_warp_left,#navi_menu_warp_right,#light_cross_html'),
        unNaviInitialState_ui_showEleSet:$('#gps,#right,#navi_menu_warp,.navi_menu,#shortcut,#search').add(thisPage.$navi_menu_li.slice(2, 5))
    };

    /**
     * @description 未导航初始状态
     **/
    this.unNaviInitialState = function(){
        if (iframeObj.isShow()) {
            iframeObj.remove();
        }
        this.eleSet.unNaviInitialState_ui_hideEleSet.hide();
        thisPage.$reach_time.css('visibility', 'hidden');
        this.eleSet.unNaviInitialState_ui_showEleSet.show();
        thisPage.$lower_left_button.attr({'alt':GLOBAL.Constant.alt_lower_left_button.contract, 'src':GLOBAL.Constant.contract_img});
        //切换设终点按钮
        thisPage.$menu_first.attr({src:'images/images/main_menu.png', alt:'主菜单按钮'});
        thisPage.hide_assist_menu();
        thisPage.initCompass();
    }

    /**
     * @description 未导航地图拖动状态
     **/
    this.unNaviDragState = function() {
        if (Event.mapObj.getStatus().dragEnable) {
            $('#crossCursor,#center').show();
            thisPage.$lower_left_button.attr({
                'src':'images/images/menu_back.png',
                'alt':GLOBAL.Constant.ret_map_ini
            });
            thisPage.$menu_first.attr({
                'src':GLOBAL.Constant.set_destination,
                'alt':'设终点按钮'
            });
            //确保设终点等图片为显示状态
            thisPage.$navi_menu_li.slice(2, 5).add('#navi_menu_warp').show();
            thisPage.$navi_menu_warp_lr.hide();
            var center = Event.mapObj.getCenter();
            var target = new MMap.LngLat(center.lng, center.lat);
            var distance = MapEvent.determin_distance(target);
            //将距离写入地图中心图标的标题元素中
            thisPage.$center_figcaption.text(distance);
            thisPage.hide_assist_menu();
        }
    }

    /**
     * @description 未导航搜索结果状态
     * @param [retValue] 返回按钮的ALT值
     **/
    this.view_detail = function() {
        iframeObj.hide();
        this.eleSet.viewDetail_ui_hideEleSet.hide();
        //确保设终点等图片为显示状态
        thisPage.$navi_menu_warp.show();
        thisPage.$lower_left_button.attr({
            src:GLOBAL.Constant.src_ret,
            alt:GLOBAL.Constant.alt_lower_left_button.ret_pre
        });
        $('#center img')
            .show()
            .attr({
                src:GLOBAL.Constant.target_img,
                alt:GLOBAL.Constant.alt_target
            })
            .parent()
            .show();
        thisPage.$menu_first.attr({
            'src':GLOBAL.Constant.set_destination,
            'alt':'设终点按钮'
        });
        this.eleSet.viewDetail_ui_showEleSet.show();
        //将距离写入地图中心图标的标题元素中,该搜索结果到自车的距离
        thisPage.$center_figcaption.text(GLOBAL.Constant.poi_search_result.distance);
        thisPage.$poi_current.val(GLOBAL.Constant.poi_search_result.name);
        scrollText();
        function scrollText() {
            var $gr = thisPage.$gpsNaviCurrRoad,
                $pc = thisPage.$poi_current,
                _p = 0;
            var oEle = $gr.is(':visible') ? $gr : $pc;
            var m_str = oEle.val();
//            console.log(m_str);
            if (m_str.length > 15) {
                oEle.css('text-align', 'left');
                var intervalId = setInterval(function () {
                    moveTxt();
                }, 500);

                function moveTxt() {
                    if ($('#iframeDiv').is(':hidden') && _p <= m_str.length) {
                        oEle.val(m_str.substr(_p, m_str.length));
                        _p++;
                    }
                    else {
                        _p = 0;
                        oEle.val(m_str/*.substr(_p,m_str.length)*/);
                        clearInterval(intervalId);
                        oEle.css('text-align', 'center');
                    }
                }
            }
        }

        thisPage.hide_assist_menu();
        thisPage.initCompass();
//        thisPage.$compass.unbind().bind('click', thisPage.setCompass);
    }

    /**
     * @description 双光柱页状态
     **/
    this.lightCross_ui = function() {
        iframeObj.remove();
        if ($('svg')[0]) {
            $('svg').show();
        }
        this.eleSet.lightCross_ui_hideEleSet.hide();
        thisPage.$light_cross_html.children().andSelf().show();
        UtilFunc.setRegularOptionGray({
            opacity:1
        });
    }

    /**
     * @description 路线详细页状态
     * @param [config] 当前点对象
     **/
    this.subsection_ui = function() {
        iframeObj.hide();
        if (thisPage.$light_cross_html.is(':visible')) {
            $('#gps, .navi_menu, header')
                .show();
            thisPage.$light_cross_html.hide();
        }
        thisPage.$reach_time.css('visibility', 'hidden');
        this.eleSet.subsection_ui_hideEleSet.hide();
        $('#scale img').attr('src', "images/images/50m.png");
        thisPage.$compass.attr('src', function (index, src) {
            return  'images/images/compass_gray.png';
        });
        this.eleSet.subsection_ui_showEleSet.show();
        thisPage.$lower_left_button
            .attr({
                src:GLOBAL.Constant.src_ret,
                alt:GLOBAL.Constant.alt_lower_left_button.ret_pre
            });
        thisPage.$poi_current.val(GLOBAL.common.LocalSave.read('Map_seg_center').name);
    }

    /**
     * @description 导航初始状态
     **/
    this.naviInitialState = function() {
        iframeObj.remove();
        $('svg').show();
        thisPage.$lower_left_button.attr({src:'images/images/menu_open.png', alt:'显示菜单栏'});
        //切换设终点按钮
        thisPage.$menu_first.attr({src:'images/images/main_menu.png', alt:'主菜单按钮'});
        //mark初始为空
        thisPage.$mark.empty();
        //显示下一条道路所在元素
        this.eleSet.naviInitialState_ui_hideEleSet.hide();
        this.eleSet.naviInitialState_ui_showEleSet.show();
        if (!eval(localStorage['Map_tbt_conditions'])) {
            $('#right li:last').hide();
        }
        thisPage.$bg_light_cross.parent("a").show();
        /**
         * @desription 更新道路名称不是在这里操作，而由tbt控制
         * @author zhanghongliang
         * */
//        thisPage.$current_pos.text(GLOBAL.Constant.currentRoadName ? GLOBAL.Constant.currentRoadName : GLOBAL.Constant.no_name_road);
        modify_lower_left_gps();
        display_dynamic_bar();
        //设置导航状态预计到达时间面板显示状态，需调用tbt接口改写里面的值，这里只切换其显示状态
        thisPage.$reach_time.css('visibility', 'visible');
//        thisPage.$gpsNaviCurrRoad.val(thisPage.$gpsNaviCurrRoad.attr('nextroad'));
        thisPage.$name_input
            .hide()
            .filter('#gpsNaviCurrRoad')
            .show();
        function modify_lower_left_gps() {
            var alt = thisPage.$lower_left_button.attr('alt');
            if (alt == '收缩按钮') {
                thisPage.$lower_left_button.attr({
                    src:'images/images/menu_open.png',
                    alt:'显示菜单栏'
                });
            }
            else if (alt == GLOBAL.Constant.ret_map_ini) {
                thisPage.$lower_left_button.attr({
                    src:'images/images/menu_close.png',
                    alt:'收缩按钮'
                });
            }
        }

        thisPage.hide_assist_menu();
        thisPage.initCompass();
//        thisPage.$compass.unbind().bind('click', thisPage.setCompass);
    }

    /**
     * @description 导航下全图浏览状态
     **/
    this.full_figure = function() {
        iframeObj.hide();
        thisPage.$lower_left_button
            .attr({
                src:GLOBAL.Constant.src_ret,
                alt:GLOBAL.Constant.alt_lower_left_button.ret_pre
            });
        thisPage.$poi_current
            .val('全图浏览')
            .show()
            .siblings()
            .hide();
        thisPage.$compass.attr('src', function (index, src) {
            return  'images/images/compass_gray.png';
        });
        this.eleSet.fullFigure_ui_hideEleSet.hide();
        thisPage.$reach_time.css('visibility', 'hidden');
        thisPage.$navi_menu_warp_lr.show();
        thisPage.$gprs_img.attr('src', 'images/images/gprs01.png');
    }

    /**
     * @description 模拟导航状态
     **/
    this.simulator_ui = function() {
        iframeObj.remove();
        thisPage.$lower_left_button.attr({
            alt:GLOBAL.Constant.alt_lower_left_button.expand_simulator,
            src:'images/images/menu_open.png'
        });
        this.eleSet.simulator_ui_hideEleSet.hide();
        this.eleSet.simulator_ui_showEleSet.show();
        $('svg').show();
        if (!eval(localStorage['Map_tbt_conditions'])) {
            $('#right li:last').hide();
        }
        thisPage.$bg_light_cross.parent("a").show();
        display_dynamic_bar();
        //设置导航状态预计到达时间面板显示状态，需调用tbt接口改写里面的值，这里只切换其显示状态
        thisPage.$reach_time.css('visibility', 'visible');
        thisPage.hide_assist_menu();
        thisPage.initCompass();
//        thisPage.$compass.unbind().bind('click', thisPage.setCompass);
    }

    function display_dynamic_bar() {
        var bg_img = thisPage.$bg_light_cross.css('background-image');
        var bg_light_new = bg_img.replace(/(.*bar_).*(?=km\.png)/, "$1" + localStorage['Map_tbt_view']);
        thisPage.$bg_light_cross.css('background-image', bg_light_new);
//        GLOBAL.NavClass.drawDynamicLightCross(GLOBAL.Constant.nav_obj);//初始化导航界面右侧光柱的值
    }

    this.showLightBar = function () {
        display_dynamic_bar();
    };
}
var uiManager = new UiManager();