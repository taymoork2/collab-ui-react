import { CtBaseController } from './ctBase.controller';
import { CVAConfig } from './factory/ctCustomerSupportClasses';

class CtProfileController extends CtBaseController {

  public profileList: any;
  public userDetails: any;
  public selectedTemplateProfile: string;
  public profiles: any;
  public selectedAvater: string;
  public agentNamePreview: string;
  public selectedAgentProfile: string;
  public agentNames: any;
  public userNames: any;
  public selectedVA: CVAConfig;
  public logoFile: string;
  public logoUploaded: boolean;
  private cardMode: string;
  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public $state: ng.ui.IStateService,
    public TemplateWizardService,
    public CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.TemplateWizardService.setCardMode(this.cardMode);
  }

  public $onInit(): void {
    super.$onInit();
    this.profileList = this.TemplateWizardService.getProfileList();
    this.userDetails = this.TemplateWizardService.userDetails;
    this.profiles = this.TemplateWizardService.profiles;
    this.selectedAvater = this.TemplateWizardService.selectedAvater;
    this.agentNamePreview = this.TemplateWizardService.agentNamePreview;
    this.agentNames = this.TemplateWizardService.agentNames;
    this.userNames = this.TemplateWizardService.userNames;
    this.selectedVA = this.TemplateWizardService.selectedVA;
    this.logoFile = this.TemplateWizardService.logoFile;
    this.logoUploaded  = this.TemplateWizardService.logoUploaded;

    this.setViewDataFromConfig();
    this.isProfilePageValid();
    this.setAgentProfile();
  }

  private setViewDataFromConfig(): void  {
    const displayName = this.TemplateWizardService.isExpertEscalationSelected() ? this.userNames.displayName : this.agentNames.displayName;
    const alias = this.TemplateWizardService.isExpertEscalationSelected() ? this.userNames.alias : this.agentNames.alias;

    this.selectedTemplateProfile = this.template.configuration.mediaSpecificConfiguration.useOrgProfile ? this.profiles.org : this.profiles.agent;
    this.selectedAgentProfile = this.template.configuration.mediaSpecificConfiguration.useAgentRealName ? displayName : alias;
  }

  private isProfilePageValid(): void {
    let isProfileValid = false;
    if ((this.selectedTemplateProfile === this.profiles.org && this.TemplateWizardService.orgName !== '') || (this.selectedTemplateProfile === this.profiles.agent)) {
      this.template.configuration.mediaSpecificConfiguration.displayText = this.TemplateWizardService.getAttributeParam('value', 'organization', 'welcomeHeader'),
      isProfileValid = true;
    }
    this.TemplateWizardService.pageValidationResult.isProfileValid = isProfileValid;
  }

  public get careVirtualAssistantName(): string {
    return this.TemplateWizardService.careVirtualAssistantName();
  }

  public get isAgentProfileWithCVA(): boolean {
    return this.TemplateWizardService.isCVAEnabled && (this.selectedTemplateProfile === this.profiles.agent);
  }

  public toggleBotAgentSelection(selectedToggle): void {
    this.selectedAvater = selectedToggle;
  }

  public brandingPageTooltipText(profileType): string {
    if (profileType === 'bot') {
      return this.$translate.instant('careChatTpl.botProfileTooltip');
    } else {
      if (this.TemplateWizardService.isExpertEscalationSelected()) {
        return this.$translate.instant('careChatTpl.userProfileTooltip');
      } else {
        return this.$translate.instant('careChatTpl.agentProfileTooltip');
      }
    }
  }

  public get profileDesc(): string {
    if (this.TemplateWizardService.isExpertEscalationSelected()) {
      return this.$translate.instant('careChatTpl.profileEvaDesc');
    } else {
      return this.$translate.instant('careChatTpl.profileDesc');
    }
  }

  public get profileSettingInfo(): string {
    if (this.selectedTemplateProfile === this.TemplateWizardService.profiles.agent) {
      return (this.TemplateWizardService.isExpertEscalationSelected()) ?
           this.$translate.instant('careChatTpl.userSettingInfo') : this.$translate.instant('careChatTpl.agentSettingInfo');
    } else {
      return (this.TemplateWizardService.isExpertEscalationSelected()) ?
     this.$translate.instant('careChatTpl.orgEvaSettingInfo') : this.$translate.instant('careChatTpl.orgSettingInfo');
    }
  }

  public get displaySelectedProfileAttribute(): string {
    if (this.TemplateWizardService.isCVAEnabled) {
      return this.selectedTemplateProfile === this.profiles.org ? 'org' : this.selectedAvater;
    } else {
      return this.selectedTemplateProfile === this.profiles.org ? 'org' : 'agent';
    }
  }

  public setUseOrgProfile(): void {
    this.template.configuration.mediaSpecificConfiguration.useOrgProfile = this.selectedTemplateProfile === this.profiles.org;
    this.isProfilePageValid();
  }

  public setAgentProfile(): void {
    switch (this.selectedAgentProfile) {
      case this.agentNames.alias:
        this.agentNamePreview = this.$translate.instant('careChatTpl.agentAliasPreview');
        break;
      case this.agentNames.displayName:
        this.agentNamePreview = this.$translate.instant('careChatTpl.agentNamePreview');
        break;
      case this.userNames.alias:
        this.agentNamePreview = this.$translate.instant('careChatTpl.agentAliasPreview');
        break;
      case this.userNames.displayName:
        this.agentNamePreview = this.$translate.instant('careChatTpl.userNamePreview');
        break;
    }
    this.template.configuration.mediaSpecificConfiguration.useAgentRealName =
    (this.selectedAgentProfile === this.agentNames.displayName ||
      this.selectedAgentProfile === this.userNames.displayName);
  }

  public get isExpertEscalationSelected(): boolean {
    return this.TemplateWizardService.isExpertEscalationSelected();
  }
}

export class CtProfileComponent implements ng.IComponentOptions {
  public controller = CtProfileController;
  public template = require('./wizardPagesComponent/ctProfile.tpl.html');
  public bindings = {
    cardMode: '@',
  };
}


export default angular
  .module('Sunlight')
  .component('ctProfileComponent', new CtProfileComponent())
  .name;
