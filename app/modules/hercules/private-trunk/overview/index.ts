import { PrivateTrunkOverviewComponent } from './private-trunk-overview.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';

export default angular
  .module('hercules.private-trunk-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
    privateTrunkPrereq,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
