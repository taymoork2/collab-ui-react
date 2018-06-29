describe('field modal component', () => {

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
    dataType: '',
    translations: ({ en_US: '' }),
    searchable: false,
    lastUpdated: undefined,
    publiclyAccessible: undefined,
    publiclyAccessibleUI: '',
    dataTypeDefinition: undefined,
  };

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$q',
      '$scope',
      '$translate',
      'Analytics',
      'ContextFieldsService',
      'Notification',
      '$rootScope',
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
  });

  describe('Component: context field modal', () => {

    beforeEach(function () {
      this.compileComponent('context-field-modal', {
        existingFieldIds: 'existingFieldIds',
        callback: 'callback()',
        dismiss: 'dismiss()',
        inUse: false,
      });

      // default to (logically) valid values
      this.controller.fieldData.dataType = 'string';
      this.controller.fieldData.dataTypeValue = { label: 'string', value: 'string' };
    });

    describe('fixDataForApi', function () {
      it('should correctly fix dataType and classification', function () {
        this.controller.fieldData.dataTypeValue.value = 'string';
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

      it('should return true if not unique AND not being created', function() {
        const fieldName = 'editedField';
        this.$scope.existingFieldIds.push(fieldName);
        // hack controller to think it's in edit mode
        this.controller.createMode = false;
        expect(this.controller.uniqueIdValidation(fieldName)).toBe(true);
      });
    });

    describe('isDisabledWhenInUse()', function () {
      [
        true,
        false,
      ].forEach(createMode => {
        it(`should return false when createMode is ${createMode} and inUse is false`, function() {
          this.controller.createMode = createMode;
          expect(this.controller.isDisabledWhenInUse()).toBe(false);
        });
      });
    });

    describe('createOrSaveButtonEnabled', function () {
      it('should return true if valid id, label, and datatype are selected', function () {
        this.controller.fieldData.id = 'someId';
        this.controller.fieldData.translations.en_US = 'label';
        this.controller.fieldData.dataTypeValue = { label: 'dataType', value: 'dataType' };
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
        this.controller.fieldData.dataTypeValue = { label: '', value: '' };

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
        });

        expect(this.controller.dataTypeOptions).toEqual([
          { label: 'context.dictionary.dataTypes.boolean',    value: 'boolean' },
          { label: 'context.dictionary.dataTypes.double',     value: 'double' },
          { label: 'context.dictionary.dataTypes.integer',    value: 'integer' },
          { label: 'context.dictionary.dataTypes.string',     value: 'string' },
          { label: 'context.dictionary.dataTypes.enumString', value: 'enumString' },
        ]);
      });

      describe('fixDataForApi', function () {
        it('should correctly fix dataType when the dataTypeDefintion is set', function () {
          const testDefinition = {
            type: 'enum',
            enumerations: ['a', 'b', 'c', 'd', 'e'],
            translations: {
              en_us: ['en-a', 'en-b', 'en-c', 'en-d', 'en-e'],
              fr: ['fr-a', 'fr-b', 'fr-c', 'fr-d', 'fr-e'],
            },
            inactiveEnumerations: ['b', 'c', 'd'],
          };
          const expectedResult = {
            type: 'enum',
            enumerations: ['a', 'e'],
            translations: {
              en_us: ['en-a', 'en-e'],
              fr: ['fr-a', 'fr-e'],
            },
            inactiveEnumerations: undefined,
          };

          this.controller.fieldData.dataTypeValue = { label: 'enumString', value: 'enumString' };
          this.controller.fieldData.dataTypeDefinition = _.cloneDeep(testDefinition);

          // get the "fixed" field data
          const fixedField = this.controller.fixDataForApi();
          const fixedDefinition = fixedField.dataTypeDefinition;

          expect(fixedField.dataType).toBe('string');
          expect(_.isEqual(fixedDefinition, expectedResult)).toBe(true);
        });
      });

      describe('addAndEditOption', function () {
        const optionsListCopy = [
          { index: 0, value: '1', edit: false },
          { index: 1, value: '2', edit: false },
        ];
        const addOptionsList = [
          { index: 0, value: '1', edit: false },
          { index: 1, value: '2', edit: false },
          { index: 2, value: '', edit: true },
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
            this.controller.optionsList = _.cloneDeep(addOptionsList);
            this.controller.optionsListCopy = _.cloneDeep(optionsListCopy);
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
            this.controller.optionsList = _.cloneDeep(addOptionsList);
            this.controller.optionsListCopy = _.cloneDeep(optionsListCopy);
            this.controller.newOption = '3';

            this.controller.cancelAddOption();
            expect(this.controller.optionsList).toEqual(this.controller.optionsListCopy);
            expect(this.controller.optionsListCopy).toEqual(optionsListCopy);
            expect(this.controller.editingOption).toBe(false);
            expect(this.controller.addEnumOption).toBe(false);
          });
        });

        describe('editOption', function () {
          const editOptionsListCopy = [
            { index: 0, value: '1', edit: false },
            { index: 1, value: '2', edit: true },
          ];
          it('should set the option edit as true when setEdit is called', function () {
            const option = {
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
            this.controller.optionsListCopy = _.cloneDeep(editOptionsListCopy);
            this.controller.setEdit( {
              index: 1,
              value: '2',
              edit: false }, true);

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
            const option = {
              index: 1,
              value: '2',
              edit: false };
            this.controller.optionsListCopy = _.cloneDeep([
              { index: 0, value: '1', edit: false },
              { index: 1, value: '2', edit: true },
            ]);
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
          const optionsList = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '2' },
            { index: 2, edit: false, value: '3' },
          ];

          const expectedDataTypeDefinition = {
            type: 'enum',
            enumerations: ['1', '2', '3'],
            translations: {
              en_US: ['1', '2', '3'],
            },
            inactiveEnumerations: [],
          };
          this.controller.updateDataTypeDefinition(optionsList);

          expect(this.controller.fieldData.dataTypeDefinition).toEqual(expectedDataTypeDefinition);
        });
      });

      describe('delete', function () {
        const origOptionsListCopy = [
          { index: 0, edit: false, value: '1' },
          { index: 1, edit: false, value: '2' },
          { index: 2, edit: false, value: '3' },
        ];

        const optionToBeDeleted = {
          index: 1,
          edit: false,
          value: '2',
        };

        const optionsListCopyAfterDelete = [
          { index: 0, edit: false, value: '1' },
          { index: 1, edit: false, value: '3' },
        ];

        const reorderOptions = [
          { label: '1', value: '1', id: 0, name: '1' },
          { label: '3', value: '3', id: 1, name: '3' },
        ];

        beforeEach(function () {
          this.setupAndDeleteOption = function() {
            this.controller.optionsListCopy = _.cloneDeep(origOptionsListCopy);
            this.controller.optionsList = _.cloneDeep(origOptionsListCopy);
            this.controller.existingFieldOptionsList = _.cloneDeep(origOptionsListCopy);
            this.controller.deleteOption(optionToBeDeleted, this.$scope.newFieldForm);
            this.$rootScope.$digest();
          };

          this.verifyDelete = function() {
            expect(this.controller.optionsList).toEqual(this.controller.optionsListCopy);
            expect(this.controller.optionsListCopy).toEqual(optionsListCopyAfterDelete);
            expect(this.controller.optionRadios).toEqual(reorderOptions);
            expect(formIsSetDirty).toBe(true);
          };

          this.verifyInactiveOptionIsSet = function () {
            expect(this.controller.inactiveOptionsList).toEqual([optionToBeDeleted]);
            expect(this.controller.fieldData.dataTypeDefinition.enumerations).toEqual(['1', '3', '2']);
            expect(this.controller.fieldData.dataTypeDefinition.inactiveEnumerations).toEqual(['2']);
          };

          this.verifyInactiveOptionIsNotSet = function () {
            expect(this.controller.inactiveOptionsList).toEqual([]);
            expect(this.controller.fieldData.dataTypeDefinition.enumerations).toEqual(['1', '3']);
            expect(this.controller.fieldData.dataTypeDefinition.inactiveEnumerations).toEqual([]);
          };
        });

        it('should remove the option and set inactive enum in edit mode', function (done) {
          this.controller.createMode = false;
          this.setupAndDeleteOption();

          this.verifyDelete();
          this.verifyInactiveOptionIsSet();
          done();
        });

        it('should not add option to inactive list if the option is not one of the items in the existing list', function (done) {
          const listWithoutDeletedOption = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '3' },
          ];
          this.controller.createMode = false;
          this.controller.optionsListCopy = _.cloneDeep(origOptionsListCopy);
          this.controller.optionsList = _.cloneDeep(origOptionsListCopy);
          this.controller.existingFieldOptionsList = _.cloneDeep(listWithoutDeletedOption);
          this.controller.deleteOption(optionToBeDeleted, this.$scope.newFieldForm);
          this.$rootScope.$digest();

          this.verifyDelete();
          this.verifyInactiveOptionIsNotSet();
          done();
        });

        it('should remove the option but not set the inactiveEnumeration in create', function (done) {
          this.controller.createMode = true;
          this.setupAndDeleteOption();

          this.verifyDelete();
          this.verifyInactiveOptionIsNotSet();
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

        describe('mark option inactive when edit', function () {
          it('should move the option to inactiveEnumerations when delete', function () {

          });
        });
      });

      describe('setReorder', function () {
        const origOptionsListCopy = [
          { index: 0, edit: false, value: '1' },
          { index: 1, edit: false, value: '2' },
        ];
        it('should set the correct controller flags when setReorder is called', function () {
          this.controller.optionsListCopy = _.cloneDeep(origOptionsListCopy);
          this.controller.setReorder();
          expect(this.controller.reorderEnumOptions).toBe(true);
          expect(this.controller.actionList.length).toBe(0);
          expect(this.controller.optionReorderListCopy).toEqual(origOptionsListCopy);
        });

        it('should save the order when save', function () {
          this.controller.optionsListCopy = _.cloneDeep(origOptionsListCopy);
          this.controller.setReorder();
          const newOptionsList = this.controller.optionsListCopy = [
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
          expect(this.controller.optionReorderListCopy).toEqual([]);
          expect(formIsSetDirty).toBe(true);
        });

        it('should reset the order when cancel', function () {
          this.controller.optionsListCopy = _.cloneDeep(origOptionsListCopy);
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

      describe('isSingleSelectCheckPassed', function () {
        it('should return false if the otpions is less than two', function () {
          this.controller.fieldData.dataTypeValue = {
            label: 'enumString',
            value: 'enumString',
          };

          this.controller.optionsListCopy = [
            { index: 0, edit: false, value: '1' },
          ];
          expect(this.controller.isSingleSelectCheckPassed()).toBe(false);
        });

        it('should return true if the otpions is equal to two', function () {
          this.controller.optionsListCopy = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '2' },
          ];
          expect(this.controller.isSingleSelectCheckPassed()).toBe(true);
        });
      });

      describe('uniqueOptionValidation', function () {
        /*tslint:disable*/
        it('should return false if the opton is one of the existing options in createMode', function () {
          this.controller.createMode = true;
          this.controller.addEnumOption = true;
          this.controller.optionsListCopy = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: false, value: '2' },
          ];

          expect(this.controller.uniqueOptionValidation('2')).toBe(false);
        });

        it('should return true if the opton is one of the existing options in edit mode', function () {
          this.controller.createMode = false;
          this.controller.addEnumOption = false;
          this.controller.optionsListCopy = [
            { index: 0, edit: false, value: '1' },
            { index: 1, edit: true, value: '2' },
          ];

          expect(this.controller.uniqueOptionValidation('2')).toBe(true);
        });
      });
    });
  });

  describe('render component with in-use field', () => {

    beforeEach(function () {

      this.existingField = {
        id: 'FIELD_ID',
        description: 'A field description',
        classification: 'ENCRYPTED',
        classificationUI: 'context.dictionary.fieldPage.encrypted',
        dataType: 'string',
        translations: { en_US: 'The field label' },
        searchable: true,
        lastUpdated: undefined,
        publiclyAccessible: false,
        publiclyAccessibleUI: 'someOrg',
        dataTypeDefinition: {
          enumerations: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          type: 'enum',
          inactiveEnumerations: ['Option 4'],
          translations: {
            en_US: ['en_US-Option 1', 'en_US-Option 2', 'us_US-Option 3', 'sn_US-Option 4'],
            fr: ['fr-Option 1', 'fr-Option 2', 'fr-Option 3', 'fr-Option 4'],
          }
        },
      };

      this.visibleEnumerationsLength = () => {
        const def = this.existingField.dataTypeDefinition;
        return def.enumerations.length - def.inactiveEnumerations.length;
      }

      this.compileComponent('context-field-modal', {
        inUse: true,
        existingFieldData: this.existingField,
        existingFieldIds: [this.existingField.id],
        callback: 'callback()',
        dismiss: 'dismiss()',
      });

      this.findElementWithContent = (parent, elementType, content) => {
        return parent.find(`${elementType}:contains("${content}")`)
      };

      this.getLabelElement = label => {
        const labelElement = this.findElementWithContent(this.view, 'p', label);
        return labelElement;
      };

      /*
        There's no id for this control, so we have to start with its "header label", which is a <p> element with a specific resource string.
        Then, cs-dropdown has an elaborate structure which ultimately ends up with a <span> that can only be found by knowing and
         traversing that structure. I hope.
       */
      this.getDropdownForLabel = (label) => {
        const labelElement = this.getLabelElement(label);
        const dropdown = labelElement.siblings().first().find('.csSelect-container').find('div[cs-dropdown]').children('span').first();
        return dropdown;
      };

      this.getInputGroupForLabel = label => {
        const labelElement = this.getLabelElement(label);
        return labelElement.parent();
      };

      this.getDataTypeContainer = () => {
        const container = this.getInputGroupForLabel('context.dictionary.fieldPage.dataType');
        return container;
      };

      this.getOptionsContainer = () => {
        const options = this.getDataTypeContainer().find('div .options-container');
        return options;
      };
    });

    it('should not remove inactive enumerations in fixDataForApi()', function () {
      const fixedField = this.controller.fixDataForApi();
      expect(_.isEqual(fixedField.dataTypeDefinition, this.existingField.dataTypeDefinition)).toBe(true);
    });

    it('should have disabled ID', function () {
      const id = this.view.find('#fieldId').first();
      expect(id).toBeDisabled();
    });

    it('should have enabled label', function () {
      const label = this.view.find('#fieldLabel');
      expect(label).not.toBeDisabled();
    });

    it('should have enabled description', function () {
      const description = this.view.find('#fieldDescription');
      expect(description).not.toBeDisabled();
    });

    it('should have disabled data type', function () {
      const dataTypeDropdown = this.getDropdownForLabel('context.dictionary.fieldPage.dataType');
      expect(dataTypeDropdown).toHaveClass('disabled');
    });

    describe('option controls', function () {

      beforeEach(function () {
        this.optionsContainer = this.getOptionsContainer();
        this.optionList = this.optionsContainer.find('#optionList');
        expect(this.optionList).not.toBeEmpty();
      });

      it ('should have disabled option-edit icons', function () {
        // the edit icons should be disabled/"hidden"
        const editIcons = this.optionList.find('[id^="edit-option-"]');
        expect(editIcons).toHaveLength(this.visibleEnumerationsLength());
        expect(editIcons).toHaveClass('icon');
        expect(editIcons).not.toHaveClass('icon-edit'); // make sure the edit icon is not displayed
        expect(editIcons).not.toHaveClass('icon-trash'); // well, better make sure it's also not the delete icon
        // toBeDisabled() doesn't work with <a>?
        expect(editIcons).toHaveAttr('disabled', 'disabled');
      });

      it('should have enabled option-delete icons', function () {
        // but the delete icons should be enabled
        const deleteIcons = this.optionList.find('[id^="delete-option-"]');
        expect(deleteIcons).toHaveLength(this.visibleEnumerationsLength());
        expect(deleteIcons).toHaveClass('icon');
        expect(deleteIcons).toHaveClass('icon-trash');
        // toBeDisabled() doesn't work with <a>?
        expect(deleteIcons).not.toHaveAttr('disabled');
      });

      it('should have enabled add-option', function () {
        const addButtn = this.findElementWithContent(this.optionsContainer, 'button', 'context.dictionary.fieldPage.enumOptionsAdd');
        expect(addButtn).toHaveClass('btn--link');
        expect(addButtn).not.toBeDisabled();
      });
    });

    it('should have disabled data privacy', function () {
      const privacyDropdown = this.getDropdownForLabel('context.dictionary.fieldPage.classification');
      expect(privacyDropdown).toHaveClass('disabled');
    });

    it('should have disabled searchable', function () {
      const searchable = this.view.find('#fieldSearchable');
      expect(searchable).toBeDisabled();
    });

    it('should have disabled save button', function() {
      const save = this.view.find('.modal-footer').find('button');
      expect(save.text()).toBe('common.save');
      expect(save).toBeDisabled();
    });
  });
});
