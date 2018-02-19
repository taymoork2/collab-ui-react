import moduleName from './index';
import { AddUsersResultsModalController } from './add-users-results-modal.component';
import { CrAddUsersResultsComponent } from './cr-add-users-results/cr-add-users-results.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<AddUsersResultsModalController, {
  $previousState;
  $state;
  Analytics;
  OnboardService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    crAddUsersResults: atlas.test.IComponentSpy<CrAddUsersResultsComponent>;
  },
}>;

describe('Component: addUsersResultsModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      crAddUsersResults: this.spyOnComponent('crAddUsersResults'),
    };
    this.initModules(
      moduleName,
      this.components.multiStepModal,
      this.components.crAddUsersResults,
    );
    this.injectDependencies(
      '$previousState',
      '$scope',
      '$state',
      'Analytics',
      'OnboardService',
    );
    this.$scope.fakeConvertUsersFlow = false;
    this.$scope.fakeConvertPending = false;
    this.$scope.fakeNumAddedUsers = 0;
    this.$scope.fakeNumUpdatedUsers = 0;
    this.$scope.fakeResults = {
      resultList: [],
      errors: [],
      warnings: [],
    };
  });

  function initComponent(this: Test) {
    this.compileComponent('addUsersResultsModal', {
      convertPending: 'fakeConvertPending',
      convertUsersFlow: 'fakeConvertUsersFlow',
      numUpdatedUsers: 'fakeNumUpdatedUsers',
      numAddedUsers: 'fakeNumAddedUsers',
      results: 'fakeResults',
    });
  }

  describe('initial state:', () => {
    describe('convert flow:', () => {
      it('should have a title for converting users', function (this: Test) {
        this.$scope.fakeConvertUsersFlow = true;
        initComponent.call(this);
        expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('usersPage.convertUsers');
      });

      it('should have finish button if convert flow', function (this: Test) {
        this.$scope.fakeConvertUsersFlow = true;
        initComponent.call(this);
        expect(this.components.multiStepModal.bindings[0].customFinishL10nLabel).toBe('common.finish');
      });
    });

    describe('add users flow:', () => {
      it('should have a title for adding users', function (this: Test) {
        this.$scope.fakeConvertUsersFlow = false;
        initComponent.call(this);
        expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('usersPage.addUsers');
      });

      it('should have finish button if no errors', function (this: Test) {
        this.$scope.fakeConvertUsersFlow = false;
        this.$scope.fakeResults.errors = [];
        initComponent.call(this);
        expect(this.components.multiStepModal.bindings[0].customFinishL10nLabel).toBe('common.finish');
      });

      it('should have a skip errors and finish button if errors are present', function (this: Test) {
        this.$scope.fakeConvertUsersFlow = false;
        this.$scope.fakeResults.errors = ['fake-errorMsg-1'];
        initComponent.call(this);
        expect(this.components.multiStepModal.bindings[0].customFinishL10nLabel).toBe('usersPage.skipErrorsAndFinish');
      });
    });

    it('should have dismiss functionality', function (this: Test) {
      initComponent.call(this);
      spyOn(this.controller, 'dismissModal');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('dismissModal():', () => {
      it('should track the event', function (this: Test) {
        spyOn(this.Analytics, 'trackAddUsers');
        initComponent.call(this);
        this.controller.dismissModal();
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
      });
    });

    describe('goToUsersPage():', () => {
      it('should track the event and jump back to users list', function (this: Test) {
        spyOn(this.$previousState, 'forget');
        spyOn(this.OnboardService, 'createPropertiesForAnalytics').and.returnValue('fake-createPropertiesForAnalytics-result');
        spyOn(this.Analytics, 'trackAddUsers');
        spyOn(this.$state, 'go');
        this.$scope.fakeNumAddedUsers = 1;
        this.$scope.fakeNumUpdatedUsers = 2;
        this.$scope.fakeResults.errors = ['fake-errorMsg-1', 'fake-errorMsg-2', 'fake-errorMsg-3'];
        initComponent.call(this);
        this.controller.goToUsersPage();
        expect(this.$previousState.forget).toHaveBeenCalledWith('modalMemo');
        expect(this.OnboardService.createPropertiesForAnalytics).toHaveBeenCalledWith(2, 1, 3, {});
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.FINISH, null, 'fake-createPropertiesForAnalytics-result');
        expect(this.$state.go).toHaveBeenCalledWith('users.list');
      });
    });
  });
});
