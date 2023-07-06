export class Geometry {
  valueOf() {
      return this.toJSON();
  }
  toString() {
      return JSON.stringify(this.toJSON());
  }
}