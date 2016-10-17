import { PgNumberComponent } from './pgNumber.component';

export default angular
  .module('huron.paging-group.number', [
    'atlas.templates',
    'cisco.ui',
    'huron.paging-group',
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/notifications/notifications.module'),
  ])
  .component('pgNumber', new PgNumberComponent())
  .name;
