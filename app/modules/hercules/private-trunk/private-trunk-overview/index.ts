import { PrivateTrunkOverviewComponent } from './private-trunk-overview.component';

export default angular
  .module('hercules.private-trunk-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
