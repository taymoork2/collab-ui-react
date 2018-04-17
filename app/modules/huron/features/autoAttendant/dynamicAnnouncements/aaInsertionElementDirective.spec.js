'use strict';

describe('Directive: aaInsertionElement', function () {
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
    element = $compile('<aa-insertion-element element-text="DynamicText"></aa-insertion-element>')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('<span class="columns small-12 insertion-element');
  });
});
