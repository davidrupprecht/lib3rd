"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const logger_1 = require("../logger");
const logger = logger_1.Logger.getLogger('asn1.extractor');
function selectRegExp(text) {
    const RE_START = /^--\s+?ASN1START.*?$/gm; // -- ASN1START
    const TRIM_START = true;
    const RE_STOP = /^--\s+?ASN1STOP.*?$/gm; // -- ASN1STOP
    const TRIM_STOP = true;
    const RE_START_RAN3 = /^--\s+?\*+?.*?$/gm; // -- *****
    const TRIM_START_RAN3 = false;
    const RE_STOP_RAN3 = /^\bEND\b.*?$/gm; // END (end of module definition)
    const TRIM_STOP_RAN3 = false;
    let reStart;
    let trimStart;
    let reStop;
    let trimStop;
    if (RE_START.test(text) && RE_STOP.test(text)) {
        reStart = RE_START;
        trimStart = TRIM_START;
        reStop = RE_STOP;
        trimStop = TRIM_STOP;
    }
    if (RE_START_RAN3.test(text) && RE_STOP_RAN3.test(text)) {
        reStart = RE_START_RAN3;
        trimStart = TRIM_START_RAN3;
        reStop = RE_STOP_RAN3;
        trimStop = TRIM_STOP_RAN3;
    }
    if (reStart === undefined
        || trimStart === undefined
        || reStop === undefined
        || trimStop === undefined) {
        throw Error('None of tokens identifying ASN.1 definition is found in the given text.');
    }
    reStart.lastIndex = 0;
    reStop.lastIndex = 0;
    return {
        reStart, trimStart, reStop, trimStop,
    };
}
function extract(text) {
    let asn1 = '';
    const { reStart, trimStart, reStop, trimStop, } = selectRegExp(text);
    for (;;) {
        const resultStart = reStart.exec(text);
        if (resultStart === null) {
            return _1.normalize(asn1);
        }
        const start = resultStart.index + (trimStart ? resultStart[0].length : 0);
        reStop.lastIndex = start;
        const resultStop = reStop.exec(text);
        if (resultStop === null) {
            logger.error('This is strange. The start token is found but the end token is not found. Extractor stops here and outputs the current state.');
            return _1.normalize(asn1);
        }
        const end = resultStop.index + (trimStop ? 0 : resultStop[0].length);
        reStart.lastIndex = end;
        asn1 += `${text.substring(start, end)}\n`;
    }
}
exports.extract = extract;
//# sourceMappingURL=extractor.js.map