/**
 * +-----------------------------------------------------------------
 * | 收藏夹Service
 * +-----------------------------------------------------------------
 * | @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd. 
 * | @Title: favoriteService.js 
 * | @Description: 收藏夹Service
 * | @author chengpawang
 * | @date 2012-4-20
 * | @version V1.0  
 * |Modification History:
 * +-----------------------------------------------------------------  
 */

var FavoriteService = function(){} ;

/**
 * +-----------------------------------------------------------------
 * | 本地存储的key
 * +-----------------------------------------------------------------
 */
FavoriteService.prototype.key = "favorite_local" ;

/**
 +-----------------------------------------------------------------
 *收藏夹缓存
 +-----------------------------------------------------------------
 */
FavoriteService.prototype.cache = null ;

/**
 +-----------------------------------------------------------------
 * 向数据库中插入收藏数据
 +-----------------------------------------------------------------
 * @faverateItem 要插入的收藏的对象
 +-----------------------------------------------------------------
 * @return 成功返回添加后新的长度,失败返回-1
 +-----------------------------------------------------------------
 */
FavoriteService.prototype.saveFavor = function(favoriteItem , successHandler , errorHandler){
	
	var favorArr = this.readFavor({error:errorHandler}) ;
	
	//如果已存在该收藏,返回
	var item = null ;
	for(var i = 0 ; i < favorArr.length ; i ++){
		item = favorArr[i];
		if(item.lng == favoriteItem.lng && item.lat == favoriteItem.lat && item.type == favoriteItem.type){
			//加入缓存
			this.cache = favorArr ;
			//添加成功后回调方法
			if(successHandler)
				successHandler({} , {rows : new ResultSet(favorArr)});
			
			return favorArr.length ;
		}
	}
	
	//由于沿用数据库查询方式的接口,所以为每个收藏添加一个id , 自增
	if(! this.id){
		if(favorArr[0]){
			try{
				this.id = parseInt(favorArr[0].id) + 1;
				if(isNaN(this.id)){
					this.id  = 1 ;
				}
			} catch(e){
				this.id = 1 ;
			}
		} else {
			this.id= 1 ;
		}
	} else {
		this.id += 1 ;
	}
	favoriteItem.id = this.id ;
	
	favorArr.unshift(favoriteItem) ;
	
	//检查是否超过最大限制
	try{
		var temp = this.findByType(favoriteItem.type) ;
		if(temp.length >= GLOBAL.Constant.restrict_favor){
			for(var ii = favorArr.length -1 ; ii >=0 ; ii--){
				if(favorArr[ii].type == favoriteItem.type){
					favorArr.splice(ii, 1) ;
					break ;
				}
			}
		}
	} catch(e){
		console.log("check the limit of favorite and delete oldest item error:" + e.message) ;
	}
	
	try{
		favorStr = JSON.stringify(favorArr) ;
		localStorage.setItem(this.key , favorStr) ;
		
		//加入缓存
		this.cache = favorArr ;
		//添加成功后回调方法
		if(successHandler)
			successHandler({} , {rows : new ResultSet(favorArr)});
		
		return favorStr.length ;
	} catch(e) {
		console.log('save favorite error : ' + e.message) ;
		if(errorHandler){
			errorHandler({} , {rows : new ResultSet(favorArr)});
		}
		return -1;
	}
	
} ;

/**
 +-----------------------------------------------------------------
 * 根据收藏类型查找
 +-----------------------------------------------------------------
 * @param type 收藏类型
 +-----------------------------------------------------------------
 * @param successHandler 查询成功回调方法
 +-----------------------------------------------------------------
 * @param errorHandler 查询失败回调方法
 +-----------------------------------------------------------------
 */
FavoriteService.prototype.findByType = function(type , successHandler , errorHandler){
	var data = this.readFavor({error:errorHandler}) ;
	var rs = [] ;

	var j = 0 ;
	for(var i = 0 ; i < data.length ; i++){
		if(data[i].type == type){
			rs[j++] = data[i] ;
		}
	}
	
	if(rs){
		if(successHandler){
			successHandler({} , {rows : new ResultSet(rs)}) ;
		}
		return rs ;
	} 
} ;

/**
 * 
 +---------------------------------------------------------------------------
 * 根据收藏id查找
 +---------------------------------------------------------------------------
 * @param id 收藏id
 * @param successHandler 查询成功回调方法
 * @param errorHandler 查询失败回调方法
 +---------------------------------------------------------------------------
 *
 */
FavoriteService.prototype.findById = function(id , successHandler , errorHandler){
	var data = this.readFavor({error:errorHandler}) ;
	var rs = [] ;
	
	var j = 0 ;
	for(var i = 0 ; i < data.length ; i++){
		if(data[i].id == id){
			rs[j++] = data[i] ;
			break;
		}
	}
	
	if(rs){
		if(successHandler){
			successHandler({} , {rows : new ResultSet(rs)}) ;
		}
		return rs ;
	} 
} ;



