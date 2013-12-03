$(function () {

    var arr = ['c1', 'c2', 'c3'], str = '';
    //根据传入的查询关键字使用ajax方式加载二级关键字
    function ajax_query(xml, key) {
        $('#table2').empty();
        $child = $(xml).find('[name=' + key + ']').children(arr[1]);
        for (var i = 0; i < $child.length; i++) {
            $('#table2').append('<tr><td></td></tr>');
        }
        $child.each(function (i, n) {
            var second = $(this).attr('name');
            $($('#table2 td').get(i)).text(second);
        });
    }

    var getPath = function () {
        var js = document.scripts || $("script");
        var jsPath;
        for (var i = js.length; i > 0; i--) {
            if (js[i - 1].src.indexOf("more.js") > -1) {
                jsPath = js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/") + 1);
            }
        }
        return jsPath;
    };
    //初始化显示汽车二级查询关键字
    var config = {
        xmlDom:xmlDom,
        xml_file:getPath() + 'classes.xml',
        callback:ajax_query,
        other:'汽车'
    };
    parent.GLOBAL.common.parseStr2Dom(config);
    $('#table1 td img[alt="汽车"]').attr('src', function () {
        return this.src.replace(/(\.png)$/, '_on$1');
    });

    // 绑定二级选项点击事件，点击后显示三级选项。
    $('#table1 td img').on('click', function (e) {
        var keyword = $(this).attr('alt');
        config.other = keyword;
        parent.GLOBAL.common.parseStr2Dom(config);
        //当前td内的图片显示按下效果。
        $('#table1 td img').each(function (index, element) {
            if (/on\.png$/.test(element.src)) {
                element.src = element.src.replace(/_on(\.png)$/, '$1');
            }
        });
        $(this).attr('src', function () {
            return this.src.replace(/(\.png)$/, '_on$1');
        });
        return false;
    });
    var searchRim = null;
    //绑定三级选项点击事件，迁移到搜索结果页面或提示无搜索结果
    $('#table2 td').live('click', function (e) {
        parent.layerPoi.showProcessLayer();
        var search_type = $(this).text();
        var configSearchRim = {
            type:search_type,
            callback:function () {
                parent.layerPoi.hideProcessLayer();
                if (parent.businessManager.noDataHandler.call(this)) {
                    return;
                }
                var config = {
                    searchInstance:this
                };
                parent.GLOBAL.Event.NGIStateManager.goToNextState(parent.GLOBAL.Constant.NGIStates.PoiSearchResult, showMoreSearchResultScreen, config);
            }
        };
        configSearchRim = parent.uiManager.utilSearch.extendSearchParam(configSearchRim);
        searchRim = new parent.PoiSearchClass(configSearchRim);
        searchRim.handleEvent();
        parent.businessManager.setNoDataPoiLayer(searchRim);
    });

    function showMoreSearchResultScreen(config) {
        var previousState = parent.GLOBAL.Event.NGIStateManager.getCurrentState();
        generateLoadingDiv(previousState)
            .load('../destn/POISearchResult.html', function (e) {
                parent.businessManager.setRetBtnEvent.call(this);
                var configData = {
                    searchInstance:config.searchInstance,
                    container:this,
                    data:config.searchInstance.getDataByPage(1)
                };
                var resultPage = new parent.PoiPageServiceClass(configData);
                resultPage.setResultPage();

            });
        return true;
    }

    function generateLoadingDiv(previousState) {
        return $('<div />', {
            id:previousState,
            'class':"w800 h480 abs-top"
        })
            .appendTo('body');
    }

    if (-[1, ]) {
        var myScroll = DragClass.create('table2');
    }
});