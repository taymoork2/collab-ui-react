'use strict';

describe('Directive: ucMediaQuality', function () {
  var $compile, $rootScope;

  beforeEach(module('Core'));

  beforeEach(inject(function ($injector, _$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-media-quality/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("media-quality");
  });
});
