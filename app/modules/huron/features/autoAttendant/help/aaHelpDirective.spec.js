'use strict';

describe('Directive: aaHelpDirective', function () {
  var $compile, $rootScope, $scope;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

  }));

  it('creates the appropriate content as element', function () {
    var element = $compile("<aa-help content='help me if you can'></aa-help>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-help-icon");
  });

  it('creates the appropriate content as attribute', function () {
    var element = $compile("<div aa-help content='please, please help me'></div>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-help-icon");
  });
});
