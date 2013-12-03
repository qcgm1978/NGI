// JavaScript Document

$(function() {
	$('img[alt="出厂设置"]').click(function() {
        var config={
            id:"prompt_box",
            msg:GLOBAL.Constant.prompt_restoreSettings,
            sureCallback:callbackMethod
        } ;
        function callbackMethod(){
            var ini = GLOBAL.common.LocalSave.read('Map_ini');
            $.each(ini, function (i, n) {
                if(i !== "Map_lat" && i !== "Map_lng" )
                    localStorage[i] = n;
            });
            localStorage['favorite_local'] = '';
            localStorage['Map_keywords'] = '';
            var pt = new parent.MMap.LngLat(localStorage['Map_lng'],localStorage['Map_lat']);
            parent.Event.mapObj.getOverlays('current').setPosition(pt);//修改自车位置
            parent.GLOBAL.Event.NavScreenEvent.initTrafficMessageBubbles();//初始化情报板开关状态
        }
        GLOBAL.layer.createNew(config).show();
	});	 
	$('td img[alt="GPS信息"]').click(function(){
		parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.GpsInfo, showGpsInfoScreen);
	});
	$('td img[alt="版本信息"]').click(function(){
		parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.VersionInfo, showVersionInfoScreen);
	});
	//显示gps信息界面
	function showGpsInfoScreen(){
	    location.href = 'gps.html';
	    return true;
	}
	//显示版本信息界面
	function showVersionInfoScreen(){
	    location.href='version.html';
		return true;
	}
	//显示图例说明界面
	function showTrafficLegendScreen(){
	    location.href = 'legend.html';
	    return true;
	}
});