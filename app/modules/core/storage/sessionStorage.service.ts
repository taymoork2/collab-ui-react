import { StorageBase } from './storage.base';

export class SessionStorageService extends StorageBase {

  /* @ngInject */
  constructor(private $window: ng.IWindowService) {
    super();
    this.storage = this.$window.sessionStorage;
  }
}
