import { IToolkitModalService } from 'modules/core/modal';
import * as _ from 'lodash';
import { VaCommonSetupCtrl } from './vaCommonSetupCtrl';
import { AccessibilityService } from 'modules/core/accessibility';
import { CvaContextFields } from './cvaContextFields';

enum PageFocusKey {
  CVA_CONFIG_OVERVIEW = 'cvaConfigOverview',
}

enum PageLocatorKey {
  CVA_CONFIG_OVERVIEW = '[name="dialogflowRadio"]',
}

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}

interface ICvaSetupPages {
  [key: string]: boolean;
}

// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
// preserve the ng-include module paths
const requireContext = (require as any).context(`ngtemplate-loader?module=Sunlight&relativeTo=app/!modules/sunlight/features/virtualAssistant/wizardPages/`, false, /^\.\/.*\.tpl\.html$/);
requireContext.keys().map(key => requireContext(key));

/**
 * CustomerVirtualAssistantSetupCtrl
 */
class CustomerVirtualAssistantSetupCtrl extends VaCommonSetupCtrl {

  public maxTokenLength = 128;
  public tokenForm: ng.IFormController;
  private cvaInputContext: CvaContextFields;
  private CVA_CONTENTS_FIELDS: string = 'cvaContextFields';

  public template = {
    templateId: '',
    name: '',
    configuration: {
      mediaType: this.CvaService.cvaServiceCard.type,
      pages: {
        cvaConfigOverview: {
          enabled: true,
          isDialogflowAgentConfigured: false,
          configurationType: this.CvaService.configurationTypes.dialogflow,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_OVERVIEW_PAGE,
        },
        cvaDialogIntegration: {
          enabled: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_DIALOGUE_PAGE,
        },
        cvaAccessToken: {
          enabled: true,
          accessTokenValue: '',
          invalidToken: true,
          validatingToken: false,
          needsValidation: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_ACCESS_TOKEN_PAGE,
        },
        name: {
          enabled: true,
          nameValue: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_NAME_PAGE,
          nameWithError: '',
        },
        vaAvatar: {
          enabled: true,
          fileValue: '',
          avatarError: this.avatarErrorType.NO_ERROR,
          uploadCanceled: false,
          avatarImageSrc: '/images/vaAvatarDefaultIcon.png',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_AVATAR_PAGE,
        },
        cvaContextFields: {
          enabled: true,
          contextServiceFields: {},
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_CONTEXT_FIELDS,
        },
        vaSummary: {
          enabled: true,
          visibleError: false,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE,
        },
      },
    },
  };

  /* @ngInject*/
  constructor(
    public $element: ng.IRootElementService,
    public $scope: ng.IScope,
    public $state,
    public $stateParams: ng.ui.IStateParamsService,
    public $modal: IToolkitModalService,
    public $translate: ng.translate.ITranslateService,
    public $timeout: ng.ITimeoutService,
    public $window: ng.IWindowService,
    protected $q: ng.IQService,
    public AccessibilityService: AccessibilityService,
    public Analytics,
    public Authinfo,
    public CTService,
    public CvaService,
    public Notification,
    public UrlConfig,
    public ContextFieldsetsService,
    public ContextFieldsService,
    public FieldUtils,
  ) {
    super($element, $modal, $scope, $state, $timeout, $translate, $window, Analytics, Authinfo, CTService, Notification, UrlConfig);
    this.service = this.CvaService;
    // states == pages in order as found in storage template
    this.states = Object.keys(this.template.configuration.pages);

    // IF Apple Business Chat is not enabled, then, make sure the page is not visible/active
    if (!this.$state.isAppleBusinessChatEnabled) {
      this.states = this.states.filter(entry => entry !== this.CVA_CONTENTS_FIELDS);
    }
    this.currentState = this.states[0];
    this.cvaInputContext = new CvaContextFields(this.ContextFieldsetsService, this.ContextFieldsService, $translate, this.FieldUtils, this.$q);
  }

  /**
   * Initialize the controller
   */
  public $onInit() {
    this.template.configuration.pages.cvaConfigOverview.startTimeInMillis = Date.now();
    if (this.$stateParams.isEditFeature) {
      this.isEditFeature = true;
      this.template.templateId = this.$stateParams.template.id;
      this.template.configuration.pages.cvaConfigOverview.isDialogflowAgentConfigured = true;
      this.template.configuration.pages.name.nameValue = this.$stateParams.template.name;
      this.template.configuration.pages.cvaAccessToken.accessTokenValue = this.$stateParams.template.config.token;
      this.template.configuration.pages.cvaAccessToken.invalidToken = false;
      this.template.configuration.pages.cvaAccessToken.needsValidation = false;
      this.template.configuration.pages.cvaContextFields.contextServiceFields = this.$stateParams.template.contextServiceFields;

      if (this.$stateParams.template.icon) {
        this.avatarUploadState = this.avatarState.PREVIEW;
        this.template.configuration.pages.vaAvatar.fileValue = this.$stateParams.template.icon;
      }
    }

    // Only initialize the input context element if Apple Business Class is enabled
    if (this.$state.isAppleBusinessChatEnabled) {
      if (this.$stateParams.isEditFeature) {
        this.cvaInputContext.init(this.template.configuration.pages.cvaContextFields.contextServiceFields);
      } else {
        this.cvaInputContext.init(null);
      }
    }
  }

