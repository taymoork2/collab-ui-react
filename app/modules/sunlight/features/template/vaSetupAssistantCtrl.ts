import { IToolkitModalService } from 'modules/core/modal';

export interface IScopeWithController extends ng.IScope {
  controller?: any;
}
export class CareSetupVirtualAssistantCtrl {

  private animationTimeout = 10;
  private escapeKey = 27;

  public animation = '';
  public maxNameLength = 50;
  public maxTokenLength = 128;
  public service = this.VirtualAssistantService;
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
  private escalationIntentUrl: string;

  public template = {
    templateId: '',
    name: '',
    configuration: {
      mediaType: this.VirtualAssistantService.serviceCard.type,
      pages: {
        VirtualAssistantConfigOverview: {
          enabled: true,
          isApiAiAgentConfigured: false,
          configurationType: this.VirtualAssistantService.configurationTypes.apiai,
        },
        VirtualAssistantDialogIntegration: { enabled: true },
        VirtualAssistantAccessToken: {
          enabled: true,
          accessTokenValue: '',
          invalidToken: true,
          validatingToken: false,
        },
        VirtualAssistantName: {
          enabled: true,
          nameValue: '',
        },
        VirtualAssistantSummary: {
          enabled: true,
          visibleError: false,
        },
      },
    },
  };
  // states == pages in order as found in storage template
  public states = Object.keys(this.template.configuration.pages);
  public currentState = this.states[0];


