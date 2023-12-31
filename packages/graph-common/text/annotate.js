import { ObjectExt } from '../object';
import { mergeAttrs } from '../dom/attr';
export function annotate(t, annotations, opt = {}) {
    const offset = opt.offset || 0;
    const compacted = [];
    const ret = [];
    let curr;
    let prev;
    let batch = null;
    for (let i = 0; i < t.length; i += 1) {
        curr = ret[i] = t[i];
        for (let j = 0, jj = annotations.length; j < jj; j += 1) {
            const annotation = annotations[j];
            const start = annotation.start + offset;
            const end = annotation.end + offset;
            if (i >= start && i < end) {
                if (typeof curr === 'string') {
                    curr = ret[i] = {
                        t: t[i],
                        attrs: annotation.attrs,
                    };
                }
                else {
                    curr.attrs = mergeAttrs(mergeAttrs({}, curr.attrs), annotation.attrs);
                }
                if (opt.includeAnnotationIndices) {
                    if (curr.annotations == null) {
                        curr.annotations = [];
                    }
                    curr.annotations.push(j);
                }
            }
        }
        prev = ret[i - 1];
        if (!prev) {
            batch = curr;
        }
        else if (ObjectExt.isObject(curr) && ObjectExt.isObject(prev)) {
            batch = batch;
            // Both previous item and the current one are annotations.
            // If the attributes didn't change, merge the text.
            if (JSON.stringify(curr.attrs) === JSON.stringify(prev.attrs)) {
                batch.t += curr.t;
            }
            else {
                compacted.push(batch);
                batch = curr;
            }
        }
        else if (ObjectExt.isObject(curr)) {
            // Previous item was a string, current item is an annotation.
            batch = batch;
            compacted.push(batch);
            batch = curr;
        }
        else if (ObjectExt.isObject(prev)) {
            // Previous item was an annotation, current item is a string.
            batch = batch;
            compacted.push(batch);
            batch = curr;
        }
        else {
            // Both previous and current item are strings.
            batch = (batch || '') + curr;
        }
    }
    if (batch != null) {
        compacted.push(batch);
    }
    return compacted;
}
export function findAnnotationsAtIndex(annotations, index) {
    return annotations
        ? annotations.filter((a) => a.start < index && index <= a.end)
        : [];
}
export function findAnnotationsBetweenIndexes(annotations, start, end) {
    return annotations
        ? annotations.filter((a) => (start >= a.start && start < a.end) ||
            (end > a.start && end <= a.end) ||
            (a.start >= start && a.end < end))
        : [];
}
export function shiftAnnotations(annotations, index, offset) {
    if (annotations) {
        annotations.forEach((a) => {
            if (a.start < index && a.end >= index) {
                a.end += offset;
            }
            else if (a.start >= index) {
                a.start += offset;
                a.end += offset;
            }
        });
    }
    return annotations;
}