import { ObjectExt } from '@packages/graph-common/object/index.js';

export const filter = {
    qualify: ObjectExt.isPlainObject,
    set(filter, { view }) {
        return `url(#${view.graph.defineFilter(filter)})`;
    },
};