import { PgNumberComponent } from './pgNumber.component';
import { PagingNumberService } from './pgNumber.service';

export * from './pgNumber.service';

export default angular
  .module('huron.paging-group.number', [
    'atlas.templates',
    'cisco.ui',
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/notifications/notifications.module'),
  ])
  .component('pgNumber', new PgNumberComponent())
  .service('PagingNumberService', PagingNumberService)
  .name;
