'use strict';

fdescribe('Controller: FusionResourceSettingsController', function () {
  var controller, $scope, $controller, $q, FusionClusterService;

  beforeEach(module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies($rootScope, _$controller_, _$q_, _FusionClusterService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    FusionClusterService = _FusionClusterService_;
  }

  function initController(FusionClusterService) {
    var $stateParamsMock = {
      clusterid: 123
    };
    controller = $controller('FusionResourceSettingsController', {
      $scope: $scope,
      FusionClusterService: FusionClusterService,
      $stateParams: $stateParamsMock
    });
    $scope.$apply();
  }

  describe('init', function () {
    it('should do something', function () {
      FusionClusterService.getAll = sinon.stub().returns($q.when(
        []
      ));

      initController(FusionClusterService);

      expect(controller.cluster).toBeUndefined();
    });
  });
});
