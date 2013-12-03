/**
 * User: 所有页面
 * Changed 2012-10-18
 * Use: common层的基础类、工具函数等
 */

jQuery.extend(String.prototype, {
    template:function (object) {
        var regex = /#{(.*?)}/g;
        return this.replace(regex, function (match, subMatch, index, source) {
            return object[subMatch] || "";
        });
    }
});

jQuery.extend(Function.prototype, {
    proxy:function (context) {
        return jQuery.proxy(this, context);
    }
});

/**
 @constructor
 **/
var Class = {
    create:function (classObj) {
        /// <summary>创建类的函数</summary>
        /// <param name="classObj" type="object">用对象表示的类</param>
        /// <returns type="object">类的实例，已经执行了类的构造函数</returns>
        var args = jQuery.makeArray(arguments);
        args.shift();
        var tempclassObj = function (params) {
            this.initialize.apply(this, params);
            this.initializeDOM.apply(this, params);
            this.initializeEvent.apply(this, params);
            this.pageLoad.apply(this, params);
        };
        classObj.initialize = classObj.initialize || jQuery.noop;
        classObj.initializeDOM = classObj.initializeDOM || jQuery.noop;
        classObj.initializeEvent = classObj.initializeEvent || jQuery.noop;
        classObj.pageLoad = classObj.pageLoad || jQuery.noop;
        classObj.dispose = classObj.dispose || jQuery.noop;
        tempclassObj.prototype = classObj;
        var result = new tempclassObj(args);
        return result;
    }
};
// @borrows instance as this 改变ajax调用后this指向
//    @author zhanghongliang
Function.prototype.changeAjaxThis = function (thisObj) {
    var _method = this;
    return function (data) {
        return _method.apply(thisObj, [data]);
    };
};
//兼容ie数组indexOf方法
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == item)
                return i;
        }
        return -1;
    }
}
//兼容ie调试的console
var alertFallback = true; // enable if you wanna see alerts msg
if (!window.console || !console.log) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    if (alertFallback) {
        for (var i = 0; i < names.length; ++i)
            window.console[names[i]] = function (msg) {
                alert(msg);
            }
    }
}

if (!GLOBAL.common) {
    GLOBAL.namespace("common");
    GLOBAL.namespace("WatchGPS");
}
GLOBAL.common = {
//观察者模式实现方法
    mediator:(function () {
        var subscribe = function (channel, fn) {
                if (!this.channels[channel]) {
                    this.channels[channel] = [];
                }
                this.channels[channel].push({ context:this, callback:fn });
                return this;
            },

            publish = function (channel) {
                if (!this.channels[channel]) {
                    return false;
                }
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, l = this.channels[channel].length; i < l; i++) {
                    var subscription = this.channels[channel][i];
                    subscription.callback.apply(subscription.context, args);
                }
                return this;
            },
            initMediator = function (channel) {
                this.channels[channel] = [];
                return this;
            };

        return {
            channels:{},
            publish:publish,
            subscribe:subscribe,
            initMediator:initMediator,
            installTo:function (obj) {
                obj.subscribe = subscribe;
                obj.publish = publish;
            }
        };

    }()),
    setEleUiEffect:function (arrNoEffectImgs, arrEffectEleExceptImg, regExp) {
        if (!parent.GLOBAL) {
            return;
        }
        if (!regExp.test(document.URL)) {
            var config = {
                allImgs:'img',
                arrNoEffectImgs:arrNoEffectImgs,
                arrEffectEleExceptImg:arrEffectEleExceptImg,
                context:document
            };
            var ele = new parent.GLOBAL.common.EleEventUiClass(config);
            ele.bindEleClickUiEvent();
        }
    },
    setEleEffect:function () {
//设置页面元素点击效果
        var arrNoEffectImgs = ["#action,#light_cross img", "img[alt='检索关键字']", "#currentPath", "img[alt='主页']", "img[alt='目的地']", "img[alt='简体安全提示']", "img[alt='繁体内容']", "img[alt='英语内容']", "img[alt='音量调整']", "img[alt='音量调整拖动条']", "img[alt='地图风格']", "img[alt='提示设定按钮']"],
            arrEffectEleExceptImg = [ "#detailsDiv img", "#PoiSearchNearby img", ".lower", ".heighten", 'td'];
        GLOBAL.common.setEleUiEffect(arrNoEffectImgs, arrEffectEleExceptImg, /navigate\/(index\.html)?$/);
    },
