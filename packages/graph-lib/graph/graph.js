import { Basecoat } from '@packages/graph-common/common/basecoat.js';
import { Options as GraphOptions } from './options.js';

import { CSSManager as Css } from './css.js';
// import { GraphView } from './view.js';
// import { GridManager as Grid } from './grid.js';


export class Graph extends Basecoat {
  constructor(opt) {
    super(opt);
    console.log('init Graph')
    // ToDo 初始化额外属性执行
    this.installedPlugins = new Set();
    this.options = GraphOptions.get(opt);
    this.css = new Css(this)
    // this.view = new GraphView(this);
    // this.defs = new Defs(this);
    // this.coord = new Coord(this);
    // this.transform = new Transform(this);
    // this.highlight = new Highlight(this);
    // this.grid = new Grid(this);
    // this.background = new Background(this);å

  }
}