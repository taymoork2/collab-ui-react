import { CtBaseController } from './ctBase.controller';
class CtChatStatusMessagesController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public $translate: ng.translate.ITranslateService,
    public CTService,
    public SunlightConstantsService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
  }

  public isCareAssistantEnabled;

  public $onInit(): void {
    super.$onInit();
    this.isCareAssistantEnabled = this.TemplateWizardService.featureFlags.isCareAssistantEnabled;
    this.isStatusMessagesPageValid();
  }

  public isExpertEscalationSelected(): boolean {
    // if eva is configured AND escalation to expert selected
    return !(this.TemplateWizardService.selectedMediaType() === 'chatPlusCallback') &&
      this.TemplateWizardService.evaConfig.isEvaFlagEnabled && this.TemplateWizardService.evaConfig.isEvaConfigured
      && this.TemplateWizardService.template.configuration.routingLabel &&
      _.includes(this.SunlightConstantsService.evaOptions, this.TemplateWizardService.template.configuration.routingLabel);
  }

  public helpTextWaiting = function () {
    if (this.isExpertEscalationSelected()) {
      return this.$translate.instant('careChatTpl.helpTextWaitingEVA');
    } else {
      return this.$translate.instant('careChatTpl.helpTextWaiting');
    }
  };

  public helpTextLeaveRoom = function () {
    if (this.isExpertEscalationSelected()) {
      return this.$translate.instant('careChatTpl.helpTextLeaveRoomEVA');
    } else {
      return this.$translate.instant('careChatTpl.helpTextLeaveRoom');
    }
  };

  public isStatusMessagesPageValid(): boolean {
    const chatStatusMessagesObj = this.TemplateWizardService.template.configuration.chatStatusMessages.messages;
    const status = this.TemplateWizardService.isValidField(chatStatusMessagesObj.waitingMessage.displayText, this.lengthValidationConstants.singleLineMaxCharLimit50)
      && this.TemplateWizardService.isValidField(chatStatusMessagesObj.leaveRoomMessage.displayText, this.lengthValidationConstants.singleLineMaxCharLimit50)
      && this.TemplateWizardService.isValidField(chatStatusMessagesObj.chattingMessage.displayText, this.lengthValidationConstants.singleLineMaxCharLimit50)
      && this.TemplateWizardService.isInputValid(chatStatusMessagesObj.waitingMessage.displayText)
      && this.TemplateWizardService.isInputValid(chatStatusMessagesObj.leaveRoomMessage.displayText)
      && this.TemplateWizardService.isInputValid(chatStatusMessagesObj.chattingMessage.displayText);
    this.TemplateWizardService.pageValidationResult.chatStatusMsgValid = status;
    return status;
  }
}

export class CtChatStatusMessagesComponent implements ng.IComponentOptions {
  public controller = CtChatStatusMessagesController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctChatStatusMessages.tpl.html');

}

export default angular
  .module('Sunlight')
  .component('ctChatStatusMessagesComponent', new CtChatStatusMessagesComponent())
  .name;
