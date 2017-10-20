import { IToolkitModalService } from 'modules/core/modal';
import * as _ from 'lodash';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}

// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
// preserve the ng-include module paths
const requireContext = (require as any).context(`ngtemplate-loader?module=Sunlight&relativeTo=app/!modules/sunlight/features/virtualAssistant/wizardPages/`, false, /^\.\/.*\.tpl\.html$/);
requireContext.keys().map(key => requireContext(key));

/**
 * CustomerVirtualAssistantSetupCtrl
 */
class CustomerVirtualAssistantSetupCtrl implements ng.IComponentController {

  private animationTimeout = 10;
  private escapeKey = 27;

  public animation = '';
  public maxNameLength = 50;
  public maxTokenLength = 128;
  public service = this.CvaService;
  public logoUrl = '';
  public logoFile = '';
  public logoUploaded = false;
  public isEditFeature = false;
  public orgName = this.Authinfo.getOrgName();
  public orgId = this.Authinfo.getOrgId();
  public creatingTemplate = false;
  public templateButtonText = this.$translate.instant('common.finish');
  public saveTemplateErrorOccurred = false;
  public cancelModalText = {};
  public nameForm: ng.IFormController;
  public tokenForm: ng.IFormController;
  private tokenFormErrors = {};
  private escalationIntentUrl: string;

  // Avatar file error
  public avatarErrorType = {
    NO_ERROR: 'None',
    FILE_TYPE_ERROR: 'FileTypeError',
    FILE_SIZE_ERROR: 'FileSizeError',
    FILE_UPLOAD_ERROR: 'FileUploadError',
  };

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
        vaName: {
          enabled: true,
          nameValue: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_NAME_PAGE,
        },
        vaAvatar: {
          enabled: true,
          fileValue: '',
          avatarError: this.avatarErrorType.NO_ERROR,
          uploadCanceled: false,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_AVATAR_PAGE,
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
  // states == pages in order as found in storage template
  public states = Object.keys(this.template.configuration.pages);
  public currentState = this.states[0];

  // Avatar file load progress states
  public avatarState = {
    SELECT: 'SELECT',
    LOADING: 'LOADING',
    PREVIEW: 'PREVIEW',
  };
  public avatarUploadState = this.avatarState.SELECT;
  public MAX_AVATAR_FILE_SIZE = 1048576; // 1MB

  /* @ngInject*/
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private CvaService,
    private Authinfo,
    private CTService,
    private Analytics,
    private Notification,
    private UrlConfig,
  ) {
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
      this.template.configuration.pages.vaName.nameValue = this.$stateParams.template.name;
      this.template.configuration.pages.cvaAccessToken.accessTokenValue = this.$stateParams.template.config.token;
      this.template.configuration.pages.cvaAccessToken.invalidToken = false;
      this.template.configuration.pages.cvaAccessToken.needsValidation = false;

      if (this.$stateParams.template.icon) {
        this.avatarUploadState = this.avatarState.PREVIEW;
        this.template.configuration.pages.vaAvatar.fileValue = this.$stateParams.template.icon;
      }
    }

