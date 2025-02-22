"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable class-methods-use-this */
const AbstractParseTreeVisitor_1 = require("antlr4ts/tree/AbstractParseTreeVisitor");
const asnSymbol_1 = require("../classes/asnSymbol");
class SymbolVisitor extends AbstractParseTreeVisitor_1.AbstractParseTreeVisitor {
    visitChildren(ctx) {
        const name = ctx.getChild(0).text;
        const parameterized = ctx.childCount > 1;
        return new asnSymbol_1.Reference(name, parameterized);
    }
    defaultResult() {
        return new asnSymbol_1.Reference('');
    }
}
exports.SymbolVisitor = SymbolVisitor;
//# sourceMappingURL=symbolVisitor.js.map