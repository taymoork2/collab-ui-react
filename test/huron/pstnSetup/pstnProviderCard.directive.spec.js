'use strict';

describe('Directive: ucPstnProviderCard', function () {
  var $compile, $rootScope;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-pstn-provider-card/>")($rootScope);
    $rootScope.$digest();

    expect(element.hasClass('pstn-provider-card')).toEqual(true);
  });
});
