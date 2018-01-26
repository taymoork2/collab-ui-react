'use strict';

var PropertyConstants = require('modules/context/services/context-property-service').PropertyConstants;
var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;

describe('HybridContextFieldsCtrl', function () {
  var $controller, $scope, $state, $q, Authinfo, controller, ContextFieldsService, Log, Notification, LogMetricsService, PropertyService, ContextAdminAuthorizationService, $translate;
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
    $controller = $scope = $state = $q = $translate = Authinfo = controller = ContextFieldsService = Log = Notification = PropertyService = fakeGridApi = LogMetricsService = ContextAdminAuthorizationService = undefined;
  });

  function dependencies($rootScope, _$controller_, _$q_, _$translate_, _$state_, _Authinfo_, _ContextFieldsService_, _Log_, _Notification_, _LogMetricsService_, _PropertyService_, _ContextAdminAuthorizationService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    Authinfo = _Authinfo_;
    ContextFieldsService = _ContextFieldsService_;
    Log = _Log_;
    Notification = _Notification_;
    LogMetricsService = _LogMetricsService_;
    Authinfo = _Authinfo_;
    PropertyService = _PropertyService_;
    ContextAdminAuthorizationService = _ContextAdminAuthorizationService_;
    $translate = _$translate_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(ContextFieldsService, 'getFields');
    spyOn(Log, 'debug');
    spyOn(Notification, 'error');
    spyOn(LogMetricsService, 'logMetrics');
    spyOn(Authinfo, 'getOrgName').and.returnValue('orgName');
    spyOn(PropertyService, 'getProperty').and.returnValue($q.resolve(PropertyConstants.MAX_FIELDS_DEFAULT_VALUE));
    spyOn(ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
  }

  function initController() {
    var ctrl = $controller('HybridContextFieldsCtrl', {
      $scope: $scope,
    });
    ctrl.gridOptions.onRegisterApi(fakeGridApi);
    return ctrl;
  }

  describe('init controller', function () {
    it('should set the default value', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([]));
      controller = initController();
      expect(controller.load).toEqual(true);
    });
  });

  describe('createField', function () {
    it('should correctly log metrics and transition to the next state', function () {
      var controller = initController();
      controller.createField();
      expect(LogMetricsService.logMetrics).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalledWith('context-field-modal', jasmine.any(Object));
    });
  });

  describe('getFields()', function () {
    it('should set the gridOptions data correctly when one field list is resolved', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        classification: 'PII Encrypted',
        dataType: 'String',
        searchable: 'Yes',
        publiclyAccessible: 'true',
        translations: { en_US: 'Agent ID' },
        locales: [],
        refUrl: '/dictionary/field/v1/id/Agent_ID',
        id: 'Agent_ID',
        lastUpdated: '01/23/2017',
      }]));
      ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
      controller = initController();
      $scope.$apply();

      expect(controller.load).toEqual(false);
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.noSearchResults).toBeFalsy('noSearchResults is not false');
    });

    it('should call Notification error and log debug message when the field list call fails', function () {
      var err = 'server error';
      ContextFieldsService.getFields.and.returnValue($q.reject(err));
      initController();
      $scope.$apply();
      expect(Log.debug).toHaveBeenCalledWith('CS fields search failed. Status: ' + err);
      expect(Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldReadFailed');
    });
  });

  describe('processFieldList()', function () {
    it('should process field data when data returned is missing dataType', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        publiclyAccessible: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'NoDataType',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].publiclyAccessible).toEqual('false');
      expect(controller.fieldsList.allFields[0].publiclyAccessibleUI).toEqual('orgName');
      expect(controller.fieldsList.allFields[0].dataTypeUI).not.toExist();
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toBeNull();
    });

    it('should process field data when data returned and publiclyAccessible', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        publiclyAccessible: 'true',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'NoDataType',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].publiclyAccessible).toEqual('true');
      expect(controller.fieldsList.allFields[0].publiclyAccessibleUI).toEqual('context.dictionary.base');
      expect(controller.fieldsList.allFields[0].dataTypeUI).not.toExist();
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toBeNull();
    });

    it('should process field data when data returned is missing lastUpdated', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        publiclyAccessible: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'NoDataType',
        dataType: 'integer',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.integer');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process field data when dataType is date time', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        publiclyAccessible: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'NoDataType',
        dataType: 'date',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.date');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is encrypted, integer, searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        description: 'Some description added for Test Integer',
        classification: 'ENCRYPTED',
        publiclyAccessible: 'false',
        searchable: 'true',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/TestInteger',
        id: 'TestInteger',
        dataType: 'integer',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.encrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.integer');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is unencrypted, boolean, missing searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        description: 'Field for TestBoolean',
        classification: 'UNENCRYPTED',
        publiclyAccessible: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'TestBoolean',
        dataType: 'boolean',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.boolean');
      expect(controller.fieldsList.allFields[0].description).toEqual('Field for TestBoolean');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is PII, double', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        description: 'Field for TestDouble',
        classification: 'PII',
        publiclyAccessible: 'false',
        searchable: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'TestDouble',
        dataType: 'double',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.piiEncrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.no');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.double');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is missing classification, boolean, missing searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        description: 'Field for NoClassification',
        publiclyAccessible: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/NoDataType',
        id: 'NoClassification',
        dataType: 'boolean',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classificationUI).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchableUI).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataTypeUI).toEqual('context.dictionary.dataTypes.boolean');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });
  });

  describe('filterList()', function () {
    it('should update grid data', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        description: 'Field for abcd',
        classification: 'PII',
        publiclyAccessible: 'false',
        searchable: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/FieldContainsSearchStr',
        id: 'FieldContainsSearchStr',
        dataType: 'double',
      }, {
        description: 'Field for xyz',
        classification: 'PII',
        publiclyAccessible: 'false',
        searchable: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        refUrl: '/dictionary/field/v1/id/FieldNotContainSearchStr',
        id: 'FieldNotContainSearchStr',
        dataType: 'double',
      }]));
      controller = initController();
      $scope.$apply();

      expect(controller.fieldsList.allFields.length).toBe(2);
      expect(controller.gridOptions.data.length).toBe(2);
      expect(controller.fieldsList.allFields[0].id).toEqual('FieldContainsSearchStr');
      expect(controller.fieldsList.allFields[1].id).toEqual('FieldNotContainSearchStr');

      controller.filterList('abcd');
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(2);
      expect(controller.gridOptions.data.length).toBe(1);
      expect(controller.gridOptions.data[0].id).toEqual('FieldContainsSearchStr');

      controller.filterList('');
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(2);
      expect(controller.gridOptions.data.length).toBe(2);
    });
  });

  describe('filterListBySearchStr()', function () {
    it('should filter out the correct number of fields when the search string as number and is found in some columns', function (done) {
      ContextFieldsService.getFields.and.returnValue($q.resolve([]));
      controller = initController();
      $scope.$apply();

      var fieldList = [{
        description: 'Field for NoClassification',
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: '2017Field',
        dataTypeUI: 'boolean',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        description: 'Field for NoClassification',
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: '2016Field',
        dataTypeUI: 'boolean',
        lastUpdated: '2016-01-26T18:42:42.124Z',
      }, {
        description: 'Field for NoClassification',
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: '2015Field',
        dataTypeUI: 'boolean',
        lastUpdated: '2015-01-26T18:42:42.124Z',
      }, {
        description: 'Field for abc3',
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: '2014FieldWithDateMatch',
        dataTypeUI: 'boolean',
        lastUpdated: '2014-02-15T18:42:42.124Z',
      }];

      controller.filterBySearchStr(fieldList, '15')
        .then(function (filteredList) {
          expect(filteredList.length).toBeGreaterThanOrEqual(1);
          expect(filteredList[0].id).toEqual('2015Field');
          expect(filteredList.length).toBeGreaterThanOrEqual(2);
          expect(filteredList[1].id).toEqual('2014FieldWithDateMatch');
          expect(filteredList.length).toBe(2);
          done();
        });
      $scope.$apply();
    });

    it('should filter only when the search string is found case insensitive in the specified columns but not in unsearchable columns', function (done) {
      ContextFieldsService.getFields.and.returnValue($q.resolve([]));
      controller = initController();
      $scope.$apply();

      var fieldList = [{
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'August',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'August', french: 'Prénom' },
        id: 'SearchStrInTranslation',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInClassification',
        classificationUI: 'August',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInDescription',
        description: 'August in description',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrLowerCaseInLastUpdatedDate',
        lastUpdated: '2017-08-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInDataType',
        dataTypeUI: '$$August in datatype',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        otherKey1: 'August',
        OhterKey2: 'august',
        otherKey3: 'anyOtherAugust',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInSearchable',
        dataTypeUI: 'String',
        searchableUI: 'somethingaugustabce',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }];
      controller.filterBySearchStr(fieldList, 'august')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(6);
          expect(filteredList[0].id).toEqual('August');
          expect(filteredList[1].id).toEqual('SearchStrInClassification');
          expect(filteredList[2].id).toEqual('SearchStrInDescription');
          expect(filteredList[3].id).toEqual('SearchStrLowerCaseInLastUpdatedDate');
          expect(filteredList[4].id).toEqual('SearchStrInDataType');
          expect(filteredList[5].id).toEqual('SearchStrInSearchable');
          done();
        });
      $scope.$apply();
    });

    it('should filter by exact match with the search string despite the list contains the same text with different delimiters', function (done) {
      ContextFieldsService.getFields.and.returnValue($q.resolve([]));
      controller = initController();
      $scope.$apply();

      var fieldList = [{
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'aaa_test',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'aaa.test',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInClassificationUpperCase',
        classificationUI: 'ContainsAAA_Test',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'aaa test',
        description: 'First in description',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'AAA test!',
        lastUpdated: '2017-01-26T18:42:42.124Z',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInDataType',
        dataTypeUI: 'aaa_TEST',
      }, {
        otherKey1: 'aaa-test',
        OhterKey2: 'aaa_test',
        otherKey3: 'anyOtherFirst',
        id: 'SearchStrInOtherFields',
      }, {
        publiclyAccessibleUI: 'false',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInSearchable',

        dataTypeUI: 'String',
        searchableUI: 'aaa_TEST',
      }, {
        publiclyAccessibleUI: 'aaa_test_something',
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'SearchStrInPubliclyAccessible',
        dataType: 'String',
        searchable: 'something',
      }];
      controller.filterBySearchStr(fieldList, 'aaa_test')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(5);
          expect(filteredList[0].id).toEqual('aaa_test');
          expect(filteredList[1].id).toEqual('SearchStrInClassificationUpperCase');
          expect(filteredList[2].id).toEqual('SearchStrInDataType');
          expect(filteredList[3].id).toEqual('SearchStrInSearchable');
          expect(filteredList[4].id).toEqual('SearchStrInPubliclyAccessible');
          done();
        });
      $scope.$apply();
    });

    describe('max fields allowed', function () {
      var DEFAULT_MAX_FIELDS = PropertyConstants.MAX_FIELDS_DEFAULT_VALUE;
      var ORG_ID = 'some-org';
      var MAX_FIELDS_PROPERTY = PropertyConstants.MAX_FIELDS_PROP_NAME;

      beforeEach(function () {
        ContextFieldsService.getFields.and.returnValue($q.resolve([{
          description: 'Field for abcd',
          classification: 'PII',
          publiclyAccessible: 'false',
          searchable: 'false',
          translations: { english: 'First Name' },
          refUrl: '/dictionary/field/v1/id/FieldContainsSearchStr',
          id: 'FieldContainsSearchStr',
          dataType: 'double',
        }, {
          description: 'Field for xyz',
          classification: 'PII',
          publiclyAccessible: 'false',
          searchable: 'false',
          translations: { english: 'First Name' },
          refUrl: '/dictionary/field/v1/id/FieldNotContainSearchStr',
          id: 'FieldNotContainSearchStr',
          dataType: 'double',
        }]));
        ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
        controller = initController();
        spyOn(Authinfo, 'getOrgId').and.returnValue(ORG_ID);
      });

      afterEach(function () {
        expect(PropertyService.getProperty).toHaveBeenCalledWith(MAX_FIELDS_PROPERTY, ORG_ID);
      });

      it('should have the default max fields', function () {
        $scope.$apply();

        expect(controller.maxFieldsAllowed).toBe(DEFAULT_MAX_FIELDS);
        expect(controller.showNew).toBe(true);
        expect(controller.newButtonTooltip).toBe('');
      });

      it('should overrides the max fields property and new is disabled', function () {
        var maxFields = 2;
        PropertyService.getProperty.and.returnValue($q.resolve(maxFields));
        $scope.$apply();

        expect(controller.maxFieldsAllowed).toBe(maxFields);
        expect(controller.showNew).toBe(false);
      });

      it('should use default max fields allowed on reject', function () {
        PropertyService.getProperty.and.returnValue($q.reject());
        $scope.$apply();

        expect(controller.maxFieldsAllowed).toBe(PropertyConstants.MAX_FIELDS_DEFAULT_VALUE);
        expect(controller.showNew).toBe(true);
      });

      it('should set the tooltip if admin not authorized', function () {
        ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.UNAUTHORIZED));
        controller = initController();
        $scope.$apply();

        expect(controller.adminAuthorizationStatus).toBe(AdminAuthorizationStatus.UNAUTHORIZED);
        expect(controller.newButtonTooltip).toBe($translate.instant('context.dictionary.fieldPage.notAuthorized'));
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

  describe('field edit feature', function () {
    beforeEach(function () {
      this.injectDependencies(
        '$q',
        'ContextFieldsService',
        'FeatureToggleService'
      );
      this.featureSupportSpy = spyOn(this.FeatureToggleService, 'supports');
      this.ContextFieldsService.getFields.and.returnValue($q.resolve([]));
    });

    afterEach(function () {
      // NOTE: these tests can probably be removed with the next story. We only need to temporarily validate to ensure
      // these feature flags are not being checked when compiling the component/view
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('contact-center-context');
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('atlas-context-dictionary-edit');
    });

    it('should show field-edit elements even if feature toggle is false', function () {
      // set default result, just in case it's called
      this.featureSupportSpy.and.returnValue($q.resolve(false));
      this.compileViewTemplate('HybridContextFieldsCtrl', require('modules/context/fields/hybrid-context-fields.html'), { controllerAs: 'contextFields' });
      var button = this.view.find('button'); // there's only one button for now
      expect(button).toExist();
      expect(button).toHaveClass('btn');
      expect(button).toHaveClass('btn--people'); // ok, just because that's what it is (people???)
      expect(button).toHaveText('common.new');
    });
  });
});
