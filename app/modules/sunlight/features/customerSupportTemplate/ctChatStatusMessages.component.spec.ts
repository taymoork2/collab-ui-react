import ctChatStatusMessagesModule from './ctChatStatusMessages.component';

describe('In CtChatStatusMessagesComponent, The controller', () => {

  let controller;

  beforeEach(function () {
    this.initModules ('Sunlight', ctChatStatusMessagesModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-chat-status-messages-component');

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });

  it('validate the message display text requirement', function() {

    function getTestTemplate(waitingMSG, leaveRoomMSG, chattingMSG): any {

      const template: any = {
        configuration: {
          chatStatusMessages: {
            messages: {
              waitingMessage: {
                displayText: waitingMSG,
              },
              leaveRoomMessage: {
                displayText: leaveRoomMSG,
              },
              chattingMessage: {
                displayText: chattingMSG,
              },
            },
          },
        },
      };
      return template;
    }

    const validMsg = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const invalidText = 'hello<>';
    const invalidMsg_51Char = validMsg + 'a';

    controller.TemplateWizardService.template = getTestTemplate(validMsg, validMsg, validMsg);
    expect(controller.isStatusMessagesPageValid()).toBe(true);

    controller.TemplateWizardService.template = getTestTemplate(invalidText, invalidText, invalidText);
    expect(controller.isStatusMessagesPageValid()).toBe(false);

    controller.TemplateWizardService.template = getTestTemplate(invalidMsg_51Char, invalidMsg_51Char, invalidMsg_51Char);
    expect(controller.isStatusMessagesPageValid()).toBe(false);

  });

  it('validate different message', () => {

    controller.TemplateWizardService.featureFlags = {
      isCareAssistantEnabled: true,
    };

    controller.TemplateWizardService.evaConfig = {
      isEvaFlagEnabled: true,
      isEvaConfigured: true,
    };
    controller.TemplateWizardService.setSelectedMediaType('chat');
    controller.TemplateWizardService.template.configuration.routingLabel = 'expert';
    expect(controller.helpTextLeaveRoom()).toEqual('careChatTpl.helpTextLeaveRoomEVA');
    expect(controller.helpTextWaiting()).toEqual('careChatTpl.helpTextWaitingEVA');

    controller.TemplateWizardService.template.configuration.routingLabel = 'agent';
    expect(controller.helpTextLeaveRoom()).toEqual('careChatTpl.helpTextLeaveRoom');
    expect(controller.helpTextWaiting()).toEqual('careChatTpl.helpTextWaiting');

    controller.TemplateWizardService.template.configuration.routingLabel = 'agentplusexpert';
    expect(controller.helpTextLeaveRoom()).toEqual('careChatTpl.helpTextLeaveRoomEVA');
    expect(controller.helpTextWaiting()).toEqual('careChatTpl.helpTextWaitingEVA');

  });

});
