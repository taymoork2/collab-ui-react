import accountLinkingWizardModule from './index';
import { LinkingOperation, IACSiteInfo } from './../account-linking.interface';
import { WizardState } from './account-linking-wizard-fsm';

describe('Component: accountLinkingWizard ', () => {

  let $componentController: ng.IComponentControllerService;
  let $state: ng.ui.IStateService;
  let ctrl;

  const siteInfo: IACSiteInfo = {
    linkedSiteUrl: 'xyz.webex.com',
    accountLinkingStatus: 'unknown',
    usersLinked: 0,
  };

  const operation: LinkingOperation = LinkingOperation.New;


  beforeEach(angular.mock.module(accountLinkingWizardModule));
  // beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject((_$componentController_, _$state_) => {
    $componentController = _$componentController_;
    $state = _$state_;
  }));

  function initController(): ng.IComponentControllerService {
    return $componentController('accountLinkingWizardComponent', { $stateParams: { siteInfo, operation } }, {});
  }

  it('Opens in entry state', function() {
    ctrl = initController();
    ctrl.$onInit();
    expect(ctrl.fsmState).toEqual({ id: WizardState.entry, initial: true, final: false });
    expect(ctrl.siteInfo).toEqual(siteInfo);
    expect(ctrl.operation).toEqual(operation);
  });

  it('Handles transitions by selecting manual mode and back', function() {
    ctrl = initController();
    ctrl.$onInit();
    ctrl.next('manual');
    expect(ctrl.fsmState).toEqual({ id: WizardState.manualSelected, initial: false, final: true });
    ctrl.back();
    expect(ctrl.fsmState).toEqual({ id: WizardState.entry, initial: true, final: false });
  });

  it('Entry page contains mode inputs and next button', function() {
    ctrl = initController();
    ctrl.$onInit();
    this.compileComponent('accountLinkingWizardComponent');
    expect(this.view).toContainElement('input#autoAgreement');
    expect(this.view).toContainElement('input#autoVerifyDomain');
    expect(this.view).toContainElement('input#manual');
    expect(this.view).toContainElement('button#al-wizard-next');
    expect(this.view.find('button#al-wizard-next')).toBeDisabled();
    this.view.find('input#autoAgreement').click().trigger('click');
    expect(this.view.find('button#al-wizard-next')).not.toBeDisabled();
  });

});
