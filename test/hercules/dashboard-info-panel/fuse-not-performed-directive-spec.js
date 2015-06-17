'use strict';

describe('FusionWelcomeDirective', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $scope;
  beforeEach(inject(function ($injector, _$compile_, $rootScope) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  it('replaces the element with the appropriate content when no clusters fused', function () {
    $scope.clusters = [];
    var element = $compile("<hercules-fuse-not-performed>")($scope);
    $scope.$digest();
    expect(element.find('#fuseNotPerformedAction').hasClass('ng-hide')).toBe(false);
    expect(element.html()).toContain("Register Cisco VCS for Cloud Extensions");
  });

  it('replaces the element with the appropriate content when there are clusters fused', function () {
    $scope.clusters = [{
      "id": "d5b78711-b132-11e4-8a66-005056000340",
      "cluster_type": "c_mgmt",
      "name": "gwydlvm340"
    }];
    var element = $compile("<hercules-fuse-not-performed>")($scope);
    $scope.$digest();
    expect(element.find('#fuseNotPerformedAction').hasClass('ng-hide')).toBe(true);
  });
});