  /* @ngInject*/
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private VirtualAssistantService,
    private Authinfo,
    private CTService,
    private LogMetricsService,
    private Notification,
    private UrlConfig,
  ) {
    if (this.$stateParams.isEditFeature) {
      this.isEditFeature = true;
      this.template.templateId = this.$stateParams.template.id;
      this.template.configuration.pages.VirtualAssistantConfigOverview.isApiAiAgentConfigured = true;
      this.template.configuration.pages.VirtualAssistantName.nameValue = this.$stateParams.template.name;
      this.template.configuration.pages.VirtualAssistantAccessToken.accessTokenValue = this.$stateParams.template.config.token;
      this.template.configuration.pages.VirtualAssistantAccessToken.invalidToken = false;
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
      return this.getVaText('editTitle');
    } else {
      return this.getVaText('createTitle');
    }
  }

  /**
   * obtain description for summary page
   * @returns {*}
   */
  public getSummaryDescription(): string {
    if (this.isEditFeature) {
      return this.getVaText('summary.editDesc');
    } else {
      return this.getVaText('summary.desc');
    }
  }

  /**
   * open up the 'Cancel' modal with certain text.
   */
  public cancelModal(): void {
    this.cancelModalText = {
      cancelHeader: this.$translate.instant('careChatTpl.cancelHeader'),
      cancelDialog: this.getVaText('cancelDialog'),
      continueButton: this.$translate.instant('careChatTpl.continueButton'),
      confirmButton: this.$translate.instant('careChatTpl.confirmButton'),
    };
    this.$modal.open({
      templateUrl: 'modules/sunlight/features/template/ctCancelModal.tpl.html',
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
    return (this.getPageIndex() > 0);
  }

  /**
   * should next button be rendered.
   * @returns {boolean}
   */
  public nextButton(): any {
    switch (this.currentState) {
      case 'VirtualAssistantConfigOverview':
        return this.isApiAiAgentConfigured(); // check radio button state
      case 'VirtualAssistantDialogIntegration':
        return true;
      case 'VirtualAssistantAccessToken':
        return this.isAccessTokenValid();
      case 'VirtualAssistantName':
        return this.isNameValid();
      case 'VirtualAssistantSummary':
        return 'hidden';
    }
  }
  /**
   * Move forward to next page in modal series.
   */
  public nextPage(): void {
    const controller = this;
    controller.animation = 'slide-left';
    controller.$timeout(function () {
      controller.currentState = controller.getAdjacentEnabledState(controller.getPageIndex(), 1);
    }, controller.animationTimeout);
  }

  /**
   * Move backwards to previous page in modal series.
   */
  public previousPage(): void {
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
    return 'modules/sunlight/features/template/setupAssistantPages/va' + this.currentState + '.tpl.html';
  }

  /**
   * submit the collected template of data for storage.
   */
  public submitFeature(): void {
    const name = this.template.configuration.pages.VirtualAssistantName.nameValue.trim();
    const config = this.createConfigurationObject(); // Note: this is our point of extensibility as other types besides api.ai are supported.
    this.creatingTemplate = true;
    if (this.isEditFeature) {
      this.updateFeature(this.template.templateId, this.template.configuration.pages.VirtualAssistantConfigOverview.configurationType, name, config, this.orgId);
    } else {
      this.createFeature(this.template.configuration.pages.VirtualAssistantConfigOverview.configurationType, name, config, this.orgId);
    }
  }

  public onAPIAITokenChange(): void {
    const controller = this;
    this.template.configuration.pages.VirtualAssistantAccessToken.invalidToken = true;
    controller.tokenForm.tokenInput.$setValidity('invalidToken', true); // reset validation
  }

  /**
   * validate the api.ai Token
   */
  public validateAPIAIToken(): void {
    const controller = this;
    controller.template.configuration.pages.VirtualAssistantAccessToken.validatingToken = true;
    const accessToken = (controller.template.configuration.pages.VirtualAssistantAccessToken.accessTokenValue || '').trim();
    controller.service.isAPIAITokenValid(accessToken)
      .then(function () {
        controller.template.configuration.pages.VirtualAssistantAccessToken.invalidToken = false;
        controller.tokenForm.tokenInput.$setValidity('invalidToken', true); //mark input as valid
        controller.template.configuration.pages.VirtualAssistantAccessToken.validatingToken = false;
      })
      .catch(function () {
        controller.template.configuration.pages.VirtualAssistantAccessToken.invalidToken = true;
        controller.tokenForm.tokenInput.$setValidity('invalidToken', false); //mark input as invalid
        controller.template.configuration.pages.VirtualAssistantAccessToken.validatingToken = false;
      });
  }

  /** Data Validation functions **/
  public isApiAiAgentConfigured(): boolean {
    return !!this.template.configuration.pages.VirtualAssistantConfigOverview.isApiAiAgentConfigured;
  }

  public isAccessTokenValid(): boolean {
    return !!(this.template.configuration.pages.VirtualAssistantAccessToken.accessTokenValue || '').trim()
      && this.isValidTokenLength()
      && !this.template.configuration.pages.VirtualAssistantAccessToken.invalidToken;
  }

  public isNameValid(): boolean {
    const name = (this.template.configuration.pages.VirtualAssistantName.nameValue || '').trim();
    return !!name && this.isValidNameLength(name) && this.isUniqueName(name);
  }

  public getVaText(textIdExtension: string): string {
    return this.service.getVaText(textIdExtension);
  }

  public getVaMessageKey(textIdExtension: string): string {
    return this.service.getVaMessageKey(textIdExtension);
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
    this.Notification.success(this.getVaMessageKey('messages.createSuccessText'), {
      featureName: this.template.configuration.pages.VirtualAssistantName.nameValue,
    });
  }

  /**
   * create and store the current feature
   * @param type
   * @param name
   * @param config
   * @param orgId
   */
  private createFeature(type: string, name: string, config: any, orgId: string): void {
    const controller = this;
    controller.service.addConfig(type, name, config, orgId)
      .then(function () {
        controller.handleFeatureCreation();
        controller.LogMetricsService.logMetrics('Created template for Care Virtual Assistant', controller.LogMetricsService.getEventType('careTemplateFinish'), controller.LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getVaMessageKey('messages.createConfigFailureText'));
      });
  }
  /**
   * handle the result of successful feature update and store
   * @param response
   * @param templateId
   */
  private handleFeatureUpdate(): void {
    this.creatingTemplate = false;
    this.$state.go('care.Features');
    const successMsg = this.getVaMessageKey('messages.updateSuccessText');
    this.Notification.success(successMsg, {
      featureName: this.template.configuration.pages.VirtualAssistantName.nameValue,
    });
  }

  /**
   * update and store the current feature
   * @param templateId
   * @param type
   * @param name
   * @param config
   * @param orgId
   */
  private updateFeature(templateId: string, type: string, name: string, config: any, orgId: string): void {
    const controller = this;
    controller.service.updateConfig(templateId, type, name, config, orgId)
      .then(function () {
        controller.handleFeatureUpdate();
        controller.LogMetricsService.logMetrics('Updated template for Care VirtualAssistant', controller.LogMetricsService.getEventType('careTemplateFinish'), controller.LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getVaMessageKey('messages.updateConfigFailureText'));
      });
  }

  /**
   * This is where we can extend our controller to support other types of assistants besides api.ai.
   * Each one may have a different Configuration object that we are going to add/update.
   * template.configuration.pages.VirtualAssistantConfigOverview.configurationType  holds the type that is being added/updated.
   * @returns {*}
   */
  private createConfigurationObject(): any {
    return { token: this.template.configuration.pages.VirtualAssistantAccessToken.accessTokenValue.trim() };
  }

  private isValidTokenLength(): boolean {
    return (this.template.configuration.pages.VirtualAssistantAccessToken.accessTokenValue || '').trim().length <= this.maxTokenLength;
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
angular
  .module('Sunlight')
  .controller('CareSetupVirtualAssistantCtrl', CareSetupVirtualAssistantCtrl);
