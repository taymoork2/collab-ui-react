'use strict';

describe('Controller: OrganizationFeaturesCtrl', function () {
  var controller, $scope, $stateParams, $q, FeatureToggleService, Notification;
  var featureToggles = [{
    key: 'feature-toggle',
    val: true,
  }];

  var currentOrg = {
    id: 1,
  };

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$stateParams_, $rootScope, _FeatureToggleService_, _Notification_, _$q_, $controller) {
    $scope = $rootScope.$new();
    $stateParams = _$stateParams_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentOrganization = currentOrg;

    spyOn(Notification, 'error');
    spyOn(FeatureToggleService, 'getFeaturesForOrg').and.returnValue($q.reject());

    controller = $controller('OrganizationFeaturesCtrl', {
      $stateParams: $stateParams,
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      Notification: Notification,
    });
    $scope.$apply();
  }));

  it('should notify the user with an error when init is not successful', function () {
    expect(Notification.error).toHaveBeenCalled();
  });
});
