import fieldsetModule from './fieldset-modal.component';

describe('Component: context fieldset modal', () => {

  let serviceSpy;
  const mockedFieldset = {
    id: 'id',
  };

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Context', fieldsetModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$translate',
      'Analytics',
      'ContextFieldsetsService',
      'Notification',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Analytics, 'trackEvent');
    serviceSpy = spyOn(this.ContextFieldsetsService, 'createAndGetFieldset').and.returnValue(this.$q.resolve(mockedFieldset));

    this.$scope.callback = jasmine.createSpy('createCallback');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    this.$scope.existingFieldsetIds = [];

    this.compileComponent('context-fieldset-modal', {
      existingFieldsetIds: 'existingFieldsetIds',
      createCallback: 'createCallback()',
      dismiss: 'dismiss()',
    });
  });

  describe('invalidCharactersValidation', function () {
    it('should return true for valid values', function () {
      ['someFieldset', 'some-fieldset', 'some_fieldset'].forEach(testString => {
        expect(this.controller.invalidCharactersValidation(testString)).toBe(true);
      });
    });

    it('should return false for values with invalid characters', function () {
      ['!', '$', '%', '!@#$%^', 'some fieldset', 'some_*-fieldset'].forEach(testString => {
        expect(this.controller.invalidCharactersValidation(testString)).toBe(false);
      });
    });
  });

  describe('uniqueIdValidation', function () {
    it('should return true if the fieldset id has not be used', function () {
      ['someFieldset', 'some-fieldset', 'some_fieldset'].forEach(testString => {
        expect(this.controller.uniqueIdValidation(testString)).toBe(true);
      });
    });

    it('should return false if the fieldset id has already been used', function () {
      this.$scope.existingFieldsetIds.push('someFieldset');
      this.$scope.existingFieldsetIds.push('some-fieldset');
      this.$scope.existingFieldsetIds.push('some_fieldset');
      ['someFieldset', 'some-fieldset', 'some_fieldset'].forEach(testString => {
        expect(this.controller.uniqueIdValidation(testString)).toBe(false);
      });
    });
  });


  describe('buttonEnabled', function () {
    it('should return true if id is valid', function () {
      this.controller.fieldsetData.id = 'someId';
      expect(this.controller.buttonEnabled()).toBe(true);
    });

    it('should return false if id has not been entered', function () {
      this.controller.fieldsetData.id = '';
      expect(this.controller.buttonEnabled()).toBe(false);
    });

    it('should return false if id contains invalid characters', function () {
      ['!', '$', '%', '!@#$%^', 'some fieldset', 'some_*-fieldset'].forEach(testString => {
        this.controller.fieldsetData.id = testString;
        expect(this.controller.buttonEnabled()).toBe(false);
      });
    });

    it('should return false if the fieldset id has already been used', function () {
      this.$scope.existingFieldsetIds.push('someFieldset');
      this.$scope.existingFieldsetIds.push('some-fieldset');
      this.$scope.existingFieldsetIds.push('some_fieldset');
      ['someFieldset', 'some-fieldset', 'some_fieldset'].forEach(testString => {
        this.controller.fieldsetData.id = testString;
        expect(this.controller.buttonEnabled()).toBe(false);
      });
    });

    it('should return false if actionInProgress is true', function () {
      this.controller.actionInProgress = true;
      expect(this.controller.buttonEnabled()).toBe(false);
    });
  });


  describe('create', function () {
    it('should correctly create a new fieldset', function (done) {
      let callbackCalled = false;
      let dismissCalled = false;
      this.controller.createCallback = function (fieldset) {
        expect(fieldset).toEqual(mockedFieldset);
        callbackCalled = true;
      };
      this.controller.dismiss = function () {
        dismissCalled = true;
      };
      this.controller.create().then(() => {
        expect(callbackCalled).toBe(true);
        expect(dismissCalled).toBe(true);
        expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.fieldsetPage.fieldsetCreateSuccess');
        expect(this.Analytics.trackEvent).toHaveBeenCalled();
        done();
      }).catch(done.fail);
      this.$scope.$apply();
    });
  });
});
