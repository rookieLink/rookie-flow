import { camelCase, startCase, upperCase, lowerCase, upperFirst, snakeCase } from 'lodash-es';
export { lowerFirst, upperFirst, camelCase } from 'lodash-es';
// @see: https://medium.com/@robertsavian/javascript-case-converters-using-lodash-4f2f964091cc
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};

// 将驼峰命名转换为烤串模式
export const kebabCase = cacheStringFunction((s) => s.replace(/\B([A-Z])/g, '-$1').toLowerCase());
// 此处多此一举
export const pascalCase = cacheStringFunction((s) => startCase(camelCase(s)).replace(/ /g, ''));
// 大写蛇形命名
export const constantCase = cacheStringFunction((s) => upperCase(s).replace(/ /g, '_'));

// 小写.点命名
export const dotCase = cacheStringFunction((s) => lowerCase(s).replace(/ /g, '.'));
// 小写/路径命名
export const pathCase = cacheStringFunction((s) => lowerCase(s).replace(/ /g, '/'));
// 只大写首字母命名
export const sentenceCase = cacheStringFunction((s) => upperFirst(lowerCase(s)));
// 这个不就是oascakCase吗
export const titleCase = cacheStringFunction((s) => startCase(camelCase(s)));
