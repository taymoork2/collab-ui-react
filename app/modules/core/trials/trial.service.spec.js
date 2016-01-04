/* globals $httpBackend, $q, Config, Authinfo, LogMetricsService, TrialCallService, TrialMeetingService, TrialMessageService, TrialResource, TrialRoomSystemService, TrialService*/
'use strict';

describe('Service: Trial Service', function () {

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  var trialData = getJSONFixture('core/json/trials/trialData.json');
  var trialAddResponse = getJSONFixture('core/json/trials/trialAddResponse.json');
  var trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');

  beforeEach(function () {
    bard.inject(this, '$httpBackend', '$q', '$rootScope', 'Config', 'Authinfo', 'LogMetricsService',
      'TrialCallService', 'TrialMeetingService', 'TrialMessageService', 'TrialResource', 'TrialRoomSystemService');

    bard.mockService(LogMetricsService, {});
    bard.mockService(Authinfo, {
      getOrgId: '1'
    });
  });

  beforeEach(function () {
    bard.inject(this, 'TrialService');

    TrialService.getData();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(TrialService).toBeDefined();
  });

  it('should start a new trial', function () {
    $httpBackend.whenPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials').respond(trialAddResponse);
    TrialService.startTrial().then(function (response) {
      expect(response.data).toEqual(trialAddResponse);
      expect(LogMetricsService.logMetrics).toHaveBeenCalled();
    });
    $httpBackend.flush();
  });

  it('should edit a trial', function () {
    $httpBackend.whenPATCH(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials/444').respond(trialEditResponse);
    TrialService.editTrial('444', '', '', '', '', ['COLLAB']).then(function (response) {
      expect(response.data).toEqual(trialEditResponse);
    });
    $httpBackend.flush();
  });

  describe('start trial with enabled trials', function () {
    beforeEach(function () {
      bard.mockService(TrialMessageService, {
        getData: trialData.enabled.trials.messageTrial
      });
      bard.mockService(TrialMeetingService, {
        getData: trialData.enabled.trials.meetingTrial
      });
      bard.mockService(TrialCallService, {
        getData: trialData.enabled.trials.callTrial
      });
      bard.mockService(TrialRoomSystemService, {
        getData: trialData.enabled.trials.roomSystemTrial
      });
      TrialService.getData();
    });

    it('should have offers list', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        var offerList = ['COLLAB', 'WEBEX', 'SQUAREDUC'];
        var offers = angular.fromJson(data).offers;
        return _.every(offerList, function (offer) {
          return _.some(offers, {
            id: offer
          });
        });
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });

    it('should have meeting settings', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        var details = angular.fromJson(data).details;
        return details.siteUrl === 'now.istomorrow.org' && details.timeZoneId === 4;
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });

    it('should have device details', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        var deviceList = [{
          model: 'sx10',
          quantity: 2
        }, {
          model: '8865',
          quantity: 3
        }];
        var devices = angular.fromJson(data).details.devices;
        return _.some(devices, deviceList[0]) && _.some(devices, deviceList[1]);
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });

    it('should have shipping details', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        var shippingInfoList = [{
          "isPrimary": true,
          "name": "John Connors",
          "phoneNumber": "+1 206 256 3000",
          "address": "2901 3rd Ave Seattle WA 98121",
          "recipientType": "CUSTOMER"
        }];
        var shippingInfo = angular.fromJson(data).details.shippingInfo;
        return _.some(shippingInfo, shippingInfoList[0]);
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });
  });

  describe('start trial with disabled trials', function () {
    it('should have blank offers list', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        return angular.fromJson(data).offers.length === 0;
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });

    it('should have blank details', function () {
      $httpBackend.expectPOST(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
        return _.isEmpty(angular.fromJson(data).details);
      }).respond(200);

      TrialService.startTrial();

      expect($httpBackend.flush).not.toThrow();
    });
  });
});
