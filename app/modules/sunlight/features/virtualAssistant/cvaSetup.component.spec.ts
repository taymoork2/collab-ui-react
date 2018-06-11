import cvaSetupModule from './cvaSetup.component';
import { KeyCodes } from 'modules/core/accessibility';
import * as _ from 'lodash';


describe('Care Customer Virtual Assistant Setup Component', () => {
  const OrgName = 'Test-Org-Name';
  const OrgId = 'Test-Org-Id';
  const pages = [
    {
      name: 'cvaConfigOverview',
      previousButtonState: 'hidden',
      nextButtonState: false,
    },
    {
      name: 'cvaDialogIntegration',
      previousButtonState: true,
      nextButtonState: true,
    },
    {
      name: 'cvaAccessToken',
      previousButtonState: true,
      nextButtonState: false,
    },
    {
      name: 'name',
      previousButtonState: true,
      nextButtonState: false,

    },
    {
      name: 'vaAvatar',
      previousButtonState: true,
      nextButtonState: true,
    },
    {
      name: 'cvaContextFields',
      previousButtonState: true,
      nextButtonState: true,
    },
    {
      name: 'vaSummary',
      previousButtonState: true,
      nextButtonState: 'hidden',
    },
  ];
  const expectedPageTemplate = {
    templateId: jasmine.any(String),
    name: jasmine.any(String),
    configuration: {
      mediaType: 'virtualAssistant',
      pages: {
      },
    },
  };
  //fill in expected PageTemplate pages from Pages array above.
  pages.forEach(function (page) { expectedPageTemplate.configuration.pages[page.name] = jasmine.any(Object); });

  const expectedStates = Object.keys(expectedPageTemplate.configuration.pages);

  const getDummyLogo = function (data) {
    return {
      data: data,
    };
  };

  const dummyLogoUrl = 'https://www.example.com/logo.png';

  const failedData = {
    success: false,
    status: 403,
    Errors: [{
      errorCode: '100106',
    }],
  };

  let getLogoDeferred, getLogoUrlDeferred, controller, getFieldsetDeferred, getFieldDeferred;
  beforeEach(angular.mock.module('context.services'));

  beforeEach(function () {
    this.initModules('Sunlight', cvaSetupModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      '$modal',
      '$timeout',
      '$translate',
      'CTService',
      'Analytics',
      'Authinfo',
      'Notification',
      'CvaService',
      'ContextFieldsetsService',
      'ContextFieldsService',
      'FieldUtils',
    );

    this.$state.isAppleBusinessChatEnabled = true;

    //create mock deferred object which will be used to return promises
    getLogoDeferred = this.$q.defer();
    getLogoUrlDeferred = this.$q.defer();
    getFieldsetDeferred = this.$q.defer();
    getFieldDeferred = this.$q.defer();

    spyOn(this.$modal, 'open');
    spyOn(this.CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(this.CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(OrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue(OrgName);
    spyOn(Date, 'now').and.returnValues(10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10);
    spyOn(this.ContextFieldsetsService, 'getFieldset').and.returnValue(getFieldsetDeferred.promise);
    spyOn(this.ContextFieldsService, 'getFields').and.returnValue(getFieldDeferred.promise);

    this.compileComponent('cva-setup', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  function checkStateOfNavigationButtons(pageIndex: number, previousButtonState: any, nextButtonState: any): void {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton()).toEqual(previousButtonState);
    expect(controller.nextButton()).toEqual(nextButtonState);
  }

  describe('should test the', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(controller, 'getText').and.returnValue(deferred.promise);
      spyOn(controller, 'getCommonText').and.returnValue(deferred.promise);
    });

    it('getTitle', function () {
      controller.getTitle();
      expect(controller.getCommonText).toHaveBeenCalledWith('createTitle');
    });

    it('getTitle with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getTitle();
      expect(controller.getCommonText).toHaveBeenCalledWith('editTitle');
    });

    it('getSummaryDescription', function () {
      controller.template.configuration.pages.name.nameValue = 'testName';
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.cvaDesc', { name: controller.template.configuration.pages.name.nameValue });
    });

    it('getSummaryDescription with isEditFeature true', function () {
      controller.template.configuration.pages.name.nameValue = 'testName';
      controller.isEditFeature = true;
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.cvaDescEdit', { name: controller.template.configuration.pages.name.nameValue });
    });

    it('cancelModal', function () {
      spyOn(this.$translate, 'instant').and.callThrough();
      controller.cancelModal();
      expect(this.$translate.instant).toHaveBeenCalledWith('careChatTpl.cancelCreateDialog',
        { featureName: 'careChatTpl.virtualAssistant.cva.featureText.name' });
    });

    it('cancelModal with isEditFeature true', function () {
      spyOn(this.$translate, 'instant').and.callThrough();
      controller.isEditFeature = true;
      controller.cancelModal();
      expect(this.$translate.instant).toHaveBeenCalledWith('careChatTpl.cancelEditDialog',
        { featureName: 'careChatTpl.virtualAssistant.cva.featureText.name' });
    });
  });

  describe('Page Structures', function () {
    beforeEach(function () {
      getLogoDeferred.resolve(getDummyLogo('abcd'));
      getLogoUrlDeferred.resolve(dummyLogoUrl);
      this.$scope.$apply();
    });

    it('States correlate to pages', function () {
      expect(controller.states).toEqual(expectedStates);
    });

    it('First state is initial state', function () {
      expect(controller.currentState).toEqual(controller.states[0]);
    });

    it('keyboard functionality', function () {
      controller.evalKeyPress(KeyCodes.ESCAPE);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('Walk pages forward in order ', function () {
      for (let i = 0; i < controller.states.length; i++) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.nextPage();
        expect(this.Analytics.trackEvent).toHaveBeenCalledWith(controller.template.configuration.pages[controller.currentState].eventName, { durationInMillis: 0 });
        this.Analytics.trackEvent.calls.reset();
        this.$timeout.flush();
      }
    });

    it('Walk pages Backward in order ', function () {
      controller.currentState = controller.states[controller.states.length - 1];
      for (let i = (controller.states.length - 1); 0 <= i; i--) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.previousPage();
        this.$timeout.flush();
      }
    });

    pages.forEach(function (expectedPage, index) {
      it(expectedPage.name + ': previous button should be ' + (expectedPage.previousButtonState ? 'Enabled' : 'Disabled') +
        ' and next button should be ' + (expectedPage.nextButtonState ? 'Enabled' : 'Disabled'), function () {
        checkStateOfNavigationButtons(index, expectedPage.previousButtonState, expectedPage.nextButtonState);
      });

      it(expectedPage.name + ': make sure template file exists for page ' + expectedPage.name + '.tpl.html\'', function () {
        const expectedPageFilename = 'modules/sunlight/features/virtualAssistant/wizardPages/' + expectedPage.name + '.tpl.html';
        controller.currentState = controller.states[index];
        expect(controller.getCurrentPage()).toEqual(expectedPageFilename);
      });
    });
  });

  const getForm = function(inputName): any {
    return {
      [inputName]: {
        $setValidity: jasmine.createSpy('$setValidity'),
      },
    };
  };

  describe('Field Checks on All Pages with fields', function () {
    const CONFIG_OVERVIEW_PAGE_INDEX = 0;
    const ACCESS_TOKEN_PAGE_INDEX = 2;
    const NAME_PAGE_INDEX = 3;
    const CVA_CONTENTS_FIELDS_INDEX = 5;

    beforeEach(function () {
      controller.nameForm = getForm('nameInput');
    });

    it('Next button on Config Overview Page enabled when isDialogflowAgentConfigured is true', function () {
      controller.template.configuration.pages.cvaConfigOverview.isDialogflowAgentConfigured = true;
      checkStateOfNavigationButtons(CONFIG_OVERVIEW_PAGE_INDEX, 'hidden', true);
    });

    it('Next button on Config Overview Page disabled when isDialogflowAgentConfigured is false', function () {
      controller.template.configuration.pages.cvaConfigOverview.isDialogflowAgentConfigured = false;
      checkStateOfNavigationButtons(CONFIG_OVERVIEW_PAGE_INDEX, 'hidden', false);
    });

    it('Next button on Access Token Page enabled when accessTokenValue is valid and validation not needed', function () {
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);

      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, true);
    });

    it('Next button on Access Token Page disabled when accessTokenValue is valid and needs validation', function () {
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);

      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page enabled when nameValue is not empty', function () {
      controller.template.configuration.pages.name.nameValue = 'Hello World';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);
    });

    it('Next button on Name Page disabled when nameValue too long', function () {
      controller.template.configuration.pages.name.nameValue = _.repeat('X', controller.maxNameLength);
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);

      controller.template.configuration.pages.name.nameValue = _.repeat('X', controller.maxNameLength + 1);
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page disabled when nameValue is empty', function () {
      controller.template.configuration.pages.name.nameValue = '';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next page keyboard shortcut should not work if name field is invalid', function () {
      controller.template.configuration.pages.name.nameValue = '';
      const ENTER_KEYPRESS_EVENT = {
        which: KeyCodes.ENTER,
      };
      spyOn(controller, 'nextPage');
      controller.enterNextPage(ENTER_KEYPRESS_EVENT);
      expect(controller.nextPage).not.toHaveBeenCalled();
    });

    it('space keyboard shortcut should not trigger next page', function () {
      controller.template.configuration.pages.name.nameValue = 'testName';
      const SPACE_KEYPRESS_EVENT = {
        which: KeyCodes.SPACE,
      };
      spyOn(controller, 'nextPage');
      controller.enterNextPage(SPACE_KEYPRESS_EVENT);
      expect(controller.nextPage).not.toHaveBeenCalled();
    });

    it('Next button on Name Page disabled when nameValue is only spaces', function () {
      controller.template.configuration.pages.name.nameValue = '  ';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page disabled when nameValue is not unique', function () {
      controller.service.featureList.data = [{ name: 'hi i am baymax', id: '1' }];
      controller.template.configuration.pages.name.nameValue = 'Hi I am Baymax';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);

      controller.template.configuration.pages.name.nameValue = 'Baymax';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);
    });

    it('Next and Back button on Avatar Page disabled when avatar file is loading', function () {
      controller.avatarUploadState = controller.avatarState.LOADING;
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, false, false);
    });

    it('Next button on Avatar Page enabled when avatar file error', function () {
      controller.avatarUploadState = controller.avatarState.PREVIEW;
      controller.template.configuration.pages.vaAvatar.avatarError = 'FileUploadError';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Dialogflow Input Context Page disabled when error in form', function () {
      const invalid = {
        contextFieldId: 'HomePhone',
        contextAssociation: 'pho ne1',
      };
      controller.cvaInputContext.validateInput(invalid);
      expect(controller.cvaInputContext.isFormValid()).toEqual(false);
      checkStateOfNavigationButtons(CVA_CONTENTS_FIELDS_INDEX, true, false);
    });

    it('Next button on Dialogflow Input Context Page enabled when no error in form', function () {
      const valid = {
        contextFieldId: 'HomePhone',
        contextAssociation: 'phone1',
      };
      controller.cvaInputContext.validateInput(valid);
      expect(controller.cvaInputContext.isFormValid()).toEqual(true);
      checkStateOfNavigationButtons(CVA_CONTENTS_FIELDS_INDEX, true, true);
    });
  });

  describe('AccessToken Page', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(this.CvaService, 'isDialogflowTokenValid').and.returnValue(deferred.promise);
      controller.tokenForm = getForm('tokenInput');
    });

    it('should validateToken successfully', function () {
      deferred.resolve(true);
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;

      controller.validateDialogflowToken();
      this.$scope.$apply();

      expect(controller.template.configuration.pages.cvaAccessToken.invalidToken).toEqual(false);
      expect(controller.template.configuration.pages.cvaAccessToken.needsValidation).toEqual(false);
    });

    it('should validateToken unsuccessfully', function () {
      deferred.reject(false);
      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;

      controller.validateDialogflowToken();
      this.$scope.$apply();

      expect(controller.template.configuration.pages.cvaAccessToken.invalidToken).toEqual(true);
      expect(controller.template.configuration.pages.cvaAccessToken.needsValidation).toEqual(false);
    });

    it('validate button should be enabled if validation fails', function () {
      expect(controller.isValidateButtonDisabled()).toBeTruthy();  // disabled if input blank
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      deferred.reject(false);
      controller.validateDialogflowToken();
      this.$scope.$apply();
      expect(controller.isValidateButtonDisabled()).toBeFalsy(); // validation failed, button should be enabled
    });

    it('validate button should be disabled if token is already validated', function () {
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      expect(controller.isValidateButtonDisabled()).toBeFalsy();  // disabled if not validated
      deferred.resolve(true);
      controller.validateDialogflowToken();
      this.$scope.$apply();
      expect(controller.isValidateButtonDisabled()).toBeTruthy(); // validation passed, button should be enabled
    });

    it('getAccessTokenError should return correct error', function () {
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.tokenForm.$valid = true;
      controller.getAccessTokenError();
      expect(controller.tokenForm.tokenInput.$setValidity).toHaveBeenCalledWith('invalidToken', false);
    });
  });

  describe('Avatar Page', function () {
    let deferredFileDataUrl;
    beforeEach(function() {
      deferredFileDataUrl = this.$q.defer();
      spyOn(this.CvaService, 'getFileDataUrl').and.returnValue(deferredFileDataUrl.promise);
    });

    it('should validate avatar file type', function () {
      deferredFileDataUrl.resolve('');
      const size = 1000;
      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.jpeg', size });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_TYPE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png', size });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.NO_ERROR);
    });

    it('should validate avatar file size', function () {
      deferredFileDataUrl.resolve('');
      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: controller.MAX_AVATAR_FILE_SIZE + 1 });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_SIZE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: 0 });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_SIZE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: controller.MAX_AVATAR_FILE_SIZE });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.NO_ERROR);
    });
  });

  describe('Dialogflow Input Context Page', () => {
    it('should return single object with value mapping from associated fields', () => {
      const associatedFields = [
        {
          contextFieldId: 'HomePhone',
          contextAssociation: 'phone1',
        },
        {
          contextFieldId: 'WorkPhone',
          contextAssociation: 'phone2',
        },
      ];
      const expectedOutput = {
        HomePhone: 'phone1',
        WorkPhone: 'phone2',
      };
      associatedFields.forEach(field => controller.cvaInputContext.associatedFields.push(field));
      associatedFields.forEach(field => {
        const errValue = controller.cvaInputContext.validateInput(field);
        expect(errValue).toEqual(controller.cvaInputContext.ERROR_TYPES.ERROR_NONE);
      });
      const fields = controller.cvaInputContext.getContextServiceFieldsObject();
      expect(fields).toEqual(expectedOutput);
    });

    it('should indicate form valid if entries indicate no errors', () => {
      const validAssociations = [
        {
          contextFieldId: 'HomePhone',
          contextAssociation: 'phone1',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_NONE,
        },
        {
          contextFieldId: 'WorkPhone',
          contextAssociation: 'pho_ne2',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_NONE,
        },
        {
          contextFieldId: 'MobilePhone',
          contextAssociation: 'phone3.phone3',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_NONE,
        },
        {
          contextFieldId: 'OtherPhone',
          contextAssociation: 'Other-Phone',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_NONE,
        },

      ];
      validAssociations.forEach(field => {
        const errValue = controller.cvaInputContext.validateInput(field);
        expect(field.expectedError).toEqual(errValue);
      });
      expect(controller.cvaInputContext.isFormValid()).toEqual(true);
    });

    it('should indicate form invalid if entries indicate errors', () => {
      const invalidAssociations = [
        {
          contextFieldId: 'HomePhone',
          contextAssociation: 'pho ne1',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_INVALID_VALUE,
        },
        {
          contextFieldId: 'WorkPhone',
          contextAssociation: 'pho{ne2',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_INVALID_VALUE,
        },
        {
          contextFieldId: 'MobilePhone',
          contextAssociation: 'phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3phone3',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_MAX_LENGTH,
        },
        {
          contextFieldId: 'OtherPhone',
          contextAssociation: '',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_MIN_LENGTH,
        },
        {
          contextFieldId: 'ValidField',
          contextAssociation: 'aValidFiedForReference',
          expectedError: controller.cvaInputContext.ERROR_TYPES.ERROR_NONE,
        },
      ];
      invalidAssociations.forEach(field => {
        const errValue = controller.cvaInputContext.validateInput(field);
        expect(field.expectedError).toEqual(errValue);
      });
      expect(controller.cvaInputContext.isFormValid()).toEqual(false);
      expect(controller.cvaInputContext.isLineError('WorkPhone')).toEqual(true);
      expect(controller.cvaInputContext.getLineError('WorkPhone')).toEqual(controller.cvaInputContext.ERROR_TYPES.ERROR_INVALID_VALUE);
      expect(controller.cvaInputContext.isLineError('ValidField')).toEqual(false);
      expect(controller.cvaInputContext.getLineError('ValidField')).toEqual(controller.cvaInputContext.ERROR_TYPES.ERROR_NONE);
    });

    describe('Specific behavior from Context Fields screen', () => {
      const cvaData = {
        id1: 'value1',
        id8: 'value8',
      };

      const generateAllSelectableFields = (count = 10) => {
        for (let i = 0; i < count; i++) {
          const fieldData = {
            id: `id${i}`,
            description: `description${i}`,
            classification: '',
            dataType: 'string',
            fieldInfo: '',
            publiclyAccessible: true,
            translations: {},
            searchable: true,
            refUrl: '',
            lastUpdated: '',
          };
          controller.cvaInputContext.allSelectableFields.push(fieldData);
        }
      };

      // Generate array of IFieldData objects to simulate response from ContextServiceFieldsService
      const generateFields = (count) => {
        // Use generate selectable to obtain IFieldData objects
        generateAllSelectableFields(count);

        const allFields: any = [];
        while (controller.cvaInputContext.allSelectableFields.length > 0) {
          const iField = controller.cvaInputContext.allSelectableFields.shift();
          allFields.push(iField);
        }
        expect(allFields.length).toEqual(20);
        return allFields;
      };

      // Generate IFieldsetData containing a set of IFieldData ids.
      const generateFieldset = (count) => {
        // Generate field set to simulate fieldset service response
        const fields: any = [];
        for (let i = 0 ; i < count; i ++) {
          fields.push(`id${i}`);
        }
        const fieldSet = {
          id: 'fieldSet',
          description: 'myFieldSet',
          fields,
          inactiveFields: [],
          lastUpdated: '',
          publiclyAccessible: true,
          publiclyAccessibleUI: '',
        };
        return fieldSet;
      };

      it('should succeed load of CS fields from Context Services', function () {
        const allFields = generateFields(20);
        const fieldSet = generateFieldset(10);

        getFieldsetDeferred.resolve(fieldSet);
        getFieldDeferred.resolve(allFields);

        // the load operation will populate associated fields
        controller.cvaInputContext.loadFields(cvaData);
        this.$scope.$apply();
        expect(controller.cvaInputContext.isLoadFailure()).toEqual(false);
      });

      it('should report retry on failure of load of CS fields from Context Services', function () {
        getFieldsetDeferred.reject({});
        controller.cvaInputContext.loadFields(cvaData);
        this.$scope.$apply();
        expect(controller.cvaInputContext.associatedFields.length).toEqual(2);
        expect(controller.cvaInputContext.isLoadFailure()).toEqual(true);
      });

      it('should show sub-set of available fields from CS given data from CVA', function () {
        const allFields = generateFields(20);
        const fieldSet = generateFieldset(10);

        getFieldsetDeferred.resolve(fieldSet);
        getFieldDeferred.resolve(allFields);

        // the load operation will populate associated fields
        controller.cvaInputContext.loadFields(cvaData);
        this.$scope.$apply();

        expect(controller.cvaInputContext.associatedFields.length).toEqual(2);
        expect(controller.cvaInputContext.selectedFields.length).toEqual(2);

        // Note: the total set of IFielData is 20, but the value in IFieldset.fields is 10, thus, selectable fields start at 10.
        //       However, 2 elements are 'selected' from CVA, which means only 8 should be selectable after load completes.
        expect(controller.cvaInputContext.allSelectableFields.length).toEqual(8);
      });

      it('should show sub-set of available fields changes based on user action', () => {
        generateAllSelectableFields(10);
        expect(controller.cvaInputContext.allSelectableFields.length).toEqual(10);
        expect(controller.cvaInputContext.selectedFields.length).toEqual(0);
        controller.cvaInputContext.selectField(controller.cvaInputContext.allSelectableFields[6]);
        expect(controller.cvaInputContext.selectedFields.length).toEqual(1);
        expect(controller.cvaInputContext.associatedFields.length).toEqual(1);
        expect(controller.cvaInputContext.allSelectableFields.length).toEqual(9);
        const removeEntry = controller.cvaInputContext.associatedFields[0];
        const mockForm = {
          $setDirty: () => {},
        };
        controller.cvaInputContext.removeFieldFromList(removeEntry, mockForm);
        expect(controller.cvaInputContext.allSelectableFields.length).toEqual(10);
        expect(controller.cvaInputContext.selectedFields.length).toEqual(0);
        expect(controller.cvaInputContext.associatedFields.length).toEqual(0);
        expect(controller.cvaInputContext.associatedFields.length).toEqual(0);

      });

      it('should indicate selection match/no-match depending on input', () => {
        generateAllSelectableFields();
        controller.cvaInputContext.selectedField = 'idX';
        expect(controller.cvaInputContext.noMatches()).toEqual(true);
        controller.cvaInputContext.selectedField = 'id5';
        expect(controller.cvaInputContext.noMatches()).toEqual(false);
      });
      it('should indicate no more fields when selectable fields are depleted', () => {
        generateAllSelectableFields();
        expect(controller.cvaInputContext.noMoreFields()).toEqual(false);
        while (controller.cvaInputContext.allSelectableFields.length > 0) {
          controller.cvaInputContext.allSelectableFields.pop();
        }
        expect(controller.cvaInputContext.noMoreFields()).toEqual(true);
      });

      it('should populate input context with data from CS field id', () => {
        generateAllSelectableFields(10);
        controller.cvaInputContext.selectField(controller.cvaInputContext.allSelectableFields[5]);
        expect(controller.cvaInputContext.associatedFields[0].contextFieldId).toEqual('id5');
        expect(controller.cvaInputContext.associatedFields[0].contextAssociation).toEqual('id5');
      });
    });
  });

  describe('Summary Page', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(this.CvaService, 'addConfig').and.returnValue(deferred.promise);
      spyOn(this.CvaService, 'updateConfig').and.returnValue(deferred.promise);
    });

    it("When save template failed, the 'saveTemplateErrorOccurred' is set", function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      deferred.reject(failedData);

      controller.submitFeature();
      this.$scope.$apply();

      const featureNameObj = { featureName: 'careChatTpl.virtualAssistant.cva.featureText.name' };
      expect(controller.saveTemplateErrorOccurred).toBeTruthy();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String), featureNameObj);
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_CREATE_FAILURE);
    });

    it('should submit template successfully', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();

      spyOn(this.$state, 'go');
      deferred.resolve({
        success: true,
        botServicesConfigId: 'ABotConfigurationId',
        status: 201,
      });

      controller.submitFeature();
      this.$scope.$apply();

      expect(this.Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String),
      });
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, { durationInMillis: 10 });
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, { durationInMillis: 0 });
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_CREATE_SUCCESS);
    });

    it('should submit template successfully for Edit', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      controller.isEditFeature = true;
      spyOn(this.$state, 'go');
      deferred.resolve({
        success: true,
        status: 200,
      });
      controller.submitFeature();
      this.$scope.$apply();

      expect(this.Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String),
      });
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, { durationInMillis: 10 });
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, { durationInMillis: 0 });
    });

    it('should submit template failed for Edit', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      deferred.reject(failedData);
      controller.isEditFeature = true;

      controller.submitFeature();
      this.$scope.$apply();

      const featureNameObj = { featureName: 'careChatTpl.virtualAssistant.cva.featureText.name' };
      expect(controller.saveTemplateErrorOccurred).toBeTruthy();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String), featureNameObj);
    });

    it('should set proper error message, when save fails due to invalid name', function () {
      controller.template.configuration.pages.name.nameValue = 'testName';
      const response = (<any>Object).assign({ data: { type: 'invalidInput.duplicateName' } }, failedData);
      spyOn(this.$translate, 'instant').and.returnValue('some translation');

      deferred.reject(response);
      controller.submitFeature();
      this.$scope.$apply();

      expect(controller.template.configuration.pages.name.nameWithError).toBe('testName');
      expect(this.$translate.instant).toHaveBeenCalledWith('careChatTpl.virtualAssistant.invalidInput.duplicateName',
        { featureName: jasmine.any(String) });
      expect(controller.summaryErrorMessage).toBe('some translation');
    });

    it('should set proper error, when save fails due to invalid icon', function () {
      const response = (<any>Object).assign({ data: { type: 'invalidInput.invalidIcon' } }, failedData);
      spyOn(this.$translate, 'instant').and.returnValue('some translation for invalid icon');

      deferred.reject(response);
      controller.submitFeature();
      this.$scope.$apply();

      expect(controller.template.configuration.pages.vaAvatar.avatarError).toBe(controller.avatarErrorType.INVALID_FILE);
      expect(this.$translate.instant).toHaveBeenCalledWith('careChatTpl.virtualAssistant.invalidInput.invalidIcon',
        { featureName: jasmine.any(String) });
      expect(controller.summaryErrorMessage).toBe('some translation for invalid icon');
    });

    it('should set proper error, when save fails due to invalid access token', function () {
      const response = (<any>Object).assign({ data: { type: 'invalidInput.invalidAccessToken' } }, failedData);
      spyOn(this.$translate, 'instant').and.returnValue('some translation for invalid token');

      deferred.reject(response);
      controller.submitFeature();
      this.$scope.$apply();

      expect(controller.template.configuration.pages.cvaAccessToken.invalidToken).toBeTruthy();
      expect(controller.template.configuration.pages.cvaAccessToken.needsValidation).toBeFalsy();
      expect(this.$translate.instant).toHaveBeenCalledWith('careChatTpl.virtualAssistant.invalidInput.invalidAccessToken',
        { featureName: jasmine.any(String) });
      expect(controller.summaryErrorMessage).toBe('some translation for invalid token');
    });
  });
});
