import { HuronCompassService } from './compass.service';

export * from './compass.service';

export default angular
  .module('huron.compass-service', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config'),
    require('modules/core/config/urlConfig'),
  ])
  .service('HuronCompassService', HuronCompassService)
  .name;
