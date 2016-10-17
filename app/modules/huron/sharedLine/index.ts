import { SharedLineComponent } from './sharedLine.component';
import { SharedLineService } from './sharedLine.service';

export * from './sharedLine';
export * from './sharedLine.service';

export default angular
  .module('huron.shared-line', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucSharedLine', new SharedLineComponent())
  .service('SharedLineService', SharedLineService)
  .name;
