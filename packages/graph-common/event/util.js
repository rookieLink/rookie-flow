import { FunctionExt } from '../function';

// 回调函数列表，这里list的结构是[handler, context, handler, context, ...]
export function call(list, args) {
    const results = [];
    for (let i = 0; i < list.length; i += 2) {
        const handler = list[i];
        const context = list[i + 1];
        const params = Array.isArray(args) ? args : [args];
        const ret = FunctionExt.apply(handler, context, params);
        results.push(ret);
    }
    return FunctionExt.toAsyncBoolean(results);
}