import { call } from './util';
import { FunctionExt } from '../function/index.js';


export class Events {
    constructor() {
        this.listeners = {};
    }
    // 将事件存储到 listeners 中，按类别进行分类
    on(name, handler, context) {
        if (handler == null) {
            return this;
        }
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        const cache = this.listeners[name];
        // 将回调和上下文存储到 listeners 中
        cache.push(handler, context);
        return this;
    }
    // 监听一次
    once(name, handler, context) {
        const cb = (...args) => {
            // 执行一次便移除
            this.off(name, cb);
            return call([handler, context], args);
        };
        return this.on(name, cb, this);
    }
    // 移除事件
    off(name, handler, context) {
        // 移除所有事件
        if (!(name || handler || context)) {
            this.listeners = {};
            return this;
        }
        const listeners = this.listeners;
        // 参数归一化
        const names = name ? [name] : Object.keys(listeners);
        names.forEach((n) => {
            // 返回对应listeners对应的事件
            const cache = listeners[n];
            if (!cache) {
                return;
            }
            // 只指定名称的情况下，移除所有该名称的事件
            if (!(handler || context)) {
                delete listeners[n];
                return;
            }
            // 查找 handler 或者 context 与参数相同 的事件，并移除
            for (let i = cache.length - 2; i >= 0; i -= 2) {
                if (!((handler && cache[i] !== handler) ||
                    (context && cache[i + 1] !== context))) {
                    cache.splice(i, 2);
                }
            }
        });
        return this;
    }
    // 触发多个事件
    trigger(name, ...args) {
        let returned = true;
        // 调用名称对应的所有事件
        if (name !== '*') {
            const list = this.listeners[name];
            if (list != null) {
                returned = call([...list], args);
            }
        }
        const list = this.listeners['*'];
        if (list != null) {
            return FunctionExt.toAsyncBoolean([
                returned,
                call([...list], [name, ...args]),
            ]);
        }
        return returned;
    }
    emit(name, ...args) {
        return this.trigger(name, ...args);
    }
}