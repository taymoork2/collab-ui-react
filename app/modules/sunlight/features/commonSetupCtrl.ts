import { IToolkitModalService } from 'modules/core/modal';
import { KeyCodes } from 'modules/core/accessibility';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}
/**
 * CommonSetupCtrl
 */
export class CommonSetupCtrl implements ng.IComponentController {

  public animationTimeout = 10;

  public animation = '';
  public maxNameLength = 50;
  public service;
  public isEditFeature = false;
  public orgName = this.Authinfo.getOrgName();
  public orgId = this.Authinfo.getOrgId();
  public creatingTemplate = false;
  public templateButtonText = this.$translate.instant('common.finish');
  public saveTemplateErrorOccurred = false;
  public cancelModalText = {};
  public nameForm: ng.IFormController;
  public currentState = '';
  public template;
  public states;
  public retryButtonDisabled = false;
  public userHasAccess = true;

  public NameErrorMessages = {
    DUPLICATE_ERROR: 'duplicate_error',
    ERROR_CHAR_50: 'error_char_50',
    ERROR_CHAR_250: 'error_char_250',
    PROCESSING: 'processing',
    INVALID_CHARS: 'invalid_chars',
  };

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
    public Notification,
    public UrlConfig,
  ) {
    const controller = this;
    (<IScopeWithController>this.$scope).controller = controller; // used by ctCancelModal to not be tied to 1 controller.
  }

  /**
   * Obtain title for this series of modal pages
   * @returns {string}
   */
  public getTitle(): string {
    if (this.isEditFeature) {
      return this.getCommonText('editTitle');
    } else {
      return this.getCommonText('createTitle');
    }
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
  public enterNextPage($event: KeyboardEvent): void {
    switch ($event.which) {
      // don't uses space as keyboard shortcut since names can have spaces
      case KeyCodes.ENTER:
        // only advance to next page it next button is enabled
        if (this.nextButton()) {
          this.nextPage();
        }
        break;
      default:
        break;
    }
  }

  /**
   * should next button be rendered.
   * each subclass should override this
   * @returns {boolean}
   */
  public nextButton(): any {
    return false;
  }

  /**
   * should previous button be rendered.
   * @returns {boolean}
   */
  public previousButton(): any {
    if (this.creatingTemplate) {
      return false;
    }
    if (0 === this.getPageIndex()) {
      return 'hidden';
    }
    return (this.getPageIndex() > 0);
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
   * Function to obtain translated string off the commonWizard area for strings
   * @param textIdExtension
   * @returns {string}
   */
  public getCommonText(textIdExtension: string, params?: object): string {
    const featureName = this.service.getFeatureName();
    return this.$translate.instant('careChatTpl.commonWizard.' + textIdExtension, (<any>Object).assign({ featureName }, params));
  }

  /**
   * obtain the current index of the page associated with the current state.
   * @returns {number|Number}
   */
  public getPageIndex(): number {
    return this.states.indexOf(this.currentState);
  }

  /**
   * Obtain the state 'jump' places away from the 'current' position
   * @param current
   * @param jump
   * @returns {*}
   */
  public getAdjacentEnabledState(current: number, jump: number): string {
    const next = current + jump;
    const last = this.states.length - 1;
    if (next > last) {
      return this.states[last];
    } else {
      return this.states[next];
    }
  }

  public displayGenericErrorMessage(): boolean {
    return this.saveTemplateErrorOccurred && !this.creatingTemplate;
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
      featureName: this.template.configuration.pages.name.nameValue,
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
      featureName: this.template.configuration.pages.name.nameValue,
    });
  }

  /**
   * handle create/edit error.
   */
  public handleFeatureError(): void {
    this.creatingTemplate = false;
    this.saveTemplateErrorOccurred = true;
    this.templateButtonText = this.$translate.instant('common.retry');
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
}
