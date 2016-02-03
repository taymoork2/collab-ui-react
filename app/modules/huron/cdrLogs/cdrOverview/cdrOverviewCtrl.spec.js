'use strict';

describe('Controller: CdrOverviewCtrl', function () {
  beforeEach(module('uc.cdrlogsupport'));
  beforeEach(module('Huron'));

  var $scope, controller, $state, $stateParams, $translate, $timeout, Config, CdrService;
  var callLegs = getJSONFixture('huron/json/cdrLogs/callLegs.json');
  var formatCdr = function (cdrRawJson) {
    var cdr = cdrRawJson.dataParam;
    delete cdr['message'];
    for (var key in cdrRawJson) {
      if (["dataParam", "eventSource", "tags", "message"].indexOf(key) < 0) {
        cdr[key] = cdrRawJson[key];
      }
    }
    return cdr;
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$stateParams_, _$translate_, _$timeout_, _Config_, _CdrService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    Config = _Config_;
    CdrService = _CdrService_;

    $stateParams.cdrData = callLegs[0][0][0];
    $stateParams.call = callLegs[0];

    spyOn(CdrService, 'createDownload').and.returnValue("url");

    controller = $controller('CdrOverviewCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      $translate: $translate,
      $timeout: $timeout,
      Config: Config,
      CdrService: CdrService
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });
});
