'use strict';

describe('HybridContextFieldsCtrl', function () {

  function init() {
    this.initModules('Context');
    this.injectDependencies(
      '$controller',
      '$rootScope',
      '$state',
      '$q',
      'ContextFieldsService',
      'Notification',
      'Log'
    );
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.$state, 'go');
    this.getFieldsSpy = spyOn(this.ContextFieldsService, 'getFields');
    spyOn(this.Notification, 'error');
    spyOn(this.Log, 'debug');

    installPromiseMatchers();
  }

  function initController() {
    var _this = this;

    this.$scope = this.$rootScope.$new();

    this.ctrl = this.$controller('HybridContextFieldsCtrl', {
      $scope: this.$scope,
      $state: this.$state,
      ContextFieldsService: this.ContextFieldsService,
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

    this.ctrl.$onInit();
    expect(this.$scope.load).toBeTruthy('load is not set as true initially');
    this.$scope.$apply();
  }

  beforeEach(init);

  describe('init controller', function () {
    it('should set the default value', function () {
      this.getFieldsSpy.and.returnValue(this.$q.resolve([]));
      initController.apply(this);
      expect(this.$scope.load).toEqual(false);
    });
  });

  describe('get field list options', function () {
    it('should set the gridOptions data correctly when one field list is resolved', function () {
      var _this = this;

      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
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
      initController.apply(this);

      expect(this.$scope.load).toEqual(false);
      var promise = this.$scope.getFieldList()
        .then(function () {
          expect(_this.$scope.fieldsList.allFields.length).toBe(1);
        });
      expect(promise).toBeResolved();
      expect(this.$scope.load).toEqual(false);
      expect(this.$scope.noSearchResults).toBeFalsy('noSearchResults is not false');
    });

    it('should call Notification error and log debug message when the field list call fails', function () {
      var err = 'server error';
      this.getFieldsSpy.and.returnValue(this.$q.reject(err));
      initController.apply(this);
      expect(this.Log.debug).toHaveBeenCalledWith('CS fields search failed. Status: ' + err);
      expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldReadFailed');
    });
  });

  describe('process fields', function () {
    it('should process field data when data returned is missing dataType', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoDataType',
        'lastUpdated': '2017-01-26T18:42:42.124Z',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
        .then(function () {
          expect(_this.$scope.fieldsList.allFields.length).toBe(1);
          expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
          expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.yes');
          expect(_this.$scope.fieldsList.allFields[0].publiclyAccessible).toEqual(false);
          expect(_this.$scope.fieldsList.allFields[0].dataType).not.toExist();
          expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toBeNull();
        });
      expect(promise).toBeResolved();
    });

    it('should process field data when data returned is missing lastUpdated', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoDataType',
        'dataType': 'integer',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
         .then(function () {
           expect(_this.$scope.fieldsList.allFields.length).toBe(1);
           expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
           expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.yes');
           expect(_this.$scope.fieldsList.allFields[0].dataType).toEqual('Integer');
           expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toExist();
         });
      expect(promise).toBeResolved();
    });

    it('should process when data is encrypted, integer, searchable', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'description': 'Some description added for Test Integer',
        'classification': 'ENCRYPTED',
        'publiclyAccessible': false,
        'searchable': 'true',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/TestInteger',
        'id': 'TestInteger',
        'dataType': 'integer',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
         .then(function () {
           expect(_this.$scope.fieldsList.allFields.length).toBe(1);
           expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.encrypted');
           expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.yes');
           expect(_this.$scope.fieldsList.allFields[0].dataType).toEqual('Integer');
           expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toExist();
         });
      expect(promise).toBeResolved();
    });

    it('should process when data is unencrypted, boolean, missing searchable', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'description': 'Field for TestBoolean',
        'classification': 'UNENCRYPTED',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'TestBoolean',
        'dataType': 'boolean',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
         .then(function () {
           expect(_this.$scope.fieldsList.allFields.length).toBe(1);
           expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
           expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.yes');
           expect(_this.$scope.fieldsList.allFields[0].dataType).toEqual('Boolean');
           expect(_this.$scope.fieldsList.allFields[0].description).toEqual('Field for TestBoolean');
           expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toExist();
         });
      expect(promise).toBeResolved();
    });

    it('should process when data is PII, double', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'description': 'Field for TestDouble',
        'classification': 'PII',
        'publiclyAccessible': false,
        'searchable': 'false',
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'TestDouble',
        'dataType': 'double',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
         .then(function () {
           expect(_this.$scope.fieldsList.allFields.length).toBe(1);
           expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.piiEncrypted');
           expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.no');
           expect(_this.$scope.fieldsList.allFields[0].dataType).toEqual('Double');
           expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toExist();
         });
      expect(promise).toBeResolved();
    });

    it('should process when data is missing classification, boolean, missing searchable', function () {
      var _this = this;
      this.getFieldsSpy.and.returnValue(this.$q.resolve([{
        'description': 'Field for NoClassification',
        'publiclyAccessible': false,
        'translations': { 'english': 'First Name', 'french': 'Prénom' },
        'refUrl': '/dictionary/field/v1/id/NoDataType',
        'id': 'NoClassification',
        'dataType': 'boolean',
      }]));
      initController.apply(this);
      var promise = this.$scope.getFieldList()
         .then(function () {
           expect(_this.$scope.fieldsList.allFields.length).toBe(1);
           expect(_this.$scope.fieldsList.allFields[0].classification).toEqual('context.dictionary.fieldPage.unencrypted');
           expect(_this.$scope.fieldsList.allFields[0].searchable).toEqual('common.yes');
           expect(_this.$scope.fieldsList.allFields[0].dataType).toEqual('Boolean');
           expect(_this.$scope.fieldsList.allFields[0].lastUpdated).not.toExist();
         });
      expect(promise).toBeResolved();
    });
  });
});
