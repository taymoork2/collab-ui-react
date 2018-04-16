import { CtBaseController } from './ctBase.controller';
import { KeyCodes } from 'modules/core/accessibility';
import { IToolkitModalService } from 'modules/core/modal';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { AccessibilityService } from 'modules/core/accessibility';

class CtSetupAssistantCtrl extends CtBaseController  {

  /* @ngInject*/
  constructor(
    private $element: ng.IRootElementService,
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public $modal: IToolkitModalService,
    public $timeout: ng.ITimeoutService,
    private AccessibilityService: AccessibilityService,
    public TemplateWizardService: TemplateWizardService,
    public CTService,
    public $state,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);

    this.TemplateWizardService.setSelectedMediaType(this.$stateParams.type);
    this.TemplateWizardService.setInitialState();
  }

  public $onInit(): void {
    super.$onInit();
    this.TemplateWizardService.setInitialState();
    this.currentState = this.TemplateWizardService.currentState;
  }

  private animationTimeout = 10;
  private pageFocus = {};

  private setFocus(page: string, locator: string) {
    const element = this.$element.find(locator);
    if (!this.pageFocus[page] && element.length > 0) {
      this.AccessibilityService.setFocus(this.$element, locator);

      _.forEach(this.pageFocus, (_value: boolean, key: string) => {
        this.pageFocus[key] = false;
      });
      this.pageFocus[page] = true;
    }
  }

  private isOffHoursPageValid() {
    return this.TemplateWizardService.pageValidationResult.offHoursValid || false;
  }

  private isProactivePromptPageValid() {
    return this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid || false;
  }

  private isNamePageValid(): boolean {
    return this.TemplateWizardService.pageValidationResult.isNameValid || false;
  }

  private isCustomerInformationPageValid() {
    return this.TemplateWizardService.pageValidationResult.isCustomerInfoPageValid || false;
  }

  private isProfilePageValid() {
    return this.TemplateWizardService.pageValidationResult.isProfileValid || false;
  }

  private isAgentUnavailablePageValid() {
    return this.TemplateWizardService.pageValidationResult.isAgentUnavailableValid || false;
  }

  private isFeedbackPageValid() {
    return this.TemplateWizardService.pageValidationResult.isFeedbackValid || false;
  }

  private isStatusMessagesPageValid() {
    return this.TemplateWizardService.pageValidationResult.chatStatusMsgValid || false;
  }

  private isVirtualAssistantPageValid() {
    return this.TemplateWizardService.pageValidationResult.isVirtualAssistantValid || false;
  }

  private isChatEscalationBehaviorPageValid() {
    return this.TemplateWizardService.pageValidationResult.isChatEscalationValid || false;
  }

  public nextButton() {
    switch (this.TemplateWizardService.currentState) {
      case 'summary':
        this.setFocus('summary', '#chatSetupFinishBtn');
        return 'hidden';
      case 'offHours':
        this.setFocus('offHours', '#offHoursTextArea');
        return this.isOffHoursPageValid();
      case 'name':
        return this.isNamePageValid();
      case 'proactivePrompt':
        this.setFocus('proactivePrompt', '#promptSelect #selectMain');
        return this.isProactivePromptPageValid();
      case 'customerInformation':
      case 'customerInformationChat':
      case 'customerInformationCallback':
        this.setFocus('customerInformation', '#customerHeader');
        return this.isCustomerInformationPageValid();
      case 'profile':
        this.setFocus('profile', '[name="profileList"]');
        return this.isProfilePageValid();
      case 'agentUnavailable':
        this.setFocus('agentUnavailable', '#agentUnavailableMessageField');
        return this.isAgentUnavailablePageValid();
      case 'feedback':
      case 'feedbackCallback':
        this.setFocus('feedback', '#label');
        return this.isFeedbackPageValid();
      case 'chatStatusMessages':
        this.setFocus('chatStatusMessages', '#waiting');
        return this.isStatusMessagesPageValid();
      case 'overview':
        return true;
      case 'virtualAssistant':
        this.setFocus('virtualAssistant', '#virtualAssistantSelect #selectMain');
        return this.isVirtualAssistantPageValid();
      case 'chatEscalationBehavior':
        return this.isChatEscalationBehaviorPageValid();
      default:
        return 'hidden';
    }
  }

  private setCurrentState(page) {
    this.currentState = page;
    this.TemplateWizardService.currentState = this.currentState;
  }

  public previousButton() {
    if (this.currentState === this.TemplateWizardService.getStates()[0]) {
      return 'hidden';
    }
    return true;
  }

  private jumpToPageBy(count) {
    const newState =
      this.TemplateWizardService.getAdjacentEnabledState(this.TemplateWizardService.getPageIndex(), count);
    this.setCurrentState(newState);
    this.navigationHandler();
  }

  public previousPage() {
    this.$timeout( () => { this.jumpToPageBy(-1); }, this.animationTimeout);
  }

  public nextPage() {
    this.$timeout(() => { this.jumpToPageBy(1); }, this.animationTimeout);
  }

  public getTitle(): String {
    if (this.TemplateWizardService.isEditFeature) {
      return this.$translate.instant('careChatTpl.editTitle_' + this.selectedMediaType());
    } else {
      return this.$translate.instant('careChatTpl.createTitle_' + this.selectedMediaType());
    }
  }

  public cancelModal(): void {
    this.$modal.open({
      template: '<ct-cancel-modal-component dismiss="$dismiss()"></ct-cancel-modal-component>',
      type: 'dialog',
    });
  }
  public evalKeyPress(keyCode): void {
    switch (keyCode) {
      case KeyCodes.ESCAPE:
        this.cancelModal();
        break;
      case KeyCodes.ENTER:
        if (this.nextButton()) {
          this.nextPage();
        }
        break;
      default:
        break;
    }
  }

  // TODO: functionality will be added later
  private statusPageNotifier() {}

  public navigationHandler() {
    switch (this.TemplateWizardService.currentState) {
      case 'customerInformation':
      case 'customerInformationCallback':
      case 'customerInformationChat': this.TemplateWizardService.activeItem = undefined; break;
      case 'chatStatusMessages': this.statusPageNotifier(); break;
    }
  }
}

export class CtSetupAssistantComponent implements ng.IComponentOptions {
  public controller = CtSetupAssistantCtrl;
  public controllerAs = 'careSetupAssistant';
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctSetupAsssitantComponent.tpl.html');

  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('ctSetupAssistantComponent', new CtSetupAssistantComponent())
  .name ;
