import { CommonSetupCtrl } from '../commonSetupCtrl';
import { IToolkitModalService } from 'modules/core/modal';
import * as _ from 'lodash';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}
/**
 * VaCommonSetupCtrl
 */
export class VaCommonSetupCtrl extends CommonSetupCtrl {

  public logoUrl = '';
  public logoFile = '';
  public logoUploaded = false;
  public evaAlreadyExisted = false;
  public summaryErrorMessage: string;

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
    super($element, $modal, $scope, $state, $timeout, $translate, $window, Analytics, Authinfo, Notification, UrlConfig);
    const controller = this;
    (<IScopeWithController>this.$scope).controller = controller; // used by ctCancelModal to not be tied to 1 controller.
    controller.CTService.getLogoUrl().then(function (url) {
      controller.logoUrl = url;
    });
    controller.CTService.getLogo().then(function (data) {
      controller.logoFile = 'data:image/png;base64,' + controller.$window.btoa(String.fromCharCode.apply(null, new Uint8Array(data.data)));
      controller.logoUploaded = true;
    });
  }

  /**
   * Return full path for current page template html.
   * @returns {string}
   */
  public getCurrentPage(): string {
    return `modules/sunlight/features/virtualAssistant/wizardPages/${this.currentState}.tpl.html`;
  }

  /**
   * obtain description for summary page
   * @returns {*}
   */
  public getSummaryDescription(): string {
    const name = this.template.configuration.pages.name.nameValue;
    let textString = 'summary.cvaDesc';
    if (this.template.configuration.mediaType === 'expertVirtualAssistant') {
      textString = 'summary.evaDesc';
    }
    if (this.isEditFeature) {
      textString += 'Edit';
    }
    return this.getText(textString, { name });
  }

  /**
   * obtain feature name
   * @returns {*}
   */
  public getFeatureName(): string {
    return this.service.getFeatureName();
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

  /**
   * conduct certain actions for the just before moving to previous page from another.
   * @param {string} currentState State before moving to previous page.
   */
  public beforePreviousPage(currentState: string): void {
    if (currentState === 'name' &&
      _.isEmpty(this.template.configuration.pages.name.nameValue) &&
      !_.isEmpty(this.nameForm) &&
      !this.nameForm.$valid) {
      //Name was validated and failed validation. The actual value is in the nameform, so set our value to that; JIRA CA-104
      this.template.configuration.pages.name.nameValue = this.nameForm.nameInput.$viewValue;
    }
  }
  /**
   * Move backwards to previous page in modal series.
   */
  public previousPage(): void {
    const controller = this;
    controller.animation = 'slide-right';
    controller.saveTemplateErrorOccurred = false;
    controller.customErrorMessage = '';
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
          this.template.configuration.pages.name.nameWithError = this.template.configuration.pages.name.nameValue;
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