    const controller = this;
    (<IScopeWithController>this.$scope).controller = controller; // used by ctCancelModal to not be tied to 1 controller.
    controller.CTService.getLogoUrl().then(function (url) {
      controller.logoUrl = url;
    });
    controller.CTService.getLogo().then(function (data) {
      controller.logoFile = 'data:image/png;base64,' + controller.$window.btoa(String.fromCharCode.apply(null, new Uint8Array(data.data)));
      controller.logoUploaded = true;
    });
    this.escalationIntentUrl = this.UrlConfig.getEscalationIntentUrl();
  }

  /**
   * Obtain title for this series of modal pages
   * @returns {{[p: string]: string}|string|*}
   */
  public getTitle(): string {
    if (this.isEditFeature) {
      return this.getText('editTitle');
    } else {
      return this.getText('createTitle');
    }
  }

  /**
   * obtain description for summary page
   * @returns {*}
   */
  public getSummaryDescription(): string {
    if (this.isEditFeature) {
      return this.getText('summary.editDesc');
    } else {
      return this.getText('summary.desc');
    }
  }

  /**
   * open up the 'Cancel' modal with certain text.
   */
  public cancelModal(): void {
    this.cancelModalText = {
      cancelHeader: this.$translate.instant('careChatTpl.cancelHeader'),
      cancelDialog: this.getText('cancelDialog'),
      continueButton: this.$translate.instant('careChatTpl.continueButton'),
      confirmButton: this.$translate.instant('careChatTpl.confirmButton'),
    };
    this.$modal.open({
      template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/ctCancelModal.tpl.html'),
      type: 'dialog',
      scope: this.$scope,
    });
  }
  /**
   * evaluate the passed keyCode to trip a condition.
   * @param keyCode
   */
  public evalKeyPress(keyCode: number): void {
    switch (keyCode) {
      case this.escapeKey:
        this.cancelModal();
        break;
      default:
        break;
    }
  }

  /**
   * should previous button be rendered.
   * @returns {boolean}
   */
  public previousButton(): any {
    if (0 === this.getPageIndex()) {
      return 'hidden';
    }
    return (this.getPageIndex() > 0 && !this.isAvatarUploading());
  }

  /**
   * should next button be rendered.
   * @returns {boolean}
   */
  public nextButton(): any {
    switch (this.currentState) {
      case 'cvaConfigOverview':
        return this.isDialogflowAgentConfigured(); // check radio button state
      case 'cvaDialogIntegration':
        return true;
      case 'cvaAccessToken':
        return this.isAccessTokenValid();
      case 'vaName':
        return this.isNameValid() && !this.isAvatarUploading();
      case 'vaAvatar':
        return !this.isAvatarUploading();
      case 'vaSummary':
        return 'hidden';
    }
  }
  public onPageLoad(): void {
    this.onPageLoaded(this.currentState);
  }
  /**
   * called when page corresponding to newState is loaded event
   * @param {string} newState
   */
  private onPageLoaded(newState: string): void {
    if (newState === 'cvaAccessToken' &&
      this.isAccessTokenInvalid() &&
      !_.isEmpty(this.tokenFormErrors) &&
      !_.isEmpty(this.tokenForm)) {
      // We've already visited this page and it had errors, so reinstate the messages for them. JIRA CA-104

      const controller = this;
      controller.tokenForm.tokenInput.$setValidity('invalidToken', false);
      _.keys(controller.tokenFormErrors).forEach( function (key){
        controller.tokenForm.$error[key] = controller.tokenFormErrors[key];
      });
      controller.tokenFormErrors = {}; //Clear out as they've served their purpose
    }

    this.template.configuration.pages[newState].startTimeInMillis = Date.now();
  }
  /**
   * Move forward to next page in modal series.
   */
  public nextPage(): void {
    // This is to clear a possible error issued during image loading. For instance one attempts to drag-drop a JPG,
    // the file is invalid, the message is displayed, and it must be cleared when toggling between pages.
    this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.NO_ERROR;

    const controller = this;
    const durationInMillis = Date.now() -
      controller.template.configuration.pages[controller.currentState].startTimeInMillis;
    const analyticProps = { durationInMillis: durationInMillis };
    controller.Analytics.trackEvent(controller.template.configuration.pages[controller.currentState].eventName, analyticProps);
    controller.animation = 'slide-left';
    controller.$timeout(function () {
      controller.currentState = controller.getAdjacentEnabledState(controller.getPageIndex(), 1);
    }, controller.animationTimeout);
  }

  /**
   * conduct certain actions for the just before moving to previous page from another.
   * @param {string} currentState State before moving to previous page.
   */
  private beforePreviousPage(currentState: string): void {
    if (currentState === 'cvaAccessToken' &&
      this.isAccessTokenInvalid() &&
      !_.isEmpty(this.tokenForm)) {
      // Token is has errors, so save off the error messages in case we come back. JIRA CA-104

      const controller = this;
      _.keys(controller.tokenForm.$error).forEach(function (key) {
        controller.tokenFormErrors[key] = controller.tokenForm.$error[key];
      });
    }
    if (currentState === 'vaName' &&
      _.isEmpty(this.template.configuration.pages.vaName.nameValue) &&
      !_.isEmpty(this.nameForm) &&
      !this.nameForm.$valid) {
      //Name was validated and failed validation. The actual value is in the nameform, so set our value to that; JIRA CA-104
      this.template.configuration.pages.vaName.nameValue = this.nameForm.nameInput.$viewValue;
    }
  }

  /**
   * Move backwards to previous page in modal series.
   */
  public previousPage(): void {
    // This is to clear a possible error issued during image loading. For instance one attempts to drag-drop a JPG,
    // the file is invalid, the message is displayed, and it must be cleared when toggling between pages.
    this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.NO_ERROR;

    const controller = this;
    controller.animation = 'slide-right';
    controller.saveTemplateErrorOccurred = false;
    controller.templateButtonText = this.$translate.instant('common.finish');
    controller.$timeout(function () {
      controller.beforePreviousPage(controller.currentState);
      controller.currentState = controller.getAdjacentEnabledState(controller.getPageIndex(), -1);
    }, controller.animationTimeout);
  }

  /**
   * Return full path for current page template html.
   * @returns {string}
   */
  public getCurrentPage(): string {
    return `modules/sunlight/features/virtualAssistant/wizardPages/${this.currentState}.tpl.html`;
  }

  /**
   * submit the collected template of data for storage.
   */
  public submitFeature(): void {
    const name = this.template.configuration.pages.vaName.nameValue.trim();
    const config = this.createConfigurationObject(); // Note: this is our point of extensibility as other types besides dialogflow are supported.
    this.creatingTemplate = true;
    const avatarDataURL = this.template.configuration.pages.vaAvatar.fileValue;
    if (this.isEditFeature) {
      this.updateFeature(this.template.templateId, this.template.configuration.pages.cvaConfigOverview.configurationType, name, config, this.orgId, avatarDataURL);
    } else {
      this.createFeature(this.template.configuration.pages.cvaConfigOverview.configurationType, name, config, this.orgId, avatarDataURL);
    }
  }

  public onDialogflowTokenChange(): void {
    const controller = this;
    this.template.configuration.pages.cvaAccessToken.invalidToken = true;
    this.template.configuration.pages.cvaAccessToken.needsValidation = true; //changed token needs validation
    controller.tokenForm.tokenInput.$setValidity('invalidToken', true); // reset validation
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
    const name = (this.template.configuration.pages.vaName.nameValue || '').trim();
    return !!name && this.isValidNameLength(name) && this.isUniqueName(name);
  }

  /**
   *  Determines if some avatar error occurred
   *
   * @returns {boolean} return true if error occurred; otherwise false
   */
  public isAvatarError(): boolean {
    return this.template.configuration.pages.vaAvatar.avatarError !== this.avatarErrorType.NO_ERROR;
  }

  private isAvatarUploading(): boolean {
    return this.avatarUploadState === this.avatarState.LOADING;
  }

  private changeAvatarUploadState(): void {
    this.avatarUploadState = _.isEmpty(this.template.configuration.pages.vaAvatar.fileValue) ? this.avatarState.SELECT : this.avatarState.PREVIEW;
  }

  /**
   *  Avatar uploading interrupted
   */
  public avatarStopLoad(): void {
    if (this.isAvatarUploading()) {
      this.changeAvatarUploadState();
      this.template.configuration.pages.vaAvatar.uploadCanceled = true;
    }
  }

  /**
   *  Image file name has to carry extension PNG.
   *  Note: original functionality called for JPG, and SVG as well - this can be extended by addign to the array
   *
   * @param {string} fileName
   * @returns {boolean}
   */
  private isImageFileName(fileName: string): boolean {
    if ((fileName || '').trim().length > 0) {
      const lowerCaseExt = fileName.trim().toLocaleLowerCase().split('.');
      return lowerCaseExt.length >= 2 && ['png'].indexOf(lowerCaseExt[lowerCaseExt.length - 1]) >= 0;
    }
    return false;
  }

  /**
   * Validate the avatar image file
   * @param {any} fileSelected
   * @returns {boolean} return true if the image file is valid; otherwise return false
   */
  private validateAvatarFile(fileSelected: any): boolean {
    if (!this.isImageFileName(fileSelected.name)) {
      this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.FILE_TYPE_ERROR;
    } else if (fileSelected.size > this.MAX_AVATAR_FILE_SIZE || fileSelected.size <= 0) {
      this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.FILE_SIZE_ERROR;
    }
    return !this.isAvatarError();
  }

  /**
   *  Avatar file name is valid, then, upload it.
   *
   * @param fileSelected (via drag-and-drop or file select)
   */
  public uploadAvatar(fileSelected: any): void {
    this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.NO_ERROR;
    this.template.configuration.pages.vaAvatar.uploadCanceled = false;
    if (fileSelected && ('name' in fileSelected)) {
      if (this.validateAvatarFile(fileSelected)) {
        this.avatarUploadState = this.avatarState.LOADING;
        this.service.getFileDataUrl(fileSelected)
          .then((avatardataURL) => {
            this.service.isAvatarFileValid(this.orgId, avatardataURL)
              .then(() => {
                if (!this.template.configuration.pages.vaAvatar.uploadCanceled) {
                  this.template.configuration.pages.vaAvatar.fileValue = avatardataURL; // update the stored config
                  this.changeAvatarUploadState();
                }
              })
              .catch(() => {
                this.handleAvatarFileUploadError();
              });
          })
          .catch(() => {
            this.handleAvatarFileUploadError();
          })
          .finally(() => {
            this.changeAvatarUploadState();
          });
      }
    }
  }

  private handleAvatarFileUploadError() {
    if (!this.template.configuration.pages.vaAvatar.uploadCanceled) {
      this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.FILE_UPLOAD_ERROR;
    }
  }

  public getText(textIdExtension: string): string {
    return this.service.getText(textIdExtension);
  }

  public getMessageKey(textIdExtension: string): string {
    return this.service.getMessageKey(textIdExtension);
  }


  /**
   * obtain the current index of the page associated with the current state.
   * @returns {number|Number}
   */
  private getPageIndex(): number {
    return this.states.indexOf(this.currentState);
  }

  /**
   * Obtain the state 'jump' places away from the 'current' position
   * @param current
   * @param jump
   * @returns {*}
   */
  private getAdjacentEnabledState(current: number, jump: number): string {
    const next = current + jump;
    const last = this.states.length - 1;
    if (next > last) {
      return this.states[last];
    } else {
      return this.states[next];
    }
  }

  /**
   * handle template create/edit error.
   */
  private handleFeatureError(): void {
    this.creatingTemplate = false;
    this.saveTemplateErrorOccurred = true;
    this.templateButtonText = this.$translate.instant('common.retry');
  }

  /**
   * handle result of successful feature create and store
   * @param headers
   */
  private handleFeatureCreation(): void {
    this.creatingTemplate = false;
    this.$state.go('care.Features');
    this.Notification.success(this.getMessageKey('messages.createSuccessText'), {
      featureName: this.template.configuration.pages.vaName.nameValue,
    });
  }

  /**
   * create and store the current feature
   * @param type
   * @param name
   * @param config
   * @param orgId
   * @param avatarDataURL optional
   */
  private createFeature(type: string, name: string, config: any, orgId: string, avatarDataURL?: string): void {
    const controller = this;
    controller.service.addConfig(type, name, config, orgId, avatarDataURL)
      .then(function () {
        controller.handleFeatureCreation();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.createConfigFailureText'));
      });
  }

  /**
   * Writing the metrics to the mixpanel for the last page and the overall wizard
   */
  private writeMetrics(): void {
    const currentTimeInMillis = Date.now();
    let durationInMillis = currentTimeInMillis - this.template.configuration.pages.vaSummary.startTimeInMillis;
    let analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, analyticProps);
    durationInMillis = currentTimeInMillis - this.template.configuration.pages.cvaConfigOverview.startTimeInMillis;
    analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, analyticProps);
  }

  /**
   * handle the result of successful feature update and store
   * @param response
   * @param templateId
   */
  private handleFeatureUpdate(): void {
    this.creatingTemplate = false;
    this.$state.go('care.Features');
    const successMsg = this.getMessageKey('messages.updateSuccessText');
    this.Notification.success(successMsg, {
      featureName: this.template.configuration.pages.vaName.nameValue,
    });
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
  private updateFeature(templateId: string, type: string, name: string, config: any, orgId: string, avatarDataURL?: string): void {
    const controller = this;
    controller.service.updateConfig(templateId, type, name, config, orgId, avatarDataURL)
      .then(function () {
        controller.handleFeatureUpdate();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.updateConfigFailureText'));
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
  private isValidNameLength(name): boolean {
    return name.trim().length <= this.maxNameLength;
  }
  private isUniqueName(name): boolean {
    const controller = this;
    const list = this.service.featureList.data;
    //will return undefined if no name found,  !undefined = true
    const isUnique = !_.find(list, function (cva: any) {
      return cva.id !== controller.template.templateId && cva.name.toLowerCase() === name.toLowerCase();
    });
    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity('duplicateNameError', isUnique);
    }
    return isUnique;
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
