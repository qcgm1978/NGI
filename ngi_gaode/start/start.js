// 开始页面js文件，包括项目初始化代码，无论初始化是否成功，都会跳转到安全页面
$(function () {
    Start = {
        i:0,
        //end初始值为false，代码全部执行后设置为true，才能跳转到下一个页面
        end:false,
        interTime:3000,
        //记录导航过程中对应用程序的设置以便下次进入时使用
        appParameters:{
            //当前是否是导航状态
            "tbt_state":false,
            //默认显示快速线路，普通线路为0
            'route_type':4,
            'Navi_Compass_Mode':"NorthUp" //地图向上模式，另一种情况是车头向上（HeadUp）
        },
        ini_value:{
            //动态交通-功能设定页面默认值
            //动态更新频率,默认两分钟
            'Map_tbt_fqcy':2,
            //默认显示当前路况信息
            'Map_tbt_display':true,
            //动态光柱默认显示
            'Map_tbt_conditions':true,
            //路径视野范围默认值两公里
            'Map_tbt_view':2,
            //系统设定页面默认值
            'Map_system_style':'switcher',
            //语音提示,可选值concise, detailed,默认详细显示
            'Map_system_prompt':'detailed',
            //电子眼提示,可选值true,false,默认显示
            'Map_system_eye':true, //1播报，0，不播报
            //音量值，区间未定，需根据硬件要求完善。
            'Map_system_volume':'09',
            //是否设置静音,默认有声音
            'Map_system_voice':true, //可能不需要
            //比例尺默认值
            'Map_scale':15,
            'Map_poi_range':2000,
            //关键词查询，默认为上海市内的poi检索
            'Map_search_area':'上海市',
            'Map_lng':'121.499053',
            'Map_lat':"31.2392739",
            'Map_keywords':'', //用户搜索的最后五个关键词,
            'TMCReroute':true,
            'TMCReroutePrompt':true,
            'TMCBroadcast':true,
            'favorite_local':'',
            'RouteRequestType':5, //0最优路径，1快速路，2距离优先，3普通路，4考虑实时路况，5多路径
            //交通情报板，默认打开
            'traffic_panel_on':true
        },
        systemInitialize:function () {
            var start = {};
            //替换进度条内显示的图片地址
            start.replace_src = function () {
               location.href = '../safe/index.html';
                return start;
            };

            start.iniLocalSysVal = function (ini) {
                GLOBAL.common.LocalSave.save('Map_ini', ini);
                return start;
            };
            start.setSystemVal = function () {
                var systemValue = JSON.parse(localStorage['Map_ini']);
//系统初始化，系统本次通电后第一次进入时，进行初始化。如果值不存在，重新赋值（确保系统值存在）
                $.each(systemValue, function (i, n) {
                    if (localStorage[i] === undefined)
                        localStorage[i] = n;
                });
                return start;
            };

            start.setNavSystemVal = function (appParameters) {
                $.each(appParameters, function (i, n) {
//                    如果变量未声明或为undefined字符串
                    if (localStorage[i] === undefined || localStorage[i] === 'undefined')
                        localStorage[i] = n;
                });
                return start;
            };
            start.setUiGetGps = function () {
                GLOBAL.common.error.handleConnectNet();
                //获取当前经纬度并更新本地存储的位置信息（自车位置）
                GLOBAL.WatchGPS.GetCurrentPosition();
                setInterval(Start.systemInitialize().replace_src, Start.interTime);
                return start;
            };
            return start;
        }
    };

    try {
        Start.systemInitialize()
            .iniLocalSysVal(Start.ini_value)
            .setSystemVal()
            .setNavSystemVal(Start.appParameters)
            .setUiGetGps();
//        系统初始化结束
        Start.end = true;
    } catch (e) {
        e.sureCallback = function () {
            location.href = '../safe/index.html';
        };
        var err = new GLOBAL.common.error.ErrorMsgToServer(e);
        err.pushMessage();
    }
});