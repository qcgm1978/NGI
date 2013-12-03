/**
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title:
 * @Description:
 * @author wangyonggang qq:135274859
 * @date 12-10-18
 * @version V1.0
 * Modification History:
 */
jQuery.fn.rotate = function(angle) {
    var p = this.get(0);
     p.angle = angle;

    if (p.angle >= 0) {
        var rotation = Math.PI * p.angle / 180;
    } else {
        var rotation = Math.PI * (360+p.angle) / 180;
    }
    var costheta = Math.round(Math.cos(rotation) * 1000) / 1000;
    var sintheta = Math.round(Math.sin(rotation) * 1000) / 1000;
    //alert(costheta+","+sintheta);

    if (document.all) {
        p.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
    }
}

jQuery.fn.rotateRight = function(angle) {
    this.rotate(angle==undefined?90:angle);
}

jQuery.fn.rotateLeft = function(angle) {
    this.rotate(angle==undefined?-90:-angle);
}
