'use strict';

describe('Service: Trial Service', function () {
  var $httpBackend, TrialService, Config;

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  var trialAddResponse = getJSONFixture('core/json/trials/trialAddResponse.json');
  var trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var Auth = jasmine.createSpyObj('Auth', ['handleStatus']);

  var LogMetricsService = jasmine.createSpyObj('LogMetricsService', ['getEventType', 'getEventAction', 'logMetrics']);

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
    $provide.value("Auth", Auth);
    $provide.value("LogMetricsService", LogMetricsService);
  }));

  beforeEach(inject(function (_$httpBackend_, _TrialService_, _Config_) {
    $httpBackend = _$httpBackend_;
    TrialService = _TrialService_;
    Config = _Config_;
    var data = TrialService.getData();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(TrialService).toBeDefined();
  });

  describe('startTrial function', function () {

    it('should start a new trial', function () {
      $httpBackend.whenPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials').respond(trialAddResponse);
      TrialService.startTrial().then(function (response) {
        expect(response.data).toEqual(trialAddResponse);
        expect(LogMetricsService.logMetrics).toHaveBeenCalled();
      });
      $httpBackend.flush();
    });

  });

  describe('editTrial function', function () {

    it('should edit a trial', function () {
      $httpBackend.whenPATCH(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials/444').respond(trialEditResponse);
      TrialService.editTrial('444', '', '', '', '', ['COLLAB']).then(function (response) {
        expect(response.data).toEqual(trialEditResponse);
      });
      $httpBackend.flush();
    });

  });

});
