import { Dictionary } from '@packages/graph-common/dictionary/index.js';
import { Dom } from '@packages/graph-common/dom/index.js';
import { Util } from '../util';
export class Cache {
    constructor(view) {
        this.view = view;
        this.clean();
    }
    clean() {
        if (this.elemCache) {
            this.elemCache.dispose();
        }
        this.elemCache = new Dictionary();
        this.pathCache = {};
    }
    get(elem) {
        const cache = this.elemCache;
        if (!cache.has(elem)) {
            this.elemCache.set(elem, {});
        }
        return this.elemCache.get(elem);
    }
    getData(elem) {
        const meta = this.get(elem);
        if (!meta.data) {
            meta.data = {};
        }
        return meta.data;
    }
    getMatrix(elem) {
        const meta = this.get(elem);
        if (meta.matrix == null) {
            const target = this.view.container;
            meta.matrix = Dom.getTransformToParentElement(elem, target);
        }
        return Dom.createSVGMatrix(meta.matrix);
    }
    getShape(elem) {
        const meta = this.get(elem);
        if (meta.shape == null) {
            meta.shape = Util.toGeometryShape(elem);
        }
        return meta.shape.clone();
    }
    getBoundingRect(elem) {
        const meta = this.get(elem);
        if (meta.boundingRect == null) {
            meta.boundingRect = Util.getBBoxV2(elem);
        }
        return meta.boundingRect.clone();
    }
}