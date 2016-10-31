'use strict';

describe("controller: gemSPListCtrl", function () {
  var $q, $scope, $controller, controller, gemService;
  var spData = getJSONFixture('gemini/servicepartner.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
  }

  function initController() {
    gemService = {
      getSpData: sinon.stub().returns($q.resolve(spData.success))
    };
    controller = $controller("GemspListCtrl", {
      $scope: $scope,
      gemService: gemService
    });
    $scope.$apply();
  }

  describe('correct data', function () {
    it('should controller be defined', function () {
      expect(controller).toBeDefined();
    });

    it('should loading is false', function () {
      expect(controller.loading).toBe(false);
    });
  });
});
