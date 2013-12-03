/**
 * Created with JetBrains WebStorm.
 * User: 张红亮
 * Date: 12-8-10
 * Time: 下午4:06
 * Changed 2012-9-29
 * Use: 搜索类，实例化后调用特权方法handleEvent进行搜索
 */

if (typeof window.SearchPoiObj == 'undefined') {
    var SearchPoiObj = {
        searchClassConfigure:function (options) {
            //    搜索类默认实例属性
            var options = $.extend({
                searchPattern:'TYPE_SEARCH', //     周边搜索模式
                number:30, //                             查询三十条数据
                pageNumuber:6, //                           每页显示6条
                timeout:60000, //                         查询超时为1分钟
                lng:'121.499053', //                    周边查询中心经度
                lat:'31.2392739', //                    周边查询中心纬度
                batch:1, //                               查找第一页
                range:2000, //                            周边查找距离2000米
                keyword:'', //                              搜索关键字为空字符串
                callback:$.noop//
            }, options);
            return options;
        }
    };
}

/**
 *  创建搜索实例
 * @class 按类型或关键字搜索
 * @param {object} [config] 搜索条件，如为空则使用SearchPoiObj.searchClassConfigure提供的默认值
 *
 * */
window.PoiSearchClass = function (options) {
    if (typeof SearchPoiObj == "object") {
        if (SearchPoiObj.searchClassConfigure instanceof Function) {
            var config = SearchPoiObj.searchClassConfigure.apply(this, [options]);
        }
    }
    this.data = [];                                   //存储请求到的数据
    this.searchPattern = config.searchPattern;  //搜索模式，可能为按类型检索或按关键字检索，需传入 'TYPE_SEARCH'或 'KEYWORD_SEARCH'
    this.range = config.range;                  //周边搜索范围
    this.lng = Number(config.lng);              //  周边搜索基于中心坐标的经纬度
    this.lat = Number(config.lat);
    this.number = parseInt(config.number);    //每次请求搜索结果的数量
    this.pageNumuber = config.pageNumuber;     //每页显示数量
    this.timeout = config.timeout;             //请求数据最长时间
    this.type = config.type;                   //周边检索请求数据基于的类别
    this.keyword = config.keyword;           //关键字检索的关键字
    this.city = config.city;                  //关键字检索基于的城市
    this.batch = config.batch;               //请求数据的页数
    this.callback = config.callback;          //请求数据成功后回调函数
    //    特权方法
    //        外部接口，调用后实现搜索功能
    this.handleEvent = function () {
        this.dataState = _verifyData.apply(this);
        if (!this.dataState) {
            return;
        }
        else {
//            this.processRet = this.processHandler();
            _searchHandler.apply(this);
        }
    };
//    以下为私有方法

    //    检查传入的数据
    function _verifyData() {
        return !(
            (this.searchPattern != 'TYPE_SEARCH' && this.searchPattern != 'KEYWORD_SEARCH') ||
                isNaN(this.lng) || isNaN(this.lat) ||
                isNaN(this.number) || Number(this.number) <= 0
            );
    }

    //        借用sdk接口请求数据
    function _searchHandler() {
        var option = {
            number:this.number,
            batch:this.batch,
            timeout:this.timeout
        };
        try {
            var that = this;
            if (this.searchPattern == 'TYPE_SEARCH') {
                //周边检索构造方法参数
                option.type = this.type;
                option.range = this.range;
                this.poi = new PoiSDK.PoiSearch(option);
                var center_poi = new PoiSDK.LngLat(this.lng, this.lat),
                    centerKey = this.keyword ? this.keyword : '';
                this.poi.byCenPoi(center_poi, centerKey, function (data) {
                    return _poiSearchHandler.apply(that, [data]);
                });
            }
            else if (this.searchPattern == 'KEYWORD_SEARCH') {
                this.poi = new PoiSDK.PoiSearch(option);
                this.poi.byKeywords(this.keyword, this.city, function (data) {
                    return _poiSearchHandler.apply(that, [data]);
                });
            }
        }
        catch (e) {
            console.log(e.message);
            this.dataFormatErrorHandler();
        }
    }

//    查询数据成功后保存相关值，ajax后调用，数据可以通过实例方法获取
    function _saveData(data) {
//        设置实例属性，保存搜索结果总数，并保存到全局变量，作为搜索结果页面搜索实例的属性
        this.searchDataCount = data.count;
        this.searchResultCount = data.list.length;
//        TODO 未确定直接调用该实例属性或通过实例方法获取该值
        this.data = this.data.concat(data.list);
    }

//    请求服务器后接收返回信息处理方法
    function _poiSearchHandler(data) {
        if (!data.list){
//            返回布尔值
            this.noData = true;
        }
        if (data.list) {
            _saveData.apply(this, [data]);
        }
        if (this.callback) {
            this.callback(data);
        }
    }
};
//公共方法，通过原型prototype定义
window.PoiSearchClass.prototype = {
//    根据每页数量返回某页数据
    getDataByPage:function (ordinalNum) {
        return this.data.slice(this.pageNumuber * (ordinalNum - 1), this.pageNumuber * ordinalNum);
    },
    //    改变状态
    changeState:function () {

    },
//    获得搜索过程中执行的方法的返回值
    getSearchProcessFuncRet:function () {
        return this.processRet;
    },
//    获取已搜索到的结果数量值,未取得搜索结果时设为0
    getSearchedNum:function () {
        return isNaN(this.searchResultCount) ? 0 : this.searchResultCount;
    },
    //    获取当前搜索结果的数量值,未取得搜索结果时设为0
    getSearchTotalNum:function () {
        return isNaN(this.searchDataCount) ? 0 : this.searchDataCount;
    },
//   获取搜索方式
    getSearchPattern:function () {
        return this.searchPattern;
    } ,
//    是否搜索到数据
    getDataState:function(){
        return this.noData;
    }
};