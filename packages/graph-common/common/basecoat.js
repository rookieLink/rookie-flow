
import {Disposable} from './disposable.js';
import {Events} from '../event/index.js'
import {ObjectExt} from '../object/index.js'

export class Basecoat extends Event {

}
// ToDo 待移除，未使用到
Basecoat.dispose = Disposable.dispose;

ObjectExt.applyMixins(Basecoat, Disposable)