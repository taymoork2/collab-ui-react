import ctOverviewComponentModule from './ctOverview.component';

describe('In ctOverviewCompoent, for chat media', () => {

  let controller;

  beforeEach(function () {
    this.initModules ('Sunlight', ctOverviewComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
      '$translate',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();
    this.TemplateWizardService.featureFlags.isCareProactiveChatTrialsEnabled = true;
    this.TemplateWizardService.featureFlags.isCareAssistantEnabled = true;

    this.compileComponent('ct-overview-component', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });

  it('virtual assistant card should be configurable only if CVA is present', () => {
    controller.TemplateWizardService.hasConfiguredVirtualAssistantServices = true;
    expect(controller.isOverviewCardConfigurable('virtualAssistant')).toBe(true);

    controller.TemplateWizardService.hasConfiguredVirtualAssistantServices = false;
    expect(controller.isOverviewCardConfigurable('virtualAssistant')).toBe(false);
  });

  it('chat mediaType should have all media related cards', () => {
    expect(controller.overviewCards.length === 6).toBe(true);
  });

  it('overviewPageTooltipText() should get the right tool tip for the component', () => {
    expect(controller.overviewPageTooltipText('agentUnavailable') ===
      controller.$translate.instant('careChatTpl.agentUnavailableToggleTooltipMessage')).toBe(true);
    expect(controller.overviewPageTooltipText('customerInformation') ===
      controller.$translate.instant('careChatTpl.customerInfoToggleTooltipMessage')).toBe(true);
    expect(controller.overviewPageTooltipText('virtualAssistant') ===
      controller.$translate.instant('careChatTpl.virtualAssistantToggleTooltipMessage')).toBe(true);
    expect(controller.overviewPageTooltipText('customerInformationCallback') ===
      controller.$translate.instant('careChatTpl.customerInfoToggleTooltipMessage')).toBe(true);
  });

  it('getCardConfig() should get the config object from the template', () => {
    expect(controller.getCardConfig('customerInformation') === undefined).toBe(false);
    expect(controller.getCardConfig('agentUnavailable') === undefined).toBe(false);
    expect(controller.getCardConfig('virtualAssistant') === undefined).toBe(false);
    expect(controller.getCardConfig('proactivePrompt') === undefined).toBe(false);
    expect(controller.getCardConfig('feedback') === undefined).toBe(false);
  });

});

describe('In ctOverviewCompoent, for callback media', () => {

  let controller;

  beforeEach(function () {
    this.initModules('Sunlight', ctOverviewComponentModule);
    this.injectDependencies(
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('callback');
    this.TemplateWizardService.setInitialState();
    this.TemplateWizardService.featureFlags.isCareProactiveChatTrialsEnabled = true;
    this.TemplateWizardService.featureFlags.isCareAssistantEnabled = true;

    this.compileComponent('ct-overview-component', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });
  it('callback mediaType should have all media related cards', () => {
    expect(controller.overviewCards.length === 3).toBe(true);
  });

});

describe('In ctOverviewCompoent, for chatPlusCallback media', () => {

  let controller;

  beforeEach(function () {
    this.initModules('Sunlight', ctOverviewComponentModule);
    this.injectDependencies(
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chatPlusCallback');
    this.TemplateWizardService.setInitialState();
    this.TemplateWizardService.featureFlags.isCareProactiveChatTrialsEnabled = true;
    this.TemplateWizardService.featureFlags.isCareAssistantEnabled = true;

    this.compileComponent('ct-overview-component', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });
  it('chatPlusCallback mediaType should have all media related cards', () => {
    expect(controller.overviewCards.length === 8).toBe(true);
  });

});
