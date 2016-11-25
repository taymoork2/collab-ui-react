'use strict';

describe('Directive: ucAvailabilityHistoricalGraph', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-availability-historical-graph></uc-availability-historical-graph>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("availability-card-historical");
    expect(element.html()).toContain("metrics-availability");
  });
});
