export const Config = {
  prefixCls: 'graph',
  autoInsertCSS: true,
  useCSSSelector: true,

  prefix(suffix) {
    return `${Config.prefixCls}-${suffix}`
  },
}
