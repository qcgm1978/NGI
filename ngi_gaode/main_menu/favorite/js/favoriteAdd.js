/**
 * 收藏夹添加页面控制
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: favoriteAdd.js
 * @Description: 收藏夹添加页面控制
 * @author chengpawang
 * @date 2012-4-20
 * @version V1.0
 * Modification History:
 */
$(function () {
    $('input').bind('keyup', function () {
        var flag = false;
        flag = Tab.checkLength(GLOBAL.Constant.maxLength, $(this));
        if (flag) {
            if (GLOBAL.layer.hasOwnProperty("createNew")) {
                GLOBAL.layer.createNew({id:"confirm_box", msg:GLOBAL.Constant.prompt_reInput}).show();
            } else {
                parent.GLOBAL.layer.createNew({id:"confirm_box", msg:GLOBAL.Constant.prompt_reInput}).show();
            }
        }
    });
    //按回车键跳到下一元素。如果是最后一个自动提交
    $('input').each(function (i) {
        $(this).keydown(function (event) {
            if (event.keyCode == 13) {
                var $ele = $('input').eq(i + 1);
                if ($ele.is('input')) {
                    $ele.focus();
                }
                else {
                    $('#confirm').click();
                }
            }
            ;

        });
    });

    GLOBAL.namespace("favoriteAdd");

    //加载数据库中我家的数据

    GLOBAL.favoriteAdd.favoriteService = new FavoriteService();

    //逆地址查询(因为这个方法的使用，要引入mapabc的JS文件(这个文件的引入是费时的) ， 如果在进入添加页面时直接查询出之后再保存，在此页面直接读取会好一些)

    var config = GLOBAL.common.LocalSave.read('Map_poi');
    $('#name').val(config.name);
    $('#address').val(config.address);
    $('#tel').val(config.tel);

    //绑定确定按钮点击事件
    //数据库存储，实现的功能：用户点击确定后将信息插入数据库中。迭代开发中，要求如果新地点的经纬度和数据库中该table中的某行数据经纬度相同，则提示您已添加此收藏，不再收藏该信息

    $('#confirm').click(function () {
        //config.type = $('#category select').val();
        var parentcons = parent.window.GLOBAL.Constant;
        GLOBAL.favoriteAdd.config = {
            type:$('#category').val(),
            name:$('#name').val(),
            lng:parentcons.poi_search_result.lng,
            lat:parentcons.poi_search_result.lat,
            address:$('#address').val(),
            tel:$('#tel').val()
        };

        checkBeforeSave(GLOBAL.favoriteAdd.config);
    });
});

/**
 * 插入前的检查，检查当前地点是否已经收藏，当前类别的收藏数目是不是超过上限，超上限则删除最早的记录
 * @param db 执行sql语句的数据库
 * @param data 需要检查的地点信息
 */
function checkBeforeSave(data) {

    //sql执行成功的处理方法
    var success = function (tx, rs) {
        var length = rs.rows.length;
        var rsItem = null;
        var bool = JSON.parse(localStorage['tbt_state']);
        var returnMapMethod = bool ? parent.window.GLOBAL.Event.NavScreenEvent.showNaviMapScreen : parent.window.GLOBAL.Event.NavScreenEvent.showInitMapScreen;
        var oldestId = Number.MAX_VALUE;
        for (var i = 0; i < length; i++) {
            rsItem = rs.rows.item(i);
            if (oldestId > rsItem.id) {
                oldestId = rsItem.id;
            }
            //如果当前地点已经收藏，则跳转到导航首页
            if (rsItem.lng == data.lng && rsItem.lat == data.lat && rsItem.name == data.name) {
                parent.window.GLOBAL.Event.NGIStateManager.returnToMapDirectly(returnMapMethod);
                return;
            }
        }
        //如果超过最大限度则删除最后一条数据
        if (length > GLOBAL.Constant.restrict_favor) {
            console.log("超过上限,删除最早的记录...");
            GLOBAL.favoriteAdd.favoriteService.deleteById(oldestId);
        }

        //如果没有收藏则存储当前地点
        GLOBAL.favoriteAdd.favoriteService.saveFavor(data, function (tx, result) {
            parent.window.GLOBAL.Event.NGIStateManager.returnToMapDirectly(returnMapMethod);
            return;
        });

    };


    GLOBAL.favoriteAdd.favoriteService.findByType(data.type, success);

}
