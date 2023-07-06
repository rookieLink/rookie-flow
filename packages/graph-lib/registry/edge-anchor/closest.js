import { Point } from '@packages/graph-geometry';
import { resolve } from '../node-anchor/util';
export const getClosestPoint = function (view, magnet, refPoint, options) {
    const closestPoint = view.getClosestPoint(refPoint);
    return closestPoint != null ? closestPoint : new Point();
};
export const closest = resolve(getClosestPoint);