/**
 * 弹出层操作
 *
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: Layer.js
 * @Description: 弹出层操作
 * @author wangyonggang qq:135274859 zhanghongliang qq: 20132277
 * @date 2012-6-27
 * @version V1.0 Modification History: 2012-8-17
 */

Layer = {
    identifier : 0,
    layerID:[],
    /**
     * @param options  Receive alert_box、 confirm_box、 prompt_box、 spinner four states，msg,sureCallback,cancelCallback;maskLayerOptions Receive left,top,width,height,backgroundColor,opacity
     * @return {Object}
     */
    createNew:function (options,maskLayerOptions) {
        var layer = {};
        var layerid = "layerID"+(new Date()).getTime() + parseInt(Math.random()*100000);
        Layer.layerID.push(layerid);

        var layerOptions={
            id:"confirm_box",
            msg:"",
            sureCallback:"",
            cancelCallback:"",
            wrapHeight:480
        };
        var showBlockOverLayer = function () {
            if ($("#_blockOverLayer").length < 1) {
                $("<div>", {
                    "id":"_blockOverLayer"
                }).prependTo("body");
                if(typeof maskLayerOptions ==='object'){
                    $("#_blockOverLayer").css({
                        left:maskLayerOptions.left ||($(window).width() -  $("#_blockOverLayer").width()) / 2 + "px",
                        top: maskLayerOptions.top || '0px',
                        width:maskLayerOptions.width || '800px',
                        height:maskLayerOptions.height || '480px',
                        backgroundColor:maskLayerOptions.backgroundColor || 'rgb(0, 0, 0)',
                        opacity:maskLayerOptions.opacity || '0.6'
                    });
                }else{
                    $("#_blockOverLayer").css({
                        left:($(window).width() -  $("#_blockOverLayer").width()) / 2 + "px",
                        top: "0px"
                    });
                }
            }
            $("#_blockOverLayer").show();
        };
        var hideBlockOverLayer = function () {
            $("#_blockOverLayer").hide();
        };
        var getPath = function () {
            var js = document.scripts || $("script");
            var jsPath;
            for (var i = js.length; i > 0; i--) {
                if (js[i - 1].src.indexOf("layer.js") > -1) {
                    var temp =js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/"));
                    jsPath = temp.substring(0, temp.lastIndexOf("/") + 1)+'images/';
                }
            }
            return jsPath;
        };
        var box;
        var createMsgBox = function () {
            var layerBox,html,jsPath = getPath();
            var config={
                prompt_box:'<section id="layerSection"><h3 class="f24"></h3></section><img class="layerYes" src=' + jsPath + 'yes.png /><img class="layerNo"  src=' + jsPath + 'no.png />',
                alert_box:'<section id="layerSection"><h3 class="f24"></h3></section>',
                confirm_box:'<section id="layerSection"><h3 class="f24"></h3></section><img  class="layerYes" src=' + jsPath + 'definitive02.png />',
                spinner: '<section id="layerSection"><img src=' + jsPath + 'spinner.gif id="spinner" /></section>'
            };
            html = config[layerOptions.id];
            layerBox = $('<aside>', {
                id:layerid,
                "class":'tc fb f20 none css3_center '+layerOptions.id+' ' ,
                html:html
            });
            layerBox.prependTo('body');
            if (layerOptions.id === 'spinner') {
                layerBox.css({width:'100px',height:'100px'});
                layerBox.find('#layerSection').width('100px');
            }else if(layerOptions.id === 'prompt_box'){
                layerBox.find('img:first').css({paddingRight:"57px"});
            }
           // layerBox = $('#'+layerid);
            return layerBox;
        };
        var bindClickEvent = function () {
            box.find('.layerYes').click(sureCallback);
            box.find('.layerNo').click(cancelCallback);
        };
        var sureCallback=function(){
            if (typeof layerOptions.sureCallback === "function"){
                layerOptions.sureCallback.apply(layer, [options]);
            }
            layer.hide();
        };
        var cancelCallback = function(){
            if (typeof layerOptions.cancelCallback === "function"){
                layerOptions.cancelCallback.apply(layer, [options]);
            }
            layer.hide();
        };
        var unbindClickEvent = function () {
            box.find('img').each( function (index) {
                $.event.remove(this,'click',layer.hide);
                $.event.remove(this,'click',sureCallback);
                $.event.remove(this,'click',cancelCallback);
            });
        };
        var setBoxCss = function () {
            box.addClass('box css3_center');
            box.css({
                "z-index":9999,
                position:'absolute',
                display:'none',
                left:($(window).width() - box.width()) / 2 + "px",
                top:(layerOptions.wrapHeight - box.height()) / 2 + "px"
            });
        };
        if (options) {
            layerOptions = $.extend(layerOptions, options);
        }
        box = createMsgBox();
        setBoxCss();
        if (layerOptions.msg !== "") {
            var length,spare;
            length =  layerOptions.msg.replace(/[^\x00-\xff]/g, 'aa').length;
            spare = length % 30;
            if(spare<10)
            box.find('#layerSection').width('280px');
            box.find('h3').html(layerOptions.msg);
        }
        layer.show = function () {
            if( box.is(":hidden")){
                Layer.identifier++;
                showBlockOverLayer();
                box.show();
                bindClickEvent();
            }
        };
        layer.hide = function () {
            if(Layer.identifier>0 && box.is(":visible")){
                Layer.identifier--;
                box.hide();
                unbindClickEvent();
            }
            if(Layer.identifier===0){
                hideBlockOverLayer();
            }
        };
        layer.remove = function () {
            Layer.identifier--;
            unbindClickEvent();
            if(Layer.identifier===0){
                hideBlockOverLayer();
            }
            box.hide();
            box.remove();
            var index =  Layer.layerID.indexOf(layerid);
            Layer.layerID.splice(index,1);
        };
        return {
            show : layer.show,
            hide : layer.hide,
            remove : layer.remove
        };
    }
};
GLOBAL.layer = Layer;