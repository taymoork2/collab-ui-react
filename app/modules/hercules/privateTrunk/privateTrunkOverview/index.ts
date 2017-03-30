import { PrivateTrunkOverviewComponent } from './privateTrunkOverview.component';
import privateTrunkPrereq from 'modules/hercules/privateTrunk/privateTrunkPrereq';

export default angular
  .module('hercules.private-trunk-overview', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    privateTrunkPrereq,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
