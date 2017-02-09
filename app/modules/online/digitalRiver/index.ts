import { DigitalRiverService } from './digitalRiver.service';
import loadEventModule from '../../core/loadEvent';

export default angular
  .module('online.digital-river', [
    'atlas.templates',
    loadEventModule,
    require('modules/core/config/urlConfig'),
  ])
  .service('DigitalRiverService', DigitalRiverService)
  .name;
