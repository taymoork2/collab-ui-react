import { PgNumberComponent } from './pgNumber.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.paging-group.number', [
    'atlas.templates',
    'cisco.ui',
    'huron.paging-group',
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    notifications,
  ])
  .component('pgNumber', new PgNumberComponent())
  .name;
