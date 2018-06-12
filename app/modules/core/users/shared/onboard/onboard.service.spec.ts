import { IOnboardedUserResult, IUserProvisionStatusResponse, IUserStatusResponse, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';

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

  // TODO (mipark2): relocate 'isEmailAlreadyPresent()' once 'users.add' UI state is decoupled from 'OnboardCtrl'
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
      const fakeUsersList = ['fake-user-1'];
      const fakeEntitlementsList = 'fake-entitlements-list';
      const fakeLicensesList = 'fake-licenses-list';
      const fakeOptions = {
        onboardMethod: 'fake-onboard-method',
        chunkSize: 1,
      };
      const fakeOnboardResponse = {
        status: 200,
        data: { userResponse: 'fake-Userservice.onboardUsers-result' },
      };
      const fakeParsedResponse = 'fake-parsed-response';
      const fakeAggResponse = {
        numAddedUsers: 1,
        numUpdatedUsers: 1,
        results: { errors: 0 },
      };

      spyOn(this.Userservice, 'onboardUsers').and.returnValue(this.$q.resolve(fakeOnboardResponse));
      spyOn(this.OnboardService, 'parseOnboardedUsers').and.returnValue(fakeParsedResponse);
      spyOn(this.OnboardService, 'aggregateResponses').and.returnValue(fakeAggResponse);
      spyOn(this.OnboardService, 'trackOnboardSaveEvent');

      this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions)
        .then((result) => {
          expect(result).toEqual(fakeAggResponse);
          expect(this.Userservice.onboardUsers.calls.count()).toBe(1);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(1);
          expect(this.OnboardService.parseOnboardedUsers).toHaveBeenCalledWith(fakeOnboardResponse);
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([fakeParsedResponse]);
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        })
        .then(() => {
          // user list bigger than chunk size (user list length: 2, chunk size: 1)
          fakeUsersList.push('fake-user-2');
          this.Userservice.onboardUsers.calls.reset();
          this.OnboardService.parseOnboardedUsers.calls.reset();
          this.OnboardService.trackOnboardSaveEvent.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions);
        })
        .then((result) => {
          // resolved value is always the return value of 'aggregateResponses()' (spied for this test)
          expect(result).toEqual(fakeAggResponse);

          // two requests were sent
          expect(this.Userservice.onboardUsers.calls.count()).toBe(2);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(2);

          // so we have two http responses to aggregate
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([
            fakeParsedResponse,
            fakeParsedResponse,
          ]);

          // but we still only track a single event
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        })
        .then(() => {
          // user list and batch size equal (user list length: 2, batch size: 2)
          fakeOptions.chunkSize = 2;
          this.Userservice.onboardUsers.calls.reset();
          this.OnboardService.parseOnboardedUsers.calls.reset();
          this.OnboardService.trackOnboardSaveEvent.calls.reset();
          return this.OnboardService.onboardUsersInChunks(fakeUsersList, fakeEntitlementsList, fakeLicensesList, fakeOptions);
        })
        .then((result) => {
          expect(result).toEqual(fakeAggResponse);

          // only 1 request is sent
          expect(this.Userservice.onboardUsers.calls.count()).toBe(1);
          expect(this.OnboardService.parseOnboardedUsers.calls.count()).toBe(1);

          // only 1 http response to aggregate
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([fakeParsedResponse]);

          // and still only track the event once
          expect(this.OnboardService.trackOnboardSaveEvent.calls.count()).toBe(1);
        })
        .catch(fail);
      this.$scope.$apply();
    });
  });

  describe('parseOnboardedUsers():', () => {
    it('should return a results object that has aggregated counts of users added and users updated', function () {
      const fakeUserResults: IOnboardedUserResult[] = [];
      const onboardedUsersResponse = {
        data: {
          userResponse: fakeUserResults,
        },
      };
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
      });
      let result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
      expect(result.numAddedUsers).toBe(0);
      expect(result.numUpdatedUsers).toBe(1);

      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 201,
      });
      result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
      expect(result.numAddedUsers).toBe(1);
      expect(result.numUpdatedUsers).toBe(1);

      // any http status that is not 200 or 201 does not add to counts
      fakeUserResults.push({
        email: 'fake-email-3',
        httpStatus: 400,
      });
      result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
      expect(result.numAddedUsers).toBe(1);
      expect(result.numUpdatedUsers).toBe(1);
    });

    it('should return a results object with a "resultList" property that is a list of parsed user results', function () {
      const fakeUserResults: IOnboardedUserResult[] = [];
      const onboardedUsersResponse = {
        data: {
          userResponse: fakeUserResults,
        },
      };
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
      });
      let result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
      expect(result.resultList.length).toBe(1);

      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 201,
      });
      fakeUserResults.push({
        email: 'fake-email-3',
        httpStatus: 400,
      });
      result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
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
      const onboardedUsersResponse = {
        data: {
          userResponse: fakeUserResults,
        },
      };
      fakeUserResults.push({
        email: 'fake-email-1',
        httpStatus: 200,
        message: '700000',  // <- magic error code from API (indicates user was onboarded without licenses)
      });
      fakeUserResults.push({
        email: 'fake-email-2',
        httpStatus: 400,    // <- any non-{200,201} status is an onboarding error
      });
      const result = this.OnboardService.parseOnboardedUsers(onboardedUsersResponse);
      expect(result.resultList[0].warningMsg).toBe('fake-addErrorWithTrackingID-result');
      expect(result.resultList[0].errorMsg).not.toBeDefined();
      expect(result.resultList[1].warningMsg).not.toBeDefined();
      expect(result.resultList[1].errorMsg).toBe('fake-addErrorWithTrackingID-result');
      expect(this.UserCsvService.addErrorWithTrackingID.calls.count()).toBe(2);
    });
  });

  describe('convertUsersInChunks():', () => {
    it('should chunk user list, call "Userservice.migrateUsers()" per list, and update migrated users as needed', function () {
      const fakeUserList = ['fake-user-1'];
      const fakeLicenseList = ['fake-license-1'];
      const fakeEntitlementList = ['fake-entitlement-1'];
      const fakeOptions = {
        chunkSize: 1,
        shouldUpdateUsers: true,
        licenseList: fakeLicenseList,
        entitlementList: fakeEntitlementList,
      };
      const fakeMigrateUsersResponse = 'fake-migrate-users-response';
      const fakeUpdateMigratedUsersResponse = 'fake-update-migrated-users-response';
      const fakeParseMigratedUsersResponse = 'fake-parse-migrated-users-response';
      const fakeAggregateResponse = {
        numUpdatedUsers: 1,
        numAddedUsers: 0,
        results: {
          resultList: [],
          warnings: [],
          errors: [],
        },
      };

      spyOn(this.Userservice, 'migrateUsers').and.returnValue(this.$q.resolve(fakeMigrateUsersResponse));
      spyOn(this.OnboardService, 'updateMigratedUsers').and.returnValue(fakeUpdateMigratedUsersResponse);
      spyOn(this.OnboardService, 'parseMigratedUsers').and.returnValue(fakeParseMigratedUsersResponse);
      spyOn(this.OnboardService, 'aggregateResponses').and.returnValue(fakeAggregateResponse);
      spyOn(this.OnboardService, 'trackConvertUsersEvent');

      this.resetSpies = () => {
        this.Userservice.migrateUsers.calls.reset();
        this.OnboardService.updateMigratedUsers.calls.reset();
        this.OnboardService.parseMigratedUsers.calls.reset();
        this.OnboardService.aggregateResponses.calls.reset();
        this.OnboardService.trackConvertUsersEvent.calls.reset();
      };

      this.OnboardService.convertUsersInChunks(fakeUserList, fakeOptions)
        .then(result => {
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserList);
          expect(this.OnboardService.updateMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse, fakeUserList, fakeLicenseList, fakeEntitlementList);
          expect(this.OnboardService.parseMigratedUsers).not.toHaveBeenCalled();
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([fakeUpdateMigratedUsersResponse]);
          expect(this.OnboardService.trackConvertUsersEvent).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeAggregateResponse);
        })
        .then(() => {
          this.resetSpies();

          return this.OnboardService.convertUsersInChunks(fakeUserList, _.assignIn({}, fakeOptions, {
            shouldUpdateUsers: false,
          }));
        })
        .then(result => {
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserList);
          expect(this.OnboardService.updateMigratedUsers).not.toHaveBeenCalled();
          expect(this.OnboardService.parseMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse);
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([fakeParseMigratedUsersResponse]);
          expect(this.OnboardService.trackConvertUsersEvent).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeAggregateResponse);
        })
        .then(() => {
          this.resetSpies();

          fakeUserList.push('fake-user-2');
          return this.OnboardService.convertUsersInChunks(fakeUserList, fakeOptions);
        })
        .then(result => {
          const fakeUserListChunk1 = [fakeUserList[0]];
          const fakeUserListChunk2 = [fakeUserList[1]];

          expect(this.Userservice.migrateUsers).toHaveBeenCalledTimes(2);
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserListChunk1);
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserListChunk2);
          expect(this.OnboardService.updateMigratedUsers).toHaveBeenCalledTimes(2);
          expect(this.OnboardService.updateMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse, fakeUserListChunk1, fakeLicenseList, fakeEntitlementList);
          expect(this.OnboardService.updateMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse, fakeUserListChunk2, fakeLicenseList, fakeEntitlementList);
          expect(this.OnboardService.parseMigratedUsers).not.toHaveBeenCalled();
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([
            fakeUpdateMigratedUsersResponse,
            fakeUpdateMigratedUsersResponse,
          ]);
          expect(this.OnboardService.trackConvertUsersEvent).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeAggregateResponse);
        })
        .then(() => {
          this.resetSpies();

          return this.OnboardService.convertUsersInChunks(fakeUserList, _.assignIn({}, fakeOptions, {
            shouldUpdateUsers: false,
          }));
        })
        .then(result => {
          const fakeUserListChunk1 = [fakeUserList[0]];
          const fakeUserListChunk2 = [fakeUserList[1]];

          expect(this.Userservice.migrateUsers).toHaveBeenCalledTimes(2);
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserListChunk1);
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserListChunk2);
          expect(this.OnboardService.updateMigratedUsers).not.toHaveBeenCalled();
          expect(this.OnboardService.parseMigratedUsers).toHaveBeenCalledTimes(2);
          expect(this.OnboardService.parseMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse);
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([
            fakeParseMigratedUsersResponse,
            fakeParseMigratedUsersResponse,
          ]);
          expect(this.OnboardService.trackConvertUsersEvent).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeAggregateResponse);
        })
        .then(() => {
          this.resetSpies();

          return this.OnboardService.convertUsersInChunks(fakeUserList, _.assignIn({}, fakeOptions, {
            chunkSize: 2,
          }));
        })
        .then(result => {
          expect(this.Userservice.migrateUsers).toHaveBeenCalledWith(fakeUserList);
          expect(this.OnboardService.updateMigratedUsers).toHaveBeenCalledWith(fakeMigrateUsersResponse, fakeUserList, fakeLicenseList, fakeEntitlementList);
          expect(this.OnboardService.parseMigratedUsers).not.toHaveBeenCalled();
          expect(this.OnboardService.aggregateResponses).toHaveBeenCalledWith([fakeUpdateMigratedUsersResponse]);
          expect(this.OnboardService.trackConvertUsersEvent).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeAggregateResponse);
        })
        .catch(fail);
      this.$scope.$apply();
    });
  });

  describe('updateMigratedUsers():', () => {
    it('should return the parsed migrated users results if none of the migrates were successful', function () {
      const fakeMigratedUsers = 'fake-migrated-users';
      const fakeParseMigratedUsersResponse = {
        resultList: [{
          email: 'fake-user-1',
          errorMsg: 'fake-error-msg',
        }],
      };
      spyOn(this.OnboardService, 'parseMigratedUsers').and.returnValue(fakeParseMigratedUsersResponse);
      spyOn(this.Userservice, 'updateUsers');

      const result = this.OnboardService.updateMigratedUsers(fakeMigratedUsers);
      expect(this.OnboardService.parseMigratedUsers).toHaveBeenCalledWith(fakeMigratedUsers);
      expect(result).toEqual(fakeParseMigratedUsersResponse);
      expect(this.Userservice.updateUsers).not.toHaveBeenCalled();
    });

    it('should call "Userservice.updateUsers()" as needed on successfully migrated users', function () {
      const fakeMigratedUsers = 'fake-migrated-users';
      const fakeOrigUsersList = [{
        userName: 'fake-user-1',
      }, {
        userName: 'fake-user-2',
      }];
      const fakeLicenseList = 'fake-license-list';
      const fakeEntitlementList = 'fake-entitlement-list';
      const fakeParseMigratedUsersResponse = {
        resultList: [{
          email: 'fake-user-1',
          errorMsg: 'fake-error-msg',
        }, {
          email: 'fake-user-2',
        }],
      };
      const fakeUpdateUsersResponse = 'fake-update-users-response';
      const fakeParseUpdatedUsersResponse = {
        resultList: [{
          email: 'fake-updated-user-2',
        }],
      };
      spyOn(this.OnboardService, 'parseMigratedUsers').and.returnValue(fakeParseMigratedUsersResponse);
      spyOn(this.Userservice, 'updateUsers').and.returnValue(this.$q.resolve(fakeUpdateUsersResponse));
      spyOn(this.OnboardService, 'parseUpdatedUsers').and.returnValue(fakeParseUpdatedUsersResponse);

      this.OnboardService.updateMigratedUsers(fakeMigratedUsers, fakeOrigUsersList, fakeLicenseList, fakeEntitlementList)
        .then(result => {
          expect(this.OnboardService.parseMigratedUsers).toHaveBeenCalledWith(fakeMigratedUsers);
          expect(this.Userservice.updateUsers).toHaveBeenCalledWith([{
            address: 'fake-user-2',
            assignedDn: undefined,
            externalNumber: undefined,
          }],
            fakeLicenseList,
            fakeEntitlementList,
          );
          expect(this.OnboardService.parseUpdatedUsers).toHaveBeenCalledWith(fakeUpdateUsersResponse);
          expect(result).toEqual({
            resultList: [{
              email: 'fake-user-1',
              errorMsg: 'fake-error-msg',
            }, {
              email: 'fake-updated-user-2',
            }],
          });
        })
        .catch(fail);
      this.$scope.$apply();
    });
  });

  describe('parseUpdatedUsers():', () => {
    it('should return a parsed user result according the http status of each user', function () {
      const fakeUserList: IUserProvisionStatusResponse[] = [];
      const updatedUserResponse = {
        data: {
          userResponse: fakeUserList,
        },
      };

      spyOn(this.UserCsvService, 'addErrorWithTrackingID').and.returnValue('error-message');

      let result = this.OnboardService.parseUpdatedUsers(updatedUserResponse);
      expect(result.numUpdatedUsers).toBe(0);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList.length).toBe(0);

      fakeUserList.push({
        email: 'fake-user-1',
        httpStatus: 200,
      });
      result = this.OnboardService.parseUpdatedUsers(updatedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList[0].email).toBe('fake-user-1');
      expect(result.resultList[0].alertType).toBe('success');

      fakeUserList.push({
        email: 'fake-user-2',
        httpStatus: 201,
      });
      result = this.OnboardService.parseUpdatedUsers(updatedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(1);
      expect(result.resultList[1].email).toBe('fake-user-2');
      expect(result.resultList[1].alertType).toBe('success');

      fakeUserList.push({
        email: 'fake-user-3',
        httpStatus: 500,
      });
      result = this.OnboardService.parseUpdatedUsers(updatedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(1);
      expect(result.resultList[2].email).toBe('fake-user-3');
      expect(result.resultList[2].alertType).toBe('danger');
      expect(result.resultList[2].errorMsg).toBe('error-message');
    });
  });

  describe('parseMigratedUsers():', () => {
    it('should return a parsed user result according the http status of each user', function () {
      const fakeUserList: IUserStatusResponse[] = [];
      const migratedUserResponse = {
        data: {
          userResponse: fakeUserList,
        },
      };

      let result = this.OnboardService.parseMigratedUsers(migratedUserResponse);
      expect(result.numUpdatedUsers).toBe(0);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList.length).toBe(0);

      fakeUserList.push({
        email: 'fake-user-1',
        httpStatus: 200,
      });
      result = this.OnboardService.parseMigratedUsers(migratedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList[0].email).toBe('fake-user-1');
      expect(result.resultList[0].alertType).toBe('success');

      fakeUserList.push({
        email: 'fake-user-2',
        httpStatus: 201,
      });
      result = this.OnboardService.parseMigratedUsers(migratedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList[1].email).toBe('fake-user-2');
      expect(result.resultList[1].alertType).toBe('danger');
      expect(result.resultList[1].errorMsg).toBe('fake-user-2 homePage.convertError');

      fakeUserList.push({
        email: 'fake-user-3',
        httpStatus: 500,
      });
      result = this.OnboardService.parseMigratedUsers(migratedUserResponse);
      expect(result.numUpdatedUsers).toBe(1);
      expect(result.numAddedUsers).toBe(0);
      expect(result.resultList[2].email).toBe('fake-user-3');
      expect(result.resultList[2].alertType).toBe('danger');
      expect(result.resultList[2].errorMsg).toBe('fake-user-3 homePage.convertError');
    });
  });

  describe('aggregateResponses():', () => {
    it('should combine properties from one or more http responses and return an aggregate result', function () {
      const fakeOnboardUsersHttpResponses: any = [];
      fakeOnboardUsersHttpResponses.push({
        numUpdatedUsers: 0,
        numAddedUsers: 1,
        resultList: ['fake-newly-added-user-1'],
      });

      let result = this.OnboardService.aggregateResponses(fakeOnboardUsersHttpResponses);
      expect(result.numUpdatedUsers).toBe(0);
      expect(result.numAddedUsers).toBe(1);
      expect(result.results.resultList).toEqual(['fake-newly-added-user-1']);
      expect(result.results.errors).toEqual([]);
      expect(result.results.warnings).toEqual([]);

      fakeOnboardUsersHttpResponses.push({
        numUpdatedUsers: 1,
        numAddedUsers: 2,
        resultList: ['fake-newly-added-user-2', 'fake-newly-added-user-3', 'fake-updated-user-4'],
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
        resultList: [
          { warningMsg: 'fake-warningMsg-1' },
          { warningMsg: 'fake-warningMsg-2' },
          { errorMsg: 'fake-errorMsg-1' },
        ],
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
        resultList: [
          { warningMsg: 'fake-warningMsg-3' },
          { errorMsg: 'fake-errorMsg-2' },
          { errorMsg: 'fake-errorMsg-3' },
        ],
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

  describe('trackConvertUsersEvent():', () => {
    it('should call "LogMetricsService.logMetrics()"', function () {
      spyOn(this.LogMetricsService, 'logMetrics');

      this.OnboardService.trackConvertUsersEvent({
        numUpdatedUsers: 'fake-updated-users',
        numTotalUsers: 'fake-total-users',
        startTime: 'fake-start-time',
      });

      expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
        'Migrated fake-updated-users users',
        jasmine.any(String), // eventType
        jasmine.any(String), // eventAction
        200,
        'fake-start-time',
        'fake-updated-users',
        {
          totalUsers: 'fake-total-users',
          successfullyConverted: 'fake-updated-users',
        },
      );
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

  describe('toEntitlementItem():', () => {
    it('should return an object usable for a request payload for making changes to a user entitlement', function () {
      spyOn(this.OnboardService, 'toEntitlementState').and.returnValue('fake-toEntitlementState-result');
      expect(this.OnboardService.toEntitlementItem('foo', true)).toEqual({
        entitlementName: 'foo',
        entitlementState: 'fake-toEntitlementState-result',
      });
      expect(this.OnboardService.toEntitlementItem('bar', false)).toEqual({
        entitlementName: 'bar',
        entitlementState: 'fake-toEntitlementState-result',
      });
      expect(this.OnboardService.toEntitlementItem('baz')).toEqual({
        entitlementName: 'baz',
        entitlementState: 'fake-toEntitlementState-result',
      });
    });
  });

  describe('toEntitlementState():', () => {
    it('should return either "ACTIVE" or "INACTIVE" depending on the truthiness of the param', function () {
      expect(this.OnboardService.toEntitlementState(true)).toBe(UserEntitlementState.ACTIVE);
      expect(this.OnboardService.toEntitlementState(false)).toBe(UserEntitlementState.INACTIVE);
      expect(this.OnboardService.toEntitlementState(null)).toBe(UserEntitlementState.INACTIVE);
      expect(this.OnboardService.toEntitlementState(undefined)).toBe(UserEntitlementState.INACTIVE);
      expect(this.OnboardService.toEntitlementState()).toBe(UserEntitlementState.INACTIVE);
    });
  });
});
