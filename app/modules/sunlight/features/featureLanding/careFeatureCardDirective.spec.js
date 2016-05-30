'use strict';

describe('Directive: car featureCards', function () {
  var $compile, $rootScope;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<care-feature-card></care-feature-card>")($rootScope);

    $rootScope.$digest();

    expect(element.html()).toContain('cs-card-block');
  });

});
