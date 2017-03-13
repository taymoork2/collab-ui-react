import { StorageService } from './storage.service';
import { SessionStorageService } from './sessionStorage.service';
import { StorageKeys } from './storage.keys';
export default angular
  .module('core.storage', [])
  .service('Storage', StorageService)
  .service('SessionStorage', SessionStorageService)
  .service('StorageKeys', StorageKeys)
  .name;

