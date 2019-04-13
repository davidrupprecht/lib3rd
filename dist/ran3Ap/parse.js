"use strict";
exports.__esModule = true;
var $ = require("cheerio");
var fs_1 = require("fs");
var logging_1 = require("../utils/logging");
var common_1 = require("./common");
var msgIeTableHeader = [
    'ie/group name', 'presence', 'range', 'ie type and reference', 'semantics description',
    'criticality', 'assigned criticiality',
];
var rangeTableHeader = [
    'range bound', 'explanation',
];
var conditionTableHeader = [
    'condition', 'explanation',
];
var reDepth = /^>+/;
/**
 * Parse RAN3 AP messages and IEs
 * @param html RAN3 AP document in HTML format encoded in UTF-8
 * @returns Collection of RAN3 AP messages and IEs
 */
function parse(html) {
    var _a;
    var definitions = {};
    var sectionNumber = '';
    var sectionTitle = '';
    var description = '';
    var direction = '';
    var ies = null;
    var rangeDefinition = null;
    var conditionDefinition = null;
    var stack = selectorToArray($(html)).reverse();
    while (stack.length) {
        var selector = stack.pop();
        var elem = selector[0];
        if (containsSection(selector)) {
            if (ies) {
                definitions[sectionNumber] = {
                    section: sectionNumber,
                    name: sectionTitle,
                    description: description,
                    direction: direction,
                    ies: ies,
                    range: rangeDefinition,
                    condition: conditionDefinition
                };
                definitions[sectionTitle] = sectionNumber;
                logging_1.log.debug("Item stored: " + sectionNumber + " " + sectionTitle);
            }
            else {
                logging_1.log.debug("Item discarded: " + sectionNumber + " " + sectionTitle.substring(0, 32) + "...");
            }
            (_a = sectionInformation(selector), sectionNumber = _a.sectionNumber, sectionTitle = _a.sectionTitle);
            description = '';
            direction = '';
            ies = null;
            rangeDefinition = null;
            conditionDefinition = null;
            continue;
        }
        if (containsDirection(selector)) {
            direction = getDirection(selector);
            continue;
        }
        if (isMsgIeTable(selector)) {
            ies = parseMsgIeTable(selector);
            continue;
        }
        if (isRangeTable(selector)) {
            rangeDefinition = parseRangeTable(selector);
            continue;
        }
        if (isConditionTable(selector)) {
            conditionDefinition = parseConditionTable(selector);
            continue;
        }
        if (isTagP(elem)) {
            if (!description) {
                description = normalizeWhitespace(selector.text());
            }
            continue;
        }
        stack = stackChildren(stack, selector);
    }
    return definitions;
}
exports.parse = parse;
function isTag(elem) {
    return elem.type === 'tag';
}
function containsSection(selector) {
    var elem = selector[0];
    if (isTag(elem)) {
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(elem.name) !== -1) {
            return true;
        }
        var text = normalizeWhitespace(selector.text());
        if (text.match(common_1.reSection)) {
            logging_1.log.debug("Section info in non-heading: " + text.substring(0, 32) + "...");
            return true;
        }
    }
    return false;
}
function isTagTable(elem) {
    return isTag(elem) && elem.name === 'table';
}
function isTagP(elem) {
    return isTag(elem) && elem.name === 'p';
}
function sectionInformation(selector) {
    var sectionHeading = normalizeWhitespace(selector.text());
    var indexDelimiter = sectionHeading.indexOf(' ');
    var sectionNumber = sectionHeading.substring(0, indexDelimiter) || '';
    var sectionTitle = sectionHeading.substring(indexDelimiter + 1) || '';
    return { sectionNumber: sectionNumber, sectionTitle: sectionTitle };
}
function containsDirection(selector) {
    return normalizeWhitespace(selector.text()).startsWith('Direction:');
}
function getDirection(selector) {
    return normalizeWhitespace(selector.text()).replace(/^Direction:\s*/, '')
        // MS Word converts rightwards arrow to \u00AE (REGISTERED SIGN)
        .replace(/®/g, '→');
}
function doesHeaderMatch(selector, header, indexEnd) {
    var headerTds = selector.find('tr').first().children('td').slice(0, indexEnd);
    return headerTds.get().reduce(function (prev, curr, currIndex, arr) {
        return prev && (normalizeWhitespace($(curr).text()).toLowerCase() === header[currIndex]);
    }, true);
}
function isMsgIeTable(selector) {
    return isTagTable(selector[0]) && doesHeaderMatch(selector, msgIeTableHeader, 5);
}
function parseTable(selector, tableHeader) {
    var trs = selector.find('tr').slice(1);
    var ies = trs.map(function (indexTr, tr) {
        var ie = {};
        $(tr).find('td').each(function (indexTd, td) {
            var key = tableHeader[indexTd];
            if (!key) {
                return;
            }
            ie[key] = normalizeWhitespace($(htmlToText($(td).html())).text());
        });
        return ie;
    }).get();
    return ies;
}
function parseMsgIeTable(selector) {
    var ies = parseTable(selector, msgIeTableHeader);
    var depthMin = Infinity;
    ies.forEach(function (ie) {
        ie.depth = elemDepth(ie);
        depthMin = Math.min(depthMin, ie.depth);
    });
    ies.forEach(function (ie) {
        ie.depth -= depthMin;
    });
    return ies;
}
function isRangeTable(selector) {
    return isTagTable(selector[0]) && doesHeaderMatch(selector, rangeTableHeader, 2);
}
function parseRangeTable(selector) {
    return parseTable(selector, rangeTableHeader);
}
function isConditionTable(selector) {
    return isTagTable(selector[0]) && doesHeaderMatch(selector, conditionTableHeader, 2);
}
function parseConditionTable(selector) {
    return parseTable(selector, conditionTableHeader);
}
function selectorToArray(selector) {
    return selector.map(function (index, elem) {
        return $(elem);
    }).get();
}
function stackChildren(stack, selector) {
    var children = selector.children().map(function (index, child) {
        return $(child);
    }).get();
    return stack.concat(children.reverse());
}
function normalizeWhitespace(text) {
    return text.trim().replace(/\s+/g, ' ');
}
function htmlToText(html) {
    return html.replace(/<sup>\s*?(.+?)\s*?<\/sup>/g, '^($1)')
        .replace(/<sub>\s*?(.+?)\s*?<\/sub>/g, '_($1)');
}
function elemDepth(ie) {
    var matchDepth = ie['ie/group name'].match(reDepth);
    if (matchDepth) {
        return matchDepth[0].length;
    }
    return 0;
}
if (require.main === module) {
    var filePath = process.argv[2];
    if (!filePath) {
        throw Error('Requires 1 argument, filePath');
    }
    fs_1.readFile(filePath, 'utf8', function (err, html) {
        if (err) {
            throw err;
        }
        process.stdout.write(JSON.stringify(parse(html), null, 2));
    });
}
