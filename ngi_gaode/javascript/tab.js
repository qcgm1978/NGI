var Tab = {
    /**
     * @function 时间间隔计算
     */
    getDateDiff:function (startDate, endDate, interval) {
        var startTime = new Date(Date.parse(startDate)).getTime(),
            endTime = new Date(Date.parse(endDate)).getTime();
        var dates = Math.abs((startTime - endTime)) / 1000;
        return  dates > interval;
    },
    /**
     * @description 生成动态光柱的参数
     */
    generateArgLightCross:function (config) {
        var arg, objConfig = {
            data:config[0],
            traffic:config[1]
        };
        try {
            arg = {
                data:objConfig.data,
                traffic:objConfig.traffic
            };
        } catch (err) {
            console.log(err.message);
        }
        return arg;
    },
    /**
     * @function 如果返回的绘制光柱的颜色数据为[[], []],转换为[[1], [0]]
     */
    changeTmcLightCrossData:function (arrLight) {
        if (arrLight == null || arrLight[0] == null || arrLight[0].length < 1) {
            /**
             * @description 如果没有动态交通信息，显示未知状态光柱，即灰色光柱，第一个数组的唯一元素表示全程为1，
             *              第二个数组的唯一元素表示路况为0，即未知路况
             */
            arrLight = [
                [ 1 ],
                [ 0 ]
            ];
        }
        return arrLight;
    },
    /**
     * @function 设置光柱效果
     */
    set_bg:function (config) {
        var metric = config.metric,
            total = 0,
            $div = $('<div />'),
            pend = (config.id === 'light_cross') ? 'appendTo' : 'prependTo';
        $.each(config.arr, function (i, n) {
            var passage = parseInt(n.percent * config.total);
            $('<img />')
                .css(metric, passage)
                .attr('src', config.address + n.color + '.png')
                [pend]($div);
            total += passage;
        });
        if (total < config.total) {
            var color = config.arr[0].color;
            $('<img />')
                .css(metric, config.total - total)
                .attr('src', config.address + color + '.png')
                .appendTo($div);
        }
        $('#' + config.id)
            .empty()
            .append($div);
    },
    // 加载点击地图产生的经纬度信息，解析的数据
    // 逆地理编码又称位置描述或地址解析，即从已知的经纬度坐标到对应的地址描述（如省市、街区、楼层、房间等）的转换
    coord_regeocode:function (lng, lat, callback) {
        var geocoderOption = {
            range:10000, //范围
            crossnum:0,
            roadnum:0,
            poinum:1//POI点数
        };
        var poiService = typeof PoiSDK != "undefined" ? PoiSDK : parent.PoiSDK;
        var geocoder = new poiService.Geocoder(geocoderOption);
        geocoder.regeocode(new poiService.LngLat(lng, lat), function (data) {
            if (data) {
                if (data.error) {
                    console.log(data.error.description, 'failed to regeocode.');
                    return;
                }
                else {
                    callback(data);
                }
            }
            else {
                console.info('no data about the coordinate');
            }
        });
    },
    //验证当前兴趣点与自车位置是否相同,1,不相同：返回true，2,相同，返回false
    validate_poi:function () {
        var lng, lat;
        if (parent.window && parent.window.constant) {
            lng = parent.window.GLOBAL.Constant.poi_search_result.lng;
            lat = parent.window.GLOBAL.Constant.poi_search_result.lat;
        } else {
            lng = GLOBAL.Constant.poi_search_result.lng;
            lat = GLOBAL.Constant.poi_search_result.lat;
        }
        if (isNaN(localStorage['Map_lng']) || isNaN(localStorage['Map_lat'])
            || isNaN(lng) || isNaN(lat)) {
            return false;
        }
        if (localStorage['Map_lng'] != lng || localStorage['Map_lat'] != lat) {
            return true;
        } else {
            return false;
        }
    },

    //数值转换函数，
    unit_conversion:function (m, decimal) {
        if ($.trim(m) == '') {
            return '0m';
        }
        if (m == Infinity)
            return "未知";
        if (m < 1000) {
            return parseInt(m) + 'm';
        }
        else {
            //number的字符串表示，不采用指数计数法，小数点后有固定的digics位数字。如果 必要，该数字会被舍入，也可以用0补足，以便它达到指定的长度。
            var k = 0;
            //如果大于等于100公里，不显示小数
            if (m / 1000 >= 100) {
                k = (m / 1000).toFixed(0);
            }
            else {
                k = (m / 1000).toFixed(decimal);
            }
            return k + 'km';
        }

    },
    //设置显示灰色图片或背景效果
    gray_img:function (config) {
        config.ele.attr(config.attr, function (index, attr) {
                if (!attr.match(/_gray/)) {
                    var str = attr.replace(/(\.png)$/, '_gray$1');
                    return str;
                }
            }
        );
    },
    /**
     * @event 正常显示图片
     */
    displayNormalImg:function (config) {
        config.ele.attr(config.attr, function (index, attr) {
                var str = attr.replace(/_gray(\.png)$/, '$1');
                return str;
            }
        );
    },
    //显示时间
    startTime:function ($container) {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        h = this.formatTime(h);
        m = this.formatTime(m);
        if ($('time')) {
            $('#time_right time').text(h + ':' + m);
        }
        if (navigator.userAgent.indexOf("MSIE") > 0) {
            if ($('#time_right span').length < 1) {
                $('<span>', {'class':'fc_top'}).appendTo('#time_right');
            }
            $('#time_right span').text(h + ':' + m);
        }
        var t = window.setTimeout(function () {
            Tab.startTime();
        }, 60);
    },
    //检测时间，两位数显示
    formatTime:function (i) {
        if (i < 10) {
            i = "0" + i
        }
        return i
    },
    //检测输入框输入字符长度是否超出给予的长度
    checkLength : function(num, obj) {
        var $input = obj;
        var length = $input.val().replace(/[^\x00-\xff]/g, 'aa').length;
        if (length > num) {
            $input[0].blur();
            $input.val($input.val().replace(/[^\x00-\xff]{1}$|.$/, ""));
            arguments.callee(num, obj);
            return true;
        }
        return false;
    }
};

