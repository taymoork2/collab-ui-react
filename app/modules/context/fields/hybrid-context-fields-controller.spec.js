'use strict';

describe('HybridContextFieldsCtrl', function () {

  var $controller, $scope, $state, $q, controller, ContextFieldsService, Log, Notification;
  var fakeGridApi = {
    infiniteScroll: {
      dataLoaded: jasmine.createSpy('dataLoaded'),
      on: {
        needLoadMoreData: jasmine.createSpy('needLoadMoreData'),
      },
    },
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterAll(function () {
    $controller = $scope = $state = $q = controller = ContextFieldsService = Log = Notification = fakeGridApi = undefined;
  });

  function dependencies($rootScope, _$controller_, _$q_, _$state_, _ContextFieldsService_, _Log_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    ContextFieldsService = _ContextFieldsService_;
    Log = _Log_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(ContextFieldsService, 'getFields');
    spyOn(Log, 'debug');
    spyOn(Notification, 'error');
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
});
