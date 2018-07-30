import { FtswConfigService } from './ftsw-config.service';
import { RialtoService } from './rialto.service';

export * from './bsft-site';
export * from './bsft-number';
export * from './bsft-order';
export * from './bsft-rialto';

export { FtswConfigService };
export { RialtoService };

export default angular
  .module('bsft.services', [])
  .service('FtswConfigService', FtswConfigService)
  .service('RialtoService', RialtoService)
  .name;
