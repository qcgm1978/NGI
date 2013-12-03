/**
 * 收藏夹Service
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd. 
 * @Title: favoriteService.js 
 * @Description: 收藏夹Service
 * @author chengpawang
 * @date 2012-4-20
 * @version V1.0  
 * Modification History:  
 */
 try {
	var FavoriteService = function(){} ;
	FavoriteService.db =  GLOBAL.db.getDB('config', '1.0', 'NGI System Database', 1024*1024*3);
	FavoriteService.db.transaction(function(tx){
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS map_favor_home (id INTEGER \
       PRIMARY KEY, type TEXT, lng TEXT, lat TEXT, name TEXT, address TEXT, tel TEXT)", [],
      function(){ /*console.log('Notes_ngi database created successfully!'); */},
	  //在这里结束进程
      function(tx, error){ console.info('未创建table，已连接数据库中的map_favor_home'); } );
  });
/**
 * 向数据库中插入收藏数据
 * @faverateItem 要插入的收藏的对象
 */
FavoriteService.prototype.saveFavor = function(favoriteItem , successHandler , errorHandler){
	   var insertFavorSql = "INSERT INTO map_favor_home (name, type, lng, lat, address, tel) VALUES (?, ?, ?, ?, ?, ?)" ;
	   var param = [favoriteItem.name, favoriteItem.type, favoriteItem.lng, favoriteItem.lat, favoriteItem.address, favoriteItem.tel] ;
	   
	   var context = {
			"db":FavoriteService.db ,
			"sql":insertFavorSql ,
			"param" : param ,
			"success" :function(tx , rs){
				//console.log('insert to favorite success...');
				if(successHandler){successHandler(tx,rs);}}  ,
			"error" : function(tx, error){ console.log(error.message); 
				if(errorHandler){errorHandler(tx , error) ;}}
	   };
	   GLOBAL.db.executeSQL(context) ;
} ;

/**
 * 根据收藏类型查找
 * @param type 收藏类型
 * @param successHandler 查询成功回调方法
 * @param errorHandler 查询失败回调方法
 */
FavoriteService.prototype.findByType = function(type , successHandler , errorHandler){
	//SQLITE查询语句，根据类别（type）查询，按id field的倒序，即为加入时间的倒序，后加的排在前面,列名不可省略
	var querySQL = "SELECT * FROM map_favor_home where type = ? ORDER BY id DESC" ;
	
	var context = {
			"db":FavoriteService.db ,
			"sql":querySQL ,
			"param" : [type] ,
			"success" : successHandler ,
			"error" : function(tx, error){ console.log(error.message); }
	   };
	   GLOBAL.db.executeSQL(context) ;
} ;

/**
 * 根据收藏id查找
 * @param id 收藏id
 * @param successHandler 查询成功回调方法
 * @param errorHandler 查询失败回调方法
 */
FavoriteService.prototype.findById = function(id , successHandler , errorHandler){
	//SQLITE查询语句，根据类别（type）查询，按id field的倒序，即为加入时间的倒序，后加的排在前面,列名不可省略
	var querySQL = "SELECT * FROM map_favor_home where id = ?" ;
	
	var context = {
			"db":FavoriteService.db ,
			"sql":querySQL ,
			"param" : [id] ,
			"success" : function(tx , rs){if(successHandler){successHandler(tx,rs);}} ,
			"error" : function(tx, error){ 
				console.log(error.message); 
				if(errorHandler){errorHandler(tx,rs);}}
	   };
	   GLOBAL.db.executeSQL(context) ;
} ;



/**
 * 根据类型删除记录
 * @param type 收藏类型
 */
FavoriteService.prototype.deleteByType = function(type , successHandler , errorHandler){
	var deleteSQL = "DELETE FROM map_favor_home where type=?" ;
	
	var context = {
			"db":FavoriteService.db ,
			"sql":deleteSQL ,
			"param" : [type] ,
			"success" : function(tx , rs){if(successHandler){successHandler(tx,rs);}} ,
			"error" : function(tx, error){ console.log(error.message); 
					if(errorHandler){errorHandler(tx , error) ;}}
	   };
	   GLOBAL.db.executeSQL(context) ;
} ;

/**
* 根据id删除记录
* @param id 要删除的收藏的id
*/
FavoriteService.prototype.deleteById = function(id , successHandler , errorHandler){
	var deleteLastSQL = "DELETE FROM map_favor_home WHERE id = ?";
	var deleteLastContext = {
		"db":FavoriteService.db ,
		"sql":deleteLastSQL ,
		"param" : [id] ,
		"success" :function(tx, rs){
			console.log('delete from map_favor_home id =' + id +' success...');
			if(successHandler){successHandler(tx,rs);} } ,
		"error" : function(tx, error){ 
			console.log(error.message); 
			if(errorHandler){errorHandler(tx,error);} }
	} ;
	GLOBAL.db.executeSQL(deleteLastContext) ;
} ;

/**
 * 更新收藏的内容
 * @param o
 */
FavoriteService.prototype.updateById = function(o , successHandler , errorHandler){
	var updateSQL = "UPDATE map_favor_home set name = ?, address = ?, tel = ? where id = ?";
	
	var context = {
			"db":FavoriteService.db ,
			"sql":updateSQL ,
			"param" : [o.name, o.address, o.tel, o.id] ,
			"success" : function(tx , rs){if(successHandler){successHandler(tx,rs);}} ,
			"error" : function(tx, error){ console.log(error.message); 
					if(errorHandler){errorHandler(tx , error) ;}}
	   };
	   GLOBAL.db.executeSQL(context) ;
};

 } catch(e) {
	console.log(e.message); 
 };