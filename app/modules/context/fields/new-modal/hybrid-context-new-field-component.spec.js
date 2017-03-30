'use strict';

describe('New field controller', function () {

  var ctrl, $rootScope, $componentCtrl, ContextFieldsService, Notification, $translate, LogMetricsService, $q;
  var existingFieldIds, createCallback, createAndGetFieldSpy;
  var mockedField = {
    id: 'id',
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);
  afterAll(function () {
    // release to prevent memory leaks
    ctrl = $rootScope = $componentCtrl = ContextFieldsService = Notification =
    $translate = LogMetricsService = $q = existingFieldIds = createCallback = createAndGetFieldSpy = mockedField = undefined;
  });

  function dependencies(_$rootScope_, _$componentController_, _ContextFieldsService_, _Notification_, _$translate_, _LogMetricsService_, _$q_) {
    $rootScope = _$rootScope_;
    $componentCtrl = _$componentController_;
    ContextFieldsService = _ContextFieldsService_;
    Notification = _Notification_;
    $translate = _$translate_;
    LogMetricsService = _LogMetricsService_;
    $q = _$q_;
  }

  function initSpies() {
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(LogMetricsService, 'logMetrics');
    createAndGetFieldSpy = spyOn(ContextFieldsService, 'createAndGetField').and.returnValue($q.resolve(mockedField));
  }

  function initController() {
    existingFieldIds = [];
    createCallback = function () {};
    ctrl = $componentCtrl('contextNewFieldModal', {
      $translate: $translate,
      Notification: Notification,
      LogMetricsService: LogMetricsService,
      ContextFieldsetsService: ContextFieldsService,
    }, {
      existingFieldIds: existingFieldIds,
      createCallback: createCallback,
    });
  }

  describe('fixDataForApi', function () {
    it('should correctly fix dataType and classification', function () {
      ctrl.fieldData.dataType = 'context.dictionary.dataTypes.string';
      ctrl.fieldData.classification = 'context.dictionary.fieldPage.unencrypted';
      var fixedField = ctrl._fixDataForApi();
      expect(fixedField.dataType).toBe('string');
      expect(fixedField.classification).toBe('UNENCRYPTED');
    });
  });

  describe('invalidCharactersValidation', function () {
    it('should return true for valid values', function () {
      ['someField', 'some-field', 'some_field'].forEach(function (testString) {
        expect(ctrl.validators.pattern(testString)).toBe(true);
      });
    });

    it('should return false for values with invalid characters', function () {
      ['!', '$', '%', '!@#$%^', 'some field', 'some_*-field'].forEach(function (testString) {
        expect(ctrl.validators.pattern(testString)).toBe(false);
      });
    });
  });

  describe('uniqueIdValidation', function () {
    it('should return true if the field id has not be used', function () {
      ['someField', 'some-field', 'some_field'].forEach(function (testString) {
        expect(ctrl.validators.unique(testString)).toBe(true);
      });
    });

    it('should return false if the field id has already been used', function () {
      existingFieldIds.push('someField');
      existingFieldIds.push('some-field');
      existingFieldIds.push('some_field');
      ['someField', 'some-field', 'some_field'].forEach(function (testString) {
        expect(ctrl.validators.unique(testString)).toBe(false);
      });
    });
  });

  describe('createEnabled', function () {
    it('should return true if valid id, label, and datatype are selected', function () {
      ctrl.fieldData.id = 'someId';
      ctrl.fieldData.translations.en_US = 'label';
      ctrl.fieldData.dataType = 'dataType';
      expect(ctrl.createEnabled()).toBe(true);
    });

    it('should return false if id has not been entered', function () {
      ctrl.fieldData.id = '';
      expect(ctrl.createEnabled()).toBe(false);
    });

    it('should return false if id contains invalid characters', function () {
      ctrl.fieldData.translations.en_US = 'label';
      ctrl.fieldData.dataType = 'dataType';
      ['!', '$', '%', '!@#$%^', 'some field', 'some_*-field'].forEach(function (testString) {
        ctrl.fieldData.id = testString;
        expect(ctrl.createEnabled()).toBe(false);
      });
    });

    it('should return false if id has already been used', function () {
      existingFieldIds.push('someField');
      existingFieldIds.push('some-field');
      existingFieldIds.push('some_field');
      ctrl.fieldData.translations.en_US = 'label';
      ctrl.fieldData.dataType = 'dataType';
      ['someField', 'some-field', 'some_field'].forEach(function (testString) {
        ctrl.fieldData.id = testString;
        expect(ctrl.createEnabled()).toBe(false);
      });
    });

    it('should return false if label has not been entered', function () {
      ctrl.fieldData.id = 'id';
      ctrl.fieldData.translations.en_US = '';
      expect(ctrl.createEnabled()).toBe(false);
    });

    it('should return false if dataType has not been selected', function () {
      ctrl.fieldData.id = 'id';
      ctrl.fieldData.translations.en_US = 'label';
      ctrl.fieldData.dataType = '';
      expect(ctrl.createEnabled()).toBe(false);
    });
  });

  describe('create', function () {
    it('should correctly create a new field', function (done) {
      var callbackCalled = false;
      var dismissCalled = false;
      ctrl.createCallback = function (field) {
        expect(field).toEqual(mockedField);
        callbackCalled = true;
      };
      ctrl.dismiss = function () {
        dismissCalled = true;
      };
      ctrl.create().then(function () {
        expect(callbackCalled).toBe(true);
        expect(dismissCalled).toBe(true);
        expect(Notification.success).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldCreateSuccess');
        expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      $rootScope.$apply();
    });

    it('should reject if create fails', function (done) {
      createAndGetFieldSpy.and.returnValue($q.reject('error'));
      ctrl.create().then(function () {
        expect(Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldCreateFailure');
        expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      $rootScope.$apply();
    });
  });

});