/**
 * @class 验证图片src和background-image类
 * @param [jquery object or array] 要验证的jquery对象或由其组成的数组
 */
function ImgValidate($obj) {
    this.obj = $obj;
    this.regex = /_on(_gray)?\.png$/;
    this.state = false;
    this.index = NaN;
    this.validateSelected();
}
ImgValidate.prototype = {
    validateSelected:function () {
        var that = this;
        if (this.obj.length == 1) {
            var config = this.retSrcBg(this.obj);
            this.state = !!(config.src.match(this.regex) || config.bg.match(this.regex));
        }
        else if (this.obj instanceof Object) {
            $.each(this.obj, function (i, n) {
                var config = that.retSrcBg($(n));
                if (config.src.match(that.regex) || config.bg.match(that.regex)) {
                    that.state = true;
                    that.index = i;
                    return false;
                }
            });
        }
    },
    /**
     * @return 返回jquery对象的src和background-image属性构建的对象
     */
    retSrcBg:function ($obj) {
        /**
         * @default '' [string] 必须有值，否则返回undefined，不能使用match方法
         */
        var boolSrc = $obj.attr('src') || '',
            boolBg = $obj.attr('background-image') || '';
        return {
            src:boolSrc,
            bg:boolBg
        };
    }
};

/**
 * @example 主界面动态光柱模拟信息
 **/
/**
 *
 * @param arrLight
 * @constructor
 */
var SimulatorLight = function (arrLight) {
    var arg = Tab.generateArgLightCross(arrLight.arr);
    this.data = arg.data;
    this.traffic = arg.traffic;
    this.arr = this.conversion();
    this.id = arrLight.id;
    this.total = arrLight.total;
    this.metric = arrLight.metric;
    this.address = arrLight.address;
};
SimulatorLight.color = ['grey', 'green', 'yellow', 'red'];
SimulatorLight.prototype.generateArg = function () {
    var argLight = {
        arr:this.arr,
        id:this.id,
        total:this.total,
        metric:this.metric,
        address:this.address
    };
    return argLight;
};
SimulatorLight.prototype.conversion = function () {
    var len = this.data.length, total = 0, arr = [];
    $.each(this.data, function (i, n) {
        total += n;
    });
    var self = this;
    $.each(this.data, function (i, n) {
        /**
         * @description 数字对应的交通路况 0, // 道路状态未知。 1, // 道路通畅。 2, // 道路缓行。 3, //
         *              道路阻塞严重
         */
        var colorVal = self.traffic[i];
        var config = {
            color:SimulatorLight.color[colorVal],
            percent:n / total
        };
        arr.push(config);
    });
    return arr;
};
// 清除系统自动title提示
//$("table").delegate("td", "mouseover", function () {
//    $(this).attr('myTitle', $(this).attr('title'));
//    $(this).attr('title', '');
//});
//$("table").delegate("td", "mouseout", function () {
//    $(this).attr('title', $(this).attr('myTitle'));
//});

//指定多少毫秒无动作将跳转
function ScreenSaver(settings) {
    this.settings = settings;
    //将无动作时间值作为实例属性
    this.nTimeout = this.settings.timeout;
    //将目标地址作为实例属性
    if (this.settings.url)
        this.url = this.settings.url;
    if (this.settings.callback) {
        this.callback = this.settings.callback;
    }
    document.body.screenSaver = this;
    // link in to body events   
    document.body.onmousemove = ScreenSaver.prototype.onevent;
    document.body.onmousedown = ScreenSaver.prototype.onevent;
    document.body.onkeydown = ScreenSaver.prototype.onevent;
    document.body.onkeypress = ScreenSaver.prototype.onevent;

    var pThis = this;
    //类的私有方法
    var f = function () {
        pThis.timeout();
    };
    //声明实例属性，一定时间后开始调用私有方法f
    this.timerID = window.setTimeout(f, this.nTimeout);
}
ScreenSaver.prototype.timeout = function () {
    if (!(this.saver)) {
        if (this.url)
            window.location = this.url;
        if (this.callback) {
            ($.proxy(this.callback, thisPage))();
        }
    }
};
ScreenSaver.prototype.signal = function () {
    if (this.saver) {
        this.saver.stop();
    }
    window.clearTimeout(this.timerID);
    var pThis = this;
    var f = function () {
        pThis.timeout();
    }
    this.timerID = window.setTimeout(f, this.nTimeout);
};

ScreenSaver.prototype.onevent = function (e) {
    this.screenSaver.signal();
};




