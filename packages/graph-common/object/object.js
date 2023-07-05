export {
  has,
  pick,
  merge,
  isEqual,
  isEmpty,
  isObject,
  isPlainObject,
  clone,
  cloneDeep,
  defaults,
  defaultsDeep,
}
from 'lodash-es';
export * from './mixins.js';
export * from './inherit.js';

// value 为null或undefined使用默认值
export function ensure(value, defaultValue) {
  return value != null ? value : defaultValue;
}

// 查询对象的某个值属性，默认值
export function getValue(obj, key, defaultValue) {
  const value = obj != null ? obj[key] : null;
  return defaultValue !== undefined ? ensure(value, defaultValue) : value;
}

// 查询数值类型的值，排除掉NaN和Infinity
export function getNumber(obj, key, defaultValue) {
  let value = obj != null ? obj[key] : null;
  if (value == null) {
    return defaultValue;
  }
  value = +value;
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return defaultValue;
  }
  return value;
}

// 查询布尔类型的值
export function getBoolean(obj, key, defaultValue) {
  const value = obj != null ? obj[key] : null;
  if (value == null) {
    return defaultValue;
  }
  return !!value;
}

// 非正常属性
export function isMaliciousProp(prop) {
  return prop === '__proto__';
}

// 通过路径获取对象的值
export function getByPath(obj, path, delimiter = '/') {
  let ret;
  // 参数归一化，将path转换为数组
  const keys = Array.isArray(path) ? path : path.split(delimiter);
  if (keys.length) {
    ret = obj;
    while (keys.length) {
      const key = keys.shift();
      if (Object(ret) === ret && key && key in ret) {
        ret = ret[key];
      } else {
        return undefined;
      }
    }
  }
  return ret;
}

// 通过路径设置对象的值
export function setByPath(obj, path, value, delimiter = '/') {
  const keys = Array.isArray(path) ? path : path.split(delimiter);
  const lastKey = keys.pop();
  if (lastKey && !isMaliciousProp(lastKey)) {
    let diver = obj;
    keys.forEach((key) => {
      if (!isMaliciousProp(key)) {
        if (diver[key] == null) {
          diver[key] = {};
        }
        diver = diver[key];
      }
    });
    diver[lastKey] = value;
  }
  return obj;
}

// 删除对应路径对象的属性
export function unsetByPath(obj, path, delimiter = '/') {
  const keys = Array.isArray(path) ? path.slice() : path.split(delimiter);
  const propertyToRemove = keys.pop();
  if (propertyToRemove) {
    if (keys.length > 0) {
      const parent = getByPath(obj, keys);
      if (parent) {
        delete parent[propertyToRemove];
      }
    } else {
      delete obj[propertyToRemove];
    }
  }
  return obj;
}

// 将对象拍平，如果该对象不在obj自身中，
export function flatten(obj, delim = '/', stop) {
  const ret = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    // 如果是对象或者数组，deep为true
    let deep = typeof val === 'object' || Array.isArray(val);
    // 如果当前值满足stop条件，则不继续拍平
    if (deep && stop && stop(val)) {
      deep = false;
    }
    if (deep) {
      // 递归拍平
      const flatObject = flatten(val, delim, stop);
      Object.keys(flatObject).forEach((flatKey) => {
        ret[key + delim + flatKey] = flatObject[flatKey];
      });
    } else {
      ret[key] = val;
    }
  });
  // 没有处理逻辑，先放在这里
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }
  }
  return ret;
}