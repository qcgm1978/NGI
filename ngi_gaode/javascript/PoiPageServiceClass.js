/**
 * 建立搜索模块的弹出层
 * @class 搜索模块弹出层
 * */
var poiLayer = (function () {
    var instance,
        _processLayer = null;

    function PoiLayer() {
        this.showDataFormatError = function () {
            console.log("网络或数据异常...");
            _netErrorlayer().show();
        };
        function _netErrorlayer() {
            var newFailConfig = {
                id:'confirm_box',
                msg:GLOBAL.Constant.prompt_exception
            };
            return    GLOBAL.layer.createNew(newFailConfig);
        }
    }

    PoiLayer.prototype = {
        showProcessLayer:function () {
            var addLoadConfig = {
                id:'spinner'
            };
            _processLayer = GLOBAL.layer.createNew(addLoadConfig)
            _processLayer.show();
        },
        hideProcessLayer:function () {
            if (_processLayer instanceof Object) {
                _processLayer.remove();
            }
        },
        noDataHandler:function () {
            var noDataConfig = {
                msg:GLOBAL.Constant.prom_no_result,
                id:'confirm_box'
            };
            GLOBAL.layer.createNew(noDataConfig).show();
        }
    };

    function inner() {
        return {
            singletonInstance:function () {
//                确保只生成一个单例
                if (typeof instance != 'undefined') {
                    var msg = 'poiLayer is a singleton model, it cant\'t be called again.';
                    var err = new GLOBAL.common.error.ErrorMsgToServer(new Error(msg));
                    err.pushMessage();
                    return;
                }
                return instance = new PoiLayer();
            }
        };
    }

    return inner();
})();
/**
 * Created with JetBrains WebStorm.
 * User: rax
 * Date: 12-10-10
 * Time: 下午5:33
 * Use:  搜索结果页面mvc中的model层的业务逻辑部分，另一部分为处理数据的PoiSearchClass类
 */

/**
 * @class 设置搜索结果页面类
 * */
