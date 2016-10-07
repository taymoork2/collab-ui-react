'use strict';

describe('Directive: ucUtilizationMetrics', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    $compile("<uc-utilization-metrics></uc-utilization-metrics>")($rootScope);
    $rootScope.$digest();
  });
});
