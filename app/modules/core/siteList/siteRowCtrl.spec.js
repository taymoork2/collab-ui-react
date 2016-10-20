'use strict';

describe('Controller: WebExSiteRowCtrl', function () {

  var controller, $scope, $q, FeatureToggleService, WebExSiteRowService;
  var fakeShowGridData = true;
  var fakeGridData = {
    siteUrl: "abc.webex.com"
  };
  var fakeGridOptions = {
    data: fakeGridData
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _FeatureToggleService_, _WebExSiteRowService_) {
    $scope = $rootScope.$new();

    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    $q = _$q_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(WebExSiteRowService, 'getConferenceServices');
    spyOn(WebExSiteRowService, 'configureGrid');
    spyOn(WebExSiteRowService, 'getGridOptions').and.returnValue(fakeGridOptions);
    spyOn(WebExSiteRowService, 'getShowGridData').and.returnValue(fakeShowGridData);

    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService
    });

    $scope.$apply();
  }));

  it('can correctly initialize WebExSiteRowCtrl', function () {
    expect(controller).toBeDefined();
    expect(controller.showGridData).toBe(true);
    expect(controller.gridOptions).not.toEqual(null);
    expect(controller.gridOptions.data.siteUrl).toEqual("abc.webex.com");
  });
});
