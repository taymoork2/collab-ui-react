'use strict';

describe('Directive: ucAvailabilityRealGraph', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-availability-real-graph></uc-availability-real-graph>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("availability-card");
    expect(element.html()).toContain("metrics-availability");
  });
});
