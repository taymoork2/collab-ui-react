'use strict';

var trialModule = require('./trial.module');

describe('Service: Trial Service:', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$rootScope',
      'Authinfo',
      'LogMetricsService',
      'TrialAdvanceCareService',
      'TrialCallService',
      'TrialCareService',
      'TrialDeviceService',
      'TrialMeetingService',
      'TrialMessageService',
      'TrialResource',
      'TrialRoomSystemService',
      'TrialSparkBoardService',
      'TrialWebexService',
      'UrlConfig'
    );

    spyOn(this.LogMetricsService, 'logMetrics');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.Authinfo, 'getLicenses').and.returnValue([{
      trialId: 'fake-uuid-value-0',
    }, {
      trialId: 'fake-uuid-value-1',
    }, {
      trialId: 'fake-uuid-value-2',
    }]);
    this.$httpBackend.whenGET(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials').respond({
      activeDeviceTrials: 17,
      maxDeviceTrials: 20,
    });
    this.$httpBackend.whenGET(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials' + '?customerName=searchStr').respond({
      activeDeviceTrials: 17,
      maxDeviceTrials: 20,
    });

    this.injectDependencies(
      'TrialService'
    );
  });

  // -----
  describe('primary behaviors:', function () {
    beforeEach(function () {
      this.trialData = getJSONFixture('core/json/trials/trialData.json');
      this.trialAddResponse = getJSONFixture('core/json/trials/trialAddResponse.json');
      this.trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');
      this.notifyPartnerResponse = getJSONFixture('core/json/trials/notifyPartnerResponse.json');

      this.TrialService.getData();
      this.$httpBackend.flush();
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should exist', function () {
      expect(this.TrialService).toBeDefined();
    });

    it('should start a new trial', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials').respond(this.trialAddResponse);
      this.TrialService.startTrial().then(function (response) {
        expect(response.data).toEqual(this.trialAddResponse);
        expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
      }.bind(this));
      this.$httpBackend.flush();
    });

    it('should edit a trial', function () {
      var customerOrgId = 123;
      var trialId = 444;
      this.$httpBackend.whenPATCH(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials/' + trialId).respond(this.trialEditResponse);
      this.TrialService.editTrial(customerOrgId, trialId).then(function (response) {
        expect(response.data).toEqual(this.trialEditResponse);
        expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
      }.bind(this));
      this.$httpBackend.flush();
    });

    it('should send a partner notification', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/trials/notifypartnertrialextinterest').respond(this.notifyPartnerResponse);
      this.TrialService.notifyPartnerTrialExt().then(function (response) {
        expect(response.data).toEqual(this.notifyPartnerResponse);
        expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
      }.bind(this));
      this.$httpBackend.flush();
    });

    describe('start trial with enabled trials', function () {
      beforeEach(function () {
        spyOn(this.TrialMessageService, 'getData').and.returnValue(this.trialData.enabled.trials.messageTrial);
        spyOn(this.TrialMeetingService, 'getData').and.returnValue(this.trialData.enabled.trials.meetingTrial);
        spyOn(this.TrialWebexService, 'getData').and.returnValue(this.trialData.enabled.trials.webexTrial);
        spyOn(this.TrialCallService, 'getData').and.returnValue(this.trialData.enabled.trials.callTrial);
        spyOn(this.TrialCareService, 'getData').and.returnValue(this.trialData.enabled.trials.careTrial);
        spyOn(this.TrialRoomSystemService, 'getData').and.returnValue(this.trialData.enabled.trials.roomSystemTrial);
        spyOn(this.TrialSparkBoardService, 'getData').and.returnValue(this.trialData.enabled.trials.sparkBoardTrial);
        spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
        spyOn(this.TrialAdvanceCareService, 'getData').and.returnValue(this.trialData.enabled.trials.advanceCareTrial);
        this.TrialService.getData();
      });

      it('should have offers list', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var offerList = ['MESSAGE', 'MEETING', 'WEBEX', 'ROOMSYSTEMS', 'CALL'];
          var offers = JSON.parse(data).offers;
          return _.every(offerList, function (offer) {
            return _.some(offers, {
              id: offer,
            });
          });
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should have meeting settings', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var details = JSON.parse(data).details;
          return details.siteUrl === 'now.istomorrow.org' && details.timeZoneId === '4';
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should have device details', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var deviceList = [{
            model: 'CISCO_SX10',
            quantity: 2,
          }, {
            model: 'CISCO_8865',
            quantity: 3,
          }];
          var dataJson = JSON.parse(data);
          var devices = dataJson.details.devices;
          return _.some(devices, deviceList[0]) && _.some(devices, deviceList[1]) && (dataJson.details.shippingInfo.dealId == 'Enabled deal');
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should not have shipping details if none were provided', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          return _.isUndefined(data.shippingInfo);
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });
    });

    describe('start call trial state and country check', function () {
      beforeEach(function () {
        this.testData = this.trialData.enabled.trials.deviceTrial;
      });

      it('should get state correcty from string', function () {
        this.testData.shippingInfo.state = 'TX';
        spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.testData);
        this.TrialService.getData();
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var state = JSON.parse(data).details.shippingInfo.state;
          return state === 'TX';
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should get state correcty from object', function () {
        this.testData.shippingInfo.state = {
          abbr: 'IL',
          state: 'Illinois',
        };
        spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.testData);
        this.TrialService.getData();
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          return JSON.parse(data).details.shippingInfo.state === 'IL';
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should get country correcty from string', function () {
        this.testData.shippingInfo.country = 'Canada';
        spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.testData);
        this.TrialService.getData();
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          return JSON.parse(data).details.shippingInfo.country === 'Canada';
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should get country correcty from object', function () {
        this.testData.shippingInfo.country = {
          country: 'Germany',
        };
        spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.testData);
        this.TrialService.getData();
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          return JSON.parse(data).details.shippingInfo.country === 'Germany';
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });
    });

    describe('start trial with disabled trials', function () {
      it('should have blank offers list', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          return JSON.parse(data).offers.length === 0;
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });

      it('should have blank details', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var details = JSON.parse(data).details;
          return _.isEmpty(details.devices) && _.isEmpty(details.offers);
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });
    });

    describe('start call trial with skipped devices', function () {
      beforeEach(function () {
        spyOn(this.TrialCallService, 'getData').and.returnValue(this.trialData.enabled.trials.skipDeviceTrial);
        this.TrialService.getData();
      });

      it('should not have devices if call trial order page was skipped', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/trials', function (data) {
          var devices = JSON.parse(data).details.devices;
          return _.isEmpty(devices);
        }).respond(200);

        this.TrialService.startTrial();

        expect(this.$httpBackend.flush).not.toThrow();
      });
    });
  });

  // -----
  describe('util methods:', function () {
    var fakeTrialId = 'fake-uuid-value-1000';
    var fakeTrialPeriodData = {
      startDate: '2015-12-06T00:00:00.000Z',
      trialPeriod: 90,
    };
    var fakeToday, fakeStartDate;

    describe('getTrialIds():', function () {
      it('should return a list of only the trial id values from a list of objects with a "trialId" property', function () {
        var trialIds = this.TrialService.getTrialIds();
        expect(trialIds.length).toBe(3);
        expect(trialIds).toEqual(['fake-uuid-value-0', 'fake-uuid-value-1', 'fake-uuid-value-2']);
      });
    });

    describe('async methods:', function () {
      afterEach(function () {
        // force resolve/reject
        this.$rootScope.$apply();
      });

      describe('getDaysLeftForCurrentUser():', function () {
        var getDaysLeftForCurrentUser;

        beforeEach(function () {
          getDaysLeftForCurrentUser = this.TrialService.getDaysLeftForCurrentUser;
          spyOn(this.TrialService, 'getTrialIds').and.returnValue([fakeTrialId]);
          spyOn(this.TrialService, 'getExpirationPeriod').and.returnValue(this.$q.resolve(1));
          spyOn(this.TrialService, 'getTrialPeriodData').and.returnValue(this.$q.resolve(fakeTrialPeriodData));
        });

        it('should resolve with the return value from "TrialService.getExpirationPeriod()"', function () {
          getDaysLeftForCurrentUser().then(function (daysLeft) {
            expect(daysLeft).toBe(1);
          });
        });

        it('should have called "TrialService.getTrialIds()"', function () {
          getDaysLeftForCurrentUser().then(function () {
            expect(this.TrialService.getTrialIds).toHaveBeenCalled();
          }.bind(this));
        });

        it('should have called "TrialService.getExpirationPeriod()" with the return value of "TrialService.getTrialIds()"', function () {
          getDaysLeftForCurrentUser().then(function () {
            expect(this.TrialService.getExpirationPeriod).toHaveBeenCalledWith([fakeTrialId]);
          }.bind(this));
        });
      });

      describe('getTrialPeriodData():', function () {
        describe('successful fetch of trial data:', function () {
          beforeEach(function () {
            spyOn(this.TrialService, 'getTrial').and.returnValue(this.$q.resolve(fakeTrialPeriodData));
          });

          describe('resolves with an object that:', function () {
            it('should have a "startDate" property as an ISO-8601 string', function () {
              this.TrialService.getTrialPeriodData(fakeTrialId).then(function (trialPeriodData) {
                expect(trialPeriodData.startDate).toBe('2015-12-06T00:00:00.000Z');
              });
            });

            it('should have a "trialPeriodData" property as an int', function () {
              this.TrialService.getTrialPeriodData(fakeTrialId).then(function (trialPeriodData) {
                expect(trialPeriodData.trialPeriod).toBe(90);
              });
            });
          });
        });

        describe('failed fetch of trial data:', function () {
          beforeEach(function () {
            spyOn(this.TrialService, 'getTrial').and.returnValue(this.$q.reject({
              message: 'getTrial failed',
            }));
          });

          it('should bubble up rejection that that caused "getTrial" to reject', function () {
            this.TrialService.getTrialPeriodData(fakeTrialId).then(fail)
              .catch(function (reason) {
                expect(reason).toEqual({
                  message: 'getTrial failed',
                });
              });
          });
        });
      });

      describe('getExpirationPeriod():', function () {
        describe('passed a trial id:', function () {
          describe('returns a promise that:', function () {
            beforeEach(function () {
              fakeToday = new Date('2016-01-02T12:34:56.789Z');
            });

            it('should resolve with 29, given 1 day passed since the start date and trial period is 30', function () {
              var fakeTrialPeriodData = this.$q.resolve({
                startDate: '2016-01-01T00:00:00.000Z',
                trialPeriod: 30,
              });
              spyOn(this.TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              this.TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
                .then(function (daysLeft) {
                  expect(daysLeft).toBe(29);
                });
            });

            it('should resolve with 30, given start date and current date are the same and trial period is 30', function () {
              var fakeTrialPeriodData = this.$q.resolve({
                startDate: '2016-01-02T00:00:00.000Z',
                trialPeriod: 30,
              });
              spyOn(this.TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              this.TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
                .then(function (daysLeft) {
                  expect(daysLeft).toBe(30);
                });
            });

            it('should resolve with -1, given 31 days passed since the start date and trial period is 30', function () {
              var fakeTrialPeriodData = this.$q.resolve({
                startDate: '2015-12-02T00:00:00.000Z',
                trialPeriod: 30,
              });
              spyOn(this.TrialService, 'getTrialPeriodData').and.returnValue(fakeTrialPeriodData);

              this.TrialService.getExpirationPeriod(fakeTrialId, fakeToday)
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
        fakeStartDate = new Date('2016-01-01T00:00:00.000Z');
        fakeToday = new Date('2016-02-01T00:00:00.000Z');
      });

      it('should return -1, if current date - start date is 31 and the trial period is 30', function () {
        expect(this.TrialService.calcDaysLeft(fakeStartDate, 30, fakeToday)).toBe(-1);
      });

      it('should return 29, if current date - start date is 31 and the trial period is 60', function () {
        expect(this.TrialService.calcDaysLeft(fakeStartDate, 60, fakeToday)).toBe(29);
      });

      it('should return 59, if current date - start date is 31 and the trial period is 90', function () {
        expect(this.TrialService.calcDaysLeft(fakeStartDate, 90, fakeToday)).toBe(59);
      });
    });

    describe('calcDaysUsed(): ', function () {
      beforeEach(function () {
        fakeToday = new Date(Date.UTC(2016, 1, 1)); // 2016-02-01 (note: month units are zero-based)
      });

      describe('current date and start date are on the same day', function () {
        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T00:00:00.000Z');
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T23:59:59.999Z');
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date('2016-02-01T23:59:59.999Z');
          fakeToday = new Date('2016-02-01T00:00:00.000Z');
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date(Date.UTC(2016, 1, 1));
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeStartDate = new Date(Date.UTC(2016, 1, 1, 23, 59, 59, 999));
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });

        it('should return 0', function () {
          fakeToday = new Date(Date.UTC(2016, 1, 1, 23, 59, 59, 999));
          fakeStartDate = new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0));
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(0);
        });
      });

      describe('getTrials with customerName search string', function () {
        it('should successfully return 17 active device trials  with customerName search', function () {
          this.TrialService.getTrialsList('searchStr').then(function (response) {
            expect(response.data.activeDeviceTrials).toBe(17);
            expect(response.data.maxDeviceTrials).toBe(20);
            expect(response.status).toBe(200);
          });
          this.$httpBackend.flush();
        });
      });

      describe('start date falls on a day before the current date', function () {
        it('should return 1', function () {
          fakeStartDate = new Date('2016-01-31T00:00:00.000Z');
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date('2016-01-31T23:59:59.999Z');
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date(Date.UTC(2016, 0, 31));
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });

        it('should return 1', function () {
          fakeStartDate = new Date(Date.UTC(2016, 0, 31, 23, 59, 59, 999));
          expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(1);
        });
      });

      it('should return correct number of days between start date and current date', function () {
        fakeStartDate = new Date('2016-01-01T00:00:00.000Z');
        expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(31);

        fakeStartDate = new Date('2015-01-01T00:00:00.000Z');
        expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(396);
      });

      it('should return -1, if start date is 1 day ahead of current date', function () {
        // no guard against future date is provided
        fakeStartDate = new Date('2016-02-02T00:00:00.000Z');
        expect(this.TrialService.calcDaysUsed(fakeStartDate, fakeToday)).toBe(-1);
      });
    });

    describe('shallow validation', function () {
      var org = 'organizationName';
      var email = 'endCustomerEmail';
      var valData;

      function expectShallowVal(type, result) {
        this.TrialService.shallowValidation(type, 'Test Name').then(function (response) {
          expect(response).toEqual(result);
        });
      }

      beforeEach(function () {
        valData = {
          properties: [{
            key: org,
            value: 'Test Name',
            isValid: 'true',
            isExist: 'false',
          }],
        };
      });

      afterEach(function () {
        this.$httpBackend.flush();
      });

      it('should return unique', function () {
        this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke').respond(JSON.stringify(valData));
        expectShallowVal.call(this, org, {
          unique: true,
        });
      });

      it('should allow for duplicate org names now', function () {
        valData.properties[0].isExist = 'true';
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke').respond(JSON.stringify(valData));
        expectShallowVal.call(this, org, {
          unique: true,
        });
      });

      it('should return error invalid name', function () {
        valData.properties[0].isValid = 'false';
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke').respond(JSON.stringify(valData));
        expectShallowVal.call(this, org, {
          error: 'trialModal.errorInvalidName',
        });
      });

      it('should return error invalid', function () {
        valData.properties[0].key = email;
        valData.properties[0].isValid = 'false';
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke').respond(JSON.stringify(valData));
        expectShallowVal.call(this, email, {
          error: 'trialModal.errorInvalid',
        });
      });

      it('should return error server down', function () {
        valData = {};
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke').respond(JSON.stringify(valData));
        expectShallowVal.call(this, org, {
          error: 'trialModal.errorServerDown',
        });
      });

      it('should return error server down (501)', function () {
        this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'orders/actions/shallowvalidation/invoke', function () {
          return valData;
        }).respond(501);
        expectShallowVal.call(this, org, {
          error: 'trialModal.errorServerDown',
          status: 501,
        });
      });
    });
  });
});
