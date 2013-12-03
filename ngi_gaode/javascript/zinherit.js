/*------------------------------------------------------------------------------
 * JavaScript zInherit Library
 * Version 1.0
 * by Nicholas C. Zakas, http://www.nczonline.net/
 * Copyright (c) 2004-2005 Nicholas C. Zakas. All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA
 *------------------------------------------------------------------------------
 */
 
/**
 * Inherits properties and methods from the given class.
 * @scope public
 * @param fnClass The constructor function to inherit from.
 */
Object.prototype.inheritFrom = function (fnClass /*: Function */) /*:void*/ {

    /**
     * Inherits all classes going up the inheritance chain recursively.
     * @param fnClass The class to inherit from.
     * @param arrClasses The array of classes to build up.
     * @scope private
     */
    function inheritClasses(fnClass /*:Function*/, 
                            arrClasses /*:Array*/) /*:void*/ {
        
        arrClasses.push(fnClass);

        if (typeof fnClass.__superclasses__ == "object") {
            for (var i=0; i < fnClass.__superclasses__.length; i++){
                inheritClasses(fnClass.__superclasses__[i], arrClasses);
            }
        }
    }
    
    if (typeof this.constructor.__superclasses__ == "undefined") {
        this.constructor.__superclasses__ = new Array();
    }
    
    inheritClasses(fnClass, this.constructor.__superclasses__);
    
    for (prop in fnClass.prototype) {
        if (typeof fnClass.prototype[prop] == "function") {
            this[prop] = fnClass.prototype[prop];
        }
    }
};

/**
 * Determines if the given object is an instance of a given class.
 * This method is necessary because using {@link #inheritFrom} renders
 * the JavaScript <code>instanceof</code> operator useless.
 * @param fnClass The constructor function to test.
 * @return True if the object is an instance of the class, false if not.
 * @scope public
 */
Object.prototype.instanceOf = function (fnClass /*:Function*/) /*: boolean */ {

    if (this.constructor == fnClass) {
        return true;
    } else if (typeof this.constructor.__superclasses__ == "object") {
        for (var i=0; i < this.constructor.__superclasses__.length; i++) {
            if (this.constructor.__superclasses__[i] == fnClass) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
};
