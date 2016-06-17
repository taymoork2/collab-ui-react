'use strict';

describe('Directive: aaBuilderAutofocus', function () {
  var $compile, $rootScope;
  var $timeout, element;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    element = $compile("<input type='text' aa-builder-focus>")($rootScope);
    $rootScope.$digest();
  }));

  it('should focus on the name entry', function () {

    element = $compile("<input type='text' aa-builder-autofocus>")($rootScope);
    spyOn(element[0], 'focus');
    $timeout.flush();

    expect(element[0].focus).toHaveBeenCalled();

  });
});
