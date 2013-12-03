/**
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title:
 * @Description:
 * @author wangyonggang qq:135274859
 * @date 12-10-24
 * @version V1.0
 * Modification History:
 */

DragClass = {
    create:function (el, options) {
        var dragObject = {};
        dragObject.element = typeof el == 'object' ? el : document.getElementById(el);
        dragObject.wrapper = dragObject.element.parentNode;
        dragObject.x = 0;
        dragObject.y = 0;
        var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
        // Device sniffing
            isTouch = ('ontouchstart' in window),
        // Event sniffing
            START_EVENT = isTouch ? 'touchstart' : 'mousedown',
            MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
            END_EVENT = isTouch ? 'touchend' : 'mouseup',
        // Translate3d helper
            translateOpen = 'translate' + (has3d ? '3d(' : '('),
            translateClose = has3d ? ',0)' : ')';
        dragObject.element.style.webkitTransitionProperty = '-webkit-transform';
        dragObject.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
        dragObject.element.style.webkitTransitionDuration = '0';
        dragObject.element.style.webkitTransform = translateOpen + '0,0' + translateClose;
        //Default options
        dragObject.options = {
            overflowX:'hidden',
            overflowY:'auto'
        };
        //User defined options
        if (typeof options == 'object') {
            for (var i in options) {
                dragObject.options[i] = options[i];
            }
        }
        dragObject.wrapper.style.overflowX = dragObject.options.overflowX;
        dragObject.wrapper.style.overflowY = dragObject.options.overflowY;
        dragObject.refresh = function() {
            var resetX = dragObject.x, resetY = dragObject.y;
            dragObject.scrollWidth = dragObject.wrapper.clientWidth;
            dragObject.scrollHeight = dragObject.wrapper.clientHeight;
            dragObject.scrollerWidth = dragObject.element.offsetWidth;
            dragObject.scrollerHeight = dragObject.element.offsetHeight;
            dragObject.maxScrollX = dragObject.scrollWidth - dragObject.scrollerWidth;
            dragObject.maxScrollY = dragObject.scrollHeight - dragObject.scrollerHeight;
            dragObject.directionX = 0;
            dragObject.directionY = 0;
            if (dragObject.scrollX) {
                if (dragObject.maxScrollX >= 0) {
                    resetX = 0;
                } else if (dragObject.x < dragObject.maxScrollX) {
                    resetX = dragObject.maxScrollX;
                }
            }
            if (dragObject.scrollY) {
                if (dragObject.maxScrollY >= 0) {
                    resetY = 0;
                } else if (dragObject.y < dragObject.maxScrollY) {
                    resetY = dragObject.maxScrollY;
                }
            }
            if (resetX != dragObject.x || resetY != dragObject.y) {
                dragObject.setPosition(resetX, resetY);
            }
            dragObject.scrollX = dragObject.scrollerWidth > dragObject.scrollWidth;
            dragObject.scrollY = dragObject.scrollerHeight > dragObject.scrollHeight;
        }

        dragObject.refresh();
        dragObject.setPosition = function (x, y) {
            dragObject.x = x;
            dragObject.y = y;

            dragObject.element.style.webkitTransform = translateOpen + dragObject.x + 'px,' + dragObject.y + 'px' + translateClose;
            dragObject.element.style.MozTransform = translateOpen + dragObject.x + 'px,' + dragObject.y + 'px' + translateClose;
        };
        var objBehavior = {
            mousedown:touchStart,
            touchstart:touchStart,
            mouseup:touchEnd,
            touchend:touchEnd,
            touchmove:touchMove,
            mousemove: touchMove,
            'orientationchange':dragObject.refresh,
            'resize':dragObject.refresh,
            'DOMSubtreeModified':onDOMModified
        };
        dragObject.handleEvent = function (e) {
            objBehavior[e.type](e);
        };
        dragObject.scrollTo=function(destX, destY) {
            if (dragObject.x == destX && dragObject.y == destY) {
                dragObject.resetPosition();
                return;
            }
            dragObject.setPosition(destX, destY);
        }

        // Is translate3d compatible?

            on(window,'onorientationchange' in window ? 'orientationchange' : 'resize', dragObject, false);
            on(dragObject.element,START_EVENT,dragObject,false);
            on(dragObject.element,MOVE_EVENT,dragObject,false);
            on(dragObject.element,END_EVENT,dragObject,false);
            on(dragObject.element,'DOMSubtreeModified',dragObject,false);
        function on(el, ev, fn, bubble) {
            if(el.addEventListener) {
                try {
                    el.addEventListener(ev, fn, bubble);
                }
                    // 黑莓等系统不支持 handleEvent 方法
                catch(e) {
                    if(typeof fn == 'object' && fn.handleEvent) {
                        el.addEventListener(ev, function(e){
                            //以第一参数为事件对象
                            fn.handleEvent.call(fn, e);
                        }, bubble);
                    } else {
                        throw e;
                    }
                }
            } else if(el.attachEvent) {
                // 检测参数是否拥有 handleEvent 方法
                if(typeof fn == 'object' && fn.handleEvent) {
                    el.attachEvent('on' + ev, function(){
                        fn.handleEvent.call(fn);
                    });
                } else {
                    el.attachEvent('on' + ev, fn);
                }
            }
        }

        function touchStart(e) {
            e.preventDefault();
            e.stopPropagation();
            dragObject.scrolling = true;
            dragObject.moved = false;
            dragObject.distX = 0;
            dragObject.distY = 0;
            dragObject.touchStartX = isTouch ? e.changedTouches[0].pageX : e.pageX;
            dragObject.scrollStartX = dragObject.x;
            dragObject.touchStartY = isTouch ? e.changedTouches[0].pageY : e.pageY;
            dragObject.scrollStartY = dragObject.y;
            dragObject.directionX = 0;
            dragObject.directionY = 0;

        }

        function touchMove(e) {
            if (!dragObject.scrolling) return;
            pageX=isTouch? e.changedTouches[0].pageX: e.pageX;
            pageY=isTouch? e.changedTouches[0].pageY: e.pageY;
            leftDelta = dragObject.scrollX ? pageX - dragObject.touchStartX : 0,
            topDelta = dragObject.scrollY ? pageY - dragObject.touchStartY : 0,
            newX = dragObject.x + leftDelta,
            newY = dragObject.y + topDelta;

            e.preventDefault();
            //e.stopPropagation();	// Stopping propagation just saves some cpu cycles (I presume)

            dragObject.touchStartX = pageX;
            dragObject.touchStartY = pageY;     

            if (dragObject.distX + dragObject.distY > 5) {			// 5 pixels threshold
                // Lock scroll direction
                if (dragObject.distX-3 > dragObject.distY) {
                    newY = dragObject.y;
                    topDelta = 0;
                } else if (dragObject.distY-3 > dragObject.distX) {
                    newX = dragObject.x;
                    leftDelta = 0;
                }

                dragObject.setPosition(newX, newY);
                dragObject.moved = true;
                dragObject.directionX = leftDelta > 0 ? -1 : 1;
                dragObject.directionY = topDelta > 0 ? -1 : 1;
            } else {
                dragObject.distX+= Math.abs(leftDelta);
                dragObject.distY+= Math.abs(topDelta);
            }
        }
        function touchEnd(e){
            var point = isTouch ? e.changedTouches[0] : e, target, ev;
            if(!dragObject.scrolling)return;
            dragObject.scrolling = false;
             if(!dragObject.moved){
                    // Find the last touched element
                    target = point.target;
                    while (target.nodeType != 1) {
                        target = target.parentNode;
                    }

                    // Create the fake event
                    ev = document.createEvent('MouseEvents');
                    ev.initMouseEvent('click', true, true, e.view, 1,
                        point.screenX, point.screenY, point.clientX, point.clientY,
                        e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                        0, null);
                    ev._fake = true;
                    target.dispatchEvent(ev);
            }
            resetPosition();
        }
        function onDOMModified(e) {
            // (Hopefully) execute onDOMModified only once
            if (e.target.parentNode != dragObject.element) {
                return;
            }

            setTimeout(function () { dragObject.refresh(); }, 0);
        }
        function resetPosition() {
                resetX = dragObject.x,
                resetY = dragObject.y;

            if (dragObject.x >= 0) {
                resetX = 0;
            } else if (dragObject.x < dragObject.maxScrollX) {
                resetX = dragObject.maxScrollX;
            }

            if (dragObject.y >= 0 || dragObject.maxScrollY > 0) {
                resetY = 0;
            } else if (dragObject.y < dragObject.maxScrollY) {
                resetY = dragObject.maxScrollY;
            }
            if (resetX != dragObject.x || resetY != dragObject.y) {
                dragObject.scrollTo(resetX, resetY);
            }
            dragObject.moved = false;
        }

        return dragObject;
    }
}