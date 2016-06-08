'use strict';

describe('Controller: WebExSiteRowCtrl', function () {

  var controller, $scope, $q, FeatureToggleService, WebExSiteRowService;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _FeatureToggleService_, _WebExSiteRowService_) {
    $scope = $rootScope.$new();

    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    $q = _$q_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(WebExSiteRowService, 'getConferenceServices');
    spyOn(WebExSiteRowService, 'configureGrid');
    spyOn(WebExSiteRowService, 'getGridOptions');
    spyOn(WebExSiteRowService, 'getShowGridData').and.returnValue(true);

    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService
    });

    $scope.$apply();
  }));

  it('can correctly initialize WebExSiteRowCtrl', function () {
    expect(controller).toBeDefined();
  });
});
