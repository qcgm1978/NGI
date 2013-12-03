(function(Obj){
    Obj.MessagePanel = function (trafficMessageData , iMinTrafficPanelLevel){
        if(typeof trafficMessageData == "undefined"){
            console.log('error: trafficMessageData was not found.');
            this.bubblesArray = [];//所有气泡数据
            return;
        }else{
            this.bubblesArray = this.processData(trafficMessageData);//预处理所有气泡数据
        }
        this.iMinTrafficPanelLevel = iMinTrafficPanelLevel;
        this.bubbleIds = [];//所有气泡的id
        this.bubblesVisible = false; //气泡可见性

        var that = this;
        $('#btn_close_message_panel').click(function(){//绑定返回按钮事件
            that.close();
        });
         $('#message_panel').attr('bChangeIcon',false);//设置元素属性
    }
    //预处理交通信息气泡数据，保存到对象数组中
    Obj.MessagePanel.prototype.processData = function(trafficMessageData){
        var arr = trafficMessageData.split(';') , id = '', x = '', y= '', row, outputArr = [];
        for(var i = 0, len = arr.length; i < len; i++){
            row = arr[i].split(',');//读取一行数据
            id = row[0];
            x = row[1];
            y = row[2];
            if(x == "" || y == "") continue;
            outputArr.push({'id' : id, 'x' : x ,'y' : y});
        }
        return outputArr;
    }
    //显示交通信息气泡
    Obj.MessagePanel.prototype.add_traffic_bubbles = function(zoomLevel){
        var  marker, markerArray = [] ,bubble , iMinTrafficPanelLevel = GLOBAL.Constant.iMinTrafficPanelLevel;
        for(var i = 0, len = this.bubblesArray.length; i < len; i++){
            bubble = this.bubblesArray[i];
            marker = this.createBubble(bubble.id, bubble.x, bubble.y);
            markerArray.push(marker);
            this.bubbleIds.push(bubble.id);
        }
        Event.mapObj.addOverlays(markerArray);//批量地将标记添加到地图
        this.bubblesVisible = true; //设置气泡的可见性

        if(zoomLevel < this.iMinTrafficPanelLevel){//当前比例尺高于3km，隐藏气泡
            this.hide_traffic_bubbles();
            this.bubblesVisible = false;
        }
    };
    //移除交通信息气泡
    Obj.MessagePanel.prototype.delete_traffic_bubbles = function(){
        Event.mapObj.removeOverlays(this.bubbleIds);
        this.bubblesVisible = false;
    };
    //显示交通信息气泡
    Obj.MessagePanel.prototype.show_traffic_bubbles = function(zoomLevel){
        if(this.isTrafficPanelOn() && !this.bubblesVisible){
            if(zoomLevel < this.iMinTrafficPanelLevel)//当前比例尺高于3km，仍然隐藏气泡
                return;
            var markers = Event.mapObj.getOverlays(this.bubbleIds);
            for(var i=0,len = markers.length; i<len ; i++){
                markers[i].show();
            }
            this.bubblesVisible = true; //气泡置为可见
        }
    };
    //隐藏交通信息气泡
    Obj.MessagePanel.prototype.hide_traffic_bubbles = function(){
        if(this.isTrafficPanelOn() && this.bubblesVisible){
            var markers = Event.mapObj.getOverlays(this.bubbleIds);
            for(var i=0,len = markers.length; i<len ; i++){
                markers[i].hide();
            }
            this.bubblesVisible = false;//气泡置为隐藏
        }
    };
    //打开气泡id对应的情报板
    Obj.MessagePanel.prototype.open = function (id){
         $('#message_panel').attr('src','http://trafficapp.autonavi.com:8888/output/'+ id +'.png');
         $('#traffic_panel_container').show();
    }
    //关闭情报板
    Obj.MessagePanel.prototype.close = function (){
         $('#message_panel').attr('src','');
         $('#traffic_panel_container').hide();
    }
    //创建气泡并为气泡绑定事件
    Obj.MessagePanel.prototype.createBubble = function (id, x ,y){
        var marker = new MMap.Marker({
                id: id,//唯一ID
                position:new MMap.LngLat(x,y), //基点位置
                icon:"images/images/bubble.png" //marker图标，直接传递地址url
                //offset:{x:0,y:41} //相对于基点的位置
            });
            var that = this;
            Event.mapObj.bind(marker,"click",function(e){
              var obj = this.obj , id = obj.id; //取得marker对应的id
              that.open(id);//打开气泡id对应的情报板
            });
        return marker;
    }
    //取得情报板开关状态
    Obj.MessagePanel.prototype.isTrafficPanelOn = function(){
        return localStorage["traffic_panel_on"] == 'true' ? true : false;
    }
    //设置交通信息情报板开关状态
    //flag {boolean} true|false
    Obj.MessagePanel.prototype.setTrafficPanelOn = function(flag){
        if(typeof flag == 'boolean')
            localStorage["traffic_panel_on"] = flag;
        else
            console.log('--setTrafficPanelOn: wrong parameter type.');
    }
   //初始化实例
   Obj.messagePanel = new Obj.MessagePanel(Obj.trafficMessageData,GLOBAL.Constant.iMinTrafficPanelLevel);
})(GLOBAL.Traffic);