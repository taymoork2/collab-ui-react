'use strict';

describe('HybridContextFieldsCtrl', function () {

  var $controller, $scope, $state, $q, controller, ContextFieldsService, Log, Notification, LogMetricsService;
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
    $controller = $scope = $state = $q = controller = ContextFieldsService = Log = Notification = fakeGridApi = LogMetricsService = undefined;
  });

  function dependencies($rootScope, _$controller_, _$q_, _$state_, _ContextFieldsService_, _Log_, _Notification_, _LogMetricsService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    ContextFieldsService = _ContextFieldsService_;
    Log = _Log_;
    Notification = _Notification_;
    LogMetricsService = _LogMetricsService_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(ContextFieldsService, 'getFields');
    spyOn(Log, 'debug');
    spyOn(Notification, 'error');
    spyOn(LogMetricsService, 'logMetrics');
  }

  function initController() {
    var ctrl = $controller('HybridContextFieldsCtrl', {
      $scope: $scope,
      hasContextDictionaryEditFeatureToggle: false,
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
      expect($state.go).toHaveBeenCalledWith('context-new-field', jasmine.any(Object));
    });
  });

  describe('getFields()', function () {
    it('should set the gridOptions data correctly when one field list is resolved', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'classification': 'PII Encrypted',
        'dataType': 'String',
        'searchable': 'Yes',
        'publiclyAccessible': true,
        'translations': { 'en_US': 'Agent ID' },
        'locales': [],
        'refUrl': '/dictionary/field/v1/id/Agent_ID',
        'id': 'Agent_ID',
        'lastUpdated': '01/23/2017',
      }]));
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
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoDataType',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].publiclyAccessible).toEqual(false);
      expect(controller.fieldsList.allFields[0].dataType).not.toExist();
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toBeNull();
    });

    it('should process field data when data returned is missing lastUpdated', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoDataType',
        'dataType': 'integer',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataType).toEqual('Integer');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is encrypted, integer, searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'description': 'Some description added for Test Integer',
        'classification': 'ENCRYPTED',
        'publiclyAccessible': false,
        'searchable': 'true',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/TestInteger',
        'id': 'TestInteger',
        'dataType': 'integer',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.encrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataType).toEqual('Integer');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is unencrypted, boolean, missing searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'description': 'Field for TestBoolean',
        'classification': 'UNENCRYPTED',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'TestBoolean',
        'dataType': 'boolean',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataType).toEqual('Boolean');
      expect(controller.fieldsList.allFields[0].description).toEqual('Field for TestBoolean');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is PII, double', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'description': 'Field for TestDouble',
        'classification': 'PII',
        'publiclyAccessible': false,
        'searchable': 'false',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'TestDouble',
        'dataType': 'double',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.piiEncrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.no');
      expect(controller.fieldsList.allFields[0].dataType).toEqual('Double');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });

    it('should process when data is missing classification, boolean, missing searchable', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'description': 'Field for NoClassification',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoClassification',
        'dataType': 'boolean',
      }]));
      controller = initController();
      $scope.$apply();
      expect(controller.fieldsList.allFields.length).toBe(1);
      expect(controller.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
      expect(controller.fieldsList.allFields[0].searchable).toEqual('common.yes');
      expect(controller.fieldsList.allFields[0].dataType).toEqual('Boolean');
      expect(controller.fieldsList.allFields[0].lastUpdated).not.toExist();
    });
  });

  describe('filterList()', function () {
    it('should update grid data', function () {
      ContextFieldsService.getFields.and.returnValue($q.resolve([{
        'description': 'Field for abcd',
        'classification': 'PII',
        'publiclyAccessible': false,
        'searchable': 'false',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/FieldContainsSearchStr',
        'id': 'FieldContainsSearchStr',
        'dataType': 'double',
      }, {
        'description': 'Field for xyz',
        'classification': 'PII',
        'publiclyAccessible': false,
        'searchable': 'false',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/FieldNotContainSearchStr',
        'id': 'FieldNotContainSearchStr',
        'dataType': 'double',
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
        'description': 'Field for NoClassification',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': '2017Field',
        'dataType': 'boolean',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'description': 'Field for NoClassification',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': '2016Field',
        'dataType': 'boolean',
        'lastUpdated': '2016-01-26T18:42:42.124Z',
      }, {
        'description': 'Field for NoClassification',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': '2015Field',
        'dataType': 'boolean',
        'lastUpdated': '2015-01-26T18:42:42.124Z',
      }, {
        'description': 'Field for abc3',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': '2014FieldWithDateMatch',
        'dataType': 'boolean',
        'lastUpdated': '2014-02-15T18:42:42.124Z',
      }];

      controller.filterBySearchStr(fieldList, '15')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(2);
          expect(filteredList[0].id).toEqual('2015Field');
          expect(filteredList[1].id).toEqual('2014FieldWithDateMatch');
          done();
        });
      $scope.$apply();
    });

    it('should filter only when the search string is found case insensitive in the specified columns but not in unsearchable columns', function (done) {
      ContextFieldsService.getFields.and.returnValue($q.resolve([]));
      controller = initController();
      $scope.$apply();

      var fieldList = [{
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'First',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInTranslation',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInClassification',
        'classification': 'first',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInDescription',
        'description': 'First in description',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrLowerCaseInLastUpdatedDate',
        'lastUpdated': 'first in date',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInDataType',
        'dataType': '$$first in datatype',
      }, {
        'otherKey1': 'First',
        'OhterKey2': 'first',
        'otherKey3': 'anyOtherFirst',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInSearchable',
        'dataType': 'String',
        'searchable': 'somethingfirstabce',
      }];
      controller.filterBySearchStr(fieldList, 'first')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(6);
          expect(filteredList[0].id).toEqual('First');
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
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'aaa_test',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'aaa.test',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInClassificationUpperCase',
        'classification': 'ContainsAAA_Test',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'aaa test',
        'description': 'First in description',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'AAA test!',
        'lastUpdated': 'first in date',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInDataType',
        'dataType': 'aaa_TEST',
      }, {
        'otherKey1': 'aaa-test',
        'OhterKey2': 'aaa_test',
        'otherKey3': 'anyOtherFirst',
        'id': 'SearchStrInOtherFields',
      }, {
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'id': 'SearchStrInSearchable',
        'dataType': 'String',
        'searchable': 'aaa_TEST',
      }];
      controller.filterBySearchStr(fieldList, 'aaa_test')
        .then(function (filteredList) {
          expect(filteredList.length).toBe(4);
          expect(filteredList[0].id).toEqual('aaa_test');
          expect(filteredList[1].id).toEqual('SearchStrInClassificationUpperCase');
          expect(filteredList[2].id).toEqual('SearchStrInDataType');
          expect(filteredList[3].id).toEqual('SearchStrInSearchable');
          done();
        });
      $scope.$apply();
    });
  });
});
