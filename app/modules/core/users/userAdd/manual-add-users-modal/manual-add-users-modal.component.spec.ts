import moduleName from './index';
import { ManualAddUsersModalController } from './manual-add-users-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { CrOnboardUsersComponent } from './cr-onboard-users/cr-onboard-users.component';

type Test = atlas.test.IComponentTest<ManualAddUsersModalController, {
  $state;
  Analytics;
  AutoAssignTemplateModel;
  AutoAssignTemplateService;
  OnboardService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    crOnboardUsers: atlas.test.IComponentSpy<CrOnboardUsersComponent>;
  },
}>;

describe('Component: manualAddUsersModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      crOnboardUsers: this.spyOnComponent('crOnboardUsers'),
    };
    this.initModules(
      moduleName,
      this.components.multiStepModal,
      this.components.crOnboardUsers,
    );
    this.injectDependencies(
      '$q',
      '$state',
      'Analytics',
      'AutoAssignTemplateModel',
      'AutoAssignTemplateService',
      'OnboardService',
    );

    spyOn(this.AutoAssignTemplateService, 'getDefaultTemplate').and.returnValue(this.$q.resolve());
    spyOn(this.AutoAssignTemplateService, 'isEnabledForOrg').and.returnValue(this.$q.resolve());
    spyOn(this.AutoAssignTemplateService, 'getSortedSubscriptions').and.returnValue(this.$q.resolve());
  });

  function initComponent(this: Test) {
    this.compileComponent('manualAddUsersModal', {});
  }

  describe('initial state:', () => {
    beforeEach(initComponent);
    it('should have title and dismiss functionality', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('usersPage.manageUsers');

      spyOn(this.controller, 'dismissModal');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });

    it('should have stateData if a default auto-assign template exists, the org is enabled for it, and subscriptions exist', function (this: Test) {
      expect(this.controller.stateData).toBe(undefined);
      expect(this.controller.useDefaultAutoAssignTemplate).toBe(false);

      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true;
      this.AutoAssignTemplateService.getDefaultTemplate.and.returnValue(this.$q.resolve('fake-getDefaultTemplate-result'));
      this.AutoAssignTemplateService.getSortedSubscriptions.and.returnValue(this.$q.resolve('fake-getSortedSubscriptions-result'));
      spyOn(this.AutoAssignTemplateService, 'toStateData').and.returnValue('fake-toStateData-result');
      initComponent.call(this);

      expect(this.AutoAssignTemplateService.toStateData).toHaveBeenCalledWith('fake-getDefaultTemplate-result', 'fake-getSortedSubscriptions-result');
      expect(this.controller.stateData).toBe('fake-toStateData-result');
      expect(this.controller.useDefaultAutoAssignTemplate).toBe(true);
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('back():', () => {
      beforeEach(function (this: Test) {
        spyOn(this.Analytics, 'trackAddUsers');
        spyOn(this.$state, 'go');
      });
      beforeEach(initComponent);

      it('should transition to the previous state by default', function (this: Test) {
        this.controller.back();
        expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
      });

      it('should transition specified state if one was provided', function (this: Test) {
        this.controller.back('fake-state');
        expect(this.$state.go).toHaveBeenCalledWith('fake-state');
      });

      it('should track the "Back" action', function (this: Test) {
        this.controller.back();
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith('Back', 'manual', {
          emailEntryMethod: 'emailOnly',
        });
      });
    });

    describe('validateTokensBtn():', () => {
      // TODO (mipark2): implement unit-test after cleaning up unneeded logic
    });

    describe('allowNext():', () => {
      beforeEach(initComponent);
      it('should return true if user list is non-empty and no errors are present', function () {
        spyOn(this.controller, 'hasErrors').and.returnValue(false);
        this.controller.model.userList = [{}];
        expect(this.controller.allowNext()).toBe(true);

        // empty-list of users
        this.controller.model.userList = [];
        expect(this.controller.allowNext()).toBe(false);

        // errors are present
        this.controller.model.userList = [{}];
        this.controller.hasErrors.and.returnValue(true);
        expect(this.controller.allowNext()).toBe(false);
      });
    });

    describe('hasErrors():', () => {
      beforeEach(initComponent);
      it('should return value from call to "OnboardService.hasErrors()"', function () {
        spyOn(this.OnboardService, 'hasErrors').and.returnValue(true);
        expect(this.controller.hasErrors()).toBe(true);

        this.OnboardService.hasErrors.and.returnValue(false);
        expect(this.controller.hasErrors()).toBe(false);
      });
    });
  });
});
