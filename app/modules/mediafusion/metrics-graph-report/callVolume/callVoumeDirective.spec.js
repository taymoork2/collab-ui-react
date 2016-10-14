'use strict';

describe('Directive: ucCallVolumeMetrics', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function () {
    var element = $compile("<uc-call-volume-metrics></uc-call-volume-metrics>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("call-volume-card");
    expect(element.html()).toContain("metrics-call-volume");
  });
});