//    错误处理类
//    @author zhanghongliang
    error:{
//未获取到gps
        noGetGps:function () {
            var config = {
                msg:GLOBAL.Constant.prompt_fail_gps,
                id:'confirm_box'
            };
            var layer = GLOBAL.layer.createNew(config);
            layer.show();
        },
//        未连接到网络
        handleConnectNet:function () {
            if (!GLOBAL.common.checkNetBySdk()) {
                var config = {
                    id:'prompt_box',
                    msg:GLOBAL.Constant.prompt_netFail
                };
                var layer = GLOBAL.layer.createNew(config);
                layer.show();
            }
        }
    },

    /**
     * @function  log error to server
     * @para sev {number || string} 错误严重程度
     * @para msg {string} 错误消息
     */
    logError:function (sev, msg, stack) {
//        使用Image对象发送请求：1，浏览器支持，2，跨域
        var img = new Image();
        img.src = 'log.php?sev=' + encodeURIComponent(sev) +
            '&msg=' + encodeURIComponent(msg) +
            '&stack=' + stack;
//        相似的jquery方法
//        $.get("log.php", { sev:sev, msg:msg });
    },
//    原来的解析字符串方法移动到common.js
    parseStr2Dom:function (data) {
        if (document.implementation.hasFeature('XML', '2.0')) {
            var parser = new DOMParser();
            var xmldom = parser.parseFromString(data.xmlDom, 'text/xml');
            data.callback(xmldom, data.other);
        }
        // 其他浏览器尝试使用AJAX方法读取本地xml文件
        else {
            console.log('the browser doesn\'t support DOM LEVEL 2 XML, AJAX method need here');
            $.ajax({
                url:data.xml_file,
                dataType:"xml",
                async:false,
                success:function (xml) {
                    data.callback(xml, data.other);
                },
                error:function (a, b, c) {
                    console.log(a, b, c)
                }
            });
        }
    },

    /**
     *更新自车位置坐标
     */
    modifyCurrentPosition:function (config) {
        localStorage['Map_lng'] = config.lng;
        localStorage['Map_lat'] = config.lat;
        if (config.altitude != undefined)
            localStorage['Map_altitude'] = config.altitude;
    },

    /**
     * 任意值以该方法存到到本地变量中
     * @param strName 本地变量名
     * @param anyValue 要存储到本地变量的值
     * @return {*} 存储后生成的本地变量的值
     */
    LocalSave:{
        save:function (strName, anyValue) {
            if (typeof strName !== 'string') {
                console.log('no local variable name');
                return;
            } else {
                if (JSON instanceof Object && JSON.stringify) {
                    try {
                        localStorage[strName] = JSON.stringify(anyValue, function (key, value) {
                            if (value instanceof Function) {
                                return "(function)";
                            } else {
                                return value;
                            }
                        });
                    } catch (e) {
                        console.log('error: ' + e.message);
                        if (e.type == "circular_structure") {
                            var str = dojox.json.ref.toJson(anyValue);
                            localStorage[strName] = str;
                        }
                    }
                }
            }
            return localStorage[strName];
        },
        /**
         * 读取localStorage值的方法
         * @param strName 要读取的本地变量名
         * @return {*} 存储后生成的本地变量的值
         */
        read:function (strName) {
            if (JSON instanceof Object && JSON.parse) {
                var any_value = JSON.parse(localStorage[strName]);
                return any_value;
            }
        }
    },
    /**
     * 返回到指定URL
     */
    backToPre:function () {
        if (arguments.length == 1) {
            var preUrl = localStorage.getItem(arguments[0]);
            if (!preUrl) {
                history.go(-1);
            } else {
                location.href = preUrl;
            }
        } else {
            history.go(-1);
        }
    },
    /**
     * @description 存储poi数据
     * @param [poi] 对象类型
     **/
    savePoiData:function (poi) {
        var constant = GLOBAL.Constant, common = GLOBAL.common;
        if (poi == null) {
            poi = {
                lng:GLOBAL.Constant.poi_search_result.lng,
                lat:GLOBAL.Constant.poi_search_result.lat
            };
        }
        for (var p in poi) {
            if (GLOBAL.common.isBlank(poi[p])) {
                poi[p] = GLOBAL.Constant.null_value;
            }
        }
        GLOBAL.Constant.poi_search_result = poi;
        common.LocalSave.save('Map_poi', poi);
        return poi;
    },
//    存储地图中心到全局对象
    saveMapCenter:function () {
        var center = Event.mapObj.getCenter();
        GLOBAL.Constant.poi_search_result.lng = center.lng;
        GLOBAL.Constant.poi_search_result.lat = center.lat;
    },
