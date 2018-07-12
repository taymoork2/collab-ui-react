import { FtswConfigService } from './ftsw-config.service';

export * from './bsft-site';
export * from './bsft-number';
export * from './bsft-order';

export default angular
  .module('bsft.services', [])
  .service('FtswConfigService', FtswConfigService)
  .name;
