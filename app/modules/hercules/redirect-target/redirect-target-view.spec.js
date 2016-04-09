'use strict';

describe('RedirectTargetView', function () {
  beforeEach(module('Hercules'));
  var $scope;
  var view;

  beforeEach(inject(function ($rootScope, $templateCache, $compile, $httpBackend) {
    $scope = $rootScope.$new();
    var html = $templateCache.get("modules/hercules/redirect-target/redirect-target-dialog.html");
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }));

  it('should open a new window with correct target when register resource clicked', function () {
    $scope.redirectTarget = {
      redirectToTargetAndCloseWindowClicked: sinon.stub(),
      hostName: "yolo"
    };

    view.find(".register-button").click();
    expect($scope.redirectTarget.redirectToTargetAndCloseWindowClicked.callCount).toBe(1);
    expect($scope.redirectTarget.redirectToTargetAndCloseWindowClicked.args[0][0]).toBe("yolo");

  });
});
