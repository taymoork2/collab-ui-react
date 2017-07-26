import { LocationCosService } from './location-cos.service';

export { LocationCosService };
export * from './cos';

export default angular
  .module('call.shared', [
    require('angular-resource'),
  ])
  .service('LocationCosService', LocationCosService)
  .name;
