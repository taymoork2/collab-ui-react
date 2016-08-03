'use strict';

describe('Directive: ucDirectoryNumber', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-directory-number/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("form-group");
  });
});
