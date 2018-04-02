import moduleName from './index';
import { CrConvertUsersModalController } from './cr-convert-users-modal.component';

type Test = atlas.test.IComponentTest<CrConvertUsersModalController, {
  $scope;
  $state;
  $timeout;
  Analytics;
  Authinfo;
  AutoAssignTemplateModel;
  DirSyncService;
  OnboardStore;
  Orgservice;
}, {}>;

describe('Component: crConvertUsersModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      '$state',
      '$timeout',
      'Analytics',
      'Authinfo',
      'AutoAssignTemplateModel',
      'DirSyncService',
      'OnboardStore',
      'Orgservice',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
  });


  function initFakeGridApi() {
    const fakeGridApi = {};
    _.set(fakeGridApi, 'core.handleWindowResize', _.noop);
    _.set(fakeGridApi, 'saveState.save', _.noop);
    _.set(fakeGridApi, 'selection.getSelectedRows', _.noop);
    this.controller.convertGridOptions.onRegisterApi(fakeGridApi);
    this.$scope.$apply();
  }

  describe('primary behaviors (controller):', () => {
    describe('get convertUsersReadOnly():', () => {
      it('should return true if either read-only binding or "DirSyncService.isDirSyncEnabled()" is true, false otherwise', function (this: Test) {
        // false + false => false
        spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
        this.$scope.fakeReadOnly = false;
        this.compileComponent('crConvertUsersModal', { readOnly: 'fakeReadOnly' });
        expect(this.controller.convertUsersReadOnly).toBe(false);

        // true + false => true
        this.$scope.fakeReadOnly = true;
        this.compileComponent('crConvertUsersModal', { readOnly: 'fakeReadOnly' });
        expect(this.controller.convertUsersReadOnly).toBe(true);

        // false + true => true
        this.$scope.fakeReadOnly = false;
        this.DirSyncService.isDirSyncEnabled.and.returnValue(true);
        this.compileComponent('crConvertUsersModal', { readOnly: 'fakeReadOnly' });
        expect(this.controller.convertUsersReadOnly).toBe(true);
      });
    });

    describe('getUnlicensedUsers():', () => {
      it('should call "Orgservice.getUnlicensedUsers()" and update "unlicensed" and "showSearch" properties', function (this: Test) {
        // success response
        spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
          callback({
            success: true,
            totalResults: 1,
          });
        });
        this.compileComponent('crConvertUsersModal', {});
        this.controller.getUnlicensedUsers();
        this.$scope.$apply();
        expect(this.Orgservice.getUnlicensedUsers).toHaveBeenCalled();
        expect(this.controller.showSearch).toBe(true);
        expect(this.controller.unlicensed).toBe(1);

        // failure response
        this.Orgservice.getUnlicensedUsers.and.callFake(function (callback) {
          callback({
            success: false,
          });
        });
        this.controller.getUnlicensedUsers();
        this.$scope.$apply();
        expect(this.Orgservice.getUnlicensedUsers).toHaveBeenCalled();
        expect(this.controller.showSearch).toBe(true);
        expect(this.controller.unlicensed).toBe(0);

        // simulate callback not fired
        this.Orgservice.getUnlicensedUsers.and.callFake(_.noop);
        this.controller.getUnlicensedUsers();
        this.$scope.$apply();
        expect(this.Orgservice.getUnlicensedUsers).toHaveBeenCalled();
        expect(this.controller.showSearch).toBe(false);
      });
    });

    describe('filterList():', () => {
      beforeEach(function () {
        spyOn(this.Analytics, 'trackUserOnboarding');
        this.compileComponent('crConvertUsersModal', {});
        spyOn(this.controller, 'getUnlicensedUsers');
      });

      it('should set internal search string from argument if at least chars long or empty string', function (this: Test) {
        this.controller.filterList('');
        this.$timeout.flush(1000);
        expect(this.controller.scopeData.searchStr).toBe('');

        this.controller.filterList('foo');
        this.$timeout.flush(1000);
        expect(this.controller.scopeData.searchStr).toBe('foo');

        this.controller.filterList('fo');
        this.$timeout.flush(1000);
        expect(this.controller.scopeData.searchStr).toBe('foo');
      });

      it('should call "getUnlicensedUsers()" and "Analytics.trackUserOnboarding()" after a 1 sec. delay', function (this: Test) {
        _.set(this.$state, 'current.name', 'fake-state-current-name');
        this.controller.filterList('foo');
        this.$timeout.flush(1000);
        expect(this.controller.getUnlicensedUsers).toHaveBeenCalled();
        expect(this.Analytics.trackUserOnboarding).toHaveBeenCalledWith(
          this.Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER,
          'fake-state-current-name',
          'fake-org-id',
        );
      });

      it('should set "timer" property to save the timeout promise, and reset it for each subsequent call', function (this: Test) {
        expect(this.controller.timer).not.toBeDefined();
        this.controller.filterList('foo');  // 1 sec. delay, internal search string sets to "foo"
        expect(this.controller.timer).toBeDefined();
        this.$timeout.flush(999);
        this.controller.filterList('foobar');  // new call resets the delay, internal search will now set to "foobar" in 1 sec.
        this.$timeout.flush(1);
        expect(this.controller.scopeData.searchStr).toBe('');
        this.$timeout.flush(999);
        expect(this.controller.scopeData.searchStr).toBe('foobar');
      });
    });

    describe('saveConvertList():', () => {
      beforeEach(function () {
        spyOn(this.$state, 'go');
        spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
          callback({
            success: true,
            totalResults: 1,
            resources: [{
              id: 'fake-user-id-1',
            }],
          });
        });
        this.compileComponent('crConvertUsersModal', {});
        initFakeGridApi.call(this);
      });

      it('should always set "scopeData.convertUsersFlow" to true', function (this: Test) {
        this.controller.saveConvertList();
        expect(this.controller.scopeData.convertUsersFlow).toBe(true);
      });

      it('should set "scopeData.*" properties from respective "gridApi.*" methods', function (this: Test) {
        spyOn(this.controller.gridApi.saveState, 'save').and.returnValue('fake-save-state-data');
        spyOn(this.controller.gridApi.selection, 'getSelectedRows').and.returnValue(['fake-getSelectedRows-data']);
        this.controller.saveConvertList();
        expect(this.controller.scopeData.selectedState).toBe('fake-save-state-data');
        expect(this.controller.scopeData.convertSelectedList).toEqual(['fake-getSelectedRows-data']);
      });

      it('should go to either "users.convert.auto-assign-license-summary" or "users.convert.services" states depending on "AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated"', function (this: Test) {
        this.controller.saveConvertList();
        expect(this.$state.go).toHaveBeenCalledWith('users.convert.services', {});

        this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true;
        this.controller.saveConvertList();
        expect(this.$state.go).toHaveBeenCalledWith('users.convert.auto-assign-license-summary');
      });
    });

    describe('convertDisabled():', () => {
      it('should return true if "DirSyncService.isDirSyncEnabled()" is true', function (this: Test) {
        spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(true);
        this.compileComponent('crConvertUsersModal', {});
        expect(this.controller.convertDisabled()).toBe(true);
      });

      it('should return true if "gridApi" property does not yet exist', function (this: Test) {
        this.compileComponent('crConvertUsersModal', {});
        expect(this.controller.gridApi).not.toBeDefined();
        expect(this.controller.convertDisabled()).toBe(true);
      });

      it('should return true if "gridApi" has no selected rows', function (this: Test) {
        this.compileComponent('crConvertUsersModal', {});
        initFakeGridApi.call(this);
        spyOn(this.controller.gridApi.selection, 'getSelectedRows').and.returnValue([]);
        expect(this.controller.convertDisabled()).toBe(true);
      });

      it('should return false if "DirSyncService.isDirSyncEnabled()" is false, and "gridApi" has selected rows', function (this: Test) {
        spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
        this.compileComponent('crConvertUsersModal', {});
        initFakeGridApi.call(this);
        spyOn(this.controller.gridApi.selection, 'getSelectedRows').and.returnValue(['fake-selected-row-data']);
        expect(this.controller.convertDisabled()).toBe(false);
      });
    });
  });
});
