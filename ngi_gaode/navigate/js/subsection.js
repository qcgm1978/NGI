    if((localStorage['tbt_state'] != undefined) && (JSON.parse(localStorage['tbt_state']) || parent.window.GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus)){
        $('article').height('329px');
        $('#return_map').show();
    }
    /**
     * subsection.js
     *
     * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
     * @Title: subsection.js
     * @Description: subsection.js
     * @author wangyonggang qq:135274859 zhanghongliang qq: 20132277
     * @date 2012-8-28
     * @version V1.0 Modification History: 2012-8-28
     */
    $(function () {
        Subsection = {
            options:{
                $article:$('article'),
                $table:$('table'),
                target:'目的地',
                $td:$('.long_bg'),
                len:null
            },
            createNew:function () {
                var subsection = {};
                /**
                 @description 显示道路信息
                 */
                subsection.showRoadSegInfo = function () {
                    parent.window.tbt.SelectRoute(localStorage['route_type']);
                    var data = {
                        xmlStr:parent.window.tbt.GetNaviGuideList(),
                        callback:callback
                    };
                    data.callback(data.xmlStr);
                    //ui 设置滚动条相对顶部的偏移，始终显示当前自车所在路段 by Zhen Xia
                    var height = $('article table').height();
                    Subsection.options.$article.scrollTop(height);
                    return subsection;
                };
                /**
                 @description 绑定点击事件处理方法
                 */
                subsection.bindEvent = function () {
                    Subsection.options.$td.die().live('click', closureItem);
                    return subsection;
                };
                function callback(data) {
                    Subsection.options.len=data.length;
                    var obj = GLOBAL.Constant.icon_direction_sub;
                    var $tr, $td, $tr1;
                    $tr = $('<tr><td id="action" rowspan=' + (data.length + 1) + '></td><td class="long_bg">' + Subsection.options.target + '</td><td class="short_bg"></td></tr>');
                    $tr1 = $('<tr></tr>');
                    for (var len = data.length, i = len - 1; i >= 0; i--) {
                        var list = data[i];
                        list.ordinal = i + 1;
                        var orient = list.directionIcon,
                            name = list.roadName || '无名道路',
                            distance = list.distance,
                            lng = list.startLon,
                            lat = list.startLat;
                        //转换距离为米或千米，并加上单位
                        distance = Tab.unit_conversion(distance, 1);
                        var src;
                        $.each(obj, function (i, n) {
                            if (parseInt(i) === orient && String(parseInt(i)).length === String(orient).length) {
                                src = n;
                            }
                        });
                        $tr.find('td:first').append('<img src="' + src + '"/>');
                        $td = $('<tr><td class="long_bg">' + name + '</td><td class="short_bg">' + distance + '</td></tr>');
                        $td.find('td:first').data('data', list);
                        $tr1.append($td);
                        var curSegIndex = -1;
                        if(parent.GLOBAL.Constant.nav_obj.NavigationInfo != null)
                            curSegIndex = parent.GLOBAL.Constant.nav_obj.NavigationInfo.nCurSegIndex || -1;
                        if(curSegIndex != -1 && i == curSegIndex) break;//不显示已走过的路 by Zhen Xia
                    }
                    Subsection.options.$table.append($tr);
                    $tr1 = $tr1.find('tr').unwrap();
                    Subsection.options.$table.append($tr1);
                    $('<img>', {
                        'src':obj['1自车'],
                        'id':'current_car'
                    }).appendTo('td:first');
                }
                function closureItem() {
                    var listItem = $(this).data('data');
                    if ($(this).text() == Subsection.options.target ) {
                        var nextState = parent.GLOBAL.Event.NGIStateManager.getNextState();
                        var state = parent.GLOBAL.Constant.NGIStates;
                        listItem = nextState === state.LightCross? {
                            startLon:parent.GLOBAL.Constant.poi_search_result.lng,
                            startLat:parent.GLOBAL.Constant.poi_search_result.lat,
                            roadName:GLOBAL.Constant.poi_search_result.name || Subsection.options.target,
                            ordinal: Subsection.options.len + 1
                        }: {
                        startLon:localStorage.Map_poi_lng,
                        startLat:localStorage.Map_poi_lat,
                        roadName:GLOBAL.Constant.poi_search_result.name || Subsection.options.target,
                        ordinal: Subsection.options.len + 1
                    };
                    }
                    GLOBAL.common.LocalSave.save('Map_seg_center', {
                        lng:listItem.startLon,
                        lat:listItem.startLat,
                        name:listItem.roadName || GLOBAL.Constant.no_name_road,
                        ordinal:listItem.ordinal
                    });
                    if (typeof parent.window.GLOBAL.Constant.newSubsection == 'undefined') {
                        parent.window.GLOBAL.Constant.newSubsection = false;
                    }
                    parent.window.GLOBAL.Constant.newSubsection = !parent.window.GLOBAL.Constant.newSubsection;
                    parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapRoadSegment, parent.window.GLOBAL.Event.NavScreenEvent.showMapRoadSegmentScreen);
                }
                return subsection;
            }
        };
        Subsection.createNew().showRoadSegInfo().bindEvent();
        if(-[1,]){
             var myScroll =  DragClass.create(document.getElementsByTagName('table')[0]);
        }
    });
