import { Basecoat } from '@packages/graph-common/common/basecoat.js';
import { Options as GraphOptions } from './options.js';

import { CSSManager as Css } from './css.js';

export class Graph extends Basecoat {
  constructor(opt) {
    super(opt);
    console.log('init Graph')
    // ToDo 初始化额外属性执行
    this.installedPlugins = new Set();
    this.options = GraphOptions.get(opt);
    this.css = new Css(this)
  }
}