import { PrivateTrunkDestinationComponent } from './private-trunk-destination.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/private-trunk-prereq';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
export default angular
  .module('hercules.private-trunk-destination', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hercules/services/uss-service'),
    privateTrunkPrereq,
    privateTrunkService,
  ])
  .component('privateTrunkDestination', new PrivateTrunkDestinationComponent())
  .name;
