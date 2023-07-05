const extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
        function (d, b) {
            d.__proto__ = b; // eslint-disable-line no-proto
        }) ||
    function (d, b) {
        // 以上格式都不支持
        for (const p in b) {
            if (Object.prototype.hasOwnProperty.call(b, p)) {
                d[p] = b[p];
            }
        }
    };
/**
 * 继承
 * @param cls 子类类
 * @param base 父类
 */
// eslint-disable-next-line
export function inherit(cls, base) {
  // 将base的静态属性赋值给目标类
    extendStatics(cls, base);
    function tmp() {
      // 这里还原constructor，否则会丢失cls自身的constructor
        this.constructor = cls;
    }
    // 采用圣杯模式，替换cls的原型为base的原型，
    cls.prototype =
        base === null
            ? Object.create(base)
            : ((tmp.prototype = base.prototype), new tmp());
}
class A {
}
const isNativeClass = /^\s*class\s+/.test(`${A}`) || /^\s*class\s*\{/.test(`${class {
}}`);
/**
 * 生成一个指定class类名的类
 */
export function createClass(className, base) {
    let cls;
    // 如果原生支持class，则采用class继承的方式创建类
    if (isNativeClass) {
        cls = class extends base {
        };
    }
    else {
        cls = function () {
            return base.apply(this, arguments);
        };
        inherit(cls, base);
    }
    Object.defineProperty(cls, 'name', { value: className });
    return cls;
}