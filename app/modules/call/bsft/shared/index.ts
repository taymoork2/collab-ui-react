import { FtswConfigService } from './ftsw-config.service';
import { RialtoService } from './rialto.service';
import { RialtoOrderService } from './bsft-rialto-order.service';
export * from './bsft-site';
export * from './bsft-number';
export * from './bsft-order';
export * from './bsft-rialto';
export * from './bsft-rialto-order';

export { FtswConfigService };
export { RialtoService };
export { RialtoOrderService };

export default angular
  .module('bsft.services', [])
  .service('FtswConfigService', FtswConfigService)
  .service('RialtoService', RialtoService)
  .service('RialtoOrderService', RialtoOrderService)
  .name;
