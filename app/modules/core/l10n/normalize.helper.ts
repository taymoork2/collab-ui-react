export class NormalizeHelper {

  private static unorm = require('unorm');

  public static stripAccents(input: string): string {
    return this.unorm.nfd(input).replace(/[\u0300-\u036f]/g, '');
  }
}
