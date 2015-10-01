'use strict';

describe('Controller: CdrLogsCtrl', function () {
  beforeEach(module('uc.cdrlogsupport'));
  beforeEach(module('Huron'));

  var controller, translate, timeout, Config, formlyValidationMessages, formlyConfig, CdrService;
  var callLegs = getJSONFixture('huron/json/cdrLogs/callLegs.json');
  var statusResponse = ['primary', 'danger'];

  beforeEach(inject(function ($rootScope, $controller, _$translate_, _$timeout_, _Config_, _formlyValidationMessages_, _formlyConfig_, _CdrService_) {
    var $scope = $rootScope.$new();
    translate = _$translate_;
    timeout = _$timeout_;
    Config = _Config_;
    formlyValidationMessages = _formlyValidationMessages_;
    formlyConfig = _formlyConfig_;
    CdrService = _CdrService_;

    controller = $controller('CdrLogsCtrl', {
      $scope: $scope,
      translate: translate,
      timeout: timeout,
      Config: Config,
      formlyValidationMessages: formlyValidationMessages,
      formlyConfig: formlyConfig,
      CdrService: CdrService
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
    expect(controller.fields).toBeDefined();
  });

  it('statusAvalibility should return expected results for error codes', function () {
    expect(controller.statusAvalibility(callLegs[0])).toEqual(statusResponse[0]);
    expect(controller.statusAvalibility(callLegs[1])).toEqual(statusResponse[1]);
  });

  it('getAccordionHeader should return a title', function () {
    expect(controller.getAccordionHeader(callLegs[0])).toEqual('cdrLogs.cdrAccordionHeader');
  });

  it('selectCDR should set selectedCDR', function () {
    controller.selectCDR(callLegs[0][0][0]);
    expect(controller.selectedCDR).toEqual(callLegs[0][0][0]);
  });
});
