'use strict';

describe('Validator: TrialUniqueAsyncValidator:', function () {
  beforeEach(function () {
    // modules
    this.initModules(
      'Core',
      'Huron',
      'Sunlight'
    );

    // dependencies
    this.injectDependencies(
      '$compile',
      '$q',
      '$rootScope',
      '$scope',
      'TrialService'
    );

    //spies
    spyOn(this.TrialService, 'shallowValidation').and.returnValue(this.$q.resolve({ unique: true }));

    this.$scope = this.$rootScope.$new();
    this.element = angular.element(
      '<form name="form">' +
      '<input ng-model="model.something" name="something" messages="validationMessages.general" trial-unique-async-validator="{key: \'organizationName\'}"  />' +
      '</form>'
    );
    this.$scope.model = {
      something: null,
    };
    this.$scope.validationMessages = {
      general: {
        trialUniqueAsyncValidator: '',
      },
    };
    this.compileTemplate(this.element);
    this.input = this.$scope.form.something;

  });

  describe('Input validators', function () {
    it('should be called with the right parameters', function () {
      this.input.$setViewValue('nothing');
      this.$scope.$digest();
      expect(this.TrialService.shallowValidation).toHaveBeenCalledWith('organizationName', 'nothing');
    });
    it('validate unique value', function () {
      this.input.$setViewValue('nothing');
      this.$scope.$digest();
      expect(this.input.$valid).toBe(true);
    });

    it('not validate non unique value', function () {
      this.TrialService.shallowValidation.and.returnValue(this.$q.resolve({ error: 'trialModal.errorInUse' }));
      this.input.$setViewValue('nothing');
      this.$scope.$digest();
      expect(this.input.$valid).toBe(false);
      expect(this.$scope.validationMessages.general.trialUniqueAsyncValidator).toBe('trialModal.errorInUse');
    });

    it('should return appropriate errormessagefrom server', function () {
      this.TrialService.shallowValidation.and.returnValue(this.$q.resolve({ error: 'trialModal.errorInvalidName' }));
      this.input.$setViewValue('nothing');
      this.$scope.$digest();
      expect(this.input.$valid).toBe(false);
      expect(this.$scope.validationMessages.general.trialUniqueAsyncValidator).toBe('trialModal.errorInvalidName');
    });
  });
});
