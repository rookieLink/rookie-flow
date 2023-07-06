import { Dom } from '@packages/graph-common/dom/index.js';

import { Config } from '../../config';
const className = Config.prefix('highlight-opacity');
export const opacity = {
    highlight(cellView, magnet) {
        Dom.addClass(magnet, className);
    },
    unhighlight(cellView, magnetEl) {
        Dom.removeClass(magnetEl, className);
    },
};
