import testModule from './index';
import { User, UserPreferencesService } from './index';
import { IPreferenceOperation } from './userPreferences.service';

describe('UserPreferencesService Service', () => {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'UserPreferencesService',
      '$rootScope',
    );

    this.User = _.merge(new User(), {
      schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
      id: '6ccf831b-xxxx-4307-xxxx-dbd2c7xxx170',
      meta: {
        created: '2016-07-26T19:50:07.582Z',
        lastModified: '2016-09-27T14:05:40.911Z',
        version: '36645602468',
        attributes: ['extLinkedAccts'],
        location: 'https://identity.webex.com/identity/scim/b15ef877-xxxx-4a73-xxxx-ed91670422b6/v1/Users/6ccf831b-xxxx-4307-xxxx-dbd2c7xxx170',
        organizationID: 'b15ef877-901d-4a73-bab1-ed91670422b6',
      },
      displayName: 'chrisstoy+atlas.stoy.test.1@gmail.com',
      userSettings: ['{\'sparkAdmin.licensedDate\':\'1471615853573\'}'],
    });

    installPromiseMatchers();

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('hasPreference()', () => {

    it('should return false if the User does not have the specified preference', function () {

      expect(this.UserPreferencesService.hasPreference(this.User, UserPreferencesService.USER_PREF_TOS)).toBeFalsy();

      this.User.userPreferences = ['something', 'another', 'nope', 'lastPref'];
      expect(this.UserPreferencesService.hasPreference(this.User, UserPreferencesService.USER_PREF_TOS)).toBeFalsy();
    });

    it('should return true if the User has the specified preference', function () {
      this.User.userPreferences = ['something', 'another', UserPreferencesService.USER_PREF_LAUNCH, 'lastPref'];
      expect(this.UserPreferencesService.hasPreference(this.User, UserPreferencesService.USER_PREF_LAUNCH)).toBeTruthy();
    });

  });

  describe('setUserPreferences', () => {

    beforeEach(function () {

      // mock result of the PATCH call.
      this.$httpBackend.expectPATCH(this.User.meta.location)
        .respond((method, url, data) => {
          let patchData = JSON.parse(data);
          expect(patchData.schemas).toBeDefined();
          expect(patchData.userPreferences).toBeDefined();
          expect(_.some(patchData.userPreferences, (vo: IPreferenceOperation) => vo.value === UserPreferencesService.USER_PREF_TOS)).toBeTruthy();
          expect(_.some(patchData.userPreferences, (vo: IPreferenceOperation) => vo.value === UserPreferencesService.USER_PREF_LAUNCH)).toBeTruthy();

          let activePrefs = _.flatMap(patchData.userPreferences, (pref) => {
            return (_.isEqual(pref.operation, 'delete') ? null : pref.value);
          });
          let userPrefs = _.filter(activePrefs, key => !_.isNull(key));

          // return mock version of the server response
          return [201, {
            method: method,
            url: url,
            data: {
              schemas: patchData.schemas,
              userPreferences: userPrefs,
            },
          }];
        });
    });

    it('should support add new preference', function () {
      this.User.userPreferences = [];

      let promise = this.UserPreferencesService.setUserPreferences(this.User, UserPreferencesService.USER_PREF_TOS, true);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          schemas: this.User.schemas,
          userPreferences: [UserPreferencesService.USER_PREF_TOS],
        },
      }));

    });

    it('should support adding an existing preference', function () {
      this.User.userPreferences = [UserPreferencesService.USER_PREF_TOS, UserPreferencesService.USER_PREF_LAUNCH];

      let promise = this.UserPreferencesService.setUserPreferences(this.User, UserPreferencesService.USER_PREF_TOS, true);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          schemas: this.User.schemas,
          userPreferences: [UserPreferencesService.USER_PREF_LAUNCH, UserPreferencesService.USER_PREF_TOS],
        },
      }));
    });

    it('should support removing existing preference', function () {
      this.User.userPreferences = [UserPreferencesService.USER_PREF_TOS, UserPreferencesService.USER_PREF_LAUNCH];

      let promise = this.UserPreferencesService.setUserPreferences(this.User, UserPreferencesService.USER_PREF_TOS, false);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          schemas: this.User.schemas,
          userPreferences: [UserPreferencesService.USER_PREF_LAUNCH],
        },
      }));
    });

    it('should support removing non-existing preference', function () {
      this.User.userPreferences = [UserPreferencesService.USER_PREF_TOS];

      let promise = this.UserPreferencesService.setUserPreferences(this.User, UserPreferencesService.USER_PREF_LAUNCH, false);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        data: {
          schemas: this.User.schemas,
          userPreferences: [UserPreferencesService.USER_PREF_TOS],
        },
      }));
    });

  });
});