//    存储终点经纬度
    saveDestination:function () {
        localStorage['Map_poi_lng'] = GLOBAL.Constant.poi_search_result.lng;
        localStorage['Map_poi_lat'] = GLOBAL.Constant.poi_search_result.lat;
    },
//    TODO 使用PoiSDK和navigtor.onLine判断联网、联机状态，以后如果PoiSDK不放在server上，需要修改该方法.
//    @param {string} 服务器上某文件的typeof值
//    @author zhanghongliang
    checkNetBySdk:function (configServer) {
        var configServer = $.extend({
            typeOfServerObj:typeof PoiSDK
        }, configServer);
        var serverState = configServer.typeOfServerObj != 'undefined',
            pattern = /navigate\/index\.html$/;
//        开始页和安全页不判定网络状态
        var bConnect = pattern.test(location.href) ? serverState : true;
//        navigator.onLineonLine 属性是一个只读的布尔值，声明了系统是否处于脱机模式
        return bConnect && navigator.onLine;
    },
//    TODO 需要使用其他方法判断网络连接状态
    checkNet:function () {
        return top.window.navigator.onLine;
    },

    /**
     * 判断字符串或对象是否为空
     * @param o
     * @returns {Boolean}
     */
    isBlank:function (o) {
        if (typeof o == "undefined")
            return true;
        if (o instanceof String || typeof o == "string") {
            o = o.replace(/(^\s*)|(\s*$)/g, "");
            return o.length == 0;

        }

        return false;
    },
    /**
     +------------------------------------------------------------
     * 将分钟转换为hh:mm格式
     +------------------------------------------------------------
     *@param newM 分钟
     +------------------------------------------------------------
     */
    formatMinute:function (newM) {
        if (typeof newM !== 'undefined') {
            var minute = Math.round(newM);
            if (minute < 61)
                return minute + " 分";
            else {
                var h = Math.floor(minute / 60);
                var m = minute % 60;
                return h + "小时" + m + "分钟";
            }
        } else {
            return '未知';
        }
    },
//为输入框加入自动完成功能
    AutoCompleteHelper:function (city) {
        //构建类实例
        var poiservice = typeof PoiSDK != "undefined" ? PoiSDK : parent.window.PoiSDK , MPoi = new poiservice.PoiSearch({});
        return {
            source:function (request, response) {
                MPoi.inputPrompt(request.term, city, function (data) {
                    var resultList = [];
                    if (typeof data.list != "undefined")
                        resultList = data.list;
                    response($.map(resultList, function (item) {
                        return {
                            label:item,
                            value:item
                        }
                    }))
                });
            },
            minLength:1,
            select:function (event, ui) {
                $(this).value = this.value;
            },
            open:function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close:function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
        };
    },
    /**
     * 地图工具类
     */
    MapUtil:{
        /**根据道路形状点调整地图的zoom
         * @param mapObj {object}MMap.Map实例
         * @param pathArray {array}路径形状的数组
         * @param w {Number} 地图宽度
         * @param h {Number} 地图高度
         */
        setPathZoom:function (mapObj, pathArray, w, h) {
            var bounds = this.getPathBounds(pathArray);
            this.setBounds(mapObj, bounds, w, h);
        },
        /**
         * 根据bounds计算地图缩放级别
         * @param mapObj {object}MMap.Map实例
         * @param bounds {object}{southwest,northeast}
         * @param w {Number} 地图宽度
         * @param h {Number} 地图高度
         */
        setBounds:function (mapObj, bounds, w, h) {
            if (typeof bounds.southwest == "undefined" || typeof bounds.northeast == "undefined") {
                console.log("invalid bounds.");
                return;
            }
            var distance = mapObj.getDistance(bounds.southwest, bounds.northeast),
                centerPoint = new MMap.LngLat((bounds.southwest.lng + bounds.northeast.lng) / 2, (bounds.southwest.lat + bounds.northeast.lat) / 2);
            if (typeof w != "Number" || w <= 0) w = 800;//默认宽度
            if (typeof h != "Number" || h <= 0) h = 480;//默认高度
            //计算分辨率
            var resoultion = Math.round(distance) / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
            //计算ZOOM级别
            var level = Math.floor(Math.LOG2E * Math.log(Math.cos(centerPoint.lat * Math.PI / 180) * 2 * Math.PI * 6378137.0 / resoultion / 256)) - 1;
            mapObj.setZoomAndCenter(level, centerPoint);
        },
        /**
         * 计算道路的外接矩形，记录下左下(西南)和右上(东北)的两个点经纬度坐标
         * @param pathArray{array} lnglat数组
         */
        getPathBounds:function (pathArray) {
            var bounds = {minX:180, minY:90, maxX:-180, maxY:-90},
                compare = function (lnglat) {
                    bounds.minX = Math.min(lnglat["lng"], bounds.minX);
                    bounds.minY = Math.min(lnglat["lat"], bounds.minY);
                    bounds.maxX = Math.max(lnglat["lng"], bounds.maxX);
                    bounds.maxY = Math.max(lnglat["lat"], bounds.maxY);
                };

            for (var i = 0; i < pathArray.length; i++) {
                compare(pathArray[i]);
            }
            return {'southwest':new MMap.LngLat(bounds.minX, bounds.minY), 'northeast':new MMap.LngLat(bounds.maxX, bounds.maxY)};
        }
    }
};

