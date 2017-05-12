'use strict';

describe('Directive: aaAddVariable', function () {
  var $compile, $rootScope;
  var element;

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('creates the appropriate content as element', function () {
    element = $compile('<aa-add-variable dynamic-prompt-id="id" dynamic-element-string="element"></aa-add-variable>')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('<button');
  });

});
