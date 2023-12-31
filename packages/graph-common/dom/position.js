import { computeStyle, computeStyleInt } from './css';
import { isElement } from './elem';
export function offset(elem) {
    const rect = elem.getBoundingClientRect();
    const win = elem.ownerDocument.defaultView;
    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset,
    };
}
export function width(elem) {
    const rect = elem.getBoundingClientRect();
    return rect.width;
}
export function height(elem) {
    const rect = elem.getBoundingClientRect();
    return rect.height;
}
export function position(elem) {
    const isFixed = computeStyle(elem, 'position') === 'fixed';
    let offsetValue;
    if (isFixed) {
        const rect = elem.getBoundingClientRect();
        offsetValue = { left: rect.left, top: rect.top };
    }
    else {
        offsetValue = offset(elem);
    }
    if (!isFixed) {
        const doc = elem.ownerDocument;
        let offsetParent = elem.offsetParent || doc.documentElement;
        while ((offsetParent === doc.body || offsetParent === doc.documentElement) &&
            computeStyle(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.parentNode;
        }
        if (offsetParent !== elem && isElement(offsetParent)) {
            const parentOffset = offset(offsetParent);
            offsetValue.top -=
                parentOffset.top + computeStyleInt(offsetParent, 'borderTopWidth');
            offsetValue.left -=
                parentOffset.left + computeStyleInt(offsetParent, 'borderLeftWidth');
        }
    }
    return {
        top: offsetValue.top - computeStyleInt(elem, 'marginTop'),
        left: offsetValue.left - computeStyleInt(elem, 'marginLeft'),
    };
}