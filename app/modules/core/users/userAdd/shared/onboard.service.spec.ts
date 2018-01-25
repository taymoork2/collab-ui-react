import { IOnboardedUserResult } from 'modules/core/users/shared/onboard.interfaces';

import moduleName from './index';

describe('OnboardService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'Analytics',
      'LogMetricsService',
      'OnboardService',
      'UserCsvService',
      'Userservice',
    );
  });

  beforeEach(function () {
    this.fakeEntitlements = {
      fake1: true,
      fake2: false,
      fake3: false,
    };
  });

  describe('getEntitlements():', () => {
    it('should add elements to results list only if entitlement is true:', function () {
      let result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(1);

      this.fakeEntitlements.fake2 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(2);

      this.fakeEntitlements.fake3 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(3);
    });

    it('should add elements with that have specific properties', function () {
      const result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result[0].entitlementName).toBe('fake1');
      expect(result[0].entitlementState).toBe('ACTIVE');
      expect(result[0].properties).toEqual({});
    });
  });

  // TODO (f3745): relocate 'isEmailAlreadyPresent()' once 'users.add' UI state is decoupled from 'OnboardCtrl'
  describe('isEmailAlreadyPresent():', () => {
    it('should return true if a provided email exists in in a list provided by "getTokenEmailArray()" method', function () {
      spyOn(this.OnboardService, 'getTokenEmailArray').and.returnValue(['user1@example.com']);
      expect(this.OnboardService.isEmailAlreadyPresent('user1@example.com')).toBe(true);
      expect(this.OnboardService.isEmailAlreadyPresent('user2@example.com')).toBe(false);

      this.OnboardService.getTokenEmailArray.and.returnValue([]);
      expect(this.OnboardService.isEmailAlreadyPresent('user1@example.com')).toBe(false);
    });

    it('should return false if no email-like token is present', function () {
      expect(this.OnboardService.isEmailAlreadyPresent('foo')).toBe(false);
      expect(this.OnboardService.isEmailAlreadyPresent('')).toBe(false);
    });
  });

  describe('parseUsersList():', () => {
    it('should return a parsed list of user objects with "address" and "name" properties', function () {
      expect(this.OnboardService.parseUsersList(null)).toEqual([]);
      expect(this.OnboardService.parseUsersList(undefined)).toEqual([]);
      expect(this.OnboardService.parseUsersList('user1@example.com')).toEqual([{
        address: 'user1@example.com',
        name: '',
      }]);

      expect(this.OnboardService.parseUsersList('user1@example.com, user2@example.com')).toEqual([{
        address: 'user1@example.com',
        name: '',
      }, {
        address: 'user2@example.com',
        name: '',
      }]);

      expect(this.OnboardService.parseUsersList('john doe user1@example.com, jane doe user2@example.com')).toEqual([{
        address: 'user1@example.com',
        name: 'john doe',
      }, {
        address: 'user2@example.com',
        name: 'jane doe',
      }]);
    });
  });

  describe('onboardUsersInChunks():', () => {
    it('should create sub-lists of users and call "Userservice.onboardUsers()" for each sub-list as needed', function () {
      spyOn(this.Userservice, 'onboardUsers').and.returnValue(this.$q.resolve('fake-Userservice.onboardUsers-result'));
      spyOn(this.OnboardService, 'parseOnboardedUsers');
      spyOn(this.OnboardService, 'aggregateResponses').and.returnValue('fake-aggregateResponses-result');
      spyOn(this.OnboardService, 'trackOnboardSaveEvent');
      const fakeUsersList = ['fake-user-1'];
      const fakeEntitlementsList = 'fake-entitlements-list';
      const fakeLicensesList = 'fake-licenses-list';
      const fakeOptions = {
        batchSize: 1,
      };
      this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions)
        .then((result) => {
          expect(result).toBe('fake-aggregateResponses-result');
          expect(this.Userservice.onboardUsers.calls.count()).toBe(1);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(1);
          expect(this.OnboardService.aggregateResponses.toHaveBeenCalledWith(['fake-Userservice.onboardUsers-result']));
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        })
        .then(() => {
          // user list bigger than batch size (user list length: 2, batch size: 1)
          fakeUsersList.push('fake-user-2');
          this.Userservice.onboardUsers.calls.reset();
          this.OnboardService.parseOnboardedUsers.calls.reset();
          this.OnboardService.trackOnboardSaveEvent.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions);
        })
        .then((result) => {
          // resolved value is always the return value of 'aggregateResponses()' (spied for this test)
          expect(result).toBe('fake-aggregateResponses-result');

          // two requests were sent
          expect(this.Userservice.onboardUsers.calls.count()).toBe(2);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(2);

          // so we have two http responses to aggregate
          expect(this.OnboardService.aggregateResponses.toHaveBeenCalledWith([
            'fake-Userservice.onboardUsers-result',
            'fake-Userservice.onboardUsers-result',
          ]));

          // but we still only track a single event
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        })
        .then(() => {
          // user list and batch size equal (user list length: 2, batch size: 2)
          fakeOptions.batchSize = 2;
          this.Userservice.onboardUsers.calls.reset();
          this.OnboardService.parseOnboardedUsers.calls.reset();
          this.OnboardService.trackOnboardSaveEvent.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions);
        })
        .then((result) => {
          expect(result).toBe('fake-aggregateResponses-result');

          // only 1 request is sent
          expect(this.Userservice.onboardUsers.calls.count()).toBe(1);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(1);

          // only 1 http response to aggregate
          expect(this.OnboardService.aggregateResponses.toHaveBeenCalledWith([
            'fake-Userservice.onboardUsers-result',
          ]));

          // and still only track the event once
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        });
      this.$scope.$apply();
    });
  });

  describe('parseOnboardedUsers():', () => {
    it('should return a results object that has aggregated counts of users added and users updated', function () {
      const fakeUserResults: IOnboardedUserResult[] = [];
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
      });
      let result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.numAddedUsers).toBe(0);
      expect(result.numUpdatedUsers).toBe(1);

      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 201,
      });
      result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.numAddedUsers).toBe(1);
      expect(result.numUpdatedUsers).toBe(1);

      // any http status that is not 200 or 201 does not add to counts
      fakeUserResults.push({
        email: 'fake-email-3',
        httpStatus: 400,
      });
      result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.numAddedUsers).toBe(1);
      expect(result.numUpdatedUsers).toBe(1);
    });

    it('should return a results object with a "resultList" property that is a list of parsed user results', function () {
      const fakeUserResults: IOnboardedUserResult[] = [];
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
      });
      let result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.resultList.length).toBe(1);

      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 201,
      });
      fakeUserResults.push({
        email: 'fake-email-3',
        httpStatus: 400,
      });
      result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.resultList.length).toBe(3);
      expect(result.resultList[0].email).toBe('fake-email-1');
      expect(result.resultList[1].email).toBe('fake-email-2');
      expect(result.resultList[2].email).toBe('fake-email-3');

      expect(result.resultList[0].alertType).toBe('success');
      expect(result.resultList[1].alertType).toBe('success');
      expect(result.resultList[2].alertType).toBe('danger');

      // these are technically not correct, as they are the result of '$translate.instant(...)'
      expect(result.resultList[0].message).toBe('usersPage.onboardSuccess');
      expect(result.resultList[1].message).toBe('usersPage.onboardSuccess');
      expect(result.resultList[2].message).toBe('usersPage.onboardError');
    });

    it('should contain parsed user results with "warningMsg" and "errorMsg" properties if conditions apply', function () {
      spyOn(this.UserCsvService, 'addErrorWithTrackingID').and.returnValue('fake-addErrorWithTrackingID-result');
      const fakeUserResults: IOnboardedUserResult[] = [];
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
        message: '700000',  // <- magic error code from API (indicates user was onboarded without licenses)
      });
      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 400,    // <- any non-{200,201} status is an onboarding error
      });
      const result = this.OnboardService.parseOnboardedUsers(fakeUserResults);
      expect(result.resultList[0].warningMsg).toBe('fake-addErrorWithTrackingID-result');
      expect(result.resultList[0].errorMsg).not.toBeDefined();
      expect(result.resultList[1].warningMsg).not.toBeDefined();
      expect(result.resultList[1].errorMsg).toBe('fake-addErrorWithTrackingID-result');
      expect(this.UserCsvService.addErrorWithTrackingID.calls.count()).toBe(2);
    });
  });

  describe('aggregateResponses():', () => {
    it('should combine properties from one or more http responses and return an aggregate result', function () {
      const fakeOnboardUsersHttpResponses: any = [];
      fakeOnboardUsersHttpResponses.push({
        onboardedUsers: {
          numUpdatedUsers: 0,
          numAddedUsers: 1,
          resultList: ['fake-newly-added-user-1'],
        },
      });

      let result = this.OnboardService.aggregateResponses(fakeOnboardUsersHttpResponses);
      expect(result.numUpdatedUsers).toBe(0);
      expect(result.numAddedUsers).toBe(1);
      expect(result.results.resultList).toEqual(['fake-newly-added-user-1']);
      expect(result.results.errors).toEqual([]);
      expect(result.results.warnings).toEqual([]);

      fakeOnboardUsersHttpResponses.push({
        onboardedUsers: {
          numUpdatedUsers: 1,
          numAddedUsers: 2,
          resultList: ['fake-newly-added-user-2', 'fake-newly-added-user-3', 'fake-updated-user-4'],
        },
      });
      result = this.OnboardService.aggregateResponses(fakeOnboardUsersHttpResponses);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(3);
      expect(result.results.resultList).toEqual([
        'fake-newly-added-user-1',
        'fake-newly-added-user-2',
        'fake-newly-added-user-3',
        'fake-updated-user-4',
      ]);
      expect(result.results.errors).toEqual([]);
      expect(result.results.warnings).toEqual([]);
    });

    it('should aggregate warning and error messages if present in respective responses', function () {
      const fakeOnboardUsersHttpResponses: any = [];
      fakeOnboardUsersHttpResponses.push({
        onboardedUsers: {
          resultList: [
            { warningMsg: 'fake-warningMsg-1' },
            { warningMsg: 'fake-warningMsg-2' },
            { errorMsg: 'fake-errorMsg-1' },
          ],
        },
      });

      let result = this.OnboardService.aggregateResponses(fakeOnboardUsersHttpResponses);
      expect(result.results.resultList).toEqual([
        { warningMsg: 'fake-warningMsg-1' },
        { warningMsg: 'fake-warningMsg-2' },
        { errorMsg: 'fake-errorMsg-1' },
      ]);
      expect(result.results.errors).toEqual(['fake-errorMsg-1']);
      expect(result.results.warnings).toEqual(['fake-warningMsg-1', 'fake-warningMsg-2']);

      fakeOnboardUsersHttpResponses.push({
        onboardedUsers: {
          resultList: [
            { warningMsg: 'fake-warningMsg-3' },
            { errorMsg: 'fake-errorMsg-2' },
            { errorMsg: 'fake-errorMsg-3' },
          ],
        },
      });
      result = this.OnboardService.aggregateResponses(fakeOnboardUsersHttpResponses);
      expect(result.results.resultList).toEqual([
        { warningMsg: 'fake-warningMsg-1' },
        { warningMsg: 'fake-warningMsg-2' },
        { errorMsg: 'fake-errorMsg-1' },
        { warningMsg: 'fake-warningMsg-3' },
        { errorMsg: 'fake-errorMsg-2' },
        { errorMsg: 'fake-errorMsg-3' },
      ]);
      expect(result.results.errors).toEqual([
        'fake-errorMsg-1',
        'fake-errorMsg-2',
        'fake-errorMsg-3',
      ]);
      expect(result.results.warnings).toEqual([
        'fake-warningMsg-1',
        'fake-warningMsg-2',
        'fake-warningMsg-3',
      ]);
    });
  });

  describe('trackOnboardSaveEvent():', () => {
    it('should make tracking calls as-needed', function () {
      spyOn(this.LogMetricsService, 'logMetrics');
      spyOn(this.Analytics, 'trackAddUsers');
      spyOn(this.OnboardService, 'createPropertiesForAnalytics').and.returnValue('fake-createPropertiesForAnalytics-result');
      const fakeOptions = {
        numAddedUsers: 0,
        numUpdatedUsers: 0,
        numErrors: 0,
        servicesSelected: {},
      };
      this.OnboardService.trackOnboardSaveEvent(fakeOptions);
      expect(this.LogMetricsService.logMetrics).not.toHaveBeenCalled();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.SAVE, null, 'fake-createPropertiesForAnalytics-result');

      // at least one user added, log to metrics
      fakeOptions.numAddedUsers = 1;
      this.OnboardService.trackOnboardSaveEvent(fakeOptions);
      expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
    });
  });

  describe('createPropertiesForAnalytics():', () => {
    it('should return a result composed of the given args', function () {
      const numAddedUsers = 1;
      const numUpdatedUsers = 2;
      const numErrors = 3;
      const servicesSelected = { foo: 0 };
      spyOn(this.OnboardService, 'getSelectedKeys').and.callThrough();

      const result = this.OnboardService.createPropertiesForAnalytics(numAddedUsers, numUpdatedUsers, numErrors, servicesSelected);
      expect(result).toEqual({
        numberOfErrors: 3,
        usersAdded: 1,
        usersUpdated: 2,
        servicesSelected: [],
      });
      expect(this.OnboardService.getSelectedKeys).toHaveBeenCalledWith({ foo: 0 });
    });
  });

  describe('getSelectedKeys():', () => {
    it('should return the keys whose values are explicitly true', function () {
      expect(this.OnboardService.getSelectedKeys(null)).toEqual([]);
      expect(this.OnboardService.getSelectedKeys(undefined)).toEqual([]);
      expect(this.OnboardService.getSelectedKeys()).toEqual([]);
      expect(this.OnboardService.getSelectedKeys({})).toEqual([]);
      expect(this.OnboardService.getSelectedKeys({
        foo1: true,
        foo2: 'true',
        foo3: 1,
        foo4: false,
      })).toEqual(['foo1']);
    });
  });
});
