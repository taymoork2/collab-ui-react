import { LocationCosService } from './location-cos.service';

export { LocationCosService };
export * from './cos';

export default angular
  .module('call.shared.cos', [
    require('angular-resource'),
  ])
  .service('LocationCosService', LocationCosService)
  .name;