//        @class 错误处理子类
//        @param e {Error} 应有message属性.可以有回调方法sureCallback
GLOBAL.common.error.ErrorMsgToServer = function (error) {
    if (typeof error == 'undefined') {
        var error = {};
    }
    this.level = error.level || error.type || 'unknown error level';
    this.message = error.message || 'no message property';
    this.stack = error.stack || 'no call stack, called outside perhaps';
    this.sureCallback = error.sureCallback || $.noop;
};
GLOBAL.common.error.ErrorMsgToServer.prototype = {
    pushMessage:function () {
        console.log(this.message);
        GLOBAL.common.logError(this.level, this.message, this.stack);
        var config = {
                id:'confirm_box',
                msg:GLOBAL.Constant.prompt_exception,
                sureCallback:this.sureCallback
            },
            layer = GLOBAL.layer.createNew(config);
//            layer.show();
        this.sureCallback();
    }
};

/**
 * @class 元素点击ui设置类
 */
GLOBAL.common.EleEventUiClass = function (config) {
    var config = $.extend({
        context:document,
        arrNoEffectImgs:[],
        arrEffectEleExceptImg:[]
    }, config);

//    私有变量
    var _context = config.context,
        _arrNoEffectImgs = config.arrNoEffectImgs,
        _arrEffectEleExceptImg = config.arrEffectEleExceptImg,
        _strEffectEle = _getClickEffectEle(),
        _userBehavior = this.getUserBehavior()   ,
        objBehavior = {
            mousedown:_changeEleUi,
            touchstart:_changeEleUi,
            mouseleave:_changeEleUiByState,
            mouseup:_changeEleUiByState,
            touchend:_changeEleUiByState,
            touchmove:_changeEleUiByState
        };
//    私有方法
    function _getClickEffectEle() {
        var str = '',
            imgNoEffect = _arrNoEffectImgs.join(','),
            strOtherElector = _arrEffectEleExceptImg.join(',');
        str = strOtherElector + ', img';
        str += $.trim(imgNoEffect) == '' ? '' : (':not(' + imgNoEffect + ')');
        return str;
    }

    function _toggleEleUi(config) {
        $(this.eventObj.currEle)[config.method](config.prop, function (index, value) {
//            如果存在该值，且不为灰色图片，则替换
            if (value && !/_gray\.png/.test(value)) {
                return  /_on\.png/.test(value) ? value.replace(/\_on(.png)/, '$1') : value.replace(/(\.png)/, '_on$1');
            }
        });
    }

    function _changeEleUiByState() {
        if (this.eventObj.state) {
            _changeEleUi.apply(this)
        }
    }

    function _callBehaviorHandler() {
        objBehavior[this.getCurrBehavior()].apply(this);
    }

    function _changeEleUi() {
        var objSrc = {
                prop:'src',
                method:'attr'
            }           ,
            objBg = {
                prop:'background-image',
                method:'css'
            };
        _toggleEleUi.call(this, objSrc);
        _toggleEleUi.call(this, objBg);
        this.eventObj.state = !this.eventObj.state;
    }

    //    特权方法
    this.bindEleClickUiEvent = function () {
        var that = this;
        $(_context)
            .on(_userBehavior.start + ' ' + _userBehavior.move + ' ' + _userBehavior.end,
            _strEffectEle,
            function (e) {
//                The target property can be the element that registered for the event or a descendant of it
//event.currentTarget will typically be equal to the this of the function.
                that.eventObj = {
                    eventType:e.type,
                    currEle:e.currentTarget,
                    state:that.eventObj ? that.eventObj.state : false
                };
                _callBehaviorHandler.apply(that);
                return false;
            });
    };
};

