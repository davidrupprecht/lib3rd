"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spreadsheet_1 = require("../../common/spreadsheet");
const spreadsheet_2 = require("../formatter/spreadsheet");
class ExtensionMarker {
    static getInstance() {
        return ExtensionMarker.instance;
    }
    // eslint-disable-next-line no-unused-vars
    expand(modules, parameterMappings) {
        return this;
    }
    // eslint-disable-next-line class-methods-use-this
    getDepth() {
        return 0;
    }
    toSpreadsheet(worksheet, row, depth) {
        const r = worksheet.addRow({
            [spreadsheet_1.headerIndexed(spreadsheet_2.HEADER_NAME_BASE, depth)]: this.toString(),
        });
        spreadsheet_1.setOutlineLevel(r, depth);
        spreadsheet_1.drawBorder(worksheet, r, depth);
    }
    // eslint-disable-next-line class-methods-use-this
    toString() {
        return '...';
    }
}
exports.ExtensionMarker = ExtensionMarker;
ExtensionMarker.instance = new ExtensionMarker();
//# sourceMappingURL=extensionMarker.js.map