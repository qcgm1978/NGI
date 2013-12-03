/**
 * 收藏夹明细显示
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: favoriteDetail.js
 * @Description: 收藏夹明细显示
 * @author chengpawang
 * @date 2012-4-23
 * @version V1.0
 * Modification History:
 */

$(function () {
    GLOBAL.namespace("favoriteDetail");
    GLOBAL.favoriteDetail.favoriteService = new FavoriteService();

    // 加载收藏夹对应id数据
    GLOBAL.favoriteDetail.favoriteService.findById(GLOBAL.Constant.favor_id, show);
    GLOBAL.favoriteDetail.updatePOIbyId = function (options) {
        var config = options.config;
        var successcb = options.successcb;
        var errorcb = options.errorcb;
        var ret = GLOBAL.favoriteDetail.favoriteService.updateById(config, successcb, errorcb);
        if (ret != -1)
            return true;
        else
            return false;
    };
    GLOBAL.favoriteDetail.deletePOIbyId = function (options) {
        var config = options.config;
        var successcb = options.successcb;
        var errorcb = options.errorcb;
        var ret = GLOBAL.favoriteDetail.favoriteService.deleteById(config, successcb, errorcb);
        if (ret != -1)
            return true;
        else
            return false;
    };
    // 在页面内添加收藏数据信息
    function show(tx, rs) {
        if (rs) {
            var item = rs.rows.item(0);
            $('#name').val(GLOBAL.common.isBlank(item.name) ? GLOBAL.Constant.null_value : item.name);
            $('#address').val(GLOBAL.common.isBlank(item.address) ? GLOBAL.Constant.null_value : item.address);
            $('#tel').val(GLOBAL.common.isBlank(item.tel) ? GLOBAL.Constant.null_value : item.tel);
        }
    }
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
    // 绑定删除按钮事件

    $('#delete').click(function () {
        var config = {
            id:'prompt_box',
            msg :GLOBAL.Constant.prompt_delete+(parent.GLOBAL.Constant.favor_type === GLOBAL.Constant.favor_history ? GLOBAL.Constant.favor_history : GLOBAL.Constant.favor_other),
            sureCallback:function () {
                var handler = function () {
                    location.href = 'type.html';
                };
                var options = {
                    favor_id:GLOBAL.Constant.favor_id,
                    successHandler:handler,
                    errorHandler:handler,
                    favoriteService:GLOBAL.favoriteDetail.favoriteService
                };
                parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.favoriteDetail.favoriteService.deleteById, options);
            }
        };
        GLOBAL.layer.createNew(config).show();
    });

    // 绑定地图查看按钮事件
    $('#view_map').click(function () {
        var data;
        GLOBAL.favoriteDetail.favoriteService.findById(GLOBAL.Constant.favor_id, function (tx, rs) {
            data = rs.rows.item(0);
            GLOBAL.common.savePoiData(data);
        });
		if(typeof(parent.window.iframeObj)!='undefined'){
			var topWindow = parent.window;
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapWithPoi,parent.window.GLOBAL.Event.NavScreenEvent.showSearchResultInMapScreen,data);
        }
	});
	// 根据收藏数据的经纬度信息加载地图
    //this function can be replaced by common.savePoiData
    function addload_map(data) {
        parent.window.GLOBAL.Constant.poi_search_result = data;
    }

    // 绑定设为目的地图片点击事件
    $('#set_destn').click(function () {
        GLOBAL.favoriteDetail.favoriteService.findById(GLOBAL.Constant.favor_id, function (tx, rs) {
            var data = rs.rows.item(0);
            GLOBAL.common.savePoiData(data);
            if (Tab.validate_poi()) {
                    var topWindow = parent.window;
                    topWindow.GLOBAL.Constant.nav_obj.handlePageLogic = topWindow.GLOBAL.NavClass.displayDoubleLightLayer;
                    topWindow.GpsNav.prepareRequestPath();
                }
            else {
                var layer = GLOBAL.layer.createNew({
                    id:'confirm_box',
                    msg:GLOBAL.Constant.prompt_doublication
                });
                layer.show();
                // 设为目的地按钮改为灰色图片，尚未提供图片
                // 代码写在这
            }
        });

    });
    // 绑定确定按钮点击事件
    $('#confirm').click(function () {
        var handler = function () {
            location.href = 'type.html';
        };
        var options = {
            favor_id:GLOBAL.Constant.favor_id,
            name:$('#name').val(),
            address:$('#address').val(),
            tel:$('#tel').val(),
            successHandler:handler,
            errorHandler:handler,
            favoriteService:GLOBAL.favoriteDetail.favoriteService
        };

        parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.favoriteDetail.favoriteService.updateById, options);
    });
});