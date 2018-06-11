import { PrivateTrunkDestinationComponent } from './private-trunk-destination.component';
import privateTrunkPrereq from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
export default angular
  .module('hercules.private-trunk-destination', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hercules/services/uss.service').default,
    privateTrunkPrereq,
    privateTrunkService,
  ])
  .component('privateTrunkDestination', new PrivateTrunkDestinationComponent())
  .name;
