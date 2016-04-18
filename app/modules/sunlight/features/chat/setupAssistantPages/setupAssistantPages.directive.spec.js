'use strict';

describe('Directive: setupAssistantPages', function () {
  var $compile, $rootScope;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<ct-profile/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("ct-title");
  });
});
