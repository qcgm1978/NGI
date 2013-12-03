
GLOBAL.namespace("region") ;

$(function(){
	//绑定城市按钮点击事件
	GLOBAL.region.init(); 
	GLOBAL.region.initUI();
    if(-[1,]){
        var myScroll =  DragClass.create(document.getElementsByTagName('table')[0]);
    }
}) ;

/**
 * 城市按钮监听器
 */
GLOBAL.region.init = function() {
	//ui设置
	//保留搜索框较好，可以随时搜索
	$('form').hide();
	$('tr').remove();
	//切换导航元素显示状态
	$('#btn_toggle').hide();
	//ajax调用，加载城市
	var arr = ['Province', 'city', 'Dist'];
	var data = {
        xmlDom: xmlDom ,
		xml_file: 'Area.xml',
		callback: GLOBAL.region.displayRegion ,
		other: arr
	} ;
    GLOBAL.common.parseStr2Dom(data);
	
	
} ; 

//显示地区,使用ul和li元素
GLOBAL.region.displayRegion = function(xml, arr) {
	var str_region_list = '<ul class="nav f_ul f20">';
	//表格新增一行添加地区列表
	$('table').append('<tr><td></td></tr>');
	//修改表格样式
	$('td').css('background-image', 'url("")');
	str_region_list = GLOBAL.region.recursion(xml, str_region_list, arr);
	str_region_list += '</ul>';
	$('td:last').append(str_region_list);
	//添加下拉菜单样式
	$('ul:not(".nav")').addClass('none');
	$('.nav a, .nav li').addClass('Clearfix');
	$('.nav>li>a').addClass('li_a');
	$('.child>li>a').addClass('child_li_a');
	$('li:not(:has(a))').addClass('li_no_a');
} ; 
//生成table内容
GLOBAL.region.recursion = function(xml, str, arr) {
	$(xml).find(arr[0]).each(function(i, n) {
		var prov = $(this).attr('name');
		str += '<li><a href="javascript:void(0)">' + prov + '</a><ul class="child">';
		var city = $(this).children(arr[1]);
		$.each(city, function(i, n) {
			
			var sub_city = $(this).attr('name');
			//如果下级市只有一个，即直辖市，则不生成下级城市菜单
			if ($(this).siblings().length != 0) {
				str += '<li><a href="javascript:void(0)">' + sub_city + '</a><ul class="child">';
			}
			str += '<li data-region=' + sub_city + '>' + '全市' + '</li>';
			
			var dist = $(this).children(arr[2]);
			//dist.unshift(i);
			$.each(dist, function(i, n) {
				var sub_dist = $(this).attr('name');
				str += '<li data-region=' + sub_dist + '>' + sub_dist + '</li>';
			});
			//配合生成下级城市的条件生成字符串，line 59
			if ($(this).siblings().length != 0) {
				str += '</ul></li>';
			}
		});
		str += '</ul></li>';
		
	});
	return str;
} ;
//生成table内容
//=========================这里内容不要删，功能是将返回的json对象转化为字符串，可以直接替换上面的方法
/*GLOBAL.region.recursion = function(xml, str, arr) {
	$.each(xml.area.province,function(i, n) {
		var prov = n.name;
		str += '<li><a href="javascript:void(0)">' + prov + '</a><ul class="child">';
		var city =n.city;
		if(city != null){
			if(city instanceof Array){
				$.each(city, function(k, j) {
					var sub_city = j.name;
					if (j.dist != null) {
						str += '<li><a href="javascript:void(0)">' + sub_city + '</a><ul class="child">';
						str += '<li data-region=' + sub_city + '><a href="javascript:void(0)">' + '全市' + '</a></li>';
					
						var dist = j.dist;
						$.each(dist, function(v, m) {
							var sub_dist = m.name;
							str += '<li data-region=' + sub_dist + '><a href="javascript:void(0)">' + sub_dist + '</a></li>';
						});
						//配合生成下级城市的条件生成字符串，line 59
					
						str += '</ul></li>';
					}				
				});
			}else{
				var sub_city = city.name;
				if (city.dist != null) {
					str += '<li><a href="javascript:void(0)">' + sub_city + '</a><ul class="child">';
					str += '<li data-region=' + sub_city + '><a href="javascript:void(0)">' + '全市' + '</a></li>';
				
					var dist = city.dist;
					$.each(dist, function(v, m) {
						var sub_dist = m.name;
						str += '<li data-region=' + sub_dist + '><a href="javascript:void(0)">' + sub_dist + '</a></li>';
					});
					//配合生成下级城市的条件生成字符串，line 59
				
					str += '</ul></li>';
				}
			}
			str += '</ul></li>';
		}
	});
	return str;
} ;*/

/**
 * 初始化页面效果
 */
GLOBAL.region.initUI = function(){
	$(".nav a").live('click', function(){		
		 if($(this).next("ul").is(":hidden")){
			 //查找不支县区,不显示市以下级别
			 if($(this).next("ul").children().find('a').length == 0){
//				 console.log("此处是倒数第二级") ;
//				 console.log(city) ;
				 var city = $.trim($(this).text()) ;
				 if(city){
					 localStorage['Map_search_area'] = city;
					 parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(parent.window.GLOBAL.Event.NavScreenEvent.showPoiSearchByKeywordScreen);
				 }
			 } else {
				 $(this).next("ul").slideDown("slow");
				 if($(this).parent("li").siblings("li").children("ul").is(":visible")){
					 $(this).parent("li").siblings("li").find("ul").slideUp("1000");
					 $(this).parent("li").siblings("li:has(ul)").children("a").css({background:"url(images/statu_close.gif) no-repeat left top;"})
					 .end().find("li:has(ul)").children("a").css({background:"url(images/statu_close.gif) no-repeat left top;"});}
				 $(this).css({background:"url(images/statu_open.gif) no-repeat left top;"});
                //展开的省份滚动到顶部
                $('article').scrollTop($($(this).parent().get(0)).prevAll().length * ($(this).height() + parseInt($(this).css('margin-top'))) + 14);
			 }
//		   return false;
		 }else{
		   $(this).next("ul").slideUp("normal");  
		   //不用toggle()的原因是为了在收缩菜单的时候同时也将该菜单的下级菜单以后的所有元素都隐藏
		   $(this).css({background:"url(images/statu_close.gif) no-repeat left top;"});
		   $(this).next("ul").children("li").find("ul").fadeOut("normal");
		   $(this).next("ul").find("li:has(ul)").children("a").css({background:"url(images/statu_close.gif) no-repeat left top;"});
            //展开的省份滚动到顶部
            $('article').scrollTop($($(this).parent().get(0)).prevAll().length * ($(this).height() + parseInt($(this).css('margin-top'))) + 14);
//		   return false;
		 }

//		 console.log($(this).position().top); 
//		 var self = $(this) ;
//		 console.log($($(this).parent().get(0)).prevAll().length) ;
//		 $('article').scrollTop($('article').scrollTop() + $(this).position().top) ;
//		 setTimeout(function(){$('article').scrollTop($('article').scrollTop() + self.position().top) ; console.log('a');} , 300 ) ;
	});
} ;