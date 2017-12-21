import { PgInitiatorComponent } from './paging-group-initiator.component';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features/services';

export default angular
  .module('call.paging-group.initiator', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
    featureMemberService,
    notifications,
  ])
  .component('pgInitiator', new PgInitiatorComponent())
  .name;
