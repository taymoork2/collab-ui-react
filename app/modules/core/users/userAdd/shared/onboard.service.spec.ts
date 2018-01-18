import { IOnboardedUserResult } from 'modules/core/users/shared/onboard.interfaces';

import moduleName from './index';

describe('OnboardService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
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
    it('should create sub-lists of users and call "Userservice.onboardUsersLegacy()" for each sub-list as needed', function () {
      spyOn(this.Userservice, 'onboardUsersLegacy').and.returnValue(this.$q.resolve({}));
      spyOn(this.OnboardService, 'parseOnboardedUsers');
      const fakeUsersList = ['fake-user-1'];
      const fakeEntitlementsList = 'fake-entitlements-list';
      const fakeLicensesList = 'fake-licenses-list';
      let batchSize = 1;
      this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, batchSize)
        .then((results) => {
          expect(results.length).toBe(1);
          expect(this.Userservice.onboardUsersLegacy.calls.count()).toBe(1);
        })
        .then(() => {
          // user list bigger than batch size (user list length: 2, batch size: 1)
          fakeUsersList.push('fake-user-2');
          this.Userservice.onboardUsersLegacy.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, batchSize);
        })
        .then((results) => {
          expect(results.length).toBe(2);
          expect(this.Userservice.onboardUsersLegacy.calls.count()).toBe(2);
        })
        .then(() => {
          // user list and batch size equal (user list length: 2, batch size: 2)
          batchSize = 2;
          this.Userservice.onboardUsersLegacy.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, batchSize);
        })
        .then((results) => {
          expect(results.length).toBe(1);
          expect(this.Userservice.onboardUsersLegacy.calls.count()).toBe(1);
        });
      this.$scope.$apply();
    });

    it('should return a list of promises whose resolved values are objects with "onboardedUsers" properties', function () {
      spyOn(this.Userservice, 'onboardUsersLegacy').and.returnValue(this.$q.resolve({}));
      spyOn(this.OnboardService, 'parseOnboardedUsers').and.returnValue('fake-parseOnboardedUsers-result');
      const fakeUsersList = ['fake-user-1'];
      const fakeEntitlementsList = 'fake-entitlements-list';
      const fakeLicensesList = 'fake-licenses-list';
      const batchSize = 1;
      this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, batchSize)
        .then((results) => {
          expect(results[0].onboardedUsers).toBe('fake-parseOnboardedUsers-result');
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
});
