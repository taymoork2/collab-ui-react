import { AccountLinkingWizardEntryComponent } from './account-linking-wizard-entry.component';
import { AccountLinkingWizardVerifyComponent } from './account-linking-wizard-verify.component';
import { AccountLinkingWizardFetchingdomainsComponent } from './account-linking-wizard-fetchingdomains.component';
import { AccountLinkingWizardDomainslistComponent } from './account-linking-wizard-domainslist.component';
import { AccountLinkingWizardShowagreementComponent } from './account-linking-wizard-showagreement.component';
import { AccountLinkingWizardAgreementacceptedComponent } from './account-linking-wizard-agreementaccepted.component';
import { AccountLinkingWizardVerifydomainComponent } from './account-linking-wizard-verifydomain.component';
import { AccountLinkingWizardReceiveemailComponent } from './account-linking-wizard-receiveemail.component';

export default angular
  .module('account-linking.wizard-states', [
    require('angular-translate'),
  ])
  .component('accountLinkingWizardEntry', new AccountLinkingWizardEntryComponent())
  .component('accountLinkingWizardVerify', new AccountLinkingWizardVerifyComponent())
  .component('accountLinkingWizardFetchingdomains', new AccountLinkingWizardFetchingdomainsComponent())
  .component('accountLinkingWizardDomainslist', new AccountLinkingWizardDomainslistComponent())
  .component('accountLinkingWizardShowagreement', new AccountLinkingWizardShowagreementComponent())
  .component('accountLinkingWizardAgreementaccepted', new AccountLinkingWizardAgreementacceptedComponent())
  .component('accountLinkingWizardVerifydomain', new AccountLinkingWizardVerifydomainComponent())
  .component('accountLinkingWizardReceiveemail', new AccountLinkingWizardReceiveemailComponent())

  .name;
