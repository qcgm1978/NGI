/**
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title:   IframeClass.js
 * @Description:
 * @author wangyonggang qq:135274859
 * @date 12-9-13
 * @version V1.0
 * Modification History:
 */



var IframeClass = {
    config:{
        //在id元素里面创建Iframe
        parentID:"iframeDiv",
        //iframe ID
        id:"iframeHTML",
        //iframe名称，window可访问
        name:"iframeHTML",
        //iframe要加载的src
        src:""
    },
    createNew:function () {
        var iframeObj = {};
        var ifm = $('#' + IframeClass.config.id), ifmParent = $('#' + IframeClass.config.parentID);
        var bindEvent = function () {
//        区分浏览器进行事件绑定，不对onload直接赋值，否则不能追加绑定onload事件
            if (window.attachEvent) {
                $('iframe')[0].attachEvent('onload', function () {
                    iframeOnload();
                });//对于IE
            }
            else {
                $('iframe')[0].addEventListener('load', function () {
                    iframeOnload();
                }, false);//对于FireFox、chrome
            }
        };
        var unbindEvent = function () {
            if (typeof frames[0].jQuery !== 'undefined') {
                for (var id in frames[0].jQuery.cache) {
                    if (frames[0].jQuery.cache[ id ].handle) {
                        try {
                            frames[0].jQuery.event.remove(frames[0].jQuery.cache[ id ].handle.elem);
                        } catch (e) {
                        }
                    }
                }
                //清除绑定数据
                jQuery(frames[0].document).find('*').each(function (index) {
                    jQuery.removeData(this);
                });
            }
        };
        var iframeOnload = function () {
            $('img[alt="返回按钮"],img[alt="返回地图按钮"]', window.frames[0].document).live('click', function () {
                //双光柱，路线详细页返回
                if (IframeClass.config.src == "subsection.html" && !JSON.parse(localStorage['tbt_state']) && !GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus/* && !GLOBAL.Constant.nav_obj.bReroute*/) {
                    GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.BackToLightCrossScreen, {'listenerAddress':listenerAddress});
                }
                else if ($(this).attr('alt') == '返回地图按钮') {
                    GLOBAL.Event.NGIStateManager.returnToMapDirectly(GLOBAL.Event.NavScreenEvent.showReturnToMapDirectlyScreen, {'listenerAddress':listenerAddress, 'backUrl':GLOBAL.Constant.NGIStatesURL.Map});
                }
                else {
                    var nextState = GLOBAL.Event.NGIStateManager.getNextState();//获取返回的状态
                    var backUrl = GLOBAL.Constant.NGIStatesURL[nextState];
                    GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.ShowPreviousScreen, {'listenerAddress':listenerAddress, 'backUrl':backUrl});
                }
            });
        };
        if (ifmParent.length === 0) {
            $('<div id=' + IframeClass.config.parentID + ' />').appendTo('body');
        }
        ifmParent.css({margin:'-480px auto', position:"relative", "z-index":"1001", display:"none"});
        if (ifm.length === 0) {
            $('<iframe />', {
                id:IframeClass.config.id,
                name:IframeClass.config.name,
                'class':'w800 h480 pa',
                frameborder:"no",
                border:'0',
                marginWidth:'0',
                marginHeight:'0',
                scrolling:'no',
                allowtransparency:'true',
                src:IframeClass.config.src
            }).appendTo(ifmParent);
            bindEvent();
        }
        iframeObj.showAndSkip = function (param) {
            iframeObj.setIframe(param);
            iframeObj.show();
            return iframeObj;
        };
        iframeObj.setIframe = function (param) {
            var frame = document.getElementById(IframeClass.config.id);
            if (frame.src !== param.src) {
                IframeClass.config = $.extend(IframeClass.config, param);
                frame.id = IframeClass.config.id;
                frame.name = IframeClass.config.name;
                frame.src = IframeClass.config.src;
            }
            return iframeObj;
        };
        iframeObj.show = function () {
            if (GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
                GLOBAL.Constant.nav_obj.Pause();
                GLOBAL.Constant.mapCenter = Event.mapObj.getCenter();
                $('#simulator').hide();
            }
            if ($('#light_cross_html').is(':visible')) {
                ifmParent.css({margin:'-960px auto'});
            } else {
                ifmParent.css({margin:'-480px auto'});
            }
            ifmParent.show();
            return iframeObj;
        };
        iframeObj.hide = function () {
            ifmParent.hide();
            return iframeObj;
        };
        iframeObj.isShow = function () {
            return  ifmParent.is(":visible");
        };
        var listenerAddress = iframeObj.remove = function () {
            var frame = document.getElementById(IframeClass.config.id);
            if (frame) {
                frame.src = '';
                ifmParent.hide();
                unbindEvent();
            }
            return iframeObj;
        };
        return iframeObj;
    }
};
iframeObj = IframeClass.createNew();