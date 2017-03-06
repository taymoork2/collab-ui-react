'use strict';

describe('HybridContextFieldsetsCtrl', function () {

  function initExternalDependencies() {
    this.initModules('Context');
    this.injectDependencies(
      '$controller',
      '$rootScope',
      '$state',
      '$q',
      'ContextFieldsetsService',
      'Notification',
      'Log'
    );
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.$state, 'go');
    this.getFieldsetsSpy = spyOn(this.ContextFieldsetsService, 'getFieldsets');
    spyOn(this.Notification, 'error');
    spyOn(this.Log, 'debug');

    installPromiseMatchers();
  }

  function initController() {
    var _this = this;

    this.$scope = this.$rootScope.$new();

    this.ctrl = this.$controller('HybridContextFieldsetsCtrl', {
      $scope: this.$scope,
      $state: this.$state,
      ContextFieldsetsService: this.ContextFieldsetsService,
    });

    spyOn(this.ctrl, 'initializeGrid').and.callFake(function () {
      // mock gridApi
      _this.$scope.gridApi = {
        infiniteScroll: {
          dataLoaded: jasmine.createSpy().and.returnValue(),
        },
      };
      return _this.$q.resolve();
    });

    this.ctrl.init();
    expect(this.$scope.load).toBeTruthy('load is not set as true initially');

    this.$scope.$apply();
  }

  beforeEach(initExternalDependencies);

  describe('init controller', function () {

    it('should set the default value', function () {
      this.getFieldsetsSpy.and.returnValue(this.$q.resolve([]));
      initController.apply(this);
      expect(this.$scope.load).toEqual(false);
    });
  });

  describe('get fieldset list options', function () {
    it('should set the gridOptions data correctly when fieldset list is resolved', function () {
      var _this = this;

      this.getFieldsetsSpy.and.returnValue(this.$q.resolve([{
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD4',
            'lastUpdated': '2017-02-02T21:22:35.106Z',
          },
          {
            'id': 'Agent_ID',
            'lastUpdated': '2017-01-23T16:48:50.021Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }, {
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aa2 custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD2',
          'Agent_ID',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD2',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'Agent_ID',
            'lastUpdated': '2017-01-23T16:48:50.021Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aa2_custom_fieldset',
        'id': 'aa2_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }]));
      initController.apply(this);
      expect(this.$scope.load).toEqual(false);
      var promise = this.$scope.getFieldsetsList()
        .then(function () {
          expect(_this.$scope.fieldsetsList.allFields.length).toBe(2);
        });
      expect(promise).toBeResolved();
      expect(this.$scope.load).toEqual(false);
      expect(this.$scope.noSearchResults).toBeFalsy('noSearchResults is not false');
    });

    it('should call Notification error and log debug message when the fieldset list call fails', function () {
      var err = 'server error';
      this.getFieldsetsSpy.and.returnValue(this.$q.reject(err));
      initController.apply(this);
      expect(this.Log.debug).toHaveBeenCalledWith('CS fieldsets search failed. Status: ' + err);
      expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.fieldsetPage.fieldsetReadFailed');
    });
  });

  describe('process fieldsets', function () {

    it('should process fieldset data when data returned is missing lastUpdate', function () {
      var _this = this;
      this.getFieldsetsSpy.and.returnValue(this.$q.resolve([{
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldsetsList()
        .then(function () {
          expect(_this.$scope.fieldsetsList.allFields.length).toBe(1);
          expect(_this.$scope.fieldsetsList.allFields[0].numOfFields).toBe(1);
          expect(_this.$scope.fieldsetsList.allFields[0].lastUpdated).not.toExist();
        });
      expect(promise).toBeResolved();
    });

    it('should process fieldset data when data returned has multiple fields', function () {
      var _this = this;
      this.getFieldsetsSpy.and.returnValue(this.$q.resolve([{
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD1',
          'AAA_TEST_FIELD2',
          'AAA_TEST_FIELD3',
          'AAA_TEST_FIELD4',
          'AAA_TEST_FIELD5',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD1',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD2',
            'lastUpdated': '2017-02-03T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD3',
            'lastUpdated': '2017-02-04T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD4',
            'lastUpdated': '2017-02-05T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD5',
            'lastUpdated': '2017-02-06T17:12:33.167Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldsetsList()
        .then(function () {
          expect(_this.$scope.fieldsetsList.allFields.length).toBe(1);
          expect(_this.$scope.fieldsetsList.allFields[0].numOfFields).toBe(5);
          expect(_this.$scope.fieldsetsList.allFields[0].lastUpdated).not.toBeNull();
        });
      expect(promise).toBeResolved();
    });

    it('should process fieldset data when data returned is missing field definition', function () {
      var _this = this;
      this.getFieldsetsSpy.and.returnValue(this.$q.resolve([{
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'publiclyAccessible': false,
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldsetsList()
        .then(function () {
          expect(_this.$scope.fieldsetsList.allFields.length).toBe(1);
          expect(_this.$scope.fieldsetsList.allFields[0].numOfFields).toBe(0);
          expect(_this.$scope.fieldsetsList.allFields[0].lastUpdated).not.toBeNull();
        });
      expect(promise).toBeResolved();
    });

  });
});
