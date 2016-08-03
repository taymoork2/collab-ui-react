'use strict';

describe('Controller: CdrLogsCtrl', function () {
  beforeEach(angular.mock.module('uc.cdrlogsupport'));
  beforeEach(angular.mock.module('Huron'));

  var controller, state, translate, timeout, Config, formlyValidationMessages, formlyConfig, CdrService, Notification;
  var callLegs = getJSONFixture('huron/json/cdrLogs/callLegs.json');
  var statusResponse = ['primary', 'danger'];
  var dateFormat = 'YYYY-MM-DD';

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$state_, _$translate_, _$timeout_, _Config_, _formlyConfig_, _Notification_) {
    var $scope = $rootScope.$new();
    state = _$state_;
    translate = _$translate_;
    timeout = _$timeout_;
    Config = _Config_;
    formlyConfig = _formlyConfig_;
    Notification = _Notification_;

    var $q = _$q_;

    spyOn(state, "go");

    controller = $controller('CdrLogsCtrl', {
      $scope: $scope,
      $state: state,
      $translate: translate,
      $timeout: timeout,
      Config: Config,
      formlyConfig: formlyConfig,
      CdrService: CdrService,
      Notification: Notification
    });
    //TODO: will fix this after the cdr page fix is merged.
    //$scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
    expect(controller.fields).toBeDefined();
  });

  it('statusAvalibility should return expected results for error codes', function () {
    expect(controller.statusAvalibility(callLegs[0])).toEqual(statusResponse[0]);
    expect(controller.statusAvalibility(callLegs[1])).toEqual(statusResponse[1]);

  });

  it('getAccordionHeader should return the correct title', function () {
    expect(controller.getAccordionHeader(callLegs[0])).toContain('cdrLogs.cdrAccordionHeader');
    expect(controller.getAccordionHeader(callLegs[0])).toContain('cdrLogs.sparkCall');
    expect(controller.getAccordionHeader(callLegs[1])).toContain('cdrLogs.cdrAccordionHeader');
    expect(controller.getAccordionHeader(callLegs[1])).not.toContain('cdrLogs.sparkCall');
  });
  //TODO: will fix this after the cdr page fix is merged.
  xit('selectCDR should set selectedCDR', function () {
    controller.selectCDR(callLegs[0][0], callLegs[0][0][0]);
    expect(controller.selectedCDR).toEqual(callLegs[0][0][0]);
  });

  it('ElasticSearch path should contain the logstash days', function () {
    var esDays = 'logstash-2016.03.22,logstash-2016.03.23';
    controller.model.startDate = moment("2016-03-22", dateFormat);
    controller.model.endDate = moment("2016-03-23", dateFormat);
    controller.updateLogstashPath();
    expect(controller.logstashPath).toEqual(esDays);
  });

  it('ElasticSearch path should contain the logstash months', function () {
    var esMonths = 'logstash-2015.11.*,logstash-2015.12.*,logstash-2016.01.*,logstash-2016.02.*,logstash-2016.03.*';
    controller.model.startDate = moment("2015-11-23", dateFormat);
    controller.model.endDate = moment("2016-03-23", dateFormat);
    controller.updateLogstashPath();
    expect(controller.logstashPath).toEqual(esMonths);
  });
});
