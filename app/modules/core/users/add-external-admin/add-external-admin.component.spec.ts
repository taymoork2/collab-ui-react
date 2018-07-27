import moduleName from './index';
import { AddExternalAdminController } from './add-external-admin.component';

type Test = atlas.test.IComponentTest<AddExternalAdminController, {
  $q,
  $rootScope,
  $scope,
  $timeout,
  Notification,
  Userservice,
}, {}>;

describe('Component: addExternalAdmin:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName, 'Core');
    this.injectDependencies(
      '$q',
      '$rootScope',
      '$scope',
      '$timeout',
      'Notification',
      'Userservice',
    );
  });

  beforeEach(function (this: Test) {
    this.compileComponent('addExternalAdmin', {});

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$rootScope, '$broadcast');
  });

  describe('primary behaviors (controller):', () => {
    it('should display Success after admin is successfully added', function (this: Test) {
      spyOn(this.Userservice, 'addExternalAdmin').and.returnValue(this.$q.resolve({
        uuid: '12345',
        managedOrgs: {
          orgId: '98765',
          roles: ['Full_Admin'],
        }}));

      this.controller.handleAdd();
      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.Notification.success).toHaveBeenCalledWith('usersPage.addExternalAdminSuccess', {});
      expect(this.$rootScope.$broadcast).toHaveBeenCalledWith('USER_LIST_UPDATED');
      expect(this.controller.loading).toBe(false);
    });

    it('should display Error if API threw an exception', function (this: Test) {
      spyOn(this.Userservice, 'addExternalAdmin').and.returnValue(this.$q.reject());

      this.controller.handleAdd();
      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.Notification.errorResponse).toHaveBeenCalled();
      expect(this.$rootScope.$broadcast).not.toHaveBeenCalled();
      expect(this.controller.loading).toBe(false);
    });
  });
});