  private pageFocus: ICvaSetupPages = {};
  private setFocus(page: PageFocusKey, locator: PageLocatorKey) {
    const element = this.$element.find(locator);
    if (!this.pageFocus[page] && element.length > 0) {
      this.AccessibilityService.setFocus(this.$element, locator);
      this.unsetFocus();
      this.pageFocus[page] = true;
    }
  }

  private unsetFocus() {
    _.forEach(this.pageFocus, (_value, key: PageFocusKey) => {
      this.pageFocus[key] = false;
    });
  }

  /**
  *  Determine if handled intent should be displayed if feature flag is on
  */
  protected isCVASelfServiceEnabled(): boolean {
    return this.$state.isCVASelfServiceEnabled;
  }

  /**
   * should next button be rendered.
   * @returns {boolean}
   */
  public nextButton(): any {
    switch (this.currentState) {
      case 'cvaConfigOverview':
        this.setFocus(PageFocusKey.CVA_CONFIG_OVERVIEW, PageLocatorKey.CVA_CONFIG_OVERVIEW);
        return this.isDialogflowAgentConfigured(); // check radio button state
      case 'cvaDialogIntegration':
        this.unsetFocus();
        return true;
      case 'cvaAccessToken':
        this.unsetFocus();
        return this.isAccessTokenValid();
      case 'name':
        this.unsetFocus();
        return this.isNamePageValid() && !this.isAvatarUploading();
      case 'vaAvatar':
        this.unsetFocus();
        return !this.isAvatarUploading();
      case this.CVA_CONTENTS_FIELDS:
        this.unsetFocus();
        return this.cvaInputContext.isFormValid();
      case 'vaSummary':
        this.unsetFocus();
        return 'hidden';
    }
  }

  /**
   * submit the collected template of data for storage.
   */
  public submitFeature(): void {
    const name = this.template.configuration.pages.name.nameValue.trim();
    const config = this.createConfigurationObject(); // Note: this is our point of extensibility as other types besides dialogflow are supported.

    const contextServiceFields = this.cvaInputContext.getContextServiceFieldsObject();
    this.template.configuration.pages.cvaContextFields.contextServiceFields = contextServiceFields;

    this.creatingTemplate = true;
    const avatarDataUrl = this.template.configuration.pages.vaAvatar.fileValue;
    if (this.isEditFeature) {
      this.updateFeature(
        this.template.templateId,
        this.template.configuration.pages.cvaConfigOverview.configurationType,
        name,
        config,
        this.orgId,
        contextServiceFields,
        avatarDataUrl);
    } else {
      this.createFeature(
        this.template.configuration.pages.cvaConfigOverview.configurationType,
        name,
        config,
        this.orgId,
        contextServiceFields,
        avatarDataUrl);
    }
  }

  public onDialogflowTokenChange(): void {
    this.template.configuration.pages.cvaAccessToken.invalidToken = true;
    this.template.configuration.pages.cvaAccessToken.needsValidation = true; //changed token needs validation
  }

  /**
   * validate the Dialogflow Token
   */
  public validateDialogflowToken(): void {
    const controller = this;
    controller.template.configuration.pages.cvaAccessToken.validatingToken = true;
    const accessToken = (controller.template.configuration.pages.cvaAccessToken.accessTokenValue || '').trim();
    controller.service.isDialogflowTokenValid(accessToken)
      .then(function () {
        controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
        controller.template.configuration.pages.cvaAccessToken.needsValidation = false; //we just validated it.
        controller.tokenForm.tokenInput.$setValidity('invalidToken', true); //mark input as valid
        controller.template.configuration.pages.cvaAccessToken.validatingToken = false;
      })
      .catch(function () {
        controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
        controller.template.configuration.pages.cvaAccessToken.needsValidation = false; //we just validated it; and it failed.
        controller.tokenForm.tokenInput.$setValidity('invalidToken', false); //mark input as invalid
        controller.template.configuration.pages.cvaAccessToken.validatingToken = false;
      });
  }

  public getAccessTokenError(): any {
    if (!_.isEmpty(this.tokenForm)) {
      if (this.template.configuration.pages.cvaAccessToken.invalidToken && this.tokenForm.$valid) {
        // if token set as invalid outside of the form (ie when we tried to save at the end),
        // then update form validity now that we have access to the form
        this.tokenForm.tokenInput.$setValidity('invalidToken', false); //mark input as invalid
      }
      return this.tokenForm.tokenInput.$error;
    }
  }

  /**
   * validate button should be disabled if input is blank or if token already validated
   * @returns {boolean} true if access token validate button should be disabled
   */
  public isValidateButtonDisabled(): boolean {
    return !(this.template.configuration.pages.cvaAccessToken.accessTokenValue) || this.isAccessTokenValid();
  }

