'use strict';

xdescribe('Directive: ucDevices', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('uc.device'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-devices/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("dir-number-list");
  });
});
