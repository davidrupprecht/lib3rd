"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const logging_1 = require("../../utils/logging");
const base_1 = require("./base");
class ComponentPresence extends base_1.Base {
    constructor(identifier, absentPresent) {
        super();
        this.identifier = identifier;
        this.absentPresent = absentPresent;
    }
    setConstraint(constraints) {
        if (!lodash_1.isEmpty(constraints)) {
            logging_1.log.warn(`ComponentPresence could not handle constraint ${JSON.stringify(constraints)}`);
        }
        return this;
    }
    expand(asn1Pool, moduleName) {
        throw Error(`${this.constructor.name}.expand does not need to be implemented`);
    }
    depthMax() {
        throw Error('Depth of this class is not valid');
    }
    replaceParameters(parameterMapping) {
        return this;
    }
    toString() {
        return `${this.identifier} ${this.absentPresent}`;
    }
    fillWorksheet(ieElem, ws, row, col, depthMax, constants, formatConfig, depth = 0) {
        throw Error(`${this.constructor.name}.fillWorksheet does not need to be implemented`);
    }
}
exports.ComponentPresence = ComponentPresence;