  /** Data Validation functions **/
  public isDialogflowAgentConfigured(): boolean {
    return !!this.template.configuration.pages.cvaConfigOverview.isDialogflowAgentConfigured;
  }

  public isAccessTokenInvalid(): boolean {
    return (this.template.configuration.pages.cvaAccessToken.invalidToken &&
      !this.template.configuration.pages.cvaAccessToken.needsValidation);
  }

  public isAccessTokenValid(): boolean {
    return !!(this.template.configuration.pages.cvaAccessToken.accessTokenValue || '').trim()
      && this.isValidTokenLength()
      && !this.template.configuration.pages.cvaAccessToken.needsValidation
      && !this.template.configuration.pages.cvaAccessToken.invalidToken;
  }
  public isNameValid(): boolean {
    const name = (this.template.configuration.pages.name.nameValue || '').trim();
    return this.isNameLengthValid(name) && this.isUniqueName(name);
  }

  public isNamePageValid(): boolean {
    const name = (this.template.configuration.pages.name.nameValue || '').trim();
    return name !== '' && this.isNameValid();
  }

  private isNameLengthValid (name): boolean {
    const isLengthValid = (_.get(name, 'length', 0) <= this.maxNameLength);

    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity(this.NameErrorMessages.ERROR_CHAR_50, isLengthValid);
    }
    return isLengthValid;
  }

  private isUniqueName(name): boolean {
    const controller = this;
    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity(this.NameErrorMessages.PROCESSING, true);
    }

    const list = this.service.featureList.data;
    //will return undefined if no name found,  !undefined = true
    let isUnique = !_.find(list, function (cva: any) {
      return cva.id !== controller.template.templateId && cva.name.toLowerCase() === name.toLowerCase();
    });
    const nameWithError = this.template.configuration.pages.name.nameWithError;
    if (!_.isEmpty(nameWithError)) {
      //this can happen if we already tried to save to the server and got a duplicate name error that was not caught by the above check
      isUnique = isUnique && name.toLowerCase() !== nameWithError;
    }
    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity(this.NameErrorMessages.DUPLICATE_ERROR, isUnique);
    }
    return isUnique;
  }
  /**
   * create and store the current feature
   * @param type
   * @param name
   * @param config
   * @param orgId
   * @param avatarDataUrl optional
   */
  private createFeature(type: string, name: string, config: any, orgId: string, contextServiceFields: any, avatarDataUrl?: string): void {
    const controller = this;
    controller.service.addConfig(type, name, config, orgId, contextServiceFields, avatarDataUrl)
      .then(function () {
        controller.handleFeatureCreation();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError(response);
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.createConfigFailureText'), {
          featureName: controller.$translate.instant('careChatTpl.virtualAssistant.cva.featureText.name'),
        });
        controller.Analytics.trackEvent(controller.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_CREATE_FAILURE);
      });
  }

  /**
   * Writing the metrics to analytics for the last page and the overall wizard
   */
  private writeMetrics(): void {
    const currentTimeInMillis = Date.now();
    let durationInMillis = currentTimeInMillis - this.template.configuration.pages.vaSummary.startTimeInMillis;
    let analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, analyticProps);
    durationInMillis = currentTimeInMillis - this.template.configuration.pages.cvaConfigOverview.startTimeInMillis;
    analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, analyticProps);
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_CREATE_SUCCESS);
  }

  /**
   * update and store the current feature
   * @param templateId
   * @param type
   * @param name
   * @param config
   * @param orgId
   * @param avatarDataURl optional
   */
  private updateFeature(templateId: string, type: string, name: string, config: any, orgId: string, contextServiceFields: any, avatarDataUrl?: string): void {
    const controller = this;
    controller.service.updateConfig(templateId, type, name, config, orgId, contextServiceFields, avatarDataUrl)
      .then(function () {
        controller.handleFeatureUpdate();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError(response);
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.updateConfigFailureText'), {
          featureName: controller.$translate.instant('careChatTpl.virtualAssistant.cva.featureText.name'),
        });
      });
  }

  /**
   * This is where we can extend our controller to support other types of assistants besides Dialogflow.
   * Each one may have a different Configuration object that we are going to add/update.
   * template.configuration.pages.cvaConfigOverview.configurationType  holds the type that is being added/updated.
   * @returns {*}
   */
  private createConfigurationObject(): any {
    return {
      token: this.template.configuration.pages.cvaAccessToken.accessTokenValue.trim(),
    };
  }

  private isValidTokenLength(): boolean {
    return (this.template.configuration.pages.cvaAccessToken.accessTokenValue || '').trim().length <= this.maxTokenLength;
  }
}
/**
 * Customer Virtual Assistant Component used for Creating new Customer Virtual Assistant
 */
export class CustomerVirtualAssistantSetupComponent implements ng.IComponentOptions {
  public controller = CustomerVirtualAssistantSetupCtrl;
  public template = require('modules/sunlight/features/virtualAssistant/vaSetup.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('cvaSetup', new CustomerVirtualAssistantSetupComponent());
