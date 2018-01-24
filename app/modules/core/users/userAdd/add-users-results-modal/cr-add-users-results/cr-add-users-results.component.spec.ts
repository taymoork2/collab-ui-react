import moduleName from './index';
import { CrAddUsersResultsController } from './cr-add-users-results.component';

type Test = atlas.test.IComponentTest<CrAddUsersResultsController, {
  $state;
  Analytics;
  OnboardService;
}, {}>;

describe('Component: crAddUsersResults:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      '$state',
      'Analytics',
      'OnboardService',
    );

    this.$scope.fakeNumAddedUsers = 0;
    this.$scope.fakeNumUpdatedUsers = 0;
    this.$scope.fakeResults = {
      resultList: [],
      errors: [],
      warnings: [],
    };
  });

  function initComponent() {
    this.compileComponent('crAddUsersResults', {
      numAddedUsers: 'fakeNumAddedUsers',
      numUpdatedUsers: 'fakeNumUpdatedUsers',
      results: 'fakeResults',
    });
  }

  describe('primary behaviors (view):', () => {
    it('should render a success icon if no errors are present', function (this: Test) {
      initComponent.call(this);
      expect(this.view.find('.users-upload-results > i.icon-check-mark-success').length).toBe(1);

      // add a fake error message, icon should no longer render
      this.$scope.fakeResults.errors.push('fake-errorMsg-1');
      initComponent.call(this);
      expect(this.view.find('.users-upload-results > i.icon-check-mark-success').length).toBe(0);
    });

    it('should render number of users added, updated, and found in error from onboarding', function (this: Test) {
      this.$scope.fakeNumAddedUsers = 1;
      this.$scope.fakeNumUpdatedUsers = 2;
      this.$scope.fakeResults.errors = ['fake-errorMsg-1', 'fake-errorMsg-2', 'fake-errorMsg-3'];
      initComponent.call(this);
      expect(this.view.find('.result.new-users > .total')).toContainText('1');
      expect(this.view.find('.result.updated-users > .total')).toContainText('2');
      expect(this.view.find('.result.error-users > .total')).toContainText('3');
    });

    it('should render a link to go back and fix users if any errors are present', function (this: Test) {
      this.$scope.fakeResults.errors = ['fake-errorMsg-1'];
      initComponent.call(this);
      expect(this.view.find('.result.error-users .action-link a[translate="firstTimeWizard.fixBulkErrors"]')).toExist();
    });

    it('should render number of users processed in total from onboarding', function (this: Test) {
      this.$scope.fakeResults.resultList = ['fake-onboardedUserResult-1', 'fake-onboardedUserResult-2'];
      initComponent.call(this);
      expect(this.view.find('.results-total')).toContainText('2');

      this.$scope.fakeResults.resultList.push('fake-onboardedUserResult-3');
      initComponent.call(this);
      expect(this.view.find('.results-total')).toContainText('3');
    });

    it('should should render each warning and error message present', function (this: Test) {
      this.$scope.fakeResults.warnings = ['fake-warningMsg-1', 'fake-warningMsg-2'];
      this.$scope.fakeResults.errors = ['fake-errorMsg-1', 'fake-errorMsg-2', 'fake-errorMsg-3'];
      initComponent.call(this);
      expect(this.view.find('.error-table tr[ng-repeat="msg in $ctrl.results.warnings"] > td').length).toBe(2);
      expect(this.view.find('.error-table tr[ng-repeat="msg in $ctrl.results.errors"] > td').length).toBe(3);
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('fixBulkErrors():', () => {
      it('should track the event and jump back to manually adding users step', function (this: Test) {
        spyOn(this.OnboardService, 'createPropertiesForAnalytics').and.returnValue('fake-createPropertiesForAnalytics-result');
        spyOn(this.Analytics, 'trackAddUsers');
        spyOn(this.$state, 'go');
        this.$scope.fakeNumAddedUsers = 1;
        this.$scope.fakeNumUpdatedUsers = 2;
        this.$scope.fakeResults.errors = ['fake-errorMsg-1', 'fake-errorMsg-2', 'fake-errorMsg-3'];
        initComponent.call(this);
        this.controller.fixBulkErrors();
        expect(this.OnboardService.createPropertiesForAnalytics).toHaveBeenCalledWith(2, 1, 3);
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, 'fake-createPropertiesForAnalytics-result');
        expect(this.$state.go).toHaveBeenCalledWith('users.add.manual');
      });
    });
  });
});
