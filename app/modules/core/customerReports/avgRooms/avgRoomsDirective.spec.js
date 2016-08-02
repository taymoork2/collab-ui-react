'use strict';

describe('Directive: ucAvgRooms', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-avg-rooms/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("customer-avg-rooms");
  });
});
