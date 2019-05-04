"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var lodash_1 = require("lodash");
var logging_1 = require("../../utils/logging");
var base_1 = require("./base");
var BitString = /** @class */ (function (_super) {
    __extends(BitString, _super);
    function BitString() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BitString.prototype.setConstraint = function (constraint) {
        if ('value' in constraint) {
            this.size = constraint.value;
            delete constraint.value;
            this.sizeMin = null;
            this.sizeMax = null;
        }
        if ('min' in constraint && 'max' in constraint) {
            this.size = null;
            this.sizeMin = constraint.min;
            delete constraint.min;
            this.sizeMax = constraint.max;
            delete constraint.max;
        }
        if (!lodash_1.isEmpty(constraint)) {
            logging_1.log.warn("BitString could not handle constraint " + JSON.stringify(constraint));
        }
        return this;
    };
    BitString.prototype.expand = function () {
        return this;
    };
    BitString.prototype.toString = function () {
        var valueConstraint = this.size ? "(SIZE (" + this.size + "))" :
            this.sizeMin !== null && this.sizeMax !== null ? "(SIZE (" + this.sizeMin + ".." + this.sizeMax + "))" : '';
        return "BIT STRING " + valueConstraint;
    };
    return BitString;
}(base_1.Base));
exports.BitString = BitString;
