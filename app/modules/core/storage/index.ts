import { LocalStorageService } from './localStorage.service';
import { SessionStorageService } from './sessionStorage.service';
import { StorageKeys } from './storage.keys';
export default angular
  .module('core.storage', [])
  .service('LocalStorage', LocalStorageService)
  .service('SessionStorage', SessionStorageService)
  .constant('StorageKeys', StorageKeys)
  .name;
