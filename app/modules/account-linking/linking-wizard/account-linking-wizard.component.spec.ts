import accountLinkingWizard from './index';
import { LinkingOperation, IACSiteInfo, IACWebexPromises, IACLinkingStatus } from './../account-linking.interface';
import { WizardState } from './account-linking-wizard.component';

describe('Component: accountLinkingWizardComponent', () => {

  const operation: LinkingOperation = LinkingOperation.New;
  const siteInfo: IACSiteInfo = {
    linkedSiteUrl: 'xyz.webex.com',
    linkingStatus: <IACLinkingStatus>{},
    webexInfo: <IACWebexPromises> {
      ciAccountSyncPromise: {},
      domainsPromise: {},
      siteInfoPromise: {},
    },
  };

  beforeEach(function () {
    this.initModules(accountLinkingWizard);
    this.injectDependencies(
      '$log',
      '$componentController',
      '$state',
    );
  });

  describe('controller', () => {

    beforeEach(function () {
      this.controller = this.$componentController('accountLinkingWizard', {
        $state: this.$state,
      }, {
        siteInfo: siteInfo,
        operation: operation,
      });
    });
    it('Go from entry to next and back', function() {
      this.controller.$onInit();
      expect(this.controller.fsmState).toEqual(WizardState.entry);
      expect(this.controller.siteInfo).toEqual(siteInfo);
      expect(this.controller.operation).toEqual(operation);
      this.controller.next('verify');
      expect(this.controller.fsmState).toEqual(WizardState.verify);
      this.controller.back();
      expect(this.controller.fsmState).toEqual(WizardState.entry);
    });

  });


  describe('view', () => {

    it('Entry page contains contains two button selections for next state', function() {

      this.compileComponent('accountLinkingWizard', {
        siteInfo: siteInfo,
        operation: operation,
      });

      expect(this.view).toContainElement('button#accountLinkingReceiveEmailButton');
      expect(this.view).toContainElement('button#accountLinkingVerifyButton');
      expect(this.view.find('button#accountLinkingReceiveEmailButton')).not.toBeDisabled();
      expect(this.view.find('button#accountLinkingVerifyButton')).not.toBeDisabled();

      this.view.find('button#accountLinkingVerifyButton').click().trigger('click');
      this.$scope.$digest();

      expect(this.view).toContainElement('button#accountLinkingVerifyNextButton');

      expect(this.view.find('button#accountLinkingVerifyNextButton')).toBeDisabled();

    });
  });
});
