import { Dom } from '@packages/graph-common/dom/index.js';
import { ObjectExt } from '@packages/graph-common/object/index.js';

export const style = {
    qualify: ObjectExt.isPlainObject,
    set(styles, { elem }) {
        Dom.css(elem, styles);
    },
};