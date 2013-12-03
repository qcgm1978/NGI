//var constant = GLOBAL.Constant,
	tbtConst = [
        localStorage['Map_system_style'],
        localStorage['Map_system_prompt'],
        localStorage['Map_system_eye']
	];
// 初始化页面设置

$('article img').attr('class', function(index,attr) {
	//地图风格和语音提示
	switch(attr) {
		case tbtConst[0]:
		case tbtConst[1]: {
			$(this).attr('src',function(index,src){
				return src.replace(/(\.png)/,'_on$1');
			});
		}
	}
	//电子眼提示
	if (attr === 'eye' && eval(tbtConst[2])) {
		$(this).attr('src',function(index,src){
			return src.replace(/(\.png)/,'_on$1');
		});
	}
});
var EleToEvent = {
    'daytime':function($target){getEle($target).switchDayTime()},
    'night':function($target){getEle($target).switchNight()},
    'switcher':function($target){getEle($target).switchSwitcher()},
    'concise':function($target){getEle($target).switchConcise()},
    'detailed':function($target){getEle($target).switchDetailed()},
    'eye':function($target){getEle($target).switchEye()}
}

  function getEle($target){
        return new EleEvent($target);
  }
  function EleEvent($target){
      var $target=$target;
      this.switchDayTime = function(){
          if(!$target.attr('src').match(/_on\.png$/)){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
              $target.parent().siblings().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }

          localStorage['Map_system_style'] = 'daytime';
          return this;
      };
      this.switchNight = function(){
          if(!$target.attr('src').match(/_on\.png$/)){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
              $target.parent().siblings().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }
          localStorage['Map_system_style'] = 'night';
          return this;
      };
      this.switchSwitcher = function(){
          if(!$target.attr('src').match(/_on\.png$/)){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
              $target.parent().siblings().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }
          localStorage['Map_system_style'] = 'switcher';
          return this;
      };
      this.switchConcise = function(){
          if(!$target.attr('src').match(/_on\.png$/)){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
              $target.parent().siblings().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }
          localStorage['Map_system_prompt'] = 'concise';
          return this;
      };
      this.switchDetailed = function(){
          if(!$target.attr('src').match(/_on\.png$/)){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
              $target.parent().siblings().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }
          localStorage['Map_system_prompt'] = 'detailed';
          return this;
      };
      this.switchEye = function(){
          var bool = !!$target.attr('src').match(/_on\.png$/);
          localStorage['Map_system_eye'] = !bool;
          if(typeof tbt !="undefined")
              tbt.SetEleyePrompt(localStorage['Map_system_eye']=="true"?1:0);
          if(bool){
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/_on(\.png)/,'$1');
              });
          }else{
              $target.parent().find('img').attr('src',function(index,src){
                  return src.replace(/(\.png)/,'_on$1');
              });
          }
          return this;
      }
  }

//使用事件委托，监视article元素点击事件，根据被点击图片的class属性值进行判定处理
$('article').on('click', 'img', function(e) {
	var $target = $(e.target);
	var class_target = $target.attr('class');
	
	//$('.' + class_target).mousedown();
    EleToEvent[class_target]($target);
});
