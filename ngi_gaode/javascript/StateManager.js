/**
 * @fileoverview  This file is used to implement a state machine to control UI flow of NGI Project
 * StateManager is the super class,you can use it directly or construct a new sub class that meet your needs by inheritance
 * provided in this file .
 * @version 1.0
 */
GLOBAL.namespace("Inheritance");

(function(Obj){
    /**
     * create a new object with the prototype value assigned to the existing object
     * @param o The existing object
     * @return {F} new object with specified prototype value
     * @constructor
     */
    Obj.object = function (o) {
        function F() {};
        F.prototype = o;
        return new F();
    };
    Obj.inheritPrototype = function(subType,superType){
        var prototypeObj = Obj.object(superType.prototype);
        prototypeObj.constructor = subType;
        subType.prototype = prototypeObj;
    }
})(GLOBAL.Inheritance);

/**
 * Construct a new StateManager class.
 * @class This class represents an instance of a Person.
 * @constructor
 * @param {String} initialState The initial state of this state machine.
 * @param {Object} arrCallbacks The callback for state transition triggered by events.
 */
function StateManager(initialState,arrCallbacks){
    this.statesStack = [initialState];
    this.transitionCallbacks = typeof arrCallbacks !="undefined"?arrCallbacks:{};
    this.currentState = initialState;
    //Setting the first transitionCallbacks attribute to an Object
    if(!this.transitionCallbacks[initialState])
        this.transitionCallbacks[initialState]={};
    this.correspondingUrl={};
}
StateManager.prototype={
    /*
     * Return the current state for application
     */
    getCurrentState:function(){
        return this.currentState;
    },
     /*
     * Return the next state the application will go to
     */
    getNextState:function(){
        var statesLen = this.statesStack.length;
        if(statesLen >=2)
            return this.statesStack[statesLen-2];
        else{
            console.log("This is the only state now,you can not go back");
            return null;
        }
    },
    /*
     *Go to the next state
     * @param {String} nextState The name of next state you want to move to
     * @param {Function} transitionCallback The function called while moving from the current state to next state
     * @param {Object} options Parameters passed to this function
     */
    goToNextState:function(nextState,transitionCallback,options){
        if(this.currentState == nextState){
            console.log("This transition is not valid,they are the same state "+ this.currentState);
            return;
        }
        var transitionResult =this.executeTransitionCallbacks(nextState,transitionCallback,options);
        if (transitionResult){
            this.currentState = nextState;
            this.statesStack.push(this.currentState);
            this.deleteStateLoop();
            console.log("state array:"+ JSON.stringify(this.statesStack));
        }
    },
    /*
     *Go to the previous state without  explicitly specifying the nextState
     * @param {Function} transitionCallback The function called while moving from the current state to next state
     * @param {Object} options Parameters passed to this function
     */
    goToPreviousState:function(transitionCallback,options){
        var nextState =this.statesStack.length>=2?this.statesStack[this.statesStack.length -2]:null;
        if(nextState == null){
            console.log("Can not go back now, it's the initial state now.");
            return;
        }
        var transitionResult = this.executeTransitionCallbacks(nextState,transitionCallback,options);
        if (transitionResult){
            this.currentState = nextState;
            this.statesStack.pop();
            this.deleteStateLoop();
            console.log("state array:"+ JSON.stringify(this.statesStack));
        }
    },
    /*
     * Execute the callback specified in attribute transitionCallbacks
     * @param {String} nextState The name of next state you want to move to
     * @param {Function} transitionCallback The function called while moving from the current state to next state
     * @param {Object} options Parameters passed to this function
     * @return {boolean} transitionResult Whether or not the function succeeds
     */
    executeTransitionCallbacks:function(nextState,actionCallback,options){
        if(!this.transitionCallbacks[this.currentState])
            this.transitionCallbacks[this.currentState] ={};
        var transitionCallback = this.transitionCallbacks[this.currentState][nextState];
        var transitionResult = false;
        if(!transitionCallback ){
            if(typeof actionCallback =="function")
                transitionCallback =this.registerCallback(nextState,actionCallback);
            else{
                console.log("No valid callback from "+this.currentState+"to "+nextState+",you have to register first.");
                return transitionResult;
            }
        }
        try{
            transitionResult = transitionCallback.apply(this,[options]);
        }catch (e){
            console.log("Error"+e.message + " occured in action transition.");
            return transitionResult;
        }
        return transitionResult;
    },
    /*
     * Register the callback in attribute transitionCallbacks
     * @param {String} nextState The name of next state you want to move to
     * @param {Function} transitionCallback The function called while moving from the current state to next state
     * @return {Function} return registered callback
     */
    registerCallback:function(nextState,transitionCallback){
        this.transitionCallbacks[this.currentState][nextState] = transitionCallback;
        return this.transitionCallbacks[this.currentState][nextState];
    },
    /*
     *Detect whether there is state loop in the state stack and if so remove the loop to make sure normal going-back process
     */
    deleteStateLoop:function(){
        var i= 0,j= 0,statesLen=this.statesStack.length;
        //find the loop and remove states in the loop
        for(i=statesLen -2;i>=0;i--){
            if(this.currentState == this.statesStack[i]){
                for(j= statesLen-1;j>i;j--)
                    this.statesStack.pop();
                break;
            }
        }
    }
};

