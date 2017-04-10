export abstract class StorageBase {

  protected storage: Storage;
 /* @ngInject */
  constructor() {
  }

  public put(key, value) {
    if (value) {
      this.storage.setItem(key, value);
    }
  }

  public putObject(key, object) {
    if (object) {
      this.storage.setItem(key, JSON.stringify(object));
    }
  }

  public get(key) {
    return this.storage.getItem(key);
  }

  public getObject(key) {
    return JSON.parse(this.storage.getItem(key) || 'null');
  }

  public pop(key) {
    let value = this.get(key);
    this.remove(key);
    return value;
  }

  public popObject(key) {
    let object = this.getObject(key);
    this.remove(key);
    return object;
  }

  public remove(key) {
    this.storage.removeItem(key);
  }

  public clear() {
    this.storage.clear();
  }
}
