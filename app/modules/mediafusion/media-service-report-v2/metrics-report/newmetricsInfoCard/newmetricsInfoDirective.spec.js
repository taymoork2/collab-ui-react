'use strict';

describe('Directive: ucNewMetricsInfoCard', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-new-metrics-info-card></uc-new-metrics-info-card>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("metrics-info");
    expect(element.html()).toContain("metrics-header");
  });
});
