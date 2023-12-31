import { hasClass } from './class';
let idCounter = 0;
export function uniqueId() {
    idCounter += 1;
    return `v${idCounter}`;
}
export function ensureId(elem) {
    if (elem.id == null || elem.id === '') {
        elem.id = uniqueId();
    }
    return elem.id;
}
/**
 * Returns true if object is an instance of SVGGraphicsElement.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement
 */
export function isSVGGraphicsElement(elem) {
    if (elem == null) {
        return false;
    }
    return typeof elem.getScreenCTM === 'function' && elem instanceof SVGElement;
}
export const ns = {
    svg: 'http://www.w3.org/2000/svg',
    xmlns: 'http://www.w3.org/2000/xmlns/',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xlink: 'http://www.w3.org/1999/xlink',
    xhtml: 'http://www.w3.org/1999/xhtml',
};
export const svgVersion = '1.1';
export function createElement(tagName, doc = document) {
    return doc.createElement(tagName);
}
export function createElementNS(tagName, namespaceURI = ns.xhtml, doc = document) {
    return doc.createElementNS(namespaceURI, tagName);
}
export function createSvgElement(tagName, doc = document) {
    return createElementNS(tagName, ns.svg, doc);
}
export function createSvgDocument(content) {
    if (content) {
        const xml = `<svg xmlns="${ns.svg}" xmlns:xlink="${ns.xlink}" version="${svgVersion}">${content}</svg>`; // lgtm[js/html-constructed-from-input]
        const { documentElement } = parseXML(xml, { async: false });
        return documentElement;
    }
    const svg = document.createElementNS(ns.svg, 'svg');
    svg.setAttributeNS(ns.xmlns, 'xmlns:xlink', ns.xlink);
    svg.setAttribute('version', svgVersion);
    return svg;
}
export function parseXML(data, options = {}) {
    let xml;
    try {
        const parser = new DOMParser();
        if (options.async != null) {
            const instance = parser;
            instance.async = options.async;
        }
        xml = parser.parseFromString(data, options.mimeType || 'text/xml');
    }
    catch (error) {
        xml = undefined;
    }
    if (!xml || xml.getElementsByTagName('parsererror').length) {
        throw new Error(`Invalid XML: ${data}`);
    }
    return xml;
}
export function tagName(node, lowercase = true) {
    const nodeName = node.nodeName;
    return lowercase ? nodeName.toLowerCase() : nodeName.toUpperCase();
}
export function index(elem) {
    let index = 0;
    let node = elem.previousSibling;
    while (node) {
        if (node.nodeType === 1) {
            index += 1;
        }
        node = node.previousSibling;
    }
    return index;
}
export function find(elem, selector) {
    return elem.querySelectorAll(selector);
}
export function findOne(elem, selector) {
    return elem.querySelector(selector);
}
export function findParentByClass(elem, className, terminator) {
    const ownerSVGElement = elem.ownerSVGElement;
    let node = elem.parentNode;
    while (node && node !== terminator && node !== ownerSVGElement) {
        if (hasClass(node, className)) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}
export function contains(parent, child) {
    const bup = child && child.parentNode;
    return (parent === bup ||
        !!(bup && bup.nodeType === 1 && parent.compareDocumentPosition(bup) & 16) // eslint-disable-line no-bitwise
    );
}
export function remove(elem) {
    if (elem) {
        const elems = Array.isArray(elem) ? elem : [elem];
        elems.forEach((item) => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        });
    }
}
export function empty(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}
export function append(elem, elems) {
    const arr = Array.isArray(elems) ? elems : [elems];
    arr.forEach((child) => {
        if (child != null) {
            elem.appendChild(child);
        }
    });
}
export function prepend(elem, elems) {
    const child = elem.firstChild;
    return child ? before(child, elems) : append(elem, elems);
}
export function before(elem, elems) {
    const parent = elem.parentNode;
    if (parent) {
        const arr = Array.isArray(elems) ? elems : [elems];
        arr.forEach((child) => {
            if (child != null) {
                parent.insertBefore(child, elem);
            }
        });
    }
}
export function after(elem, elems) {
    const parent = elem.parentNode;
    if (parent) {
        const arr = Array.isArray(elems) ? elems : [elems];
        arr.forEach((child) => {
            if (child != null) {
                parent.insertBefore(child, elem.nextSibling);
            }
        });
    }
}
export function appendTo(elem, target) {
    if (target != null) {
        target.appendChild(elem);
    }
}
export function isElement(x) {
    return !!x && x.nodeType === 1;
}
// Determines whether a node is an HTML node
export function isHTMLElement(elem) {
    try {
        // Using W3 DOM2 (works for FF, Opera and Chrome)
        return elem instanceof HTMLElement;
    }
    catch (e) {
        // Browsers not supporting W3 DOM2 don't have HTMLElement and
        // an exception is thrown and we end up here. Testing some
        // properties that all elements have (works on IE7)
        return (typeof elem === 'object' &&
            elem.nodeType === 1 &&
            typeof elem.style === 'object' &&
            typeof elem.ownerDocument === 'object');
    }
}
export function children(parent, className) {
    const matched = [];
    let elem = parent.firstChild;
    for (; elem; elem = elem.nextSibling) {
        if (elem.nodeType === 1) {
            if (!className || hasClass(elem, className)) {
                matched.push(elem);
            }
        }
    }
    return matched;
}