var resultPageConfig = {
    data:null,
    displayNum:6,
    number:30,
    nextBtnId:'#next_button',
    prevBtnId:'#prev_button'
};
function PoiPageServiceClass(options) {
    var config = $.extend(resultPageConfig, options);
    this.searchInstance = config.searchInstance;
    this.data = config.data;
    this.id = this.searchInstance.getSearchPattern() == 'TYPE_SEARCH' ? 'searchTable' : "resultTable";
    this.container = config.container;
    this.total = this.searchInstance.getSearchTotalNum();
    this.displayNum = config.displayNum;
    this.number = config.number;
    //      传递context作为加载数据行所在的环境，否则在load页面下会访问到frames[0].document中的所有tr行
    this.context = $(this.container, frames[0].document);
    this.nextBtn = $(config.nextBtnId, this.context);
    this.prevBtn = $(config.prevBtnId, this.context);
//    特权方法
    this.setResultPage = function () {
        _insertDom.call(this, this.data);
        _changeBtnUi.call(this);
        _bindPageTurningEvent.call(this);
//        _setEleClickEffect.call(this);
        _changeResultH1.call(this);
        _setChooseBtn.call(this);
    };
//    私有方法
    function _setChooseBtn() {
        var that = this,
            mediator = GLOBAL.common.mediator,
            configFilter = {
                type:this.searchInstance.type,
                xmlDom:xmlDom,
                $filter:$('#filter', this.context)
            };
        frames[0].queryThirdType(configFilter);
    }

    function _changeResultH1() {
        if (this.id == "resultTable") {
            $('h1:first', this.context).text(GLOBAL.Constant.title_destn);
        }
        else {
            $('h1:first', this.context).text(GLOBAL.Constant.title_nearby);
        }
    }

    function _getLastLineNum() {
        //如果不给 .index() 方法传递参数，那么返回值就是这个jQuery对象集合中最后一个元素相对于其同辈元素的位置。
        var lastTrNum = $('tr:not(.none):last', this.context).index() + 1;
        return lastTrNum;
    }

    function _getNextPageNum() {
        return Math.ceil(_getLastLineNum.call(this)) / this.displayNum + 1;
    }

    function _getDataToServer() {
        parent.layerPoi.showProcessLayer();
        this.searchInstance.batch++;
        this.searchInstance.callback = $.proxy(function () {
            var data = this.searchInstance.getDataByPage(_getNextPageNum.call(this));
            _insertDom.call(this, data);
            _hidePrevPage.call(this);
            parent.layerPoi.hideProcessLayer();
        }, this);
        this.searchInstance.handleEvent();
    }

    function _displayExsitedNextPage() {
        $('tr', this.context)
            .slice(_getLastLineNum.call(this), _getLastLineNum.call(this) + this.displayNum)
            .removeClass('none');
    }

    function _displayExsitedHiddenData() {
        var data = this.searchInstance.getDataByPage(_getNextPageNum.call(this));
        _insertDom.call(this, data);
    }

    function _hidePrevPage() {
        $('tr', this.context)
            .slice(0, _getLastLineNum.call(this) - this.displayNum)
            .addClass('none');
    }

    function _turnNextPage() {
        if (_getLastLineNum.call(this) >= this.total) {
            //如果已经显示了全部查询结果
            console.log('last result page');
            return;
        }

        //如果不是最后一页，就显示下六条查询结果
        if ($('tr', this.context).eq(_getLastLineNum.call(this)).length != 0) {
            _displayExsitedNextPage.call(this);
            _hidePrevPage.call(this);
            return
        }
        if (_getLastLineNum.call(this) % this.number != 0) {
            _displayExsitedHiddenData.call(this);
            _hidePrevPage.call(this);
            return;
        }
        //如果已经显示最后一页，执行下一次查询
        if (this.total > _getLastLineNum.call(this)) {
            _getDataToServer.call(this);
        }
    }

    /**
     * 上一页按钮事件处理
     */
    function _turnPrevPage() {
        var first_display_tr = $('tr:not(.none):first', this.context).index(),
            last_tr = $('tr:not(.none)', this.context).index();
        if (first_display_tr != 0) {
            console.log(last_tr);
            $('tr', this.context).addClass('none');
            $('tr', this.context).slice(first_display_tr - this.displayNum, first_display_tr).removeClass('none');
        }
        _changeBtnUi.call(this);
    }

    function _bindPageTurningEvent() {
        this.nextBtn.click({
//            传递执行环境和搜索结果总数
            context:this.context,
            total:this.total
        }, $.proxy(function () {
                _turnNextPage.call(this);
                _changeBtnUi.call(this);
            }, this
        ));
        this.prevBtn.click({context:this.context}, $.proxy(_turnPrevPage, this));
    }

    function _insertDom(data) {
        $('table', this.context).attr('id', this.id);
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i],
                result = item.address ? item.name + ' [ ' + item.address + ' ]' : item.name;
            //向表格中添加查询结果
            var $tr = $("<tr>", {
                html:"<td>" + result + "</td>",
                click:_resultClickEvent(item.x, item.y, item.name, item.address, item.tel)
            });
            $tr.appendTo($('#' + this.id, this.context));
            if (this.id == 'searchTable') {
                var distance = item.distance;
                $('<td>', {
                    text:Tab.unit_conversion(distance, 1)
                })
                    .appendTo($('#' + this.id, this.context).find('tr:last'));
            }
            //            $tr是包含函数的活动对象，引用了元素，设置为null，解除对dom的隐私，保证正常回收内存，防止内存泄露。（主要针对ie）
            $tr = null;
        }
    }

    function _changeBtnUi() {
        var firstDisplayTr = $('tr:not(.none):first', this.context).index(),
            lastDisplayNum = firstDisplayTr + this.displayNum;
//        如果显示的第一行是表格的第一行，上一页按钮变灰
        if (firstDisplayTr == 0) {
            this.prevBtn.attr('src', '../../images/previous_page_gray.png');
        }
        else {
            this.prevBtn.attr('src', '../../images/previous_page.png');
        }
//        如果搜索结果总数大于最后显示的行数，高亮下一页按钮
        if (this.total > lastDisplayNum) {
            this.nextBtn.attr('src', '../../images/next_page.png');
        }
        else {
            this.nextBtn.attr('src', '../../images/next_page_gray.png');
        }
    }

    function _resultClickEvent(x, y, name, address, tel) {
        //返回匿名函数
        return function () {
            var config = {
                lng:x,
                lat:y,
                name:name,
                address:address,
                tel:tel
            };
            //save current poi info,Added by TANGJING
            GLOBAL.common.savePoiData(config);
            Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapWithPoi, Event.NavScreenEvent.showSearchResultInMapScreen, config);
        };
    }
}

PoiPageServiceClass.prototype = {
};