import { CtBaseController } from './ctBase.controller';
import { KeyCodes } from 'modules/core/accessibility';
import { IToolkitModalService } from 'modules/core/modal';
import { TemplateWizardService } from './services/TemplateWizard.service';

class CtSetupAssistantCtrl extends CtBaseController  {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public $modal: IToolkitModalService,
    public $timeout: ng.ITimeoutService,
    public TemplateWizardService: TemplateWizardService,
    public CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);

    this.TemplateWizardService.setSelectedMediaType(this.$stateParams.type);
    this.TemplateWizardService.setInitialState();
    this.c.log(this.$stateParams);
  }

  public $onInit(): void {
    super.$onInit();
    this.TemplateWizardService.setInitialState();
    this.currentState = this.TemplateWizardService.currentState;
  }

  public animation = 'slide-left';
  private animationTimeout = 10;

  private setFocus(page, locator) {
    this.c.log(page, locator);
  }

  private isOffHoursPageValid() {
    return this.TemplateWizardService.pageValidationResult.offHoursValid || false;
  }

  private isProactivePromptPageValid() {
    return true;
  }

  private isNamePageValid(): boolean {
    return this.TemplateWizardService.pageValidationResult.isNameValid || false;
  }

  private isCustomerInformationPageValid() {
    return true;
  }

  private isProfilePageValid() {
    return true;
  }

  private isAgentUnavailablePageValid() {
    return this.TemplateWizardService.pageValidationResult.isAgentUnavailableValid || false;
  }

  private isFeedbackPageValid() {
    return true;
  }

  private isStatusMessagesPageValid() {
    return this.TemplateWizardService.pageValidationResult.chatStatusMsgValid || false;
  }

  private isVirtualAssistantPageValid() {
    return true;
  }

  private isChatEscalationBehaviorPageValid() {
    return true;
  }

  public nextButton() {
    this.c.log('next button: state' +  this.TemplateWizardService.currentState);
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
        //var cardName = _.get(vm.overviewCards[0], 'name');
        //if (!_.isUndefined(cardName)) {
        //  this.setFocus('overview', '#' + cardName);
        //}
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
    this.animation = 'slide-right';
    this.$timeout( () => { this.jumpToPageBy(-1); }, this.animationTimeout);
  }

  public nextPage() {
    this.animation = 'slide-left';
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
    this.c.log('evalKeyPress:' + keyCode );
    switch (keyCode) {
      case KeyCodes.ESCAPE:
        this.c.log('Cancell will be called here');
        this.cancelModal();
        break;
      default:
        break;
    }
  }

  public navigationHandler() {
    switch (this.TemplateWizardService.currentState) {
      case 'customerInformation':
      case 'customerInformationCallback':
      case 'customerInformationChat': this.TemplateWizardService.activeItem = undefined; break;
      case 'chatStatusMessages': this.statusPageNotifier(); break;
    }
  }

  private statusPageNotifier() {
  //  var notifyMessage = this.$translate.instant('careChatTpl.statusMessage_failureText', { lengthLimit: this.TemplateWizardService.lengthConstants.singleLineMaxCharLimit25 });
  //  if (!this.isStatusMessagesPageValid() && this.TemplateWizardService.isEditFeature) {
  //    Notification.error(notifyMessage);
  //  }
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
