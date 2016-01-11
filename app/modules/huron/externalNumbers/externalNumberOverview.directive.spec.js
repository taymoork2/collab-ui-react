'use strict';

describe('Directive: ucExternalNumberOverview', function () {
  var $compile, $rootScope;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-external-number-overview/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("cs-sp-section");
    expect(element.html()).toContain("customerPage.call");
  });
});
