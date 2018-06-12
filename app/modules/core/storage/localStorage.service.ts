import { StorageBase } from './storage.base';

export class LocalStorageService extends StorageBase {

  /* @ngInject */
  constructor( private $window: ng.IWindowService, private $log: ng.ILogService ) {
    super();
    this.storage = this.getLocalStorage();
  }

  private getLocalStorage() {
    try {
      return this.$window.localStorage;
    } catch (e) {
      this.$log.error(e);
      return new Storage();
    }
  }
}
