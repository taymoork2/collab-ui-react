import fieldModalComponent from './hybrid-context-field-modal.component';

describe('Component: context field modal', () => {

  let createServiceSpy, updateServiceSpy;
  const mockedCreateField = {
    id: 'id',
  };
  const mockedUpdateField = {
    id: '',
    description: '',
    classification: 'ENCRYPTED',
    classificationUI: 'context.dictionary.fieldPage.encrypted',
    dataTypeUI: '',
    dataType: undefined,
    translations: ({ en_US: '' }),
    searchable: false,
    lastUpdated: undefined,
    publiclyAccessible: undefined,
    publiclyAccessibleUI: '',
  };

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Context', fieldModalComponent);
    this.injectDependencies(
      '$q',
      '$scope',
      '$translate',
      'Analytics',
      'ContextFieldsService',
      'Notification',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Analytics, 'trackEvent');
    createServiceSpy = spyOn(this.ContextFieldsService, 'createAndGetField').and.returnValue(this.$q.resolve(mockedCreateField));
    updateServiceSpy = spyOn(this.ContextFieldsService, 'updateAndGetField').and.returnValue(this.$q.resolve(mockedUpdateField));

    this.$scope.callback = jasmine.createSpy('callback');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    this.$scope.existingFieldIds = [];

    this.compileComponent('context-field-modal', {
      existingFieldIds: 'existingFieldIds',
      callback: 'callback()',
      dismiss: 'dismiss()',
    });
  });

  describe('fixDataForApi', function () {
    it('should correctly fix dataType and classification', function () {
      this.controller.fieldData.dataTypeUI = 'context.dictionary.dataTypes.string';
      this.controller.fieldData.classificationUI = 'context.dictionary.fieldPage.unencrypted';
      const fixedField = this.controller.fixDataForApi();
      expect(fixedField.dataType).toBe('string');
      expect(fixedField.classification).toBe('UNENCRYPTED');
    });
  });

  describe('invalidCharactersValidation', function () {
    it('should return true for valid values', function () {
      ['someField', 'some-field', 'some_field'].forEach(testString => {
        expect(this.controller.invalidCharactersValidation(testString)).toBe(true);
      });
    });

    it('should return false for values with invalid characters', function () {
      ['!', '$', '%', '!@#$%^', 'some field', 'some_*-field'].forEach(testString => {
        expect(this.controller.invalidCharactersValidation(testString)).toBe(false);
      });
    });
  });

  describe('uniqueIdValidation', function () {
    it('should return true if the field id has not be used', function () {
      ['someField', 'some-field', 'some_field'].forEach(testString => {
        expect(this.controller.uniqueIdValidation(testString)).toBe(true);
      });
    });

    it('should return false if the field id has already been used', function () {
      this.$scope.existingFieldIds.push('someField');
      this.$scope.existingFieldIds.push('some-field');
      this.$scope.existingFieldIds.push('some_field');
      ['someField', 'some-field', 'some_field'].forEach(testString => {
        expect(this.controller.uniqueIdValidation(testString)).toBe(false);
      });
    });
  });

  describe('createOrSaveButtonEnabled', function () {
    it('should return true if valid id, label, and datatype are selected', function () {
      this.controller.fieldData.id = 'someId';
      this.controller.fieldData.translations.en_US = 'label';
      this.controller.fieldData.dataTypeUI = 'dataType';
      expect(this.controller.createOrSaveButtonEnabled()).toBe(true);
    });

    it('should return false if id has not been entered', function () {
      this.controller.fieldData.id = '';
      expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
    });

    it('should return false if id contains invalid characters', function () {
      this.controller.fieldData.translations.en_US = 'label';
      this.controller.fieldData.dataType = 'dataType';
      ['!', '$', '%', '!@#$%^', 'some field', 'some_*-field'].forEach(testString => {
        this.controller.fieldData.id = testString;
        expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
      });
    });

    it('should return false if id has already been used', function () {
      this.$scope.existingFieldIds.push('someField');
      this.$scope.existingFieldIds.push('some-field');
      this.$scope.existingFieldIds.push('some_field');
      this.controller.fieldData.translations.en_US = 'label';
      this.controller.fieldData.dataType = 'dataType';
      ['someField', 'some-field', 'some_field'].forEach(testString => {
        this.controller.fieldData.id = testString;
        expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
      });
    });

    it('should return false if label has not been entered', function () {
      this.controller.fieldData.id = 'id';
      this.controller.fieldData.translations.en_US = '';
      expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
    });

    it('should return false if dataType has not been selected', function () {
      this.controller.fieldData.id = 'id';
      this.controller.fieldData.translations.en_US = 'label';
      this.controller.fieldData.dataType = '';
      expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
    });

    it('should return false if actionInProgress is true', function () {
      this.controller.actionInProgress = true;
      expect(this.controller.createOrSaveButtonEnabled()).toBe(false);
    });
  });


  describe('create', function () {
    it('should correctly create a new field', function (done) {
      let callbackCalled = false;
      let dismissCalled = false;
      this.controller.callback = function (field) {
        expect(field).toEqual(mockedCreateField);
        callbackCalled = true;
      };
      this.controller.dismiss = function () {
        dismissCalled = true;
      };
      this.controller.create().then(() => {
        expect(callbackCalled).toBe(true);
        expect(dismissCalled).toBe(true);
        expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldCreateSuccess');
        expect(this.Analytics.trackEvent).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      this.$scope.$apply();
    });

    it('should reject if create fails', function (done) {
      createServiceSpy.and.returnValue(this.$q.reject('error'));
      this.controller.create().then(() => {
        expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldCreateFailure');
        expect(this.Analytics.trackEvent).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      this.$scope.$apply();
    });
  });

  describe('update', function () {
    it('should update the field successfully and make sure callback is called and dismiss is NOT called', function (done) {
      let callbackCalled = false, dismissCalled = false;
      this.controller.callback = function (field) {
        expect(field).toEqual(mockedUpdateField);
        callbackCalled = true;
      };
      this.controller.dismiss = function () {
        dismissCalled = true;
      };
      this.controller.update().then(() => {
        expect(callbackCalled).toBe(true);
        expect(dismissCalled).toBe(false);
        expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldUpdateSuccess');
        expect(this.Analytics.trackEvent).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      this.$scope.$apply();
    });

    it('should reject if update fails', function (done) {
      updateServiceSpy.and.returnValue(this.$q.reject('error'));
      this.controller.update().then(() => {
        expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldUpdateFailure');
        expect(this.Analytics.trackEvent).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      this.$scope.$apply();
    });
  });
});
