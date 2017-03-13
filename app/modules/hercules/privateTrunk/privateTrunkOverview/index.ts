import { PrivateTrunkOverviewComponent } from './privateTrunkOverview.component';

export default angular
  .module('hercules.private-trunk-overview', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
