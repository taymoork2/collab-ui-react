'use strict';

describe('Directive: featureCards', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function () {
    // var element = $compile("<feature-cards ng-if=\"huronFeaturesCtrl.pageState == 'showFeatures'\"></feature-cards>")($rootScope);

    var element = $compile("<feature-cards></feature-cards>")($rootScope);

    $rootScope.$digest();

    expect(element.html()).toContain('cs-card-block');
  });

});
