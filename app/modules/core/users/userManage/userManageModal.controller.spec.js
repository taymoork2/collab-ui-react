'use strict';

describe('UserManageModalController', function () {

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$scope', '$rootScope', '$controller', '$q', 'FeatureToggleService', '$state');
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.$state, 'go');
  }

  function initController() {
    this.controller = this.$controller('UserManageModalController', {
      $scope: this.$scope
    });
    this.$scope.$apply();
  }

  beforeEach(init);

  it('should transition to standard org state when DirSync not supported', function () {
    spyOn(this.FeatureToggleService, 'supportsDirSync').and.returnValue(this.$q.when(false));

    initController.apply(this);

    expect(this.controller.isDirSyncEnabled).toBeFalsy();
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.org');
  });

  it('should transition to advanced org state when DirSync is supported', function () {
    spyOn(this.FeatureToggleService, 'supportsDirSync').and.returnValue(this.$q.when(true));

    initController.apply(this);

    expect(this.controller.isDirSyncEnabled).toBeTruthy();
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.activedir');
  });

});
