'use strict';

describe('Directive: ucActiveUserPopulation', function () {
  var $compile, $rootScope;

  beforeEach(module('Core'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-active-user-population/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("active-user-population");
  });
});
