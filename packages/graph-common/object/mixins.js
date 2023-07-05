/**
 * 应用 Mixins 到目标类上, 使目标类具有基础类的方法
 * @param derivedCtor 目标类
 * @param baseCtors 基础类
 */
export function applyMixins(derivedCtor, ...baseCtors) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (name !== 'constructor') {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name),
        )
      }
    })
  })
}
