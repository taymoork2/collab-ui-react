'use strict';

describe('Directive: ucAvailabilityMetrics', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-availability-metrics></uc-availability-metrics>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("availability-card");
    expect(element.html()).toContain("metrics-availability");
  });
});
