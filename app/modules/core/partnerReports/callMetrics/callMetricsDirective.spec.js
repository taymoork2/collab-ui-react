'use strict';

describe('Directive: ucCallMetrics', function () {
  var $compile, $rootScope;

  beforeEach(module('Core'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-call-metrics/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("call-metrics");
  });
});
