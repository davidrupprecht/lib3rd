"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const unimpl_1 = require("unimpl");
const spreadsheet_1 = require("../../common/spreadsheet");
const style_1 = require("../../common/spreadsheet/style");
const spreadsheet_2 = require("../formatter/spreadsheet");
const objectSet_1 = require("./objectSet");
class ParameterizedTypeAssignment {
    constructor(name, parameters, asnType) {
        this.name = name;
        this.parameters = parameters;
        this.asnType = asnType;
    }
    /**
     * Expand `asnType` property. This will mutate the object itself.
     * @param modules
     */
    expand(modules) {
        const parameterMappings = this.parameters.map((parameter) => ({
            parameter,
            actualParameter: undefined,
        }));
        const expandedType = lodash_1.cloneDeep(this.asnType).expand(modules, parameterMappings);
        if (expandedType instanceof objectSet_1.ObjectSet) {
            return unimpl_1.unimpl();
        }
        if (!lodash_1.isEqual(expandedType, this.asnType)) {
            this.asnType = expandedType;
        }
        return this;
    }
    getDepth() {
        return this.asnType.getDepth();
    }
    toSpreadsheet(workbook) {
        const wb = spreadsheet_1.getWorkbook(workbook);
        const sheetname = spreadsheet_1.uniqueSheetname(wb, this.name);
        const ws = spreadsheet_1.addWorksheet(wb, sheetname, 3);
        const depth = this.getDepth();
        spreadsheet_1.addTitle(ws, `${this.name} ${this.parameterString()}`);
        ws.addRow([]);
        spreadsheet_1.addHeader(ws, spreadsheet_2.HEADER_LIST, depth);
        this.asnType.toSpreadsheet(ws, {
            [spreadsheet_1.headerIndexed(spreadsheet_2.HEADER_NAME_BASE, 0)]: this.name,
        }, 0);
        spreadsheet_1.drawBorder(ws, ws.addRow([]), 0, style_1.BorderTop);
        return wb;
    }
    toString() {
        return `${this.name} ${this.parameterString()} ::= ${this.asnType.toString()}`;
    }
    parameterString() {
        const parametersString = this.parameters
            .map((parameter) => parameter.toString())
            .join(', ');
        return `{${parametersString}}`;
    }
}
exports.ParameterizedTypeAssignment = ParameterizedTypeAssignment;
//# sourceMappingURL=parameterizedTypeAssignment.js.map