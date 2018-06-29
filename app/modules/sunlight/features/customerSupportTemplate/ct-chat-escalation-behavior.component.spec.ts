import ctChatEscalationBehaviorComponentModule from './ct-chat-escalation-behavior.component';
import { IdNameConfig } from './factory/ctCustomerSupportClasses';

describe('In ctChatEscalationBehaviorComponent, The controller', () => {

  let controller;
  let evaDataModel;

  beforeEach(function () {
    this.initModules ('Sunlight', ctChatEscalationBehaviorComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-chat-escalation-behavior-component', {
      dismiss: 'dismiss()',
    });

    spyOn(this.TemplateWizardService, 'isExpertEscalationSelected');

    controller = this.controller;
    evaDataModel = controller.evaDataModel;
  });

  afterEach(function () {
    controller = undefined;
  });

  it('isChatEscalationBehaviorPageValid should validate the requirement', () => {
    controller.isChatEscalationBehaviorPageValid();
    expect(controller.TemplateWizardService.pageValidationResult['isChatEscalationValid']).toBe(true);
    expect(controller.evaDataModel).toEqual(evaDataModel);
  });

  it('onEscalationOptionChange should set expert virtual assitance properly ', () => {
    controller.onEscalationOptionChange('agent');
    const idNameConfig = new IdNameConfig();
    expect(controller.template.configuration.expertVirtualAssistant).toEqual(idNameConfig);

    controller.onEscalationOptionChange('expert');
    expect(controller.template.configuration.expertVirtualAssistant).toEqual(controller.TemplateWizardService.selectedEVA);

    controller.onEscalationOptionChange('agentplusexpert');
    expect(controller.template.configuration.expertVirtualAssistant).toEqual(controller.TemplateWizardService.selectedEVA);
  });

  it('setRequiredValue should set values properly when isExpertEscalationSelected is true and mediaType is chat', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    controller.setRequiredValue();
    expect(controller.template.configuration.pages.customerInformation.fields.field3.attributes[0].value).toEqual('required');
    expect(controller.template.configuration.pages['agentUnavailable'].enabled).toBe(false);
    expect(controller.template.configuration.chatStatusMessages.messages.waitingMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.waitingMessageEVA'));
    expect(controller.template.configuration.chatStatusMessages.messages.leaveRoomMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessageEVA'));
  });

  it('setRequiredValue should set values properly when isExpertEscalationSelected is false and mediaType is chat', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    controller.setRequiredValue();
    expect(controller.template.configuration.pages.customerInformation.fields.field3.attributes[0].value).toEqual('optional');
    expect(controller.template.configuration.pages['agentUnavailable'].enabled).toBe(true);
    expect(controller.template.configuration.chatStatusMessages.messages.waitingMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.waitingMessage'));
    expect(controller.template.configuration.chatStatusMessages.messages.leaveRoomMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessage'));
  });

  it('setRequiredValue should set values properly when isExpertEscalationSelected is true and mediaType is chatPlusCallback', function() {
    this.TemplateWizardService.setSelectedMediaType('chatPlusCallback');
    const template = this.TemplateWizardService.getDefaultTemplate('chatPlusCallback');
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    controller.template = template;
    controller.setRequiredValue();
    expect(controller.template.configuration.pages.customerInformationChat.fields.field3.attributes[0].value).toEqual('required');
    expect(controller.template.configuration.pages['agentUnavailable'].enabled).toBe(false);
    expect(controller.template.configuration.chatStatusMessages.messages.waitingMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.waitingMessageEVA'));
    expect(controller.template.configuration.chatStatusMessages.messages.leaveRoomMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessageEVA'));
  });

  it('setRequiredValue should set values properly when isExpertEscalationSelected is false and mediaType is chatPlusCallback', function() {
    this.TemplateWizardService.setSelectedMediaType('chatPlusCallback');
    const template = this.TemplateWizardService.getDefaultTemplate('chatPlusCallback');
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    controller.template = template;
    controller.setRequiredValue();
    expect(controller.template.configuration.pages.customerInformationChat.fields.field3.attributes[0].value).toEqual('optional');
    expect(controller.template.configuration.pages['agentUnavailable'].enabled).toBe(true);
    expect(controller.template.configuration.chatStatusMessages.messages.waitingMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.waitingMessage'));
    expect(controller.template.configuration.chatStatusMessages.messages.leaveRoomMessage.displayText).toEqual(this.TemplateWizardService.$translate.instant('careChatTpl.templateConfig.default.leaveRoomMessage'));
  });
});
