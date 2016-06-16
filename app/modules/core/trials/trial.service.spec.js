/* globals $httpBackend, $q, $rootScope, Config, Authinfo, LogMetricsService, TrialCallService, TrialCareService, TrialDeviceService,TrialMeetingService,TrialWebexService, TrialMessageService, TrialResource, TrialRoomSystemService, TrialService, UrlConfig*/
'use strict';

describe('Service: Trial Service:', function () {
  beforeEach(module('core.trial'));
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(function () {
    bard.inject(this, '$httpBackend', '$q', '$rootScope', 'Config', 'Authinfo', 'LogMetricsService',
      'TrialCallService', 'TrialCareService', 'TrialMeetingService', 'TrialMessageService', 'TrialWebexService', 'TrialResource', 'TrialRoomSystemService', 'TrialDeviceService', 'UrlConfig');
  });

  beforeEach(function () {
    bard.mockService(LogMetricsService, {});
    bard.mockService(Authinfo, {
      getOrgId: '1',
      getLicenses: [{
        'trialId': 'fake-uuid-value-0'
      }, {
        'trialId': 'fake-uuid-value-1'
      }, {
        'trialId': 'fake-uuid-value-2'
      }]
    });
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials').respond({
      activeDeviceTrials: 17,
      maxDeviceTrials: 20
    });
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials' + '?customerName=searchStr').respond({
      activeDeviceTrials: 17,
      maxDeviceTrials: 20
    });
  });

  beforeEach(function () {
    bard.inject(this, 'TrialService');
  });

  // -----
  describe('primary behaviors:', function () {
    var trialData = getJSONFixture('core/json/trials/trialData.json');
    var trialAddResponse = getJSONFixture('core/json/trials/trialAddResponse.json');
    var trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');

    beforeEach(function () {
      TrialService.getData();
      $httpBackend.flush();
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should exist', function () {
      expect(TrialService).toBeDefined();
    });

    it('should start a new trial', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials').respond(trialAddResponse);
      TrialService.startTrial().then(function (response) {
        expect(response.data).toEqual(trialAddResponse);
        expect(LogMetricsService.logMetrics).toHaveBeenCalled();
      });
      $httpBackend.flush();
    });

    it('should edit a trial', function () {
      var customerOrgId = 123;
      var trialId = 444;
      $httpBackend.whenPATCH(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials/' + trialId).respond(trialEditResponse);
      TrialService.editTrial(customerOrgId, trialId).then(function (response) {
        expect(response.data).toEqual(trialEditResponse);
        expect(LogMetricsService.logMetrics).toHaveBeenCalled();
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
        bard.mockService(TrialWebexService, {
          getData: trialData.enabled.trials.webexTrial
        });
        bard.mockService(TrialCallService, {
          getData: trialData.enabled.trials.callTrial
        });
        bard.mockService(TrialCareService, {
          getData: trialData.enabled.trials.careTrial
        });
        bard.mockService(TrialRoomSystemService, {
          getData: trialData.enabled.trials.roomSystemTrial
        });
        bard.mockService(TrialDeviceService, {
          getData: trialData.enabled.trials.deviceTrial
        });
        TrialService.getData();
      });

      it('should have offers list', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var offerList = ['MESSAGE', 'MEETING', 'WEBEX', 'ROOMSYSTEMS', 'CALL'];
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
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var details = angular.fromJson(data).details;
          return details.siteUrl === 'now.istomorrow.org' && details.timeZoneId === '4';
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should have device details', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var deviceList = [{
            model: 'CISCO_SX10',
            quantity: 2
          }, {
            model: 'CISCO_8865',
            quantity: 3
          }];
          var dataJson = angular.fromJson(data);
          var devices = dataJson.details.devices;
          return _.some(devices, deviceList[0]) && _.some(devices, deviceList[1]) && (dataJson.details.shippingInfo.dealId == "Enabled deal");
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should not have shipping details if none were provided', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          return _.isUndefined(data.shippingInfo);
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });
    });

    describe('start call trial state and country check', function () {
      var testData = trialData.enabled.trials.deviceTrial;
      it('should get state correcty from string', function () {
        testData.shippingInfo.state = "TX";
        bard.mockService(TrialDeviceService, {
          getData: testData
        });
        TrialService.getData();
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var state = angular.fromJson(data).details.shippingInfo.state;
          return state === 'TX';
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should get state correcty from object', function () {
        testData.shippingInfo.state = {
          "abbr": "IL",
          "state": "Illinois"
        };
        bard.mockService(TrialDeviceService, {
          getData: testData
        });
        TrialService.getData();
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          return angular.fromJson(data).details.shippingInfo.state === 'IL';

        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should get country correcty from string', function () {
        testData.shippingInfo.country = "Canada";
        bard.mockService(TrialDeviceService, {
          getData: testData
        });
        TrialService.getData();
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {

          return angular.fromJson(data).details.shippingInfo.country === 'Canada';
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should get country correcty from object', function () {
        testData.shippingInfo.country = {
          "country": "Germany"
        };
        bard.mockService(TrialDeviceService, {
          getData: testData
        });
        TrialService.getData();
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {

          return angular.fromJson(data).details.shippingInfo.country === 'Germany';
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

    });

    describe('start trial with disabled trials', function () {
      it('should have blank offers list', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          return angular.fromJson(data).offers.length === 0;
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });

      it('should have blank details', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var details = angular.fromJson(data).details;
          return _.isEmpty(details.devices) && _.isEmpty(details.offers);
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });
    });

    describe('start call trial with skipped devices', function () {
      beforeEach(function () {
        bard.mockService(TrialCallService, {
          getData: trialData.enabled.trials.skipDeviceTrial
        });
        TrialService.getData();
      });

      it('should not have devices if call trial order page was skipped', function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials', function (data) {
          var devices = angular.fromJson(data).details.devices;
          return _.isEmpty(devices);
        }).respond(200);

        TrialService.startTrial();

        expect($httpBackend.flush).not.toThrow();
      });
    });
  });

  // -----
  describe('util methods:', function () {
    var fakeTrialId = 'fake-uuid-value-1000';
    var fakeTrialPeriodData = {
      startDate: '2015-12-06T00:00:00.000Z',
      trialPeriod: 90
    };
    var fakeToday, fakeStartDate;

    describe('getTrialIds():', function () {
      it('should return a list of only the trial id values from a list of objects with a "trialId" property', function () {
        var trialIds = TrialService.getTrialIds();
        expect(trialIds.length).toBe(3);
        expect(trialIds).toEqual(['fake-uuid-value-0', 'fake-uuid-value-1', 'fake-uuid-value-2']);
      });
    });

    describe('async methods:', function () {
      afterEach(function () {
        // force resolve/reject
        $rootScope.$apply();
      });

      describe('getTrialPeriodData():', function () {
        describe('successful fetch of trial data:', function () {
          beforeEach(function () {
            spyOn(TrialService, 'getTrial').and.returnValue($q.when(fakeTrialPeriodData));
          });

          describe('resolves with an object that:', function () {
            it('should have a "startDate" property as an ISO-8601 string', function () {
              TrialService.getTrialPeriodData(fakeTrialId).then(function (trialPeriodData) {
                expect(trialPeriodData.startDate).toBe('2015-12-06T00:00:00.000Z');
              });
            });

            it('should have a "trialPeriodData" property as an int', function () {
              TrialService.getTrialPeriodData(fakeTrialId).then(function (trialPeriodData) {
                expect(trialPeriodData.trialPeriod).toBe(90);
              });
            });
          });
        });

        describe('failed fetch of trial data:', function () {
          beforeEach(function () {
            spyOn(TrialService, 'getTrial').and.returnValue($q.reject({
              message: 'getTrial failed'
            }));
          });

          it('should bubble up rejection that that caused "getTrial" to reject', function () {
            TrialService.getTrialPeriodData(fakeTrialId).catch(function (reason) {
              expect(reason).toEqual({
                message: 'getTrial failed'
              });
            });
          });
        });
      });

      describe('getExpirationPeriod():', function () {
        describe('passed a trial id:', function () {
          describe('returns a promise that:', function () {
            beforeEach(function () {
              fakeToday = new Date("2016-01-02T12:34:56.789Z");
            });

            it('should resolve with 29, given 1 day passed since the start date and trial period is 30', function () {
              var fakeTrialPeriodData = $q.when({
                startDate: '2016-01-01T00:00:00.000Z',
                trialPeriod: 30
              });
              spyOn(TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
                .then(function (daysLeft) {
                  expect(daysLeft).toBe(29);
                });
            });

            it('should resolve with 30, given start date and current date are the same and trial period is 30', function () {
              var fakeTrialPeriodData = $q.when({
                startDate: '2016-01-02T00:00:00.000Z',
                trialPeriod: 30
              });
              spyOn(TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
                .then(function (daysLeft) {
                  expect(daysLeft).toBe(30);
                });
            });

            it('should resolve with -1, given 31 days passed since the start date and trial period is 30', function () {
              var fakeTrialPeriodData = $q.when({
                startDate: '2015-12-02T00:00:00.000Z',
                trialPeriod: 30
              });
              spyOn(TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
                .then(function (daysLeft) {
                  expect(daysLeft).toBe(-1);
                });
            });

          });
        });
      });
    });

    describe('calcDaysLeft():', function () {
      beforeEach(function () {
        fakeStartDate = new Date("2016-01-01T00:00:00.000Z");
        fakeToday = new Date("2016-02-01T00:00:00.000Z");
      });

      it('should return -1, if current date - start date is 31 and the trial period is 30', function () {
        expect(TrialService.calcDaysLeft(fakeStartDate, 30, fakeToday)).toBe(-1);
      });

      it('should return 29, if current date - start date is 31 and the trial period is 60', function () {
        expect(TrialService.calcDaysLeft(fakeStartDate, 60, fakeToday)).toBe(29);
      });

      it('should return 59, if current date - start date is 31 and the trial period is 90', function () {
        expect(TrialService.calcDaysLeft(fakeStartDate, 90, fakeToday)).toBe(59);
      });
    });

    describe('calcDaysUsed(): ', function () {
      beforeEach(function () {
        fakeToday = new Date(Date.UTC(2016, 1, 1)); // 2016-02-01 (note: month units are zero-based)
      });

      describe('current date and start date are on the same day', function () {
        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T00:00:00.000Z');
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T23:59:59.999Z');
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T23:59:59.999Z');
          fakeToday = new Date('2016-02-01T00:00:00.000Z');
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date(Date.UTC(2016, 1, 1));
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date(Date.UTC(2016, 1, 1, 23, 59, 59, 999));
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeToday = new Date(Date.UTC(2016, 1, 1, 23, 59, 59, 999));
          fakeStartDate = new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0));
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });
      });

      describe('getTrials with customerName search string', function () {
        it('should successfully return 17 active device trials  with customerName search', function () {
          TrialService.getTrialsList('searchStr').then(function (response) {
            expect(response.data.activeDeviceTrials).toBe(17);
            expect(response.data.maxDeviceTrials).toBe(20);
            expect(response.status).toBe(200);
          });
          $httpBackend.flush();
        });
      });

      describe('start date falls on a day before the current date', function () {
        it('should return 1', function () {
          fakeStartDate = new Date('2016-01-31T00:00:00.000Z');
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date('2016-01-31T23:59:59.999Z');
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date(Date.UTC(2016, 0, 31));
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date(Date.UTC(2016, 0, 31, 23, 59, 59, 999));
          expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });
      });

      it('should return correct number of days between start date and current date', function () {
        fakeStartDate = new Date('2016-01-01T00:00:00.000Z');
        expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(31);

        fakeStartDate = new Date('2015-01-01T00:00:00.000Z');
        expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(396);
      });

      it('should return -1, if start date is 1 day ahead of current date', function () {
        // no guard against future date is provided
        fakeStartDate = new Date('2016-02-02T00:00:00.000Z');
        expect(TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(-1);
      });
    });
  });
});
