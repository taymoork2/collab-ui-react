import { TemplateWizardService } from './TemplateWizard.service';
import { CVAConfig } from '../factory/ctCustomerSupportClasses';

describe('TemplateWizardService ', () => {

  let templateWizardService: TemplateWizardService;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function(_TemplateWizardService_) {
    templateWizardService = _TemplateWizardService_;

  }));


  it('getDefaultTemplate get the right template for mediaTye = chat', () => {
    const template = templateWizardService.getDefaultTemplate('chat');
    expect(template.configuration.mediaType === 'chat').toBe(true);
  });

  it('getDefaultTemplate get the right template for mediaTye = callback', () => {
    expect(templateWizardService.getDefaultTemplate('callback').configuration.mediaType === 'callback').toBe(true);
  });

  it('getDefaultTemplate get the right template for mediaTye = chatPlusCallback', () => {
    expect(templateWizardService.getDefaultTemplate('chatPlusCallback').configuration.mediaType === 'chatPlusCallback').toBe(true);
  });

  it('setSelectedMediaType to set the mediaType in the service and get the default template', () => {
    templateWizardService.setSelectedMediaType('chat');
    expect(templateWizardService.selectedMediaType() === 'chat').toBe(true);
    expect(templateWizardService.template.configuration.mediaType === 'chat').toBe(true);
  });

  it('setInitialState should set the starting state', () => {
    templateWizardService.setInitialState();
    expect(templateWizardService.currentState === templateWizardService.getStates()[0]).toBe(true);
  });

  it('isInputValid should validate the input content against the invalid char list', () => {
    expect(templateWizardService.isInputValid('sdsd > sds')).toBe(false);
    expect(templateWizardService.isInputValid('sdsd sds')).toBe(true);
  });

  it ('isValidField should validate the length of the input', () => {
    expect(templateWizardService.isValidField('sss', 50)).toBe(true);
    expect(templateWizardService.isValidField('sss', 2)).toBe(false);
    expect(templateWizardService.isValidField('sss', 3)).toBe(true);
  });


  /* UT for ct profile realted functions */

  it('setCardMode should set the right card mode', () => {
    templateWizardService.setCardMode('chat');
    expect(templateWizardService.cardMode).toBe('chat');
  });

  it('isExpertEscalationSelected should return true with required parameters', () => {
    templateWizardService.setSelectedMediaType('chat');
    templateWizardService.setCardMode('chat');
    templateWizardService.evaConfig.isEvaFlagEnabled = true;
    templateWizardService.evaConfig.isEvaConfigured = true;
    templateWizardService.template.configuration.routingLabel = 'expert';
    expect(templateWizardService.isExpertEscalationSelected()).toBe(true);
  });

  it('isExpertEscalationSelected should return false with required parameters', function() {
    templateWizardService.setSelectedMediaType('chatPlusCallback');
    templateWizardService.setCardMode('callback');
    templateWizardService.evaConfig.isEvaFlagEnabled = true;
    templateWizardService.evaConfig.isEvaConfigured = true;
    templateWizardService.template.configuration.routingLabel = 'expert';
    expect(templateWizardService.isExpertEscalationSelected()).toBe(false);
  });

  it('getLocalizedOrgOrAgentInfo should return info based on given conditions', function() {
    templateWizardService.setSelectedMediaType('chat');
    templateWizardService.template.configuration.virtualAssistant.enabled  = true;
    templateWizardService.setCardMode('chat');
    templateWizardService.evaConfig.isEvaFlagEnabled = true;
    templateWizardService.evaConfig.isEvaConfigured = true;
    templateWizardService.template.configuration.routingLabel = 'expert';
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('agentInfo')).toBe(templateWizardService.cvaMessage['userInfo']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('agentHeader')).toBe(templateWizardService.cvaMessage['userHeader']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('orgInfo')).toBe(templateWizardService.cvaMessage['orgInfoEVA']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('userInfo')).toBe(templateWizardService.cvaMessage['userInfo']);

    templateWizardService.template.configuration.virtualAssistant.enabled  = false;
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('agentInfo')).toBe(templateWizardService.nonCVAMessage['userInfo']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('agentHeader')).toBe(templateWizardService.nonCVAMessage['userHeader']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('orgInfo')).toBe(templateWizardService.nonCVAMessage['orgInfoEVA']);
    expect(templateWizardService.getLocalizedOrgOrAgentInfo('userInfo')).toBe(templateWizardService.nonCVAMessage['userInfo']);
  });

  it('getProfileList should return profile list', function () {
    templateWizardService.setSelectedMediaType('chat');
    templateWizardService.template.configuration.virtualAssistant.enabled  = true;
    templateWizardService.setCardMode('chat');
    templateWizardService.evaConfig.isEvaFlagEnabled = true;
    templateWizardService.evaConfig.isEvaConfigured = true;
    templateWizardService.template.configuration.routingLabel = 'expert';
    const profileList = [
      {
        header: templateWizardService.getLocalizedOrgOrAgentInfo('orgHeader'),
        label: templateWizardService.getLocalizedOrgOrAgentInfo('orgInfo'),
        value: templateWizardService.profiles.org,
      },
      {
        header: templateWizardService.getLocalizedOrgOrAgentInfo('agentHeader'),
        label: templateWizardService.getLocalizedOrgOrAgentInfo('agentInfo'),
        value: templateWizardService.profiles.agent,
      },
    ];

    expect(templateWizardService.getProfileList()).toEqual(profileList);
  });

  it('getCustomerInformationFormFields should return customer info fields', () => {
    templateWizardService.cardMode = undefined;
    templateWizardService.setSelectedMediaType('chat');
    expect(templateWizardService.getCustomerInformationFormFields()).toBe(templateWizardService.template.configuration.pages.customerInformation.fields);

    templateWizardService.setSelectedMediaType('chatPlusCallback');
    templateWizardService.cardMode = 'callback';
    expect(templateWizardService.getCustomerInformationFormFields()).toBe(templateWizardService.template.configuration.pages.customerInformationCallback.fields);
    templateWizardService.cardMode = 'chat';
    expect(templateWizardService.getCustomerInformationFormFields()).toBe(templateWizardService.template.configuration.pages.customerInformationChat.fields);
  });

  it('careVirtualAssistantName should return proper CVA name', function() {
    templateWizardService.setSelectedMediaType('chat');
    templateWizardService.template.configuration.virtualAssistant.config.name = 'care-gt';
    expect(templateWizardService.careVirtualAssistantName()).toEqual('care-gt');

    templateWizardService.template.configuration.virtualAssistant.config = undefined;
    expect(templateWizardService.careVirtualAssistantName()).toEqual(templateWizardService.$translate.instant('careChatTpl.default_cva_name'));
  });

  it(' EVAObject should return true if valid', function() {
    const eva = {
      id: '',
      orgId: '',
      name: 'care-eva',
    };
    expect(templateWizardService.isEvaObjectValid(eva)).toBe('');
    expect(templateWizardService.getEvaName(eva)).toBe('care-eva');
  });

  it('setSpaceDataAsError should set proper messages', function() {
    templateWizardService.setSpaceDataAsError();
    const popoverErrorMessage = templateWizardService.$translate.instant('careChatTpl.featureCard.popoverErrorMessage');
    expect(templateWizardService.evaSpaceTooltipData).toEqual(`<div class="feature-card-popover-error">${popoverErrorMessage}</div>`);
    expect(templateWizardService.evaSpaceTooltipAriaLabel).toEqual(popoverErrorMessage);
  });

  it('vaSelectionCommit should set proper config data', function() {
    templateWizardService.setSelectedMediaType('chat');
    templateWizardService.selectedVA = new CVAConfig();
    templateWizardService.selectedVA.id = '1';
    templateWizardService.selectedVA.name = 'VA';
    templateWizardService.vaSelectionCommit();
    expect( templateWizardService.template.configuration.virtualAssistant.config.id).toEqual('1');
    expect( templateWizardService.template.configuration.virtualAssistant.config.name).toEqual('VA');
  });
});
