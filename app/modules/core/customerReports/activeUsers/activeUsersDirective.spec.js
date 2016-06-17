'use strict';

describe('Directive: ucActiveUserCustomer', function () {
  var $compile, $rootScope;

  beforeEach(module('Core'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-active-user-customer/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("customer-active-user");
  });
});
