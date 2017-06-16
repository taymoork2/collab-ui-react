import fieldModalComponent from './hybrid-context-field-modal.component';

describe('Component: context field modal', () => {

  let createServiceSpy, updateServiceSpy;
  const mockedCreateField = {
    id: 'id',
  };

  let formIsSetDirty = false;

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
    dataTypeDefinition: undefined,
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
      '$rootScope',
      'ModalService',
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

    formIsSetDirty = false;
    this.$scope.newFieldForm = {
      $setDirty: function () {
        formIsSetDirty = true;
      },
      $valid: true,
    };

    this.compileComponent('context-field-modal', {
      existingFieldIds: 'existingFieldIds',
      callback: 'callback()',
      dismiss: 'dismiss()',
      hasContextExpandedTypesToggle: true,
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

  describe('singleSelectOption', function () {

    it('should not be displayed if feature flag is off', function () {
      this.compileComponent('context-field-modal', {
        existingFieldIds: 'existingFieldIds',
        callback: 'callback()',
        dismiss: 'dismiss()',
        hasContextExpandedTypesToggle: false,
      });

      expect(Object.keys(this.controller.dataTypeApiMap)).toEqual([
        'context.dictionary.dataTypes.boolean',
        'context.dictionary.dataTypes.double',
        'context.dictionary.dataTypes.integer',
        'context.dictionary.dataTypes.string',
      ]);
    });

    describe('fixDataForApi', function () {
      it('should correctly fix dataType when the dataTypeDefintion is set', function () {
        this.controller.fieldData.dataTypeUI = 'context.dictionary.dataTypes.enumString';
        this.controller.fieldData.dataTypeDefinition = {
          type: 'enum',
          enumerations: ['a', 'b', 'c'],
          translations: {
            en_us: ['a', 'b', 'c'],
          },
        };
        const fixedField = this.controller.fixDataForApi();
        expect(fixedField.dataType).toBe('string');
      });
    });

    describe('addAndEditOption', function () {
      let optionsListCopy = [
        { index: 0, value: '1', edit: false },
        { index: 1, value: '2', edit: false },
      ];
      let addOptionsList = [
        { index: 0, value: '1', edit: false },
        { index: 1, value: '2', edit: false },
        { index: 2, value: '', edit: true },
      ];
      let editOptionsListCopy = [
        { index: 0, value: '1', edit: false },
        { index: 1, value: '2', edit: true },
      ];

      describe('addOption', function () {
        it('should set the correct controller flags when setAddEnumOptions is called', function () {
          this.controller.setAddEnumOptions();
          expect(this.controller.addEnumOption).toBe(true);
          expect(this.controller.editingOption).toBe(true);
          expect(this.controller.actionList.length).toBe(0);
          expect(this.controller.actionListCopy.length).toBe(2);
          expect(this.controller.optionsList[0]).toEqual({
            index: 0,
            value: '',
            edit: true,
          });
          expect(this.controller.newOption).toEqual('');
        });

        it('should save and cancel when adding an option', function () {
          this.controller.optionsList = addOptionsList;
          this.controller.optionsListCopy = optionsListCopy;
          this.controller.newOption = '3';
          this.controller.saveOption();
          expect(this.controller.optionsListCopy).toEqual(this.controller.optionsList);
          expect(this.controller.optionsListCopy.length).toBe(3);
          expect(this.controller.optionsListCopy).toEqual([
            { index: 0, value: '1', edit: false },
            { index: 1, value: '2', edit: false },
            { index: 2, value: '3', edit: false },
          ]);
          expect(this.controller.actionList.length).toBe(2);
          expect(this.controller.optionRadios).toEqual([
            { label: '1', value: '1', id: 0, name: '1' },
            { label: '2', value: '2', id: 1, name: '2' },
            { label: '3', value: '3', id: 2, name: '3' },
          ]);
          expect(this.controller.editingOption).toBe(false);
          expect(this.controller.addEnumOption).toBe(false);
        });

        it('should reset when cancel adding an option', function () {
          this.controller.optionsList = addOptionsList;
          this.controller.optionsListCopy = optionsListCopy;
          this.controller.newOption = '3';

          this.controller.cancelAddOption();
          expect(this.controller.optionsList).toEqual(this.controller.optionsListCopy);
          expect(this.controller.optionsListCopy).toEqual(optionsListCopy);
          expect(this.controller.editingOption).toBe(false);
          expect(this.controller.addEnumOption).toBe(false);
        });
      });

      describe('editOption', function () {
        it('should set the option edit as true when setEdit is called', function () {
          let option = {
            index: 2,
            value: '2',
            edit: false,
          };
          this.controller.setEdit(option, true);
          expect(option.edit).toBe(true);
          expect(this.controller.editingOption).toBe(true);
          expect(this.controller.actionList.length).toBe(0);
          expect(this.controller.newOption).toEqual(option.value);
        });

        it('should save the option correctly when editing an option which is the default option', function () {
          this.controller.optionsListCopy = editOptionsListCopy;
          this.controller.setEdit( {
            index: 1,
            value: '2',
            edit: true }, true);

          this.controller.newOption = '5';
          this.controller.defaultOption = '2';

          this.controller.saveOption();
          expect(this.controller.optionsListCopy).toEqual(this.controller.optionsList);
          expect(this.controller.optionsListCopy.length).toBe(2);
          expect(this.controller.optionsListCopy).toEqual([
            { index: 0, value: '1', edit: false },
            { index: 1, value: '5', edit: false },
          ]);
          expect(this.controller.optionRadios).toEqual([
            { label: '1', value: '1', id: 0, name: '1' },
            { label: '5', value: '5', id: 1, name: '5' },
          ]);
          expect(this.controller.defaultOption).toBe('5');
          expect(this.controller.editingOption).toBe(false);
          expect(this.controller.addEnumOption).toBe(false);
        });

        it('should reset the flags and values when cancel', function () {
          let option = {
            index: 1,
            value: '2',
            edit: true };
          this.controller.optionsListCopy = editOptionsListCopy;
          this.controller.setEdit(option, true);
          this.controller.newOption = '5';
          this.controller.defaultOption = '2';
          this.controller.cancelEditOption();

          expect(this.controller.optionsListCopy.length).toBe(2);
          expect(this.controller.optionsListCopy).toEqual(this.controller.optionsList);
          expect(this.controller.optionsListCopy).toEqual([
            { index: 0, value: '1', edit: false },
            { index: 1, value: '2', edit: false },
          ]);

          expect(this.controller.defaultOption).toBe('2');
          expect(this.controller.editingOption).toBe(false);
        });
      });

      it('updateDataTypeDefinition', function () {
        let optionsList = [
          { index: 0, edit: false, value: '1' },
          { index: 1, edit: false, value: '2' },
          { index: 2, edit: false, value: '3' },
        ];

        let expectedDataTypeDefinition = {
          type: 'enum',
          enumerations: ['1', '2', '3'],
          translations: {
            en_US: ['1', '2', '3'],
          },
        };
        this.controller.updateDataTypeDefinition(optionsList);

        expect(this.controller.fieldData.dataTypeDefinition).toEqual(expectedDataTypeDefinition);
      });
    });

    describe('delete', function () {
      let origOptionsListCopy = [
        { index: 0, edit: false, value: '1' },
        { index: 1, edit: false, value: '2' },
        { index: 2, edit: false, value: '3' },
      ];

      let optionToBeDeleted = {
        index: 1,
        edit: false,
        value: '2',
      };

      let optionsListCopyAfterDelete = [
        { index: 0, edit: false, value: '1' },
        { index: 1, edit: false, value: '3' },
      ];

      let reorderOptions = [
        { label: '1', value: '1', id: 0, name: '1' },
        { label: '3', value: '3', id: 1, name: '3' },
      ];

      it('should remove the option if confirmed', function (done) {
        //mock the modal open call through and get result
        let modalResult = {};
        let mockModalInstance = { result: this.$q.resolve(modalResult) };
        spyOn(mockModalInstance.result, 'then').and.callThrough();
        spyOn(this.ModalService, 'open').and.returnValue(mockModalInstance);

        this.controller.optionsList = this.controller.optionsListCopy = origOptionsListCopy;

        this.controller.deleteOption(optionToBeDeleted, this.$scope.newFieldForm);
        this.$rootScope.$digest();

        expect(mockModalInstance.result.then).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.controller.optionsList).toEqual(this.controller.optionsListCopy);
        expect(this.controller.optionsListCopy).toEqual(optionsListCopyAfterDelete);
        expect(this.controller.optionRadios).toEqual(reorderOptions);
        expect(formIsSetDirty).toBe(true);
        done();
      });

      describe('updateIndex', function () {
        it('should update all the index when delete the first item in the list', function () {
          this.controller.optionsList = [
            { index: 1, edit: false, value: '2' },
            { index: 2, edit: false, value: '3' },
            { index: 3, edit: false, value: '4' },
          ];

          this.controller.updateIndex(0);
          expect(this.controller.optionsList).toEqual([
            { index: 0, edit: false, value: '2' },
            { index: 1, edit: false, value: '3' },
            { index: 2, edit: false, value: '4' },
          ]);
        });

        it('should update the index correctly when delete the item in the middle of the list', function () {
          this.controller.optionsList = [
            { index: 0, edit: false, value: '1' },
            { index: 2, edit: false, value: '3' },
            { index: 3, edit: false, value: '4' },
          ];

          this.controller.updateIndex(1);
          expect(this.controller.optionsList).toEqual([
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '3' },
            { index: 2, edit: false, value: '4' },
          ]);
        });

        it('should update the index correctly when delete the last', function () {
          this.controller.optionsList = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '2' },
            { index: 2, edit: false, value: '3' },
          ];

          this.controller.updateIndex(3);
          expect(this.controller.optionsList).toEqual([
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '2' },
            { index: 2, edit: false, value: '3' },
          ]);
        });
      });
    });

    describe('setReorder', function () {
      let origOptionsListCopy = [
        { index: 0, edit: false, value: '1' },
        { index: 1, edit: false, value: '2' },
      ];
      it('should set the correct controller flags when setReorder is called', function () {
        this.controller.optionsListCopy = origOptionsListCopy;
        this.controller.setReorder();
        expect(this.controller.reorderEnumOptions).toBe(true);
        expect(this.controller.actionList.length).toBe(0);
        expect(this.controller.optionReorderListCopy).toEqual(origOptionsListCopy);
      });

      it('should save the order when save', function () {
        this.controller.optionsListCopy = origOptionsListCopy;
        this.controller.setReorder();
        let newOptionsList = this.controller.optionsListCopy = [
          { index: 0, edit: false, value: '2' },
          { index: 1, edit: false, value: '1' },
        ];

        this.controller.saveOptionsList(this.$scope.newFieldForm);

        expect(this.controller.optionsList).toEqual(newOptionsList);
        expect(this.controller.reorderEnumOptions).toBe(false);
        expect(this.controller.optionRadios).toEqual([
          { label: '2', value: '2', id: 0, name: '2' },
          { label: '1', value: '1', id: 1, name: '1' },
        ]);
        expect(this.controller.optionReorderListCopy).toEqual(undefined);
        expect(formIsSetDirty).toBe(true);
      });

      it('should reset the order when cancel', function () {
        this.controller.optionsListCopy = origOptionsListCopy;
        this.controller.setReorder();
        this.controller.optionsListCopy = [
          { index: 0, edit: false, value: '2' },
          { index: 1, edit: false, value: '1' },
        ];

        this.controller.cancelOptionsList();

        expect(this.controller.reorderEnumOptions).toBe(false);
        expect(this.controller.setDefaultEnumOption).toBe(false);
        expect(this.controller.actionList.length).toBe(2);
        expect(this.controller.optionsListCopy).toEqual(origOptionsListCopy);
        expect(formIsSetDirty).toBe(false);
      });
    });

    describe('setDefaultOption', function () {
      it('should set the right flags when setDefault is called', function () {
        this.controller.setDefault();
        expect(this.controller.setDefaultEnumOption).toBe(true);
        expect(this.controller.actionList.length).toBe(0);
      });

      it('should set the default option when save', function () {
        this.controller.fieldData = {
          defaultValue: '6',
        };
        this.controller.setDefault();
        this.controller.defaultOption = '5';
        this.controller.saveOptionsList(this.$scope.newFieldForm);
        expect(this.controller.setDefaultEnumOption).toBe(false);
        expect(this.controller.fieldData.defaultValue).toEqual('5');
        expect(formIsSetDirty).toBe(true);
      });

      it('should not change the original default option when cancel', function () {
        this.controller.fieldData = {
          defaultValue: '6',
        };
        this.controller.setDefault();
        this.controller.defaultOption = '5';

        this.controller.cancelOptionsList();

        expect(this.controller.reorderEnumOptions).toBe(false);
        expect(this.controller.setDefaultEnumOption).toBe(false);
        expect(this.controller.actionList.length).toBe(0);
        expect(this.controller.fieldData.defaultValue).toEqual('6');
        expect(formIsSetDirty).toBe(false);
      });

    });

    describe('removeDefaultOption', function () {
      it('should remove the default option from the fieldData', function () {
        this.controller.fieldData = {
          defaultValue: '6',
        };
        this.controller.defaultOption = '5';
        this.controller.removeDefault();

        expect(this.controller.defaultOption).toEqual('');
        expect(this.controller.fieldData.defaultValue).toEqual(undefined);
      });

    });
  });
});
