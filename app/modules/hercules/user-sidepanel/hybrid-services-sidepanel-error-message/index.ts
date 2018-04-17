import { HybridServicesSidepanelMessageComponent } from './hybrid-services-sidepanel-message.component';

require('./_hybrid-services-sidepanel-message.scss');

export default angular
  .module('hercules.hybrid-services-sidepanel-message', [
    require('angular-translate'),
  ])
  .component('hybridServicesSidepanelMessage', new HybridServicesSidepanelMessageComponent())
  .name;
