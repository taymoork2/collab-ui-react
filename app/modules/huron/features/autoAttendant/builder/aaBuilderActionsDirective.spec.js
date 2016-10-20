'use strict';

describe('Directive: aaBuilderActions', function () {
  var $compile, $rootScope, $q;
  var FeatureToggleService;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;

    FeatureToggleService = _FeatureToggleService_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-builder-actions/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aa-panel");
    expect(element.html()).toContain("aa-add-step-icon");
  });
});
