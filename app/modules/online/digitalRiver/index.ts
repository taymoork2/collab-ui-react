import { DigitalRiverService } from './digitalRiver.service';

export default angular
  .module('online.digital-river', [
    require('modules/core/config/urlConfig'),
  ])
  .service('DigitalRiverService', DigitalRiverService)
  .name;