function NGIStateManager(state,callbacks){
    StateManager.apply(this,[state,callbacks]);
    this.correspondingUrl[state] = "";
}
GLOBAL.Inheritance.inheritPrototype(NGIStateManager,StateManager);
//override deleteStateLoop in superclass
NGIStateManager.prototype.deleteStateLoop = function () {
    var i = 0, j = 0, statesLen = this.statesStack.length;
    var states = GLOBAL.Constant.NGIStates;
    var loopStates = [states.PoiSearchRange, states.PoiSearchRegion, states.PoiSearchResultFilter];
    var statesFromMap = [states.AddToFavorites, states.MainMenu, states.PoiSearchNearby, states.PoiSearchByKeyword,states.RoadSegInfo,states.PathOptions,states.PoiSearchResult];
    if (loopStates.indexOf(this.currentState) != -1) {
        //find the loop and remove states in the loop
        for (i = statesLen - 2; i > 0; i--) {
            if (this.currentState == this.statesStack[i]) {
                for (j = statesLen - 1; j > i; j--)
                    this.statesStack.pop();
                break;
            }
        }
    } else if (statesFromMap.indexOf(this.currentState) != -1 && this.statesStack[statesLen - 2] ==states.MapWithPoi) {
        //empty the states stack and just leave map or navigation and current state
        for (i = 0; i < statesLen - 1; i++)
            this.statesStack.pop();
        this.statesStack[1] = this.currentState;
    }else if(this.currentState == states.LightCross){
        //from lightcross screen than get back to mapscreen forever
        for (i = 0; i < statesLen - 2; i++)
            this.statesStack.shift();
        this.statesStack[0] = states.Map;
    }else if([states.Navigation,states.Map].indexOf(this.currentState) !=-1 ){
        //empty the statesStack just left navigation or map
        for (i = 0; i < statesLen - 1; i++)
            this.statesStack.shift();
        this.statesStack[0] = this.currentState;
    }
    //maintain an array corresponding to the state
    //TODO Delete them if not necessary
    if (!this.correspondingUrl[this.currentState] || this.correspondingUrl[this.currentState] == "")
        this.correspondingUrl[this.currentState] = $("iframe")[0] == undefined ? "" : $("iframe")[0].contentDocument.URL;
};
//Override executeTransitionCallbacks for NGIStateManager
NGIStateManager.prototype.executeTransitionCallbacks = function (nextState, actionCallback, options) {
    if (!this.transitionCallbacks[this.currentState])
        this.transitionCallbacks[this.currentState] = {};
    var transitionCallback = this.transitionCallbacks[this.currentState][nextState];
    var transitionResult = false;
    if (typeof actionCallback == "function")
        transitionCallback = this.registerCallback(nextState, actionCallback);
    else if (!transitionCallback) {
        console.log("There is no corresponding callback,you have to register a valid callback.");
        return transitionResult;
    }
    try {
        transitionResult = transitionCallback.apply(this, [options]);
    } catch (e) {
        console.log(e.message + " occured in going back.");
        return transitionResult;
    }
    return transitionResult;
};
//The interface for returning to map directly,it will empty the statesStack with map screen only
NGIStateManager.prototype.returnToMapDirectly = function (actionCallback, options) {
    var transitionResult;
    if (typeof actionCallback == "function")
        transitionResult = actionCallback.apply(this, [options]);

    if (transitionResult) {
        var  firstState = this.statesStack.shift();
        this.statesStack = [firstState];
        this.currentState = firstState;
    }
    else
        console.log("Returning to map failed,please check your code.");
    console.log("state array:"+ JSON.stringify(this.statesStack));
};
//Get the url of the next state
NGIStateManager.prototype.getNextStateUrl = function () {
    var statesLen = this.statesStack.length;
    return this.correspondingUrl[this.statesStack[statesLen - 2]];
};
