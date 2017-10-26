import { IToolkitModalService } from 'modules/core/modal';
import { UniqueEmailValidator } from './uniqueEmailValidator.directive';
import * as _ from 'lodash';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}

// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
// preserve the ng-include module paths
const requireContext = (require as any).context(`ngtemplate-loader?module=Sunlight&relativeTo=app/!modules/sunlight/features/virtualAssistant/wizardPages/`, false, /^\.\/.*\.tpl\.html$/);
requireContext.keys().map(key => requireContext(key));

/**
 * ExpertVirtualAssistantSetupCtrl
 */
class ExpertVirtualAssistantSetupCtrl implements ng.IComponentController {

  private animationTimeout = 10;
  private escapeKey = 27;

  public animation = '';
  public maxNameLength = 50;
  public maxEmailLength = 63;
  public validateEmailChars = /^([A-Za-z0-9-._~/|?%^&{}!#$'`*=]+)$/;
  public service = this.EvaService;
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
  public emailForm: ng.IFormController;

  public NameErrorMessages = {
    DUPLICATE_ERROR: 'duplicate_error',
    ERROR_CHAR_50: 'error_char_50',
  };

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
      mediaType: this.EvaService.evaServiceCard.type,
      pages: {
        evaOverview: {
          enabled: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_OVERVIEW_PAGE,
        },
        vaName: {
          enabled: true,
          nameValue: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_NAME_PAGE,
        },
        evaEmail: {
          enabled: true,
          value: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_EMAIL_PAGE,
        },
        vaSummary: {
          enabled: true,
          visibleError: false,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_SUMMARY_PAGE,
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
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private EvaService,
    private Authinfo,
    private CTService,
    private Analytics,
    private Notification,
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
      return this.getText('summary.editDesc', { name: this.template.configuration.pages.vaName.nameValue });
    } else {
      return this.getText('summary.desc', { name: this.template.configuration.pages.vaName.nameValue });
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
    if (this.currentState === 'evaEmail') {
      return !_.get(this, 'emailForm.input.$pending', false);
    }
    if (this.creatingTemplate) {
      return false;
    }
    if (0 === this.getPageIndex()) {
      return 'hidden';
    }
    return (this.getPageIndex() > 0);
  }

  /**
   * should next button be rendered.
   * @returns {boolean}
   */
  public nextButton(): any {
    switch (this.currentState) {
      case 'evaOverview':
        return true;
      case 'vaName':
        return this.isNamePageValid();
      case 'evaEmail':
        return this.isEmailPageValid();
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
    this.template.configuration.pages[newState].startTimeInMillis = Date.now();
  }

  /**
   * Move forward to next page in modal series.
   */
  public nextPage(): void {
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
   * Move backwards to previous page in modal series.
   */
  public previousPage(): void {
    // This is to clear a possible error issued during image loading. For instance one attempts to drag-drop a JPG,
    // the file is invalid, the message is displayed, and it must be cleared when toggling between pages.

    const controller = this;
    controller.animation = 'slide-right';
    controller.saveTemplateErrorOccurred = false;
    controller.templateButtonText = this.$translate.instant('common.finish');
    controller.$timeout(function () {
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
   * Writing the metrics to the mixpanel for the last page and the overall wizard
   */
  private writeMetrics(): void {
    const currentTimeInMillis = Date.now();
    let durationInMillis = currentTimeInMillis - this.template.configuration.pages.vaSummary.startTimeInMillis;
    let analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_SUMMARY_PAGE, analyticProps);
    durationInMillis = currentTimeInMillis - this.template.configuration.pages.evaOverview.startTimeInMillis;
    analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_START_FINISH, analyticProps);
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
  private createFeature(name: string, orgId: string, email: string): void {
    const controller = this;
    controller.service.addExpertAssistant(name, orgId, email)
      .then(function () {
        controller.handleFeatureCreation();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.createConfigFailureText'), {
          featureName: controller.$translate.instant('careChatTpl.virtualAssistant.eva.featureText.name'),
        });
      });
  }

  public submitFeature(): void {
    const name = this.template.configuration.pages.vaName.nameValue.trim();
    const emailPrefix = this.template.configuration.pages.evaEmail.value.trim();
    const email = `${emailPrefix}@sparkbot.io`;
    this.creatingTemplate = true;
    this.createFeature(name, this.orgId, email);
  }

  public getText(textIdExtension: string, params?: object): string {
    return this.service.getText(textIdExtension, params);
  }

  public getMessageKey(textIdExtension: string): string {
    return this.service.getMessageKey(textIdExtension);
  }

  public isNameValid(): boolean {
    const name = (this.template.configuration.pages.vaName.nameValue || '').trim();
    const isLengthValid = (_.get(name, 'length', 0) <= this.maxNameLength);

    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity(this.NameErrorMessages.ERROR_CHAR_50, isLengthValid);
    }

    return isLengthValid;
  }

  public isNamePageValid(): boolean {
    const name = (this.template.configuration.pages.vaName.nameValue || '').trim();
    return name !== '' && this.isNameValid();
  }

  public isEmailPageValid(): boolean {
    const emailPrefix = (this.template.configuration.pages.evaEmail.value || '').trim();
    return emailPrefix !== '' && _.get(this, 'emailForm.$valid', false);
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
}

/**
 * Expert Virtual Assistant Component used for Creating new Expert Virtual Assistant
 */
export class ExpertVirtualAssistantSetupComponent implements ng.IComponentOptions {
  public controller = ExpertVirtualAssistantSetupCtrl;
  public template = require('modules/sunlight/features/virtualAssistant/vaSetup.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .directive('uniqueEmail', UniqueEmailValidator.factory)
  .component('evaSetup', new ExpertVirtualAssistantSetupComponent());
