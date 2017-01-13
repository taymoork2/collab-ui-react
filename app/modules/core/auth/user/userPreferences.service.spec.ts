import testModule from './index';
import { User, UserPreferencesService } from './index';

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

    it('should PATCH user updating preferences', function () {

      this.$httpBackend.expect('PATCH', this.User.meta.location)
        .respond((method, url, data) => {

          let patchData = angular.fromJson(data);
          expect(patchData.schemas).toBeDefined();
          expect(patchData.userPreferences).toBeDefined();
          expect(patchData.userPreferences[0].value).toEqual(UserPreferencesService.USER_PREF_TOS);
          expect(patchData.userPreferences[0].operation).not.toBeDefined();
          expect(patchData.userPreferences[1].value).toEqual(UserPreferencesService.USER_PREF_LAUNCH);
          expect(patchData.userPreferences[1].operation).toEqual('delete');

          return [201, {
            method: method,
            url: url,
            data: patchData,
          }];
        });

      this.User.hideToS = true;

      let success = false;
      this.UserPreferencesService.setUserPreferences(this.User)
        .then(() => {
          success = true;
        })
        .catch(() => {
          expect('error from PATCH').toBeFalsy();
        })
        .finally(() => {
          expect(success).toBeTruthy();
        });

      this.$httpBackend.flush();

    });

  });
});
