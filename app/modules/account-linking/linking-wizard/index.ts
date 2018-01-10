import { AccountLinkingWizardComponent } from './account-linking-wizard.component';
import './account-linking-wizard.scss';

export default angular
  .module('account-linking.wizard', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('accountLinkingWizardComponent', new AccountLinkingWizardComponent())
  .name;
