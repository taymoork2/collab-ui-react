'use strict';

describe('DeactivateServiceModalView', function () {
  beforeEach(module('Hercules'));
  var $scope;
  var view;
  var html;

  beforeEach(inject(function ($rootScope, $templateCache, $compile) {
    $scope = $rootScope.$new();
    html = $templateCache.get("modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html");
    view = $compile(angular.element(html))($scope);
    $scope.$apply();
  }));

  it('should call deactivateService() when Confirm is clicked', function () {

    $scope.deactivateServiceOnExpresswayModal = {
      deactivateService: sinon.stub()
    };

    view.find("#confirm").click();
    expect($scope.deactivateServiceOnExpresswayModal.deactivateService.callCount).toBe(1);

  });
});
