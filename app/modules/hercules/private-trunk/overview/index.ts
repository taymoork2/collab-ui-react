import { PrivateTrunkOverviewComponent } from './private-trunk-overview.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';

export default angular
  .module('hercules.private-trunk-overview', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    privateTrunkPrereq,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
