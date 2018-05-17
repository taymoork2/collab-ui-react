import ctAgentUnavailableModule from './ctAgentUnavailable.component';

describe('In CtAgentUnavailableComponent, The controller', () => {

  let controller;

  beforeEach(function () {
    this.initModules ('Sunlight', ctAgentUnavailableModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-agent-unavailable-component');

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });
  const getStringOfLength = function (length) {
    return Array(length + 1).join('a');
  };

  it('next button should be disabled when unavailable msg is more than 250 characters', function () {
    controller.template.configuration.pages.agentUnavailable.fields.agentUnavailableMessage.displayText = getStringOfLength(251);
    controller.setAgentUnavailablePageValidation();
    expect(controller.TemplateWizardService.pageValidationResult.isAgentUnavailableValid).toEqual(false);

  });

  it('next button should be disabled when unavailable msg has invalid characters', function () {
    controller.template.configuration.pages.agentUnavailable.fields.agentUnavailableMessage.displayText = '<';
    controller.setAgentUnavailablePageValidation();
    expect(controller.TemplateWizardService.pageValidationResult.isAgentUnavailableValid).toEqual(false);
  });

  it('next button should be enabled when unavailable msg is present', function () {
    controller.template.configuration.pages.agentUnavailable.fields.agentUnavailableMessage.displayText = 'hello';
    controller.setAgentUnavailablePageValidation();
    expect(controller.TemplateWizardService.pageValidationResult.isAgentUnavailableValid).toEqual(true);
  });
});
