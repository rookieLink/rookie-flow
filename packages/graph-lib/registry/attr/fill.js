import { ObjectExt } from '@packages/graph-common/object';
export const fill = {
    qualify: ObjectExt.isPlainObject,
    set(fill, { view }) {
        return `url(#${view.graph.defineGradient(fill)})`;
    },
};
