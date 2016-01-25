'use strict';

fdescribe('RedirectTargetView', function () {
  beforeEach(module('wx2AdminWebClientApp'));
  var $scope;
  var view;

  beforeEach(inject(function ($rootScope, $templateCache, $compile, $httpBackend) {
    $httpBackend.whenGET('l10n/en_US.json').respond({});
    $scope = $rootScope.$new();
    var html = $templateCache.get("modules/hercules/redirect-target/redirect-target-dialog.html");
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }));

  it('yolo', function () {
    $scope.redirectTarget = {
      addRedirectTargetClicked: sinon.stub(),
      hostName: "yolo"
    };
    view.find(".register-button").click();
    expect($scope.redirectTarget.addRedirectTargetClicked.callCount).toBe(1);
    expect($scope.redirectTarget.addRedirectTargetClicked.args[0][0]).toBe("yolo");

  })
});