GLOBAL.common.EleEventUiClass.prototype = {
    getCurrBehavior:function () {
        return this.eventObj.eventType;
    },
    getEventData:function () {
        return this.eventObj;
    },
    supportTouch:{
        touch:(navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/android/i))
    },
    getUserBehavior:function () {
        var behavior = {
            start:this.supportTouch.touch ? 'touchstart' : 'mousedown',
            move:this.supportTouch.touch ? 'touchmove' : 'mouseleave',
            end:this.supportTouch.touch ? 'touchend' : 'mouseup'
        };
        return behavior;
    }
};

/**
 * @Class  GLOBAL.WatchGPS 调用html5 地理位置接口函数获取当前地点的位置信息
 * @param config
 * @constructor
 */
GLOBAL.WatchGPS = function (config) {
    var that = this;
    if (config) {
        this.onSuccess = config.onSuccess;
        this.onError = function (error) {
            GLOBAL.WatchGPS.handle_error(error);
            config.onError(error);
        };
        this.options_gps = config.options_gps || GLOBAL.Constant.options_gps;
    }
};
GLOBAL.WatchGPS.currGPS = null;
GLOBAL.WatchGPS.lastGPS = null;
GLOBAL.WatchGPS.logGPSId = 0; //TODO Only for gps log navigation
GLOBAL.WatchGPS.handle_error = function (err) {
    //错误处理
    console.log(err.code, err.message);
    var ErrCode = {
        '1':"位置服务被拒绝。",
        '2':"暂时获取不到位置信息。",
        '3':"获取信息超时。",
        'default':"未知错误。"
    }
    console.log(ErrCode[err.code] === undefined ? ErrCode['default'] : ErrCode[err.code]);
};

GLOBAL.WatchGPS.handle_position = function (position) {
    var config = {
        lng:position.coords.longitude,
        lat:position.coords.latitude,
        altitude:position.coords.altitude
    };
    //将当前位置车位置经纬度存储在localStorage中，以便其他页面访问,尚未提供GPS接口
    GLOBAL.common.modifyCurrentPosition(config);
}
GLOBAL.WatchGPS.GetCurrentPosition = function () {
    var watchGPS = GLOBAL.WatchGPS;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(watchGPS.handle_position, watchGPS.handle_error);
    } else {
        console.log("你的浏览器不支持使用HTML5来获取地理位置信息。");
        location.href = '../safe/index.html';
    }
};
GLOBAL.WatchGPS.generateGPS = function (position) {
    try {
        var temp = parent.updateCoord(position.coords.latitude, position.coords.longitude), gpsinfo = {};
        if (parseFloat(temp.lon)) {
            gpsinfo.longitude = parseFloat(temp.lon);
        }
        if (parseFloat(temp.lat)) {
            gpsinfo.latitude = parseFloat(temp.lat);
        }
        gpsinfo.speed = position.coords.speed * 3.6; //速度单位从m/s转换到km/h
        gpsinfo.direction = position.coords.heading;
        var date = new Date();
        date.setTime(position.timestamp);
        // TODO 确认
        gpsinfo.year = date.getFullYear();
        gpsinfo.month = date.getMonth() + 1;
        gpsinfo.day = date.getDate();
        gpsinfo.hour = date.getHours();
        gpsinfo.minute = date.getMinutes();
        gpsinfo.second = date.getSeconds();
        if (typeof parent.logtest != "undefined") {
            var gpsinfostr = gpsinfo.longitude + "," + gpsinfo.latitude + "," + gpsinfo.speed + "," + gpsinfo.direction + "," + date.getTime() + ",";
            parent.logtest.writeFile(gpsinfostr);
        }
        return gpsinfo;
    } catch (e) {
        var err = new GLOBAL.common.error.ErrorMsgToServer(e);
        err.pushMessage();
    }
};
GLOBAL.WatchGPS.prototype = {
    //通过html5接口轮询服务器，获取gps信息
    inspectCurrentGPS:function () {
        var that = this, watchGPS = null;
        if (navigator.geolocation && !GLOBAL.Constant.tbt_gpsLog_state)
            watchGPS = navigator.geolocation.watchPosition(function (position) {
                that.onSuccess(position);
            }, that.onError, that.options_gps);
        else
            try {
                watchGPS = GLOBAL.NavClass.pushGPSLogLatLon();
            } catch (e) {
                var err = new GLOBAL.common.error.ErrorMsgToServer(e);
                err.pushMessage();
            }
        return watchGPS;
    }
};

//TODO 需要迁移到相关页面js文件
document.oncontextmenu = function () {
    return false;
};

GLOBAL.common.setEleEffect();