import { Dom } from '@packages/graph-common/dom/index.js';
import { Vector } from '@packages/graph-common/vector/index.js';
import { ObjectExt } from '@packages/graph-common/object/index.js';
// eslint-disable-next-line
export var Markup;
(function (Markup) {
    function isJSONMarkup(markup) {
        return markup != null && !isStringMarkup(markup);
    }
    Markup.isJSONMarkup = isJSONMarkup;
    function isStringMarkup(markup) {
        return markup != null && typeof markup === 'string';
    }
    Markup.isStringMarkup = isStringMarkup;
    function clone(markup) {
        return markup == null || isStringMarkup(markup)
            ? markup
            : ObjectExt.cloneDeep(markup);
    }
    Markup.clone = clone;
    /**
     * Removes blank space in markup to prevent create empty text node.
     */
    function sanitize(markup) {
        return `${markup}`
            .trim()
            .replace(/[\r|\n]/g, ' ')
            .replace(/>\s+</g, '><');
    }
    Markup.sanitize = sanitize;
    function parseJSONMarkup(markup, options = { ns: Dom.ns.svg }) {
        const fragment = document.createDocumentFragment();
        const groups = {};
        const selectors = {};
        const queue = [
            {
                markup: Array.isArray(markup) ? markup : [markup],
                parent: fragment,
                ns: options.ns,
            },
        ];
        while (queue.length > 0) {
            const item = queue.pop();
            let ns = item.ns || Dom.ns.svg;
            const defines = item.markup;
            const parentNode = item.parent;
            defines.forEach((define) => {
                // tagName
                const tagName = define.tagName;
                if (!tagName) {
                    throw new TypeError('Invalid tagName');
                }
                // ns
                if (define.ns) {
                    ns = define.ns;
                }
                const node = ns
                    ? Dom.createElementNS(tagName, ns)
                    : Dom.createElement(tagName);
                // attrs
                const attrs = define.attrs;
                if (attrs) {
                    Dom.attr(node, Dom.kebablizeAttrs(attrs));
                }
                // style
                const style = define.style;
                if (style) {
                    Dom.css(node, style);
                }
                // classname
                const className = define.className;
                if (className != null) {
                    node.setAttribute('class', Array.isArray(className) ? className.join(' ') : className);
                }
                // textContent
                if (define.textContent) {
                    node.textContent = define.textContent;
                }
                // selector
                const selector = define.selector;
                if (selector != null) {
                    if (selectors[selector]) {
                        throw new TypeError('Selector must be unique');
                    }
                    selectors[selector] = node;
                }
                // group
                if (define.groupSelector) {
                    let nodeGroups = define.groupSelector;
                    if (!Array.isArray(nodeGroups)) {
                        nodeGroups = [nodeGroups];
                    }
                    nodeGroups.forEach((name) => {
                        if (!groups[name]) {
                            groups[name] = [];
                        }
                        groups[name].push(node);
                    });
                }
                parentNode.appendChild(node);
                // children
                const children = define.children;
                if (Array.isArray(children)) {
                    queue.push({ ns, markup: children, parent: node });
                }
            });
        }
        Object.keys(groups).forEach((groupName) => {
            if (selectors[groupName]) {
                throw new Error('Ambiguous group selector');
            }
            selectors[groupName] = groups[groupName];
        });
        return { fragment, selectors, groups };
    }
    Markup.parseJSONMarkup = parseJSONMarkup;
    function createContainer(firstChild) {
        return firstChild instanceof SVGElement
            ? Dom.createSvgElement('g')
            : Dom.createElement('div');
    }
    function renderMarkup(markup) {
        if (isStringMarkup(markup)) {
            const nodes = Vector.createVectors(markup);
            const count = nodes.length;
            if (count === 1) {
                return {
                    elem: nodes[0].node,
                };
            }
            if (count > 1) {
                const elem = createContainer(nodes[0].node);
                nodes.forEach((node) => {
                    elem.appendChild(node.node);
                });
                return { elem };
            }
            return {};
        }
        const result = parseJSONMarkup(markup);
        const fragment = result.fragment;
        let elem = null;
        if (fragment.childNodes.length > 1) {
            elem = createContainer(fragment.firstChild);
            elem.appendChild(fragment);
        }
        else {
            elem = fragment.firstChild;
        }
        return { elem, selectors: result.selectors };
    }
    Markup.renderMarkup = renderMarkup;
    function parseLabelStringMarkup(markup) {
        const children = Vector.createVectors(markup);
        const fragment = document.createDocumentFragment();
        for (let i = 0, n = children.length; i < n; i += 1) {
            const currentChild = children[i].node;
            fragment.appendChild(currentChild);
        }
        return { fragment, selectors: {} };
    }
    Markup.parseLabelStringMarkup = parseLabelStringMarkup;
})(Markup || (Markup = {}));
// eslint-disable-next-line
(function (Markup) {
    function getSelector(elem, stop, prev) {
        if (elem != null) {
            let selector;
            const tagName = elem.tagName.toLowerCase();
            if (elem === stop) {
                if (typeof prev === 'string') {
                    selector = `> ${tagName} > ${prev}`;
                }
                else {
                    selector = `> ${tagName}`;
                }
                return selector;
            }
            const parent = elem.parentNode;
            if (parent && parent.childNodes.length > 1) {
                const nth = Dom.index(elem) + 1;
                selector = `${tagName}:nth-child(${nth})`;
            }
            else {
                selector = tagName;
            }
            if (prev) {
                selector += ` > ${prev}`;
            }
            return getSelector(elem.parentNode, stop, selector);
        }
        return prev;
    }
    Markup.getSelector = getSelector;
})(Markup || (Markup = {}));
// eslint-disable-next-line
(function (Markup) {
    function getPortContainerMarkup() {
        return 'g';
    }
    Markup.getPortContainerMarkup = getPortContainerMarkup;
    function getPortMarkup() {
        return {
            tagName: 'circle',
            selector: 'circle',
            attrs: {
                r: 10,
                fill: '#FFFFFF',
                stroke: '#000000',
            },
        };
    }
    Markup.getPortMarkup = getPortMarkup;
    function getPortLabelMarkup() {
        return {
            tagName: 'text',
            selector: 'text',
            attrs: {
                fill: '#000000',
            },
        };
    }
    Markup.getPortLabelMarkup = getPortLabelMarkup;
})(Markup || (Markup = {}));
// eslint-disable-next-line
(function (Markup) {
    function getEdgeMarkup() {
        return [
            {
                tagName: 'path',
                selector: 'wrap',
                groupSelector: 'lines',
                attrs: {
                    fill: 'none',
                    cursor: 'pointer',
                    stroke: 'transparent',
                    strokeLinecap: 'round',
                },
            },
            {
                tagName: 'path',
                selector: 'line',
                groupSelector: 'lines',
                attrs: {
                    fill: 'none',
                    pointerEvents: 'none',
                },
            },
        ];
    }
    Markup.getEdgeMarkup = getEdgeMarkup;
})(Markup || (Markup = {}));
// eslint-disable-next-line
(function (Markup) {
    function getForeignObjectMarkup(bare = false) {
        return {
            tagName: 'foreignObject',
            selector: 'fo',
            children: [
                {
                    ns: Dom.ns.xhtml,
                    tagName: 'body',
                    selector: 'foBody',
                    attrs: {
                        xmlns: Dom.ns.xhtml,
                    },
                    style: {
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                    },
                    children: bare
                        ? []
                        : [
                            {
                                tagName: 'div',
                                selector: 'foContent',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                },
                            },
                        ],
                },
            ],
        };
    }
    Markup.getForeignObjectMarkup = getForeignObjectMarkup;
})(Markup || (Markup = {}));