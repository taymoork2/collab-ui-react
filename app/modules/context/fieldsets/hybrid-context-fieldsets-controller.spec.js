'use strict';

describe('HybridContextFieldsetsCtrl', function () {
  var PropertyConstants = require('modules/context/services/context-property-service').PropertyConstants;
  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;
  var MOCK_ORG_ID = 'mocked-org-id';

  var $controller, $scope, $state, $q, Authinfo, controller, ContextFieldsetsService, Log, Notification, PropertyService, ContextAdminAuthorizationService, $translate;
  var fakeGridApi = {
    infiniteScroll: {
      dataLoaded: jasmine.createSpy('dataLoaded'),
      on: {
        needLoadMoreData: jasmine.createSpy('needLoadMoreData'),
      },
    },
    selection: {
      on: {
        rowSelectionChanged: function () {},
      },
    },
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterAll(function () {
    $controller = $scope = $state = $q = $translate = Authinfo = controller = ContextFieldsetsService = Log = Notification = PropertyService = fakeGridApi = ContextAdminAuthorizationService = undefined;
  });

  function dependencies($rootScope, _$controller_, _$q_, _$translate_, _$state_, _Authinfo_, _ContextFieldsetsService_, _Log_, _Notification_, _PropertyService_, _ContextAdminAuthorizationService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    Authinfo = _Authinfo_;
    ContextFieldsetsService = _ContextFieldsetsService_;
    Log = _Log_;
    Notification = _Notification_;
    Authinfo = _Authinfo_;
    PropertyService = _PropertyService_;
    ContextAdminAuthorizationService = _ContextAdminAuthorizationService_;
    $translate = _$translate_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(ContextFieldsetsService, 'getFieldsets').and.returnValue($q.resolve([]));
    spyOn(Log, 'debug');
    spyOn(Notification, 'error');
    spyOn(Authinfo, 'getOrgName').and.returnValue('orgName');
    spyOn(PropertyService, 'getProperty').and.returnValue($q.resolve(PropertyConstants.MAX_FIELDSETS_DEFAULT_VALUE));
    spyOn(Authinfo, 'getOrgId').and.returnValue(MOCK_ORG_ID);
    spyOn(ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
  }

  function initController() {
    var ctrl = $controller('HybridContextFieldsetsCtrl', {
      $scope: $scope,
      hasContextDictionaryEditFeatureToggle: false,
    });
    ctrl.gridOptions.onRegisterApi(fakeGridApi);
    return ctrl;
  }

  describe('init controller', function () {
    it('should set the default value', function () {
      controller = initController();
      expect(controller.load).toEqual(true);
    });
  });

  describe('createFieldset', function () {
    it('should correctly transition to the next state', function () {
      var controller = initController();
      controller.createFieldset();
      expect($state.go).toHaveBeenCalledWith('context-fieldset-modal', jasmine.any(Object));
    });
  });

  describe('get fieldset list options', function () {
    it('should set the gridOptions data correctly when fieldset list is resolved', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
        ],
        publiclyAccessibleUI: false,
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      }, {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aa2 custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD2',
          'Agent_ID',
        ],
        publiclyAccessibleUI: false,
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD2',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aa2_custom_fieldset',
        id: 'aa2_custom_fieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      }]));
      ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
      controller = initController();
      $scope.$apply();

      expect(controller.load).toEqual(false);
      expect(controller.fieldsetsList.allFieldsets.length).toBe(2);
      expect(controller.noSearchResults).toBeFalsy('noSearchResults is not false');
    });

    it('should call Notification error and log debug message when the fieldset list call fails', function () {
      var err = 'server error';
      ContextFieldsetsService.getFieldsets.and.returnValue($q.reject(err));
      controller = initController();
      $scope.$apply();
      expect(Log.debug).toHaveBeenCalledWith('CS fieldsets search failed. Status: ' + err);
      expect(Notification.error).toHaveBeenCalledWith('context.dictionary.fieldsetPage.fieldsetReadFailed');
    });
  });

  describe('process fieldsets', function () {
    it('should process fieldset data when data returned and publiclyAccessible', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD',
        ],
        publiclyAccessible: true,
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
      }]));
      controller = initController();
      $scope.$apply();

      expect(controller.fieldsetsList.allFieldsets.length).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].numOfFields).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].lastUpdated).not.toExist();
      expect(controller.fieldsetsList.allFieldsets[0].publiclyAccessible).toEqual(true);
      expect(controller.fieldsetsList.allFieldsets[0].publiclyAccessibleUI).toEqual('context.dictionary.base');
    });

    it('should process fieldset data when data returned is missing lastUpdate', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD',
        ],
        publiclyAccessible: false,
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
      }]));
      controller = initController();
      $scope.$apply();

      expect(controller.fieldsetsList.allFieldsets.length).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].numOfFields).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].lastUpdated).not.toExist();
      expect(controller.fieldsetsList.allFieldsets[0].publiclyAccessible).toEqual(false);
      expect(controller.fieldsetsList.allFieldsets[0].publiclyAccessibleUI).toEqual('orgName');
    });

    it('should process fieldset data when data returned has multiple fields', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD1',
          'AAA_TEST_FIELD2',
          'AAA_TEST_FIELD3',
          'AAA_TEST_FIELD4',
          'AAA_TEST_FIELD5',
        ],
        publiclyAccessibleUI: false,
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD1',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD2',
            lastUpdated: '2017-02-03T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD3',
            lastUpdated: '2017-02-04T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-02-05T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD5',
            lastUpdated: '2017-02-06T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      }]));
      controller = initController();
      $scope.$apply();

      expect(controller.fieldsetsList.allFieldsets.length).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].numOfFields).toBe(5);
      expect(controller.fieldsetsList.allFieldsets[0].lastUpdated).not.toBeNull();
    });

    it('should process fieldset data when data returned is missing field definition', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        publiclyAccessibleUI: false,
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      }]));
      controller = initController();
      $scope.$apply();

      expect(controller.fieldsetsList.allFieldsets.length).toBe(1);
      expect(controller.fieldsetsList.allFieldsets[0].numOfFields).toBe(0);
      expect(controller.fieldsetsList.allFieldsets[0].lastUpdated).not.toBeNull();
    });
  });

  describe('filterListBySearchStr', function () {
    it('should filter out the correct number of fieldsets when the search string is a number and is found in some columns', function (done) {
      controller = initController();
      $scope.$apply();

      var fieldsetList = [{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '4 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
          'AAA_TEST_FIELD5',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'AAA_TEST_FIELD5',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchInLastUpdated',
        id: 'strMatchInLastUpdated',
        lastUpdated: '2017-02-15T19:37:36.998Z',
        numOfFields: '4',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '2 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/fieldset5',
        id: 'fieldset5',
        lastUpdated: '2017-02-10T19:37:36.998Z',
        numOfFields: '2',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '2 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD5',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD5',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/notThisfieldset',
        id: 'notThisfieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
        numOfFields: '2',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'number 5 in description',
        fields: [
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchInDescription',
        id: 'strMatchInDescription',
        lastUpdated: '2017-02-10T19:37:36.998Z',
        numOfFields: '1',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'lots of fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD2',
          'Agent_ID2',
          'AAA_TEST_FIELD3',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD2',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD3',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
          {
            id: 'Agent_ID2',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchViaNumFields',
        id: 'strMatchViaNumFields',
        lastUpdated: '2017-02-12T19:37:36.998Z',
        numOfFields: '5',
      }];

      controller.filterBySearchStr(fieldsetList, '5')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(4);
          expect(filteredList[0].id).toEqual('strMatchInLastUpdated');
          expect(filteredList[1].id).toEqual('fieldset5');
          expect(filteredList[2].id).toEqual('strMatchInDescription');
          expect(filteredList[3].id).toEqual('strMatchViaNumFields');
          done();
        }).catch(done.fail);
      $scope.$apply();
    });

    it('should filter only when the search string is found case insensitive in the specified columns but not in unsearchable columns', function (done) {
      controller = initController();
      $scope.$apply();

      var fieldsetList = [{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '4 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
          'AAA_TEST_FIELD5',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'AAA_TEST_FIELD5',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/August',
        id: 'August',
        lastUpdated: '2017-02-15T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'auGuST - first 2 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchInDescription',
        id: 'strMatchInDescription',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '2 fields in this fieldset',
        fields: [
          'AUGUST',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AUGUST',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/notThisfieldset',
        id: 'notThisfieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'number 5 in description',
        fields: [
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchInLastUpdated',
        id: 'strMatchInLastUpdated',
        lastUpdated: '2017-08-23T16:48:50.021Z',
      },
      {
        otherKey1: 'August',
        otherKey2: 'august',
        otherKey3: 'anyOtherAugust',
      }];

      controller.filterBySearchStr(fieldsetList, 'august')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(3);
          expect(filteredList[0].id).toEqual('August');
          expect(filteredList[1].id).toEqual('strMatchInDescription');
          expect(filteredList[2].id).toEqual('strMatchInLastUpdated');
          done();
        }).catch(done.fail);
      $scope.$apply();
    });

    it('should filter by exact match with the search string despite the list contains the same text with different delimiters', function (done) {
      controller = initController();
      $scope.$apply();

      var fieldsetList = [{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '4 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
          'AAA_TEST_FIELD5',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'AAA_TEST_FIELD5',
            lastUpdated: '2017-02-02T21:22:35.106Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/AAA_TEST_FIELDSET',
        id: 'AAA_TEST_FIELDSET',
        lastUpdated: '2017-02-15T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'TeSt 2 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/AAA.TEST.FIELDSET',
        id: 'AAA.TEST.FIELDSET',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'Aaa_Test fieldset',
        fields: [
          'aaa.test',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'aaa.test',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/strMatchInDescription',
        id: 'strMatchInDescription',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa test',
        fields: [
          'aaa_test',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'aaa_test',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/shouldNotMatch',
        id: 'shouldNotMatch',
        lastUpdated: '2017-01-23T16:48:50.021Z',
      },
      {
        otherKey1: 'aaa-test',
        otherKey2: 'aaa_test',
        otherKey3: 'anyOtherFirst',
        id: 'SearchStrInOtherFields',
      }, {
        orgId: '',
        publiclyAccessibleUI: 'AAA_TEST',
        id: 'SearchStringInPubliclyAccessible',
      }];
      controller.filterBySearchStr(fieldsetList, 'aaa_test')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(3);
          expect(filteredList[0].id).toEqual('AAA_TEST_FIELDSET');
          expect(filteredList[1].id).toEqual('strMatchInDescription');
          expect(filteredList[2].id).toEqual('SearchStringInPubliclyAccessible');
          done();
        }).catch(done.fail);
      $scope.$apply();
    });

    it('should return full list when search string is empty', function (done) {
      controller = initController();
      $scope.$apply();

      var fieldsetList = [{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '4 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'Agent_ID',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'Agent_ID',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_test_fieldset',
        id: 'aaa_test_fieldset',
        lastUpdated: '2017-02-15T19:37:36.998Z',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: '2 fields in this fieldset',
        fields: [
          'AAA_TEST_FIELD',
          'AAA_TEST_FIELD4',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
          {
            id: 'AAA_TEST_FIELD4',
            lastUpdated: '2017-01-23T16:48:50.021Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/anotherFieldset',
        id: 'anotherFieldset',
        lastUpdated: '2017-02-10T19:37:36.998Z',
      }];
      controller.filterBySearchStr(fieldsetList, '')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(2);
          expect(filteredList[0].id).toEqual('aaa_test_fieldset');
          expect(filteredList[1].id).toEqual('anotherFieldset');
          done();
        }).catch(done.fail);
      $scope.$apply();
    });
  });

  describe('filterList tests', function () {
    it('should test filterList function with valid string', function () {
      ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'aaa custom fieldset with some long description description description description description',
        fields: [
          'AAA_TEST_FIELD',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'AAA_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        id: 'aaa_custom_fieldset',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'bbb custom fieldset with some description',
        fields: [
          'BBB_TEST_FIELD',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'BBB_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/bbb_custom_fieldset',
        id: 'bbb_custom_fieldset',
      },
      {
        orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
        description: 'bbb custom fieldset with some description',
        fields: [
          'CCC_TEST_FIELD',
        ],
        publiclyAccessibleUI: 'false',
        fieldDefinitions: [
          {
            id: 'BBB_TEST_FIELD',
            lastUpdated: '2017-02-02T17:12:33.167Z',
          },
        ],
        refUrl: '/dictionary/fieldset/v1/id/ccc_custom_fieldset',
        id: 'ccc_custom_fieldset',
      }]));
      controller = initController();
      $scope.$apply();

      controller.filterList('bbb');
      $scope.$apply();
      expect(controller.fieldsetsList.allFieldsets.length).toBe(3);
      expect(controller.noSearchResults).toBe(false);
      expect(controller.gridOptions.data[0].id).toEqual('bbb_custom_fieldset');
      expect(controller.gridOptions.data[1].id).toEqual('ccc_custom_fieldset');
      expect(controller.placeholder.count).toBe(2);
    });

    describe('max fieldsets allowed and admin authorized', function () {
      var MAX_FIELDSETS_PROPERTY = PropertyConstants.MAX_FIELDSETS_PROP_NAME;

      beforeEach(function () {
        ContextFieldsetsService.getFieldsets.and.returnValue($q.resolve([{
          orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
          description: 'aaa custom fieldset with some long description description description description description',
          fields: [
            'AAA_TEST_FIELD',
          ],
          publiclyAccessibleUI: 'false',
          fieldDefinitions: [
            {
              id: 'AAA_TEST_FIELD',
              lastUpdated: '2017-02-02T17:12:33.167Z',
            },
          ],
          refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
          id: 'aaa_custom_fieldset',
        },
        {
          orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
          description: 'bbb custom fieldset with some description',
          fields: [
            'BBB_TEST_FIELD',
          ],
          publiclyAccessibleUI: 'false',
          fieldDefinitions: [
            {
              id: 'BBB_TEST_FIELD',
              lastUpdated: '2017-02-02T17:12:33.167Z',
            },
          ],
          refUrl: '/dictionary/fieldset/v1/id/bbb_custom_fieldset',
          id: 'bbb_custom_fieldset',
        },
        {
          orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
          description: 'bbb custom fieldset with some description',
          fields: [
            'CCC_TEST_FIELD',
          ],
          publiclyAccessibleUI: 'false',
          fieldDefinitions: [
            {
              id: 'BBB_TEST_FIELD',
              lastUpdated: '2017-02-02T17:12:33.167Z',
            },
          ],
          refUrl: '/dictionary/fieldset/v1/id/ccc_custom_fieldset',
          id: 'ccc_custom_fieldset',
        }]));
        ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
      });

      afterEach(function () {
        expect(PropertyService.getProperty).toHaveBeenCalledWith(MAX_FIELDSETS_PROPERTY, MOCK_ORG_ID);
      });

      it('should have the default max fields', function () {
        controller = initController();
        $scope.$apply();

        expect(controller.maxFieldsetsAllowed).toBe(PropertyConstants.MAX_FIELDSETS_DEFAULT_VALUE);
        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.AUTHORIZED);
        expect(controller.showNew).toBe(true);
        expect(controller.newButtonTooltip).toBe('');
      });

      it('should overrides the max fields property and new is disabled', function () {
        PropertyService.getProperty.and.returnValue($q.resolve(2));
        controller = initController();
        $scope.$apply();

        expect(controller.maxFieldsetsAllowed).toBe(2);
        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.AUTHORIZED);
        expect(controller.showNew).toBe(false);
      });

      it('should use default max fields allowed on reject', function () {
        PropertyService.getProperty.and.returnValue($q.reject());
        controller = initController();
        $scope.$apply();

        expect(controller.maxFieldsetsAllowed).toBe(PropertyConstants.MAX_FIELDSETS_DEFAULT_VALUE);
        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.AUTHORIZED);
        expect(controller.showNew).toBe(true);
      });

      it('should set the tooltip if admin not authorized', function () {
        ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.UNAUTHORIZED));
        controller = initController();
        $scope.$apply();

        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.UNAUTHORIZED);
        expect(controller.newButtonTooltip).toBe($translate.instant('context.dictionary.fieldsetPage.notAuthorized'));
      });

      it('should set the tooltip if admin authorization is unknown ', function () {
        ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.UNKNOWN));
        controller = initController();
        $scope.$apply();

        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.UNKNOWN);
        expect(controller.newButtonTooltip).toBe($translate.instant('context.dictionary.unknownAdminAuthorizationStatus'));
      });
    });
  });

  describe('fieldset edit feature', function () {
    beforeEach(function () {
      this.injectDependencies(
        '$q',
        'ContextFieldsetsService',
        'FeatureToggleService'
      );
      this.featureSupportSpy = spyOn(this.FeatureToggleService, 'supports');
    });

    afterEach(function () {
      // NOTE: these tests can probably be removed with the next story. We only need to temporarily validate to ensure
      // these feature flags are not being checked when compiling the component/view
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('contact-center-context');
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('atlas-context-dictionary-edit');
    });

    it('should show fieldset-edit elements even if feature toggle is false', function () {
      this.featureSupportSpy.and.returnValue($q.resolve(false));
      this.compileViewTemplate('HybridContextFieldsetsCtrl', require('modules/context/fieldsets/hybrid-context-fieldsets.html'), { controllerAs: 'contextFieldsets' });
      var button = this.view.find('button'); // there's only one button for now
      expect(button).toExist();
      expect(button).toHaveClass('btn');
      expect(button).toHaveClass('btn--people'); // ok, just because that's what it is (people???)
      expect(button).toHaveText('common.new');
    });
  });
});
