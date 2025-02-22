"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable class-methods-use-this */
const AbstractParseTreeVisitor_1 = require("antlr4ts/tree/AbstractParseTreeVisitor");
const unimpl_1 = require("unimpl");
const objectIdentifierType_1 = require("../classes/objectIdentifierType");
/**
 * # Grammar
 * ```
 * objectidentifiertype: OBJECT_LITERAL IDENTIFIER_LITERAL
 * ```
 */
class ObjectidentifiertypeVisitor extends AbstractParseTreeVisitor_1.AbstractParseTreeVisitor {
    // eslint-disable-next-line no-unused-vars
    visitChildren(ctx) {
        return new objectIdentifierType_1.ObjectIdentifierType();
    }
    defaultResult() {
        return unimpl_1.unimpl();
    }
}
exports.ObjectidentifiertypeVisitor = ObjectidentifiertypeVisitor;
//# sourceMappingURL=objectidentifiertypeVisitor.js.map