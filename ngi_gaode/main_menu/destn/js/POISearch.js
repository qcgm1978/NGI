/**
 * POI检索
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: POISearch.js
 * @Description: POI检索
 * @author chengpawang
 * @date 2012-4-24
 * @version V1.0
 * Modification History:
 */
GLOBAL.namespace('POISearch');

$(function () {
//    GLOBAL.POISearch.POISearchService = new POISearchService();
    try {
        var historyArr = JSON.parse(localStorage.getItem("Map_keywords"));
    } catch (e) {
        console.log("GLOBAL.POISearch-->没有检索关键字历史记录");
        localStorage['Map_keywords'] = "[]";
    }
    GLOBAL.POISearch.showPOISearchHistory(historyArr);

    //绑定历史关键字点击事件
    $('td').bind('click', function () {
        var keyword = $(this).text();
        if ($.trim(keyword) != '') {
            searchPoi(keyword);
        }
    });
    //绑定检索按钮点击事件
    $('form').submit(function (e) {
        var keyword = $('[type="search"]').val();
        if ($.trim(keyword) == '') return false;
        saveHistory(keyword);
        searchPoi(keyword);
    });
    //保存搜索关键字
    function saveHistory(keyword) {
        var historyArr;
        //保存历史记录
        try {
            historyArr = JSON.parse(localStorage.getItem('Map_keywords'));
        } catch (e) {
            historyArr = new Array();
            console.log("POI 查询关键字记录格式有误");
        }
        if (!historyArr instanceof Array) {
            historyArr = new Array();
        }
        //删除重复的记录
        for (var i = 0; i < historyArr.length; i++) {
            if (historyArr[i] == keyword) {
                historyArr.splice(i, 1);
            }
        }
        historyArr.unshift(keyword);
        historyArr.splice(5, 5);
        localStorage.setItem('Map_keywords', JSON.stringify(historyArr));
    }

    //历史关键字和搜索按钮点击事件处理函数
    function searchPoi(keyword) {
        parent.layerPoi.showProcessLayer();
        if ($.trim(keyword) != '') {
            parent.GLOBAL.common.saveMapCenter();
            var city = $('#region', parent.frames[0].document).val();
            var poiConfig = {
                keyword:keyword,
                city:city,
                searchPattern:'KEYWORD_SEARCH',
                callback:function () {
                    parent.layerPoi.hideProcessLayer();
                    if (parent.businessManager.noDataHandler.call(this)) {
                        return;
                    }
                    var config = {
                        searchInstance:this
                    };
                    parent.GLOBAL.Event.NGIStateManager.goToNextState(parent.GLOBAL.Constant.NGIStates.PoiSearchResult, parent.businessManager.searchPoiButtonListener, config);
                }
            };
            var searchPoi = new parent.PoiSearchClass(poiConfig);
            searchPoi.handleEvent();
            parent.businessManager.setNoDataPoiLayer(searchPoi);
        }
    }
    $('input').bind('keyup', function () {
        var flag = false;
        flag = Tab.checkLength(GLOBAL.Constant.maxLength, $(this));
        if (flag) {
            if (GLOBAL.layer.hasOwnProperty("createNew")) {
                GLOBAL.layer.createNew({id:"confirm_box", msg:GLOBAL.Constant.prompt_reInput}).show();
            } else {
                parent.GLOBAL.layer.createNew({id:"confirm_box", msg:GLOBAL.Constant.prompt_reInput}).show();
            }
        }
    });

    //绑定城市按钮点击事件
    $('#region').click(function () {
        parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchRegion,function(){
           location.href =  'region.html';
            return true;
        });
    });
    //为输入框加入自动完成功能
    var city = $('#region').val(), autocompleteHelper = parent.GLOBAL.common.AutoCompleteHelper(city);
    $('#keyword').autocomplete(autocompleteHelper);
});

/**
 * 显示搜索的关键词历史
 * @param historyArr 关键词历史记录数组
 */
GLOBAL.POISearch.showPOISearchHistory = function (historyArr) {
    if (JSON.parse(localStorage['Map_keywords']).length > 0) {
        $('#div_no_history').hide();
        var tr = null;
        var str = '';
        $.each(historyArr, function (i, v) {
            str += '<tr><td>' + v + '</td>';
            str += '<td><img src="images/images/delete.png" onclick="GLOBAL.POISearch.deletePOISearchHistory(' + i + ',this)"></td></tr>';
        });
        $('table').html(str);
    } else
        $('#div_no_history').show();

    //历史城市
    $('#region').val(localStorage['Map_search_area']);
};

/**
 * 根据索引删除指定元素
 * @param index 索引号
 */
GLOBAL.POISearch.deletePOISearchHistory = function (index, obj) {
    var count = 0;
    var tempArr = new Array();
    var historyArr = JSON.parse(localStorage['Map_keywords']);
    for (var i = 0 , length = historyArr.length; i < length; i++) {
        if (i != index) {
            tempArr[count] = historyArr[i];
            count++;
        }
    }
    //保存到本地存储
    localStorage['Map_keywords'] = JSON.stringify(tempArr);
    //清除原来的显示数据
    $(obj).parent().parent().remove();//删除指定行
    GLOBAL.POISearch.showPOISearchHistory(tempArr);
};

