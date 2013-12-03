/**
 * POI检索结果
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: searchResult.js
 * @Description: POI检索结果
 * @author chengpawang, 张红亮
 * @date 2012-8-16
 * @version V1.0
 * Modification History:
 */
function setEleClickEffect(config) {
    var ele = new parent.GLOBAL.common.EleEventUiClass(config);
    ele.bindEleClickUiEvent();
}
var config = {
    arrEffectEleExceptImg:['td'],
    context:$('article:last').parent()
};
setEleClickEffect(config);
function queryThirdType(config) {
    var xmlParser = {
        xmlDom:config.xmlDom,
        callback:function (xml) {
            if ($(xml).find('[name="' + config.type + '"]')) {
                var $child = $(xml).find('[name="' + config.type + '"]').children('c3');
                if ($child.length) {
                    config.$filter.show();
                    config.$filter
                        .off()
                        .click(function () {
                            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchResultFilter, showPoiSearchResultFilterScreen, {type:config.type});
                        });
                } else {
                    console.info('choose button not clicked');
                    config.$filter.hide();
                }
            } else {
                config.$filter.hide();
            }
        }
    };
    parent.GLOBAL.common.parseStr2Dom(xmlParser);
}

function ChoosingPageHandler(config) {
//实例属性
    this.type = config.type;
//  私有方法
    //显示筛选结果界面
    function _showMoreSearchResultScreen(configSearch) {
        var previousState = parent.GLOBAL.Event.NGIStateManager.getCurrentState();
        _generateLoadingDiv(previousState)
            .load('../destn/POISearchResult.html', function () {
                var configData = {
                    searchInstance:configSearch.searchInstance,
                    container:this,
                    data:configSearch.searchInstance.getDataByPage(1)
                };
                var resultPage = new parent.PoiPageServiceClass(configData);
                resultPage.setResultPage();
                parent.businessManager.setRetBtnEvent.call(this);
            });
        return true;
    }

    function _bindChoosePageBehavior() {
        var config = {
            arrEffectEleExceptImg:['td'],
            context:'#filterResult'
        };
        var ele = new GLOBAL.common.EleEventUiClass(config);
        ele.bindEleClickUiEvent();
    }

    function _generateLoadingDiv(previousState) {
        return $('<div />', {
            id:previousState,
            'class':"w800 h480 abs-top"
        })
            .appendTo('body');
    }

//根据传入的查询关键字使用ajax方式加载三级类型关键字

    function _displayThirdType() {
        var that = this,
            xmlParser = {
                xmlDom:xmlDom,
                callback:function (xml) {
                    var $child = $(xml).find('[name="' + that.type + '"]').children('c3');
                    if ($child.length !== 0) {
                        $child.each(function (i, n) {
                            var third = $(this).attr('name');
                            var str = '<tr><td>' + third + '</td></tr>';
                            $(str).appendTo('#filterTable');
                        });
                    }
                    else {
                        //查询三级关键字的所有兄弟元素
                        var third = $(xml).find('[name="' + that.type + '"]').siblings().andSelf();
                        third.each(function (i, n) {
                            var str = '<tr><td>' + $(n).attr('name') + '</td></tr>';
                            $(str).appendTo('#filterTable');
                        });
                    }

                }

            };
        parent.GLOBAL.common.parseStr2Dom(xmlParser);
    }

//点击后显示三级查询结果
    function _bindThirdTypeSearch() {
        $('#filterTable td').on('click', function () {
            parent.layerPoi.showProcessLayer();
            var that = this;
            var thirdClassRimConfig = {
                type:$(that).text(),
                callback:function (data) {
                    parent.layerPoi.hideProcessLayer();
                    if (parent.businessManager.noDataHandler.call(this)) {
                        return;
                    }
                    var config = {
                        searchInstance:this
                    };
                    parent.GLOBAL.Event.NGIStateManager.goToNextState(parent.GLOBAL.Constant.NGIStates.PoiSearchResult, _showMoreSearchResultScreen, config);
                }
            };
            thirdClassRimConfig = parent.uiManager.utilSearch.extendSearchParam(thirdClassRimConfig);
            var thirdClassRim = new parent.PoiSearchClass(thirdClassRimConfig);
            thirdClassRim.handleEvent();
            parent.businessManager.setNoDataPoiLayer(thirdClassRim);
        });
    }

//    特权方法，抽象方法，设置选择页面事件
    this.setChoosePage = function () {
//        筛选按钮页面显示三级查询类型

        _displayThirdType.apply(this);
//                绑定三级类别按钮点击事件
        _bindThirdTypeSearch();
//                绑定选择页面ui事件

//        _bindChoosePageBehavior();
    };
}
function showPoiSearchResultFilterScreen(config) {
    if ($('#filterResult').length == 0) {
        $('<div />', {
            id:"filterResult",
            'class':"w800 h480 abs-top"
        })
            .appendTo('body')
            .load('choose.html', function () {
                var choosePage = new ChoosingPageHandler(config);
                choosePage.setChoosePage();
                if (-[1, ]) {
                    var myScroll = DragClass.create('filterTable');
                }
                $(this)
                    .find('#returnSearch,#search_all')
                    .live('click', function (e) {
                        parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(returnSearch, {id:'#filterResult'});
                        return false;
                    });
            });
    } else {
        $('#filterResult').show();
    }
    return true;
}
function returnSearch(config) {
    parent.frames[0].$(config.id).hide();
//        显示筛选按钮，从筛选页面返回时，筛选按钮必是可选的
    parent.frames[0].$('#filter').show();
    return true;
}