/**
 +---------------------------------------------------------------------------
 *
 * 根据类型删除记录
 +---------------------------------------------------------------------------
 * @param type 收藏类型
 * 
 +---------------------------------------------------------------------------
 * @returns 
 * 
 +---------------------------------------------------------------------------
 */
FavoriteService.prototype.deleteByType = function(options){
	var type = options.favor_type,
	successHandler = options.successHandler,
	errorHandler = options.errorHandler,
	favoriteService =options.favoriteService;
	var data = favoriteService.readFavor({error:errorHandler}) ;
	var rs = [] ;
	
	
	if(rs){
		try{
			var j = 0 ;
			for(var i = 0 ; i < data.length ; i++){
				if(data[i].type != type){
					rs[j++] = data[i];
				}
			}
			//保存到本地
			localStorage.setItem(favoriteService.key , JSON.stringify(rs)) ;
			//加入缓存
			favoriteService.cache = rs ;
			//执行回调方法
			if(successHandler){
				successHandler({} , null) ;
				return true;
			}
			return j ;
		} catch(e){
			console.log('find favorite by type error:' + e.message) ;
			if(errorHandler){
				errorHandler() ;
			}
		}
		
	}	
} ;

/**
 +--------------------------------------------------------------------------- 
 * 根据id删除记录
 +---------------------------------------------------------------------------
 * @param id 要删除的收藏的id
 * 
 +---------------------------------------------------------------------------
 */
FavoriteService.prototype.deleteById = function(options){
	var id = options.favor_id,
	successHandler = options.successHandler,
	errorHandler = options.errorHandler,
	favoriteService =options.favoriteService;
	var data = favoriteService.readFavor({error:errorHandler}) ;
	
	try{
		var j = 0 ;
		for(var i = 0 ; i < data.length ; i++){
			if(data[i].id == id){
				data.splice(i , 1) ;
				j++ ;
				break ;
			}
		}
		localStorage.setItem(favoriteService.key , JSON.stringify(data)) ;
		
		favoriteService.cache = data ;
		if(successHandler){
			successHandler({} , null) ;
			return true;
		}
		return j ;
	} catch(e){
		console.log('find favorite by type error:' + e.message) ;
		if(errorHandler){
			errorHandler() ;
		}
		return -1 ;
	}
	
} ;

/**
 * 
 * +---------------------------------------------------------------
 * | 更新收藏的内容
 * +---------------------------------------------------------------
 * | @param o
 * | @param successHandler
 * | @param errorHandler
 * | @returns {Number}
 * +---------------------------------------------------------------
 * |Number
 * +---------------------------------------------------------------
 */
FavoriteService.prototype.updateById = function(options){
	var id = options.favor_id,
	successHandler = options.successHandler,
	errorHandler = options.errorHandler,
	favoriteService =options.favoriteService;
	var data = favoriteService.readFavor({error:errorHandler}) ;
	
	try{
		var j = 0 ;
		for(var i = 0 ; i < data.length ; i++){
			if(data[i].id == id){
				var temp = data[i] ;
				temp.name = options.name ;
				temp.address = options.address ;
				temp.tel = options.tel ;
				data[i] = temp ;
				j++ ;
				break ;
			}
		}
		localStorage.setItem(favoriteService.key , JSON.stringify(data)) ;
		
		favoriteService.cache = data ;
		if(successHandler){
			successHandler({} , null) ;
			return true;
		}
		return j ;
	} catch(e){
		console.log('find favorite by type error:' + e.message) ;
		if(errorHandler){
			errorHandler() ;
		}
		return -1 ;
	}
		
};

/**
 * +----------------------------------------------------------------------
 * |
 * +----------------------------------------------------------------------
 * | @param errorHandler
 * +----------------------------------------------------------------------
 * | @return
 * +----------------------------------------------------------------------
 */
FavoriteService.prototype.readFavor = function(param){
	var data = this.cache ;
	if(!data){
		try{
			if (typeof localStorage["favorite_local"] == 'string') {
				data = JSON.parse(localStorage[this.key]) ;
				//加入缓存
				this.cache = data ;
			}
		} catch(e){
			console.log('find favorite by type error:' + e.message) ;
			if(param.error){
				param.error() ;
			}
		}
	}
	if(!data) 
		return [] ;
	
	return data ;
} ;

//封装成数据结果集的结构
var ResultSet = function(data){
	this.data = data ;
	this.length = data.length ;
} ;

ResultSet.prototype = {
	constructor : ResultSet ,
	item : function(i){
		return this.data[i] ;
	}  
} ;