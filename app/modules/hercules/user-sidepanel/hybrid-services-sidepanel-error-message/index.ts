import { HybridServicesSidepanelErrorMessageComponent } from './hybrid-services-sidepanel-error-message.component';

export default angular
  .module('hercules.hybrid-services-sidepanel-error-message', [
    require('angular-translate'),
  ])
  .component('hybridServicesSidepanelErrorMessage', new HybridServicesSidepanelErrorMessageComponent())
  .name;
