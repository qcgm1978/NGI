/**  
 * 数据库的基本操作
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd. 
 * @Title: db.js 
 * @Description: 数据库的基本操作
 * @author chengpawang
 * @date 2012-4-20
 * @version V1.0  
 * Modification History:   
 **/ 
//规定命名空间 (初始化时，创建所有的表)
GLOBAL.namespace('db');

/**
 * 打开或创建数据库
 * @param dbName 数据库名称
 * @param version 数据库版本
 * @param desc 数据库描述
 * @param size 数据库大小
 * @returns 返回数据库实例
 */
GLOBAL.db.getDB = function(dbName , version , desc , size){
	try {
	var database = window.openDatabase(dbName, version , desc, size);
	}
	catch(e) {
		console.log(e);	
	}
//	console.log('connect to database: ' + dbName + ' success!') ;
	return database ;
} ;

/**
* 执行SQL语句，并调用回调方法
* @param sqlContext 执行的sql语句以及上下文
* sqlContext：
*	db: 需要执行的数据库
*	sql: 要执行的sql语句
*	param: 传递的参数,数组类型
*	success: 执行成功时的回调方法
*	error: 执行失败执行的回调方法
*/
GLOBAL.db.executeSQL = function(sqlContext){
	sqlContext.db.transaction(function(tx){
//		console.log("execute sql :" + sqlContext.sql) ;
		tx.executeSql(sqlContext.sql , sqlContext.param , sqlContext.success , sqlContext.error);
	   });
} ;