import testModule from './index';
import { IUser } from 'modules/core/auth/user';
import { IUserPreference, IFeatureToggle } from './featureTogglesEditor.service';

interface IPreferenceOperation {
  value: string;
  operation?: string;
}

describe('Directive: selectOn', () => {

  function init() {
    this.initModules(testModule);
    this.injectDependencies('$rootScope', '$httpBackend',
      'UrlConfig', 'UserPreferencesService',
      'FeatureToggleEditorService');
    initDependencySpies.apply(this);

    this.testUser = <IUser>{
      schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
      meta: {
        location: 'http://example.com',
      },
      userPreferences: ['SparkHideLaunch'],
    };

    installPromiseMatchers();
  }

  function initDependencySpies() {
    this.userId = '24601';
    this.featureRegex = /.*\/features\/users.*\/developer/;
  }

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  //////////////////////////////

  describe('updateUserPreferences', () => {

    it('should resolve with list of userPreferences and their states', function () {

      let promise = this.FeatureToggleEditorService.updateUserPreferences(this.testUser);
      this.$rootScope.$digest();
      expect(promise).toBeResolvedWith([
        { key: 'SparkHideLaunch', value: true },
        { key: 'SparkTOSAccept', value: false },
      ]);
    });

  });

  describe('updateUserPreference', () => {

    beforeEach(function () {
      // mock patch operation so that it returns expected data
      this.$httpBackend.expectPATCH('http://example.com').respond((_method, _url, data, _headers, _param) => {
        let userData = {
          userPreferences: <Array<string>>[],
        };
        let body = JSON.parse(data);
        _.forEach(_.get(body, 'userPreferences', []), (pref: IPreferenceOperation) => {
          if (!_.isEqual(_.get(pref, 'operation'), 'delete')) {
            userData.userPreferences.push(pref.value);
          }
        });
        return [200, userData];
      });
    });

    it('should make correct call to set a user preference', function () {

      expect(this.UserPreferencesService.hasPreference(this.testUser, 'SparkTOSAccept')).toBeFalsy();

      let newPref: IUserPreference = {
        key: 'SparkTOSAccept',
        value: true,
      };

      let promise = this.FeatureToggleEditorService.updateUserPreference(this.testUser, newPref);
      promise.then((updatedUser: IUser) => {
        expect(this.UserPreferencesService.hasPreference(updatedUser, 'SparkTOSAccept')).toBeTruthy();
      });

      this.$httpBackend.flush();
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        userPreferences: ['SparkHideLaunch', 'SparkTOSAccept'],
      }));
    });

    it('should make correct call to clear a user preference', function () {

      expect(this.UserPreferencesService.hasPreference(this.testUser, 'SparkHideLaunch')).toBeTruthy();

      let newPref: IUserPreference = {
        key: 'SparkHideLaunch',
        value: false,
      };

      let promise = this.FeatureToggleEditorService.updateUserPreference(this.testUser, newPref);
      promise.then((updatedUser: IUser) => {
        expect(this.UserPreferencesService.hasPreference(updatedUser, 'SparkHideLaunch')).toBeFalsy();
      });

      this.$httpBackend.flush();
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        userPreferences: [],
      }));

    });

  });

  describe('getFeatureToggles', () => {

    it('should resolve with list of DEV feature toggles', function () {

      let toggles = {
        featureToggles: [
          { key: 'testToggle_True', mutable: true, type: 'DEV', val: 'true' },
          { key: 'testToggle_NonDEV', mutable: true, type: 'PROD', val: 'true' },
          { key: 'testToggle_False', mutable: true, type: 'DEV', val: 'false' },
        ],
      };

      this.$httpBackend.expectGET(this.featureRegex).respond(200, toggles);

      let promise = this.FeatureToggleEditorService.getFeatureToggles(this.userId);
      this.$httpBackend.flush();
      expect(promise).toBeResolvedWith([
        { key: 'testToggle_True', mutable: true, type: 'DEV', val: 'true', value: true, isUpdating: false },
        { key: 'testToggle_False', mutable: true, type: 'DEV', val: 'false', value: false, isUpdating: false },
      ]);
    });

  });

  describe('add/update/delete Toggles', () => {

    it('should call to add a toggle', function () {
      const TOGGLE_ID = 'testToggle_Id';
      let responseToggle = <IFeatureToggle>{
        key: TOGGLE_ID,
        mutable: true,
        type: 'DEV',
        val: 'false',
      };
      this.$httpBackend.expectPOST(this.featureRegex).respond(200, responseToggle);

      let promise = this.FeatureToggleEditorService.addToggle(this.userId, TOGGLE_ID);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        isUpdating: false,
        value: false,
      }));

    });

    it('should call to update a toggle', function () {
      const TOGGLE_ID = 'testToggle_Id';
      let responseToggle = <IFeatureToggle>{
        key: TOGGLE_ID,
        mutable: true,
        type: 'DEV',
        val: 'true',
      };
      this.$httpBackend.expectPOST(this.featureRegex).respond(200, responseToggle);

      let feature = {
        key: TOGGLE_ID,
        value: true,
        isUpdating: true,
      };

      let promise = this.FeatureToggleEditorService.updateToggle(this.userId, feature);
      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        key: TOGGLE_ID,
        value: true,
      }));
    });

    it('should call to deletw a toggle', function () {
      const TOGGLE_ID = 'testToggle_Id';
      let url = /.*\/features\/users.*\/developer\/testToggle_Id/;
      this.$httpBackend.expectDELETE(url).respond(204);

      let promise = this.FeatureToggleEditorService.deleteToggle(this.userId, TOGGLE_ID);
      expect(promise).toBeResolved();
    });

  });

});
