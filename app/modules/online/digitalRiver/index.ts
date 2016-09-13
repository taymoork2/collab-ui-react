import { DigitalRiverService } from './digitalRiver.service';
import { DigitalRiverIframeComponent } from './digitalRiverIframe.component';
import loadEventModule from '../../core/loadEvent';

require('./digitalRiverIframe.scss');

export default angular
  .module('online.digital-river', [
    'atlas.templates',
    loadEventModule,
    require('modules/core/config/urlConfig'),
  ])
  .service('DigitalRiverService', DigitalRiverService)
  .component('digitalRiverIframe', new DigitalRiverIframeComponent())
  .name;