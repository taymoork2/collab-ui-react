import { PrivateTrunkDeactivateComponent } from './private-trunk-deactivate.component';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
import notifications from 'modules/core/notifications';

import modalservice from 'modules/core/modal';
export default angular
  .module('hercules.private-trunk-deactivate', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkService,
    modalservice,
    notifications,
  ])
  .component('privateTrunkDeactivate', new PrivateTrunkDeactivateComponent())
  .name;
