import ctVirtualAssistantComponentModule from './ct-virtual-assistant.component';
import { CVAConfig } from './factory/ctCustomerSupportClasses';

describe('In CVA, The controller', () => {

  let getLogoDeferred;
  let getLogoUrlDeferred;
  const orgName = 'Test Org';
  const dummyLogoUrl = 'https://www.example.com/logo.png';
  const getDummyLogo = (data) => {
    return { data };
  };
  const getStringOfLength = (length) => {
    return Array(length + 1).join('a');
  };

  let controller;

  const checkNextButtonState = (state: boolean) => {
    controller.isVirtualAssistantValid();
    expect(controller.TemplateWizardService.pageValidationResult.isVirtualAssistantValid).toEqual(state);
  };

  beforeEach(function () {
    this.initModules('Sunlight', ctVirtualAssistantComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
      '$stateParams',
      '$translate',
      'CTService',
      'Authinfo',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();
    this.TemplateWizardService.configuredVirtualAssistantServices = [{ id: 'id1', name: 'cva', icon: 'bot-icon' } as CVAConfig];
    getLogoDeferred = this.$q.defer();
    getLogoUrlDeferred = this.$q.defer();
    spyOn(this.CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(this.CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue(orgName);
    spyOn(this.$translate, 'instant').and.returnValue('careChatTpl.virtualAssistantWelcomeMessage');

    this.compileComponent('ct-virtual-assistant-component', {});

    getLogoDeferred.resolve(getDummyLogo('abcd'));
    getLogoUrlDeferred.resolve(dummyLogoUrl);

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });

  it('should update template when user select an item form VA list', function () {
    controller.selectedVA = {
      name: 'testVa',
      id: 'testId',
    };
    controller.vaSelectionCommit();
    expect(controller.template.configuration.virtualAssistant.config.id).toEqual(controller.selectedVA.id);
    expect(controller.template.configuration.virtualAssistant.config.name).toEqual(controller.selectedVA.name);
  });

  it('should not allow to navigate next page if No VA is selected in the page', function () {
    const validateCvaId = (id: string, finalState: boolean) => {
      controller.template.configuration.virtualAssistant.config.id = id;
      checkNextButtonState(finalState);
    };
    validateCvaId('', false);
    validateCvaId('something', true);
  });

  it('should not allow to navigate next page if welcomeMessage validation failed', function () {
    controller.template.configuration.virtualAssistant.config.id = 'something';
    controller.template.configuration.virtualAssistant.welcomeMessage = getStringOfLength(251);
    checkNextButtonState(false);

    controller.template.configuration.virtualAssistant.welcomeMessage = getStringOfLength(250);
    checkNextButtonState(true);
  });


  it('should update modified name of the VA in the template config', function () {
    const VAService = new CVAConfig('id1', 'new-name', undefined);

    controller.template.configuration.virtualAssistant.config = new CVAConfig('id1', 'old-name', undefined);
    controller.template.configuration.virtualAssistant.welcomeMessage = getStringOfLength(51);

    controller.TemplateWizardService.hasConfiguredVirtualAssistantServices = true;
    controller.TemplateWizardService.configuredVirtualAssistantServices = [VAService];
    controller.initializeCVA();

    expect(controller.selectedVA as CVAConfig).toEqual(VAService);
    expect(controller.template.configuration.virtualAssistant.config.id).toEqual(VAService.id);
    expect(controller.template.configuration.virtualAssistant.config.name).toEqual(VAService.name);
  });

  it('should disable VA if bot is deleted', function () {
    const template = controller.TemplateWizardService.template;
    const defaultSelectedVA = new CVAConfig();
    const defaultVirtualAssistantConfig = {
      enabled: false,
      config: defaultSelectedVA,
      welcomeMessage: this.$translate.instant('careChatTpl.virtualAssistantWelcomeMessage'),
    };

    template.configuration.virtualAssistant.config = new CVAConfig('id1', 'some-name');
    template.configuration.virtualAssistant.welcomeMessage = getStringOfLength(51);

    controller.hasConfiguredVirtualAssistantServices = true;
    controller.TemplateWizardService.configuredVirtualAssistantServices = [];
    controller.initializeCVA();

    expect(template.configuration.virtualAssistant.enabled).toBe(false);
    expect(controller.selectedVA).toEqual(defaultSelectedVA);
    expect(template.configuration.virtualAssistant.config).toEqual(defaultVirtualAssistantConfig.config);
  });

  it('should disable VA if on edit, no bot is found to be configured in the system', function () {
    const template = controller.TemplateWizardService.template;
    const defaultVirtualAssistantConfig = new CVAConfig();

    template.configuration.virtualAssistant.config.id = new CVAConfig('id-x', 'some-name');
    template.configuration.virtualAssistant.welcomeMessage = getStringOfLength(51);

    controller.hasConfiguredVirtualAssistantServices = false;
    controller.configuredVirtualAssistantServices = [];
    controller.initializeCVA();

    expect(template.configuration.virtualAssistant.enabled).toBe(false);
    expect(controller.selectedVA).toEqual(defaultVirtualAssistantConfig);
    expect(template.configuration.virtualAssistant.config).toEqual(defaultVirtualAssistantConfig);
  });
});
