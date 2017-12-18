import { HybridServicesSidepanelErrorMessageComponent } from './hybrid-services-sidepanel-error-message.component';

require('./_hybrid-services-sidepanel-error-message.scss');

export default angular
  .module('hercules.hybrid-services-sidepanel-error-message', [
    require('angular-translate'),
  ])
  .component('hybridServicesSidepanelErrorMessage', new HybridServicesSidepanelErrorMessageComponent())
  .name;
