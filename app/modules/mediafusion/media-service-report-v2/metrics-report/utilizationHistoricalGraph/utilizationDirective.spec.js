'use strict';

describe('Directive: ucUtilizationHistoricalGraph', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-utilization-historical-graph></uc-utilization-historical-graph>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("utilization-card-historical");
    expect(element.html()).toContain("metrics-utilization");
  });
});
