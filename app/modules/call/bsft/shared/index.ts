import { FtswConfigService } from './ftsw-config.service';

export * from './bsft-site';

export default angular
  .module('bsft.services', [])
  .service('FtswConfigService', FtswConfigService)
  .name;
