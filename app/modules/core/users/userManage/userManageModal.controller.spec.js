'use strict';

describe('UserManageModalPickerController', function () {
  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$scope', '$rootScope', '$controller', '$q', '$state', 'DirSyncService', 'FeatureToggleService');
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.$state, 'go');
    spyOn(this.DirSyncService, 'requiresRefresh').and.returnValue(false);
    spyOn(this.DirSyncService, 'refreshStatus').and.returnValue(this.$q.resolve());
    spyOn(this.FeatureToggleService, 'atlasF3745AutoAssignLicensesGetStatus').and.returnValue(this.$q.resolve(false));
  }

  function initController() {
    this.controller = this.$controller('UserManageModalPickerController', {
      $scope: this.$scope,
    });
    this.$scope.$apply();
    this.controller.onInit();
    this.$scope.$apply();
  }

  beforeEach(init);

  it('should transition to standard org state when DirSync not supported', function () {
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);

    initController.apply(this);
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.org');
  });

  it('should transition to advanced org state when DirSync is supported', function () {
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(true);

    initController.apply(this);
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.activedir');
  });
});
