'use strict';

describe('Directive: ucExternalNumberOverview', function () {
  var $compile, $rootScope, $q, ExternalNumberService, FeatureToggleService;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _ExternalNumberService_, _FeatureToggleService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    ExternalNumberService = _ExternalNumberService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-external-number-overview/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("cs-sp-section");
    expect(element.html()).toContain("customerPage.call");
  });
});
