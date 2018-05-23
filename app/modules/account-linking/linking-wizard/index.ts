import { AccountLinkingWizardComponent } from './account-linking-wizard.component';
import accountLinkingWizardStatesModule from './states';
import metricsModule from 'modules/core/metrics';

export default angular
  .module('account-linking.wizard', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    accountLinkingWizardStatesModule,
    metricsModule,
  ])
  .component('accountLinkingWizard', new AccountLinkingWizardComponent())
  .name;
