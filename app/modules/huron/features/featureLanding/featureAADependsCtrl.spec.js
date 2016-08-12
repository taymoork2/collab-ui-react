'use strict';

describe('Controller: HuronFeatureAADependsCtrl', function () {
  var createController;
  var $rootScope, $scope, $stateParams;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    $stateParams = {
      detailsFeatureName: "AA for example",
      detailsDependsList: 'AA depend one, AA depend two'
    };

    createController = function () {
      return $controller('HuronFeatureAADependsCtrl', {
        $rootScope: $rootScope,
        $scope: $scope,
        $stateParams: $stateParams
      });
    };

  }));

  it('should create AADependsCtrl', function () {
    var controller = createController();

    expect(controller.featureName).toEqual($stateParams.detailsFeatureName);
    expect(controller.dependsNames).toEqual($stateParams.detailsDependsList);

  });
});
