import {Dom} from '@packages/graph-common/dom/index.js';

export const fixedDot = {
    color: '#aaaaaa',
    thickness: 1,
    markup: 'rect',
    update(elem, options) {
        const size = options.sx <= 1 ? options.thickness * options.sx : options.thickness;
        Dom.attr(elem, {
            width: size,
            height: size,
            rx: size,
            ry: size,
            fill: options.color,
        });
    },
};