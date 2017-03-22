import { PrivateTrunkOverviewComponent } from './privateTrunkOverview.component';
import privateTrunkDomain from '../privateTrunkDomain';
export default angular
  .module('hercules.private-trunk-overview', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    privateTrunkDomain,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
