'use strict';

describe('Directive: aaBuilderScheduleInfo', function () {
  var $compile, $rootScope;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-builder-schedule-info/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-panel");
  });
});
