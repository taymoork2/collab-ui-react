'use strict';

describe('Directive: aaNewCardCustom', function () {
  var $compile, $rootScope, $scope;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-new-card-custom></aa-new-card-custom>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-template-card-section");
  });
});
