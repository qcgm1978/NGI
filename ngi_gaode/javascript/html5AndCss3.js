/**
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title:
 * @Description:
 * @author wangyonggang qq:135274859
 * @date 12-10-22
 * @version V1.0
 * Modification History:
 */
(function () {
    function $import(url,callback)
    {
        var async = false;
        var caller = this.caller;
        var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject('Msxml2.XMLHTTP');
        xmlhttp.open("GET", url, false);
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if(window.execScript)
                {// eval in global scope for IE
                    window.execScript(xmlhttp.responseText);
                }
                else
                {// 关键：用call来解决作用域问题 fo FF
                    eval.call(window, xmlhttp.responseText);
                }
                if(typeof(callback) == 'function')
                {
                    callback.call(caller);
                }
            }
        }
        xmlhttp.send();
    }
    var getPath = function () {
        var js = document.scripts || $("script");
        var jsPath;
        for (var i = js.length; i > 0; i--) {
            if (js[i - 1].src.indexOf("html5AndCss3.js") > -1) {
                jsPath =js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/")+1);
            }
        }
        return jsPath;
    };
    if(!-[1,]) {
        (function () {
            if (!/*@cc_on!@*/0)return;
            var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,figcaption,footer,header,hgroup,mark,menu,meter,nav, output,progress,section, time,video".split(','),
                i = e.length;
            while (i-- )
            {
                document.createElement(e[i])
            }
        })()
        $import(getPath() + 'DOMAssistantCompressed-2.7.4.js');
        $import(getPath() + 'ie-css3.js');
    }
})()