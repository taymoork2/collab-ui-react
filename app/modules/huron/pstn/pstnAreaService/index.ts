import { PstnAreaService } from './pstnArea.service';
export * from './pstnArea.service';

export default angular
  .module('huron.pstn.pstn-area-service', [
    require('angular-resource'),
    require('angular-translate'),
  ])
  .service('PstnAreaService', PstnAreaService)
  .name;
