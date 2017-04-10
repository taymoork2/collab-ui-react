import { PgInitiatorComponent } from './pgInitiator.component';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features';

export default angular
  .module('huron.paging-group.initiator', [
    'atlas.templates',
    'collab.ui',
    'huron.paging-group',
    'pascalprecht.translate',
    require('modules/core/config/urlConfig'),
    featureMemberService,
    notifications,
  ])
  .component('pgInitiator', new PgInitiatorComponent())
  .name;
