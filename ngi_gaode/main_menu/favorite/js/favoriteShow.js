/**
 * 收藏夹显示
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: favoriteShow.js
 * @Description: 收藏夹显示
 * @author chengpawang
 * @date 2012-4-23
 * @version V1.0
 * Modification History:
 */
GLOBAL.namespace("favoriteShow") ;
GLOBAL.favoriteShow.favoriteService = new FavoriteService() ;

//设置页面左上角收藏夹类别文字显示
$('h1:first').text(parent.window.GLOBAL.Constant.favor_type);

// 加载某类别收藏夹数据
GLOBAL.favoriteShow.favoriteService.findByType(parent.window.GLOBAL.Constant.favor_type , show) ;
$('#next_button').click(next_page);
$('#prev_button').click(prev_page);

/**
 * 展示查询出的收藏夹内容
 * @param tx 事务管理器
 * @param rs 结果集
 */
function show(tx , rs){
	var length = rs.rows.length,constant = GLOBAL.Constant ;
    if(length > 0){
        $('#delete_all').attr('src','images/delete_all.png');
    }
    if(length > GLOBAL.Constant.display_num)//结果多余一页
        $('#next_button').attr('src', '../../images/next_page.png');
	$('h1 span').text(length);
	if (length > 0) {
        var displayType = 'block';
		for(var i = 0 ; i < length ; i++){
            if(i >= GLOBAL.Constant.display_num) displayType='none';
			var item = rs.rows.item(i) ;
			var tmpl = $('#tmpl-item').html();
			var str = tmpl.split('{name}').join(item.name ? item.name : '未命名')
					.split('{id}').join(item.id).split('{display}').join(displayType);
			$('#favorite').append(str);
		}
	}
}

// 绑定全删除按钮事件
$('#delete_all').click(function() {
    if($(this).attr('src').match(/_gray/)) return;
    var config = {
        id:'prompt_box',
        msg :GLOBAL.Constant.prompt_delete+(parent.GLOBAL.Constant.favor_type === GLOBAL.Constant.favor_history ? GLOBAL.Constant.favor_history : GLOBAL.Constant.favor_other),
        sureCallback:function () {
            var handler = function () {
                $('tr').remove();
                $('h1 span').text(0);
                $('#delete_all').attr('src','images/delete_all_gray.png').unbind('click');
                $('#prev_button').attr('src','../../images/previous_page_gray.png').unbind('click');
                $('#next_button').attr('src','../../images/next_page_gray.png').unbind('click');
            };
            var options = {
                favor_type:parent.window.GLOBAL.Constant.favor_type,
                successHandler:handler,
                errorHandler:handler,
                favoriteService:GLOBAL.favoriteShow.favoriteService
            };
            GLOBAL.favoriteShow.favoriteService.deleteByType(options);
        }
    };
    GLOBAL.layer.createNew(config).show();
});

// 绑定收藏数据名称点击事件
$('td:not(:empty)').live('click', function() {
	localStorage['Map_favor_id'] = $(this).attr('data-id');
	parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.ViewPoiDetail,parent.window.GLOBAL.Event.NavScreenEvent.showViewPoiDetailScreen);
});

//-------------------------old-------------------------------
//构造要追加到表格的行字符串
function add_row(config, content) {
	var tmpl = $('#tmpl-item').html();
	var str = tmpl.split('{name}').join(config.name ? config.name : '未命名')
			.split('{id}').join(config.id);
	$('#favorite').append(str);
};

//显示数据数量
function display_num(tx , config) {
	$('h1 span').text(config.len);
	if (config.len == 0) {
		$('#delete_all').unbind('click');
	}
}
/*
 *设置上一页和下一页跳转按钮
 */
function next_page() {
    var constant = GLOBAL.Constant;
	//如果不给 .index() 方法传递参数，那么返回值就是这个jQuery对象集合中最后一个元素相对于其同辈元素的位置。
	var first_display_tr = $('tr:visible:first').index();
	var len = $('tr').length;
    if(len <= GLOBAL.Constant.display_num )//结果只有一页，不能翻页
        return;

	//如果不是最后一页，就显示下六条查询结果
	if (first_display_tr < len - GLOBAL.Constant.display_num ) {
		$('tr').hide();
		$('tr').slice(first_display_tr + GLOBAL.Constant.display_num, first_display_tr + GLOBAL.Constant.display_num * 2).show();
		if (first_display_tr + GLOBAL.Constant.display_num * 2 >= len) {//全部结果都显示完毕，下一页才变灰
			$('#next_button').attr('src', '../../images/next_page_gray.png');
		}
	}
	//改变上一步按钮的ui
	$('#prev_button').attr('src', '../../images/previous_page.png');
} ;

/**
 * 上一页按钮事件处理
 */
function prev_page() {
    var constant = GLOBAL.Constant;
	var first_display_tr = $('tr:visible:first').index();
    var len = $('tr').length;
	if (first_display_tr != 0) {
		$('tr').hide();
        $('tr').slice(first_display_tr - GLOBAL.Constant.display_num, first_display_tr).show();
		if (first_display_tr == GLOBAL.Constant.display_num) {
			$('#prev_button').attr('src', '../../images/previous_page_gray.png');
		}
	}
	//改变下一步按钮的ui
    if(len > GLOBAL.Constant.display_num) {
        $('#next_button').attr('src', '../../images/next_page.png');
    }
}