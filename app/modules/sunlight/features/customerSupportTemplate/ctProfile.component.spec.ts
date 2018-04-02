import ctProfileComponentModule from './ctProfile.component';

describe('CtProfileComponent, ', () => {
  let controller;

  beforeEach(function() {
    this.initModules ('Sunlight', ctProfileComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-profile-component', {
      dismiss: 'dismiss()',
    });
    spyOn(this.TemplateWizardService, 'isExpertEscalationSelected');
    spyOn(this.TemplateWizardService, 'careVirtualAssistantName');
    // spyOn(this.TemplateWizardService, 'getAttributeParam');

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });

  it('should set the right view for given template when isExpertEscalationSelected is true ', function () {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    controller.template.configuration.mediaSpecificConfiguration.useOrgProfile = true;
    controller.template.configuration.mediaSpecificConfiguration.useAgentRealName = true;

    controller.setViewDataFromConfig();
    expect(controller.selectedTemplateProfile).toBe(this.TemplateWizardService.profiles.org);
    expect(controller.selectedAgentProfile).toBe(this.TemplateWizardService.userNames.displayName);

    controller.template.configuration.mediaSpecificConfiguration.useOrgProfile = false;
    controller.template.configuration.mediaSpecificConfiguration.useAgentRealName = false;
    controller.setViewDataFromConfig();
    expect(controller.selectedTemplateProfile).toBe(this.TemplateWizardService.profiles.agent);
    expect(controller.selectedAgentProfile).toBe(this.TemplateWizardService.userNames.alias);
  });

  it('should set the right view for given template when isExpertEscalationSelected is false ', function () {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    controller.template.configuration.mediaSpecificConfiguration.useOrgProfile = true;
    controller.template.configuration.mediaSpecificConfiguration.useAgentRealName = true;

    controller.setViewDataFromConfig();
    expect(controller.selectedTemplateProfile).toBe(this.TemplateWizardService.profiles.org);
    expect(controller.selectedAgentProfile).toBe(this.TemplateWizardService.agentNames.displayName);

    controller.template.configuration.mediaSpecificConfiguration.useOrgProfile = false;
    controller.template.configuration.mediaSpecificConfiguration.useAgentRealName = false;
    controller.setViewDataFromConfig();
    expect(controller.selectedTemplateProfile).toBe(this.TemplateWizardService.profiles.agent);
    expect(controller.selectedAgentProfile).toBe(this.TemplateWizardService.agentNames.alias);
  });

  it('should validate the page', function() {
    this.TemplateWizardService.orgName = 'TEST_ORG';
    expect(controller.selectedTemplateProfile).toBe(this.TemplateWizardService.profiles.org);
    expect(this.TemplateWizardService.pageValidationResult.isProfileValid).toBe(true);
  });

  it('should return valid careVirtualAssistantName', function() {
    this.TemplateWizardService.careVirtualAssistantName.and.
    returnValue('Care-GT');
    expect(controller.careVirtualAssistantName).toBe('Care-GT');
  });

  it('should return true if agent profile is with CVA', function() {
    this.TemplateWizardService.isCVAEnabled = true;
    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    expect(controller.isAgentProfileWithCVA).toBe(true);
  });

  it('should select respective avater for given toggleBotAgent', function() {
    controller.toggleBotAgentSelection('bot');
    expect(controller.selectedAvater).toBe('bot');

    controller.toggleBotAgentSelection('agent');
    expect(controller.selectedAvater).toBe('agent');
  });

  it('should return respective branding page tooltip text when profileType is bot', function() {
    expect(controller.brandingPageTooltipText('bot')).toBe(controller.$translate.instant('careChatTpl.botProfileTooltip'));
  });

  it('should return respective branding page tooltip text when isExpertEscalationSelected is true', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    expect(controller.brandingPageTooltipText('agent')).toBe(controller.$translate.instant('careChatTpl.userProfileTooltip'));
  });

  it('should return respective branding page tooltip text when isExpertEscalationSelected is false', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    expect(controller.brandingPageTooltipText('agent')).toBe(controller.$translate.instant('careChatTpl.agentProfileTooltip'));
  });

  it('should return respective profile description when isExpertEscalationSelected is true', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    expect(controller.profileDesc).toBe(controller.$translate.instant('careChatTpl.profileEvaDesc'));
  });

  it('should return respective profile description when isExpertEscalationSelected is false', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    expect(controller.profileDesc).toBe(controller.$translate.instant('careChatTpl.profileDesc'));
  });

  it('should return respective profile setting info when isExpertEscalationSelected is true', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    expect(controller.profileSettingInfo).toBe(controller.$translate.instant('careChatTpl.userSettingInfo'));

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.org;
    expect(controller.profileSettingInfo).toBe(controller.$translate.instant('careChatTpl.orgEvaSettingInfo'));
  });

  it('should return respective profile setting info when isExpertEscalationSelected is false', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(false);
    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    expect(controller.profileSettingInfo).toBe(controller.$translate.instant('careChatTpl.agentSettingInfo'));

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.org;
    expect(controller.profileSettingInfo).toBe(controller.$translate.instant('careChatTpl.orgSettingInfo'));
  });

  it('should return true when isExpertEscalationSelected', function() {
    this.TemplateWizardService.isExpertEscalationSelected.and.returnValue(true);
    expect(controller.isExpertEscalationSelected).toBe(true);
  });

  it('should display selected profile attribute', function() {
    this.TemplateWizardService.isCVAEnabled = true;
    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.org;
    expect(controller.displaySelectedProfileAttribute).toBe('org');

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    expect(controller.displaySelectedProfileAttribute).toBe(controller.selectedAvater);

    this.TemplateWizardService.isCVAEnabled = false;

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.org;
    expect(controller.displaySelectedProfileAttribute).toBe('org');

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    expect(controller.displaySelectedProfileAttribute).toBe('agent');
  });

  it('should properly set user org profile', function() {
    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.org;
    controller.setUseOrgProfile();
    expect(controller.template.configuration.mediaSpecificConfiguration.useOrgProfile).toBe(true);

    controller.selectedTemplateProfile = this.TemplateWizardService.profiles.agent;
    controller.setUseOrgProfile();
    expect(controller.template.configuration.mediaSpecificConfiguration.useOrgProfile).toBe(false);
  });

  it('should properly set agent profile', function() {
    controller.selectedAgentProfile = controller.agentNames.alias;
    controller.setAgentProfile();
    expect(controller.agentNamePreview).toBe(controller.$translate.instant('careChatTpl.agentAliasPreview'));
    expect(controller.template.configuration.mediaSpecificConfiguration.useAgentRealName).toBe(false);

    controller.selectedAgentProfile = controller.agentNames.displayName;
    controller.setAgentProfile();
    expect(controller.agentNamePreview).toBe(controller.$translate.instant('careChatTpl.agentNamePreview'));
    expect(controller.template.configuration.mediaSpecificConfiguration.useAgentRealName).toBe(true);

    controller.selectedAgentProfile = controller.userNames.alias;
    controller.setAgentProfile();
    expect(controller.agentNamePreview).toBe(controller.$translate.instant('careChatTpl.agentAliasPreview'));
    expect(controller.template.configuration.mediaSpecificConfiguration.useAgentRealName).toBe(false);

    controller.selectedAgentProfile = controller.userNames.displayName;
    controller.setAgentProfile();
    expect(controller.agentNamePreview).toBe(controller.$translate.instant('careChatTpl.userNamePreview'));

    expect(controller.template.configuration.mediaSpecificConfiguration.useAgentRealName).toBe(true);
  });
});
