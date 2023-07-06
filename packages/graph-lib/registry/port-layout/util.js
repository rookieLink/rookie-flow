import { NumberExt } from '@packages/graph-common/number';
import { Point } from '@packages/graph-geometry';
export function normalizePoint(bbox, args = {}) {
    return new Point(NumberExt.normalizePercentage(args.x, bbox.width), NumberExt.normalizePercentage(args.y, bbox.height));
}
export function toResult(point, angle, rawArgs) {
    return Object.assign({ angle, position: point.toJSON() }, rawArgs);
}
