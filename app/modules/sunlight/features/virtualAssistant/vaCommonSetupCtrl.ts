import { IToolkitModalService } from 'modules/core/modal';
import { KeyCodes } from 'modules/core/accessibility';
import * as _ from 'lodash';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}
/**
 * VaCommonSetupCtrl
 */
export class VaCommonSetupCtrl implements ng.IComponentController {

  public animationTimeout = 10;

  public animation = '';
  public maxNameLength = 50;
  public service;
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
  public escalationIntentUrl: string;
  public currentState = '';
  public template;
  public states;
  public userHasAccess = true;
  public evaAlreadyExisted = false;
  public retryButtonDisabled = false;
  public summaryErrorMessage: string;

  public NameErrorMessages = {
    DUPLICATE_ERROR: 'duplicate_error',
    ERROR_CHAR_50: 'error_char_50',
    PROCESSING: 'processing',
  };

  // Avatar file error
  public avatarErrorType = {
    NO_ERROR: 'None',
    FILE_TYPE_ERROR: 'FileTypeError',
    FILE_SIZE_ERROR: 'FileSizeError',
    FILE_UPLOAD_ERROR: 'FileUploadError',
    INVALID_FILE: 'InvalidFile',
    INVALID_ICON_DIMENSIONS: 'InvalidIconDimensions',
  };

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
    public $element: ng.IRootElementService,
    public $modal: IToolkitModalService,
    public $scope: ng.IScope,
    public $state: ng.ui.IStateService,
    public $timeout: ng.ITimeoutService,
    public $translate: ng.translate.ITranslateService,
    public $window: ng.IWindowService,
    public Analytics,
    public Authinfo,
    public CTService,
    public Notification,
    public UrlConfig,
  ) {
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
   * Return full path for current page template html.
   * @returns {string}
   */
  public getCurrentPage(): string {
    return `modules/sunlight/features/virtualAssistant/wizardPages/${this.currentState}.tpl.html`;
  }

  /**
   * Obtain title for this series of modal pages
   * @returns {string}
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
    const vaName = this.template.configuration.pages.vaName.nameValue;
    let textString = 'summary.cvaDesc';
    if (this.template.configuration.mediaType === 'expertVirtualAssistant') {
      textString = 'summary.evaDesc';
    }
    if (this.isEditFeature) {
      textString += 'Edit';
    }
    return this.getText(textString, { name: vaName });
  }

  /**
   * obtain help text for name input
   * @returns {*}
   */
  public getNameHint(): string {
    const featureName = this.service.getFeatureName();
    let msgKey = 'name.nameHint';
    if (this.template.configuration.mediaType === 'expertVirtualAssistant') {
      msgKey = 'name.nameHintEva';
    }
    return this.getText(msgKey, { featureName });
  }

  /**
   * open up the 'Cancel' modal with certain text.
   */
  public cancelModal(): void {
    const featureName = this.service.getFeatureName();
    const cancelDialogKey = this.isEditFeature ? 'careChatTpl.cancelEditDialog' : 'careChatTpl.cancelCreateDialog';
    const cancelText = this.$translate.instant(cancelDialogKey, { featureName });

    this.cancelModalText = {
      cancelHeader: this.$translate.instant('careChatTpl.cancelHeader'),
      cancelDialog: cancelText,
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
      case KeyCodes.ESCAPE:
        this.cancelModal();
        break;
      default:
        break;
    }
  }

  /**
   * evaluate the passed event to trip a condition.
   * @param $event
   */
  public keydown($event: KeyboardEvent): void {
    switch ($event.which) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        this.nextPage();
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
    if (this.currentState === 'evaEmail') {
      return !_.get(this, 'emailForm.input.$pending', false);
    }
    if (this.creatingTemplate) {
      return false;
    }
    if (0 === this.getPageIndex()) {
      return 'hidden';
    }
    return (this.getPageIndex() > 0 && !this.isAvatarUploading());
  }

  public onPageLoad(): void {
    this.onPageLoaded(this.currentState);
  }

  /**
   * called when page corresponding to newState is loaded event
   * @param {string} newState
   */
  public onPageLoaded(newState: string): void {
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
  public beforePreviousPage(currentState: string): void {
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
    const controller = this;
    controller.animation = 'slide-right';
    controller.saveTemplateErrorOccurred = false;
    controller.templateButtonText = this.$translate.instant('common.finish');
    controller.retryButtonDisabled = false;
    controller.$timeout(function () {
      controller.beforePreviousPage(controller.currentState);
      controller.currentState = controller.getAdjacentEnabledState(controller.getPageIndex(), -1);
    }, controller.animationTimeout);
  }

  /**
   *  Determines if some avatar error occurred
   *
   * @returns {boolean} return true if error occurred; otherwise false
   */
  public isAvatarError(): boolean {
    return this.template.configuration.pages.vaAvatar.avatarError !== this.avatarErrorType.NO_ERROR;
  }

  public isAvatarUploading(): boolean {
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
              .catch((response) => {
                this.handleAvatarFileUploadError(response);
              });
          })
          .catch((response) => {
            this.handleAvatarFileUploadError(response);
          })
          .finally(() => {
            this.changeAvatarUploadState();
          });
      }
    }
  }

  private getAvatarError(errorType: string): string {
    if (errorType) {
      switch (errorType) {
        case 'invalidInput.invalidIconFileType':
          return this.avatarErrorType.FILE_TYPE_ERROR;
        case 'invalidInput.invalidIconTooLarge':
          return this.avatarErrorType.FILE_SIZE_ERROR;
        case 'invalidInput.invalidIconCorrupted':
        case 'invalidInput.invalidIcon':
          return this.avatarErrorType.INVALID_FILE;
        case 'invalidInput.invalidIconDimensions':
          return this.avatarErrorType.INVALID_ICON_DIMENSIONS;
      }
    }
    return '';
  }

  private handleAvatarFileUploadError(response?: ng.IHttpResponse<any>): void {
    if (!this.template.configuration.pages.vaAvatar.uploadCanceled) {
      const errorType = response && response.data ? response.data.type : null;
      const avatarError = this.getAvatarError(errorType);
      if (!_.isEmpty(avatarError)) {
        this.template.configuration.pages.vaAvatar.avatarError = avatarError;
      } else {
        this.template.configuration.pages.vaAvatar.avatarError = this.avatarErrorType.FILE_UPLOAD_ERROR;
      }
    }
  }

  /**
   * Function to obtain translated string off virtual-assistant's area for strings
   * @param textIdExtension
   * @returns {string}
   */
  public getText(textIdExtension: string, params?: object): string {
    const featureName = this.service.getFeatureName();
    return this.$translate.instant('careChatTpl.virtualAssistant.' + textIdExtension, (<any>Object).assign({ featureName }, params));
  }

  /**
   * Function to obtain translated string off virtual-assistant's area for strings
   * @returns {string}
   */
  public getAvatarDescText(): string {
    const featureName = this.service.getFeatureName();
    let textIdExtension = 'avatar.desc';
    if (this.template.configuration.mediaType === 'expertVirtualAssistant') {
      textIdExtension = 'avatar.descEva';
    }
    return this.$translate.instant('careChatTpl.virtualAssistant.' + textIdExtension, { featureName });
  }
  /**
   * Function to obtain literal key for later lookup/translation.
   * @param textIdExtension
   * @returns {string}
   */
  public getMessageKey(textIdExtension: string): string {
    return 'careChatTpl.virtualAssistant.' + textIdExtension;
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

  private translateWithFallback(messageKey: string, fallbackText: string, translateReplacements?: object): string {
    const translationKey = this.getMessageKey(messageKey);
    const translation = this.$translate.instant(translationKey, translateReplacements);
    //if key doesn't exist will return "Translation for <translationKey> doesn't exist", so return fallback string instead
    return _.includes(translation, translationKey) ? fallbackText : translation;
  }

  /**
   * handle template create/edit error.
   */
  public handleFeatureError(response?: ng.IHttpResponse<any>): void {
    const errorType = response && response.data ? response.data.type : null;
    const featureName = this.service.getFeatureName();
    const fallback = this.getText('summary.errorCreateTemplate');
    this.summaryErrorMessage = this.translateWithFallback(errorType, fallback, { featureName });
    this.creatingTemplate = false;
    this.saveTemplateErrorOccurred = true;
    this.templateButtonText = this.$translate.instant('common.retry');

    if (errorType) {
      this.retryButtonDisabled = true; //user has to go to previous pages to fix issue
      //set error flag so error message shows up on correct page when user clicks back
      switch (errorType) {
        case 'invalidInput.duplicateName':
          //save current name so we can check against it when user goes back to name page to change the name
          this.template.configuration.pages.vaName.nameWithError = this.template.configuration.pages.vaName.nameValue;
          break;
        case 'invalidInput.invalidAccessToken':
          this.template.configuration.pages.cvaAccessToken.invalidToken = true;
          this.template.configuration.pages.cvaAccessToken.needsValidation = false;
      }
      const avatarError = this.getAvatarError(errorType);
      if (!_.isEmpty(avatarError)) {
        this.template.configuration.pages.vaAvatar.avatarError = avatarError;
      }
    }
  }

  public displayGenericErrorMessage(): boolean {
    return this.saveTemplateErrorOccurred && !this.creatingTemplate && !this.evaAlreadyExisted;
  }

  /**
   * handle template edit error for user who does not have access.
   */
  public handleUserAccessForEditError(): void {
    this.creatingTemplate = false;
    this.saveTemplateErrorOccurred = false;
    this.userHasAccess = false;
    this.templateButtonText = this.$translate.instant('common.finish');
  }

  /**
   * handle the result of successful feature update and store
   * @param response
   * @param templateId
   */
  public handleFeatureUpdate(): void {
    this.creatingTemplate = false;
    this.$state.go('care.Features');
    const successMsg = 'careChatTpl.editSuccessText';
    this.Notification.success(successMsg, {
      featureName: this.template.configuration.pages.vaName.nameValue,
    });
  }

  /**
   * handle result of successful feature create and store
   * @param headers
   */
  public handleFeatureCreation(): void {
    this.creatingTemplate = false;
    this.$state.go('care.Features');
    this.Notification.success('careChatTpl.createSuccessText', {
      featureName: this.template.configuration.pages.vaName.nameValue,
    });
  }

  /**
   * open file browser on Enter/Space Keypress
   * @param $event
   */
  public openFileBrowser($event: KeyboardEvent) {
    switch ($event.which) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        this.$element.find('.file-browser-ctrl').click();
        break;
    }
  }

  /**
   *  Determine if edit warning message should be shown on summary page
   *
   * @returns {boolean}
   */
  public showEditWarning(): boolean {
    if (this.template.configuration.mediaType === 'expertVirtualAssistant' && this.isEditFeature ) {
      if (!this.userHasAccess) {
        return false;
      } else if (!this.saveTemplateErrorOccurred) {
        return true;
      }
    }
    return false;
  }

}
