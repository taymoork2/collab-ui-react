'use strict';

describe('Directive: ucUtilizationRealGraph', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-utilization-real-graph></uc-utilization-real-graph>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("utilization-card");
    expect(element.html()).toContain("metrics-utilization");
  });
});
