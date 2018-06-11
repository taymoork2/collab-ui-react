import { PrivateTrunkOverviewComponent } from './private-trunk-overview.component';
import privateTrunkSetup from  'modules/hercules/private-trunk/private-trunk-setup/';

export default angular
  .module('hercules.private-trunk-overview', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkSetup,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
