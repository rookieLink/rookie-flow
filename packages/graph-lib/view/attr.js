import { ObjectExt } from '@packages/graph-common/object';
import { Dom } from '@packages/graph-common/dom';
import { FunctionExt } from '@packages/graph-common/function';
import { ArrayExt } from '@packages/graph-common/array';
import { Dictionary } from '@packages/graph-common/dictionary';
import { StringExt } from '@packages/graph-common/string';
import { Point } from '@packages/graph-common/geometry';
import { Attr } from '../registry/attr';
import { View } from './view';
import { Util } from '../util';
export class AttrManager {
    constructor(view) {
        this.view = view;
    }
    get cell() {
        return this.view.cell;
    }
    getDefinition(attrName) {
        return this.cell.getAttrDefinition(attrName);
    }
    processAttrs(elem, raw) {
        let normal;
        let set;
        let offset;
        let position;
        const specials = [];
        // divide the attributes between normal and special
        Object.keys(raw).forEach((name) => {
            const val = raw[name];
            const definition = this.getDefinition(name);
            const isValid = FunctionExt.call(Attr.isValidDefinition, this.view, definition, val, {
                elem,
                attrs: raw,
                cell: this.cell,
                view: this.view,
            });
            if (definition && isValid) {
                if (typeof definition === 'string') {
                    if (normal == null) {
                        normal = {};
                    }
                    normal[definition] = val;
                }
                else if (val !== null) {
                    specials.push({ name, definition });
                }
            }
            else {
                if (normal == null) {
                    normal = {};
                }
                const normalName = Dom.CASE_SENSITIVE_ATTR.includes(name)
                    ? name
                    : StringExt.kebabCase(name);
                normal[normalName] = val;
            }
        });
        specials.forEach(({ name, definition }) => {
            const val = raw[name];
            const setDefine = definition;
            if (typeof setDefine.set === 'function') {
                if (set == null) {
                    set = {};
                }
                set[name] = val;
            }
            const offsetDefine = definition;
            if (typeof offsetDefine.offset === 'function') {
                if (offset == null) {
                    offset = {};
                }
                offset[name] = val;
            }
            const positionDefine = definition;
            if (typeof positionDefine.position === 'function') {
                if (position == null) {
                    position = {};
                }
                position[name] = val;
            }
        });
        return {
            raw,
            normal,
            set,
            offset,
            position,
        };
    }
    mergeProcessedAttrs(allProcessedAttrs, roProcessedAttrs) {
        allProcessedAttrs.set = Object.assign(Object.assign({}, allProcessedAttrs.set), roProcessedAttrs.set);
        allProcessedAttrs.position = Object.assign(Object.assign({}, allProcessedAttrs.position), roProcessedAttrs.position);
        allProcessedAttrs.offset = Object.assign(Object.assign({}, allProcessedAttrs.offset), roProcessedAttrs.offset);
        // Handle also the special transform property.
        const transform = allProcessedAttrs.normal && allProcessedAttrs.normal.transform;
        if (transform != null && roProcessedAttrs.normal) {
            roProcessedAttrs.normal.transform = transform;
        }
        allProcessedAttrs.normal = roProcessedAttrs.normal;
    }
    findAttrs(cellAttrs, rootNode, selectorCache, selectors) {
        const merge = [];
        const result = new Dictionary();
        Object.keys(cellAttrs).forEach((selector) => {
            const attrs = cellAttrs[selector];
            if (!ObjectExt.isPlainObject(attrs)) {
                return;
            }
            const { isCSSSelector, elems } = View.find(selector, rootNode, selectors);
            selectorCache[selector] = elems;
            for (let i = 0, l = elems.length; i < l; i += 1) {
                const elem = elems[i];
                const unique = selectors && selectors[selector] === elem;
                const prev = result.get(elem);
                if (prev) {
                    if (!prev.array) {
                        merge.push(elem);
                        prev.array = true;
                        prev.attrs = [prev.attrs];
                        prev.priority = [prev.priority];
                    }
                    const attributes = prev.attrs;
                    const selectedLength = prev.priority;
                    if (unique) {
                        // node referenced by `selector`
                        attributes.unshift(attrs);
                        selectedLength.unshift(-1);
                    }
                    else {
                        // node referenced by `groupSelector` or CSSSelector
                        const sortIndex = ArrayExt.sortedIndex(selectedLength, isCSSSelector ? -1 : l);
                        attributes.splice(sortIndex, 0, attrs);
                        selectedLength.splice(sortIndex, 0, l);
                    }
                }
                else {
                    result.set(elem, {
                        elem,
                        attrs,
                        priority: unique ? -1 : l,
                        array: false,
                    });
                }
            }
        });
        merge.forEach((node) => {
            const item = result.get(node);
            const arr = item.attrs;
            item.attrs = arr.reduceRight((memo, attrs) => ObjectExt.merge(memo, attrs), {});
        });
        return result;
    }
    updateRelativeAttrs(elem, processedAttrs, refBBox) {
        const rawAttrs = processedAttrs.raw || {};
        let nodeAttrs = processedAttrs.normal || {};
        const setAttrs = processedAttrs.set;
        const positionAttrs = processedAttrs.position;
        const offsetAttrs = processedAttrs.offset;
        const getOptions = () => ({
            elem,
            cell: this.cell,
            view: this.view,
            attrs: rawAttrs,
            refBBox: refBBox.clone(),
        });
        if (setAttrs != null) {
            Object.keys(setAttrs).forEach((name) => {
                const val = setAttrs[name];
                const def = this.getDefinition(name);
                if (def != null) {
                    const ret = FunctionExt.call(def.set, this.view, val, getOptions());
                    if (typeof ret === 'object') {
                        nodeAttrs = Object.assign(Object.assign({}, nodeAttrs), ret);
                    }
                    else if (ret != null) {
                        nodeAttrs[name] = ret;
                    }
                }
            });
        }
        if (elem instanceof HTMLElement) {
            // TODO: setting the `transform` attribute on HTMLElements
            // via `node.style.transform = 'matrix(...)';` would introduce
            // a breaking change (e.g. basic.TextBlock).
            this.view.setAttrs(nodeAttrs, elem);
            return;
        }
        // The final translation of the subelement.
        const nodeTransform = nodeAttrs.transform;
        const transform = nodeTransform ? `${nodeTransform}` : null;
        const nodeMatrix = Dom.transformStringToMatrix(transform);
        const nodePosition = new Point(nodeMatrix.e, nodeMatrix.f);
        if (nodeTransform) {
            delete nodeAttrs.transform;
            nodeMatrix.e = 0;
            nodeMatrix.f = 0;
        }
        let positioned = false;
        if (positionAttrs != null) {
            Object.keys(positionAttrs).forEach((name) => {
                const val = positionAttrs[name];
                const def = this.getDefinition(name);
                if (def != null) {
                    const ts = FunctionExt.call(def.position, this.view, val, getOptions());
                    if (ts != null) {
                        positioned = true;
                        nodePosition.translate(Point.create(ts));
                    }
                }
            });
        }
        // The node bounding box could depend on the `size`
        // set from the previous loop.
        this.view.setAttrs(nodeAttrs, elem);
        let offseted = false;
        if (offsetAttrs != null) {
            // Check if the node is visible
            const nodeBoundingRect = this.view.getBoundingRectOfElement(elem);
            if (nodeBoundingRect.width > 0 && nodeBoundingRect.height > 0) {
                const nodeBBox = Util.transformRectangle(nodeBoundingRect, nodeMatrix);
                Object.keys(offsetAttrs).forEach((name) => {
                    const val = offsetAttrs[name];
                    const def = this.getDefinition(name);
                    if (def != null) {
                        const ts = FunctionExt.call(def.offset, this.view, val, {
                            elem,
                            cell: this.cell,
                            view: this.view,
                            attrs: rawAttrs,
                            refBBox: nodeBBox,
                        });
                        if (ts != null) {
                            offseted = true;
                            nodePosition.translate(Point.create(ts));
                        }
                    }
                });
            }
        }
        if (nodeTransform != null || positioned || offseted) {
            nodePosition.round(1);
            nodeMatrix.e = nodePosition.x;
            nodeMatrix.f = nodePosition.y;
            elem.setAttribute('transform', Dom.matrixToTransformString(nodeMatrix));
        }
    }
    update(rootNode, attrs, options) {
        const selectorCache = {};
        const nodesAttrs = this.findAttrs(options.attrs || attrs, rootNode, selectorCache, options.selectors);
        // `nodesAttrs` are different from all attributes, when
        // rendering only attributes sent to this method.
        const nodesAllAttrs = options.attrs
            ? this.findAttrs(attrs, rootNode, selectorCache, options.selectors)
            : nodesAttrs;
        const specialItems = [];
        nodesAttrs.each((data) => {
            const node = data.elem;
            const nodeAttrs = data.attrs;
            const processed = this.processAttrs(node, nodeAttrs);
            if (processed.set == null &&
                processed.position == null &&
                processed.offset == null) {
                this.view.setAttrs(processed.normal, node);
            }
            else {
                const data = nodesAllAttrs.get(node);
                const nodeAllAttrs = data ? data.attrs : null;
                const refSelector = nodeAllAttrs && nodeAttrs.ref == null
                    ? nodeAllAttrs.ref
                    : nodeAttrs.ref;
                let refNode;
                if (refSelector) {
                    refNode = (selectorCache[refSelector] ||
                        this.view.find(refSelector, rootNode, options.selectors))[0];
                    if (!refNode) {
                        throw new Error(`"${refSelector}" reference does not exist.`);
                    }
                }
                else {
                    refNode = null;
                }
                const item = {
                    node,
                    refNode,
                    attributes: nodeAllAttrs,
                    processedAttributes: processed,
                };
                // If an element in the list is positioned relative to this one, then
                // we want to insert this one before it in the list.
                const index = specialItems.findIndex((item) => item.refNode === node);
                if (index > -1) {
                    specialItems.splice(index, 0, item);
                }
                else {
                    specialItems.push(item);
                }
            }
        });
        const bboxCache = new Dictionary();
        let rotatableMatrix;
        specialItems.forEach((item) => {
            const node = item.node;
            const refNode = item.refNode;
            let unrotatedRefBBox;
            const isRefNodeRotatable = refNode != null &&
                options.rotatableNode != null &&
                Dom.contains(options.rotatableNode, refNode);
            // Find the reference element bounding box. If no reference was
            // provided, we use the optional bounding box.
            if (refNode) {
                unrotatedRefBBox = bboxCache.get(refNode);
            }
            if (!unrotatedRefBBox) {
                const target = (isRefNodeRotatable ? options.rotatableNode : rootNode);
                unrotatedRefBBox = refNode
                    ? Util.getBBox(refNode, { target })
                    : options.rootBBox;
                if (refNode) {
                    bboxCache.set(refNode, unrotatedRefBBox);
                }
            }
            let processedAttrs;
            if (options.attrs && item.attributes) {
                // If there was a special attribute affecting the position amongst
                // passed-in attributes we have to merge it with the rest of the
                // element's attributes as they are necessary to update the position
                // relatively (i.e `ref-x` && 'ref-dx').
                processedAttrs = this.processAttrs(node, item.attributes);
                this.mergeProcessedAttrs(processedAttrs, item.processedAttributes);
            }
            else {
                processedAttrs = item.processedAttributes;
            }
            let refBBox = unrotatedRefBBox;
            if (isRefNodeRotatable &&
                options.rotatableNode != null &&
                !options.rotatableNode.contains(node)) {
                // If the referenced node is inside the rotatable group while the
                // updated node is outside, we need to take the rotatable node
                // transformation into account.
                if (!rotatableMatrix) {
                    rotatableMatrix = Dom.transformStringToMatrix(Dom.attr(options.rotatableNode, 'transform'));
                }
                refBBox = Util.transformRectangle(unrotatedRefBBox, rotatableMatrix);
            }
            this.updateRelativeAttrs(node, processedAttrs, refBBox);
        });
    }
}