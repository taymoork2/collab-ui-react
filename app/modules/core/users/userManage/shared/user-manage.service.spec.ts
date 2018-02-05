import moduleName, { UserManageService } from './index';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template';

import { ManageType } from './user-manage.keys';

type Test = atlas.test.IServiceTest<{
  $state: ng.ui.IStateService,
  Analytics,
  AutoAssignTemplateModel: AutoAssignTemplateModel,
  FeatureToggleService,
  UserManageService: UserManageService,
}>;

describe('Service: UserManageService', () => {
  beforeEach(function(this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
      'Analytics',
      'AutoAssignTemplateModel',
      'FeatureToggleService',
      'UserManageService',
    );

    spyOn(this.FeatureToggleService, 'atlasEmailSuppressGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.$state, 'go');
    spyOn(this.Analytics, 'trackAddUsers');
  });

  describe('gotoNextStateForManageType():', () => {
    it('should get redirected to email suppress state', function (this: Test) {
      this.UserManageService.gotoNextStateForManageType(ManageType.MANUAL);
      this.$scope.$apply();

      expect(this.$state.go).toHaveBeenCalledWith('users.manage.emailSuppress', {
        manageType: 'manual',
        prevState: 'users.manage.picker',
      });
    });

    it('should go to the requested state if can skip email suppress', function (this: Test) {
      this.UserManageService.gotoNextStateForManageType(ManageType.AUTO_ASSIGN_TEMPLATE);
      this.$scope.$apply();

      expect(this.$state.go).toHaveBeenCalledWith('users.manage.edit-auto-assign-template-modal', {
        prevState: 'users.manage.picker',
      });
    });
  });

  describe('gotoNextStateForManageTypeAfterEmailSuppress():', () => {
    it('should go to users.add', function (this: Test) {
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.MANUAL);
      expect(this.$state.go).toHaveBeenCalledWith('users.add.manual', {
        resetOnboardStoreStates: 'all',
      });
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
    });

    it('should go to users.csv', function (this: Test) {
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.BULK);
      expect(this.$state.go).toHaveBeenCalledWith('users.csv');
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, this.Analytics.sections.ADD_USERS.uploadMethods.CSV);
    });

    it('should go to users.manage.dir-sync.add.ob.syncStatus', function (this: Test) {
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.ADVANCED_DS);
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.dir-sync.add.ob.syncStatus');
    });

    it('should go to users.manage.dir-sync.add.ob.installConnector', function (this: Test) {
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.ADVANCED_NO_DS);
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.dir-sync.add.ob.installConnector');
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, this.Analytics.sections.ADD_USERS.uploadMethods.SYNC);
    });

    it('should go to users.manage.dir-sync.add.ob.autoAssignLicenseSummary if AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated is true', function (this: Test) {
      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true;

      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.ADVANCED_NO_DS);
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.dir-sync.add.ob.autoAssignLicenseSummary');
    });

    it('should go to users.convert', function (this: Test) {
      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = false;
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.CONVERT);
      expect(this.$state.go).toHaveBeenCalledWith('users.convert', {
        manageUsers: true,
        isDefaultAutoAssignTemplateActivated: false,
      });

      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true;
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.CONVERT);
      expect(this.$state.go).toHaveBeenCalledWith('users.convert', {
        manageUsers: true,
        isDefaultAutoAssignTemplateActivated: true,
      });

      expect(this.Analytics.trackAddUsers).not.toHaveBeenCalled();
    });

    it('should go to users.manage.edit-auto-assign-template-modal', function (this: Test) {
      this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(ManageType.AUTO_ASSIGN_TEMPLATE);
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.edit-auto-assign-template-modal', {
        prevState: 'users.manage.picker',
      });
    });
  });
});
