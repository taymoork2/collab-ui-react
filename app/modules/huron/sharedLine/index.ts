import { SharedLineComponent } from 'modules/huron/sharedLine/sharedLine.component';
import { SharedLineService } from 'modules/huron/sharedLine/sharedLine.service';

export * from 'modules/huron/sharedLine/sharedLine';
export * from 'modules/huron/sharedLine/sharedLine.service';

export default angular
  .module('huron.shared-line', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucSharedLine', new SharedLineComponent())
  .service('SharedLineService', SharedLineService)
  .name;
