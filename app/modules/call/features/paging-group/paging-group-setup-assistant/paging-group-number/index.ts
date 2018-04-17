import { PgNumberComponent } from './paging-group-number.component';
import pagingGroupNumberServiceModule from 'modules/call/features/paging-group/shared';
import notifications from 'modules/core/notifications';

export default angular
  .module('call.paging-group.number', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    pagingGroupNumberServiceModule,
    notifications,
  ])
  .component('pgNumber', new PgNumberComponent())
  .name;
