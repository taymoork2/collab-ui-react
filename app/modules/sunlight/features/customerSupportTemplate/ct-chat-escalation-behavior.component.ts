import { CtBaseController } from './ctBase.controller';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { CTService } from 'modules/sunlight/features/customerSupportTemplate/services/CTService';
import { SunlightConstantsService } from 'modules/sunlight/services/SunlightConstantsService';
import { IdNameConfig, MediaTypes } from './factory/ctCustomerSupportClasses';

class CtChatEscalationBehaviorController extends CtBaseController {
  public evaLearnMoreLink: string = 'https://www.cisco.com/go/create-template';
  public evaDataModel: any;
  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService: TemplateWizardService,
    public CTService: CTService,
    public $translate: ng.translate.ITranslateService,
    public SunlightConstantsService: SunlightConstantsService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.evaDataModel = this.getEVADataModel();
  }

  public $onInit(): void {
    super.$onInit();

    if (this.TemplateWizardService.evaConfig.isEvaConfigured) {
      _.forEach(this.evaDataModel, function (evaData) {
        if (evaData.id !== 'agent') {
          evaData.isDisabled = false;
        }
      });
    }

    this.isChatEscalationBehaviorPageValid();
  }

  private isChatEscalationBehaviorPageValid() {
    if (this.TemplateWizardService.evaConfig.isEvaConfigured) {
      this.TemplateWizardService.pageValidationResult['isChatEscalationValid'] = this.template.configuration.routingLabel && _.includes(this.SunlightConstantsService.routingLabels, this.template.configuration.routingLabel);
    } else {
      this.TemplateWizardService.pageValidationResult['isChatEscalationValid'] = this.template.configuration.routingLabel && !_.includes(this.SunlightConstantsService.evaOptions, this.template.configuration.routingLabel);
    }
  }

  private getEVADataModel() {
    return [{
      label: this.$translate.instant('careChatTpl.chatEscalatioAgent'),
      value: this.SunlightConstantsService.routingLabels.AGENT,
      name: 'RadioEVA',
      id: 'agent',
      desc: this.$translate.instant('careChatTpl.chatEscalatioAgentDesc'),
      hasInfo: true,
      isDisabled: false,
      tooltipHtml: this.$translate.instant('careChatTpl.chatEscalatioAgentTooltip'),
    }, {
      label: this.$translate.instant('careChatTpl.chatEscalatioExpert'),
      value: this.SunlightConstantsService.routingLabels.EXPERT,
      name: 'RadioEVA',
      id: 'expert',
      desc: this.$translate.instant('careChatTpl.chatEscalatioExpertDesc'),
      hasInfo: false,
      isDisabled: !this.TemplateWizardService.evaConfig.isEvaConfigured,
      tooltipHtml: this.$translate.instant('careChatTpl.chatEscalatioExpertTooltip'),
    }, {
      label: this.$translate.instant('careChatTpl.chatEscalatioAgentPlusExpert'),
      value: this.SunlightConstantsService.routingLabels.AGENTPLUSEXPERT,
      name: 'RadioEVA',
      id: 'agentplusexpert',
      desc: this.$translate.instant('careChatTpl.chatEscalatioAgentPlusExpertDesc'),
      hasInfo: false,
      isDisabled: !this.TemplateWizardService.evaConfig.isEvaConfigured,
      tooltipHtml: this.$translate.instant('careChatTpl.chatEscalatioAgentPlusExpertTooltip'),
    }];
  }

  public onEscalationOptionChange(escalationType): void {
    const isExpertIncluded = _.includes(this.SunlightConstantsService.evaOptions, escalationType);
    if (isExpertIncluded) {
      this.template.configuration.expertVirtualAssistant = this.TemplateWizardService.selectedEVA;
    } else {
      this.template.configuration.expertVirtualAssistant = new IdNameConfig();
    }

    this.isChatEscalationBehaviorPageValid();
  }

  private setRequiredValueChat(radioButtonValue) {
    const defaultChatAttributes = this.template.configuration.pages.customerInformation.fields.field3.attributes;
    _.forEach(defaultChatAttributes, function (attribute) {
      if (attribute.name === 'required') {
        attribute.value = radioButtonValue;
      }
    });
    this.template.configuration.pages.customerInformation.fields.field3.attributes = defaultChatAttributes;
  }

  private setRequiredValueChatPlusCallback(radioButtonValue) {
    const defaultChatPlusCallackAttributes = this.template.configuration.pages.customerInformationChat.fields.field3.attributes;
    _.forEach(defaultChatPlusCallackAttributes, function (attribute) {
      if (attribute.name === 'required') {
        attribute.value = radioButtonValue;
      }
    });
    this.template.configuration.pages.customerInformationChat.fields.field3.attributes = defaultChatPlusCallackAttributes;
  }

  public setRequiredValue() {
    const radioButtonValue = this.TemplateWizardService.isExpertEscalationSelected() ? 'required' : 'optional';
    switch (this.TemplateWizardService.selectedMediaType()) {
      case MediaTypes.CHAT: this.setRequiredValueChat(radioButtonValue); break;
      case MediaTypes.CHATPLUSCALLBACK: this.setRequiredValueChatPlusCallback(radioButtonValue); break;
    }
    const agentPageDisabled = this.template.configuration.pages['agentUnavailable'];
    agentPageDisabled.enabled = !this.TemplateWizardService.isExpertEscalationSelected();
    this.template.configuration.pages['agentUnavailable'] = agentPageDisabled;
    this.TemplateWizardService.userDetails = this.TemplateWizardService.isExpertEscalationSelected() ? this.TemplateWizardService.userNames : this.TemplateWizardService.agentNames;
    this.TemplateWizardService.selectedAgentProfile = this.TemplateWizardService.isExpertEscalationSelected() ? this.TemplateWizardService.userNames.displayName : this.TemplateWizardService.agentNames.displayName;
    this.template.configuration.chatStatusMessages.messages.waitingMessage.displayText = this.TemplateWizardService.isExpertEscalationSelected() ?
      this.$translate.instant('careChatTpl.templateConfig.default.waitingMessageEVA') : this.$translate.instant('careChatTpl.templateConfig.default.waitingMessage');
    this.template.configuration.chatStatusMessages.messages.leaveRoomMessage.displayText = this.TemplateWizardService.isExpertEscalationSelected() ?
      this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessageEVA') : this.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessage');
    this.TemplateWizardService.agentNamePreview = this.TemplateWizardService.isExpertEscalationSelected() ? this.$translate.instant('careChatTpl.userNamePreview') :
      this.$translate.instant('careChatTpl.agentNamePreview');
  }

}

export class CtChatEscalationBehaviorComponent implements ng.IComponentOptions {
  public controller = CtChatEscalationBehaviorController;
  public template = require('./wizardPagesComponent/ct-chat-escalation-behavior.tpl.html');
}

export default angular
  .module('Sunlight')
  .component('ctChatEscalationBehaviorComponent', new CtChatEscalationBehaviorComponent())
  .name;
