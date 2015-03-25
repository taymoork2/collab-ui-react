'use strict';

describe('Service: Trial Service', function () {
  var $httpBackend, TrialService, Config;

  beforeEach(module('Core'));

  var trialAddResponse = getJSONFixture('core/json/trials/trialAddResponse.json');
  var trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var Auth = jasmine.createSpyObj('Auth', ['handleStatus']);

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
    $provide.value("Auth", Auth);
  }));

  beforeEach(inject(function (_$httpBackend_, _TrialService_, _Config_) {
    $httpBackend = _$httpBackend_;
    TrialService = _TrialService_;
    Config = _Config_;
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
      TrialService.startTrial('', '', '', '', '', ['COLLAB']).then(function (response) {
        expect(response.data).toEqual(trialAddResponse);
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
