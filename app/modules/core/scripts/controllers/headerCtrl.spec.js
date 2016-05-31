describe('Controller: HeaderCtrl', function () {
  var $scope, $controller, $q;
  var controller, FeatureToggleService, Utils;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  function dependencies($rootScope, _$controller_, _$q_, _FeatureToggleService_, _Utils_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    FeatureToggleService = _FeatureToggleService_;
    Utils = _Utils_;
  }

  function initSpies() {
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when());
    spyOn(Utils, 'isAdminPage');
  }

  function initController() {
    controller = $controller('HeaderCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  describe('Admin Page', function () {
    beforeEach(setAdminPageSpy(true));
    beforeEach(initController);

    it('should call feature toggle service', function () {
      expect(FeatureToggleService.supports).toHaveBeenCalled();
    });
  });

  describe('Non-Admin Page', function () {
    beforeEach(setAdminPageSpy(false));
    beforeEach(initController);

    it('should not call feature toggle service', function () {
      expect(FeatureToggleService.supports).not.toHaveBeenCalled();
    });
  });

  function setAdminPageSpy(isAdminPage) {
    return function () {
      Utils.isAdminPage.and.returnValue(isAdminPage);
    };
  }
});
