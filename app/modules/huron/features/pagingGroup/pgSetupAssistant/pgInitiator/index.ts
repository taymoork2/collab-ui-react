import { PgInitiatorComponent } from './pgInitiator.component';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features';

export default angular
  .module('huron.paging-group.initiator', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.paging-group',
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
    featureMemberService,
    notifications,
  ])
  .component('pgInitiator', new PgInitiatorComponent())
  .name;
