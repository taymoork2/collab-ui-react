import { CTService } from './CTService';
import { CvaService } from 'modules/sunlight/features/virtualAssistant/services/cvaService';
import { Notification } from 'modules/core/notifications';
import TemplateFactory from 'modules/sunlight/features/customerSupportTemplate/factory/ctCustomerSupportTemplate.factory';
import { MediaTypes, IdNameConfig, CVAConfig,
  VirtualAssistantConfig } from 'modules/sunlight/features/customerSupportTemplate/factory/ctCustomerSupportClasses';
export class TemplateWizardService {
  private templateFactory;

  /* @ngInject */
  constructor(
    public $translate: ng.translate.ITranslateService,
    public Notification: Notification,
    public SunlightConstantsService,
    public CTService: CTService,
    public CvaService: CvaService,
    public $stateParams,
    public Authinfo,
    public EvaService,
    public $window,
  ) {
    this.templateFactory = new TemplateFactory(Authinfo, CTService, $translate, SunlightConstantsService);
    this.setInitialState();
    this.setEvaTemplateData();
    this.setCVATemplateData();
  }

  /*
    States
   */
  private states: string[] = [];
  public isEditFeature = false;

  //TODO: each compoent will put it's validation status here
  public pageValidationResult = {
    isProactivePromptPageValid: false,
    isVirtualAssistantValid: false,
    isNameValid: false,
    chatStatusMsgValid: false,
    isProfileValid: false,
    offHoursValid: false,
    isAgentUnavailableValid: false,
    isFeedbackValid: false,
    isChatEscalationValid: false,
    isCustomerInfoPageValid: false,
  };

  //TODO: to set it from the right page
  public hasConfiguredVirtualAssistantServices = false;

  //TODO: assign types to the variables
  private mediaType;
  public currentState;
  public activeItem;
  public cardMode;
  public template;
  public isEvaFlagEnabled;
  public configuredVirtualAssistantServices: CVAConfig[] = [];
  public featureFlags;

  // constants
  public lengthConstants = this.CTService.getLengthValidationConstants();
  public selectedAvater = 'agent';
  public isCVAEnabled = false;
  public orgName = this.Authinfo.getOrgName();
  public evaSpaceTooltipData = '';
  public evaSpaceTooltipAriaLabel = '';
  public selectedEVA = new IdNameConfig();
  public selectedVA = new CVAConfig();
  public logoUploaded = false;
  public logoFile = '';

  public profiles: any = {
    org: this.$translate.instant('careChatTpl.org'),
    agent: this.$translate.instant('careChatTpl.agent'),
  };

  public cvaMessage: any = {
    orgHeader: this.$translate.instant('careChatTpl.org'),
    orgInfo: this.$translate.instant('careChatTpl.profile_org_info_cva'),
    agentHeader: this.$translate.instant('careChatTpl.agent_cva'),
    agentInfo: this.$translate.instant('careChatTpl.profile_agent_info_cva'),
    userInfo: this.$translate.instant('careChatTpl.profile_user_info_cva'),
    userHeader: this.$translate.instant('careChatTpl.user_cva'),
    orgInfoEVA: this.$translate.instant('careChatTpl.profile_org_info_cva_eva'),
  };

  public nonCVAMessage: any = {
    orgHeader: this.$translate.instant('careChatTpl.org'),
    agentHeader: this.$translate.instant('careChatTpl.agent'),
    orgInfo: this.$translate.instant('careChatTpl.profile_org_info'),
    agentInfo: this.$translate.instant('careChatTpl.profile_agent_info'),
    orgInfoEVA: this.$translate.instant('careChatTpl.profile_org_info_eva'),
    userHeader: this.$translate.instant('careChatTpl.user_non_cva'),
    userInfo: this.$translate.instant('careChatTpl.user_info_non_cva'),
  };

  public agentNames: any = {
    displayName: this.$translate.instant('careChatTpl.agentDisplayName'),
    alias: this.$translate.instant('careChatTpl.agentAlias'),
  };
  public userNames: any = {
    displayName: this.$translate.instant('careChatTpl.userDisplayName'),
    alias: this.$translate.instant('careChatTpl.userAlias'),
  };

  public evaConfig: any = {
    isEvaFlagEnabled: false,
    isEvaConfigured: false,
  };

  public userDetails: any = this.isExpertEscalationSelected() ? this.userNames : this.agentNames;
  public agentNamePreview = this.isExpertEscalationSelected() ? this.$translate.instant('careChatTpl.userNamePreview') :
  this.$translate.instant('careChatTpl.agentNamePreview');
  public selectedAgentProfile = this.isExpertEscalationSelected() ? this.userNames.displayName : this.agentNames.displayName;
  public evaDataModel = this.CTService.getEvaDataModel(this.evaConfig, this.SunlightConstantsService.routingLabels, this.$translate);
  /*
  Common utilities
  */
  public setCardMode(cardMode: string) {
    this.cardMode = cardMode;
  }

  public isExpertEscalationSelected(): boolean {
    // if eva is configured AND escalation to expert selected
    return !(this.selectedMediaType() === 'chatPlusCallback' && this.cardMode === 'callback') &&
        this.evaConfig.isEvaFlagEnabled && this.evaConfig.isEvaConfigured && this.template.configuration.routingLabel &&
        _.includes(this.SunlightConstantsService.evaOptions, this.template.configuration.routingLabel);
  }

  public getLocalizedOrgOrAgentInfo(msgType) {
    this.isCVAEnabled = this.template.configuration.virtualAssistant ? this.template.configuration.virtualAssistant.enabled : false;

    if (this.isCVAEnabled) {
      if (msgType === 'agentInfo' && this.isExpertEscalationSelected()) {
        return this.cvaMessage['userInfo'];
      } else if (msgType === 'agentHeader' && this.isExpertEscalationSelected()) {
        return this.cvaMessage['userHeader'];
      } else if (msgType === 'orgInfo' && this.isExpertEscalationSelected()) {
        return this.cvaMessage['orgInfoEVA'];
      } else {
        return this.cvaMessage[msgType];
      }
    } else {
      if (msgType === 'agentInfo' && this.isExpertEscalationSelected()) {
        return this.nonCVAMessage['userInfo'];
      } else if (msgType === 'agentHeader' && this.isExpertEscalationSelected()) {
        return this.nonCVAMessage['userHeader'];
      } else if (msgType === 'orgInfo' && this.isExpertEscalationSelected()) {
        return this.nonCVAMessage['orgInfoEVA'];
      } else {
        return this.nonCVAMessage[msgType];
      }
    }
  }

  public getProfileList(): any {
    return [
      {
        header: this.getLocalizedOrgOrAgentInfo('orgHeader'),
        label: this.getLocalizedOrgOrAgentInfo('orgInfo'),
        value: this.profiles.org,
      },
      {
        header: this.getLocalizedOrgOrAgentInfo('agentHeader'),
        label: this.getLocalizedOrgOrAgentInfo('agentInfo'),
        value: this.profiles.agent,
      },
    ];
  }

  public getCustomerInformationFormFields () {
    let custInfoFields;
    const type = (this.cardMode) ? this.cardMode : this.selectedMediaType();
    if (this.selectedMediaType() !== MediaTypes.CHAT_PLUS_CALLBACK) {
      custInfoFields = this.template.configuration.pages.customerInformation.fields;
    } else {
      switch (type) {
        case MediaTypes.CALLBACK:
          custInfoFields = this.template.configuration.pages.customerInformationCallback.fields;
          break;
        default:
          custInfoFields = this.template.configuration.pages.customerInformationChat.fields;
          break;
      }
    }

    return custInfoFields;
  }

  public getAttributeByName (attributeName: string, fieldName: string) {
    let attributeByName;
    const fields = this.getCustomerInformationFormFields();
    const field: any = _.get(fields, fieldName);
    if (field) {
      attributeByName = _.find(field.attributes, {
        name: attributeName,
      });
    }
    return attributeByName;
  }

  public getAttributeParam(paramName: string, attributeName: string, fieldName: string): any {
    const attribute = this.getAttributeByName(attributeName, fieldName);
    return _.get(attribute, paramName);
  }
  public selectedMediaType(): string { return this.mediaType; }
  public setSelectedMediaType(media: string) {
    this.mediaType = media;
    this.template = this.getDefaultTemplate(this.mediaType);
  }

  public getCategoryTypeObject(text: String): String { return text; }
  public getTypeObject(text: String): String { return text; }

  public getStates() {
    return this.states;
  }

  public getDefaultTemplate(media: string): any {
    switch (media) {
      case MediaTypes.CHAT:
        return this.templateFactory.getDefaultChatTemplate(media);
      case MediaTypes.CALLBACK:
        return this.templateFactory.getDefaultCallbackTemplate(media);
      case MediaTypes.CHAT_PLUS_CALLBACK:
        return this.templateFactory.getDefaultChatPlusCallbackTemplate(media);
      default:
        return this.templateFactory.getDefaultChatTemplate(media);
    }
  }

  public setInitialState(): void {
    //TODO: feature flags to be handled
    this.isEditFeature = this.$stateParams.isEditFeature;
    this.featureFlags = {
      isProactiveFlagEnabled: true,
      isCareAssistantEnabled: true,
      isCareProactiveChatTrialsEnabled: true, //vm.isCareProactiveChatTrialsEnabled,
      isEvaFlagEnabled: true, //vm.evaConfig.isEvaFlagEnabled,
    };
    this.states = this.CTService.getStatesBasedOnType(this.selectedMediaType() as string, this.featureFlags);
    this.currentState = this.states[0];

    //TODO: Dummy impl:  to populate the eva config from chatEscalation page
    this.evaConfig = {
      isEvaFlagEnabled: this.featureFlags.isEvaFlagEnabled,
      isEvaConfigured: false,
    };
  }

  public getPageIndex() {
    return this.states.indexOf(this.currentState);
  }

  public getAdjacentEnabledState(current, jump) {
    const next = current + jump;
    const last = this.states.length - 1;
    if (next > last) {
      return this.states[last];
    }
    let nextPage = this.template.configuration.pages[this.states[next]];
    switch (this.states[next]) {
      case 'proactivePrompt':
      case 'virtualAssistant':
        nextPage = this.template.configuration[this.states[next]];
        break;
      case 'profile':
        this.getProfileList();
        this.setAvaterInBrandingPage();
        break;
    }
    if (nextPage && !nextPage.enabled) {
      return this.getAdjacentEnabledState(next, jump);
    } else {
      return this.states[next];
    }
  }

  public isInputValid (input) {
    const InvalidCharacters = /[<>]/i;
    const res = !(InvalidCharacters.test(input));
    return res;
  }

  public isValidField(fieldDisplayText, maxCharLimit) {
    return (fieldDisplayText.length <= maxCharLimit);
  }

  private setAvaterInBrandingPage() {
    this.selectedAvater = this.isCVAEnabled ? 'bot' : 'agent';
  }

  public careVirtualAssistantName() {
    if (this.template.configuration.virtualAssistant.config) {
      return this.template.configuration.virtualAssistant.config.name;
    } else {
      return this.$translate.instant('careChatTpl.default_cva_name');
    }
  }

  public isEvaObjectValid(evaObj) {
    return (evaObj.id && evaObj.orgId);
  }

  public getEvaName(evaObj) {
    if (evaObj.name) {
      return evaObj.name;
    } else {
      return this.$translate.instant('careChatTpl.evaDefaultName');
    }
  }

  // TODO: markup to be removed
  public setSpaceDataAsError() {
    const popoverErrorMessage = this.$translate.instant('careChatTpl.featureCard.popoverErrorMessage');
    this.evaSpaceTooltipData = '<div class="feature-card-popover-error">' + popoverErrorMessage + '</div>';
    this.evaSpaceTooltipAriaLabel = popoverErrorMessage;
  }

  // TODO: markup to be removed
  public getEvaSpaceDetailsText(evaForOrg) {
    const spaces = evaForOrg.spaces;
    if (spaces && spaces.length >= 0) {
      const numSpaces = spaces.length;
      const evaOrgName = this.getEvaName(evaForOrg);
      if (numSpaces === 1) {
        const evaSpaceDetailsTextOneSpace = this.$translate.instant('careChatTpl.evaSpaceDetailsTextOneSpace');
        this.evaSpaceTooltipData = evaOrgName + evaSpaceDetailsTextOneSpace;
        this.evaSpaceTooltipAriaLabel = evaOrgName + evaSpaceDetailsTextOneSpace;
      } else {
        const evaSpaceDetailsText = this.$translate.instant('careChatTpl.evaSpaceDetailsText', { numberOfEvaSpaces: numSpaces });
        this.evaSpaceTooltipData = evaOrgName + evaSpaceDetailsText;
        this.evaSpaceTooltipAriaLabel = evaOrgName + evaSpaceDetailsText;
      }
      _.forEach(spaces,  (space) => {
        if (space.title) {
          this.evaSpaceTooltipData += '<li>' + space.title + '</li>';
          this.evaSpaceTooltipAriaLabel += ' ' + space.title;
          if (space.default) {
            const defaultSpace = this.$translate.instant('careChatTpl.escalationDetailsDefaultSpace');
            this.evaSpaceTooltipData += '<div>' + '    ' + defaultSpace + '<div>';
            this.evaSpaceTooltipAriaLabel += ' ' + defaultSpace;
          }
        }
      });
    } else {
      this.setSpaceDataAsError();
    }
  }

  public setEvaTemplateData() {
    const evaObj = this.EvaService.listExpertAssistants(this.Authinfo.getOrgId());
    evaObj.then((data) => {
      if (data && data.items && data.items.length >= 1) {
        this.evaConfig.isEvaConfigured = true;
        _.forEach(this.evaDataModel, (evaData) => {
          if (evaData.id !== 'agent') {
            evaData.isDisabled = false;
          }
        });
        const evaForOrg = data.items[0]; // first eva assuming only one as atlas doesnt allow
        if (this.isEvaObjectValid(evaForOrg)) {
          this.selectedEVA.id = evaForOrg.id;
          this.selectedEVA.name = evaForOrg.name;
          this.getEvaSpaceDetailsText(evaForOrg);
        } else {
          this.setSpaceDataAsError();
        }
      }
    });
  }

  public vaSelectionCommit() {
    this.template.configuration.virtualAssistant.config = this.selectedVA;
  }

  public populateVirtualAssistantInfo() {
    if (!this.template.configuration.virtualAssistant || !this.template.configuration.virtualAssistant.config) {
      this.template.configuration.virtualAssistant = new VirtualAssistantConfig(this.$translate);
    }
    this.selectedVA = this.template.configuration.virtualAssistant.config;

    // update modified VA Name from the configured VA info
    if (this.hasConfiguredVirtualAssistantServices) {
      const selectedVAFound: any = _.find(this.configuredVirtualAssistantServices, {
        id: this.selectedVA.id,
      });
      if (selectedVAFound) {
        this.selectedVA.name = selectedVAFound.name;
        this.selectedVA.icon = selectedVAFound.icon;
        this.vaSelectionCommit();
      } else {
        this.resetVA();
      }
    } else {
      this.resetVA();
    }
  }

  private resetVA () {
    this.template.configuration.virtualAssistant = new VirtualAssistantConfig(this.$translate);
    this.selectedVA = this.template.configuration.virtualAssistant.config;
  }

  public setCVATemplateData() {
    this.CTService.getLogo().then(function (data) {
      this.logoFile = 'data:image/png;base64,' + this.$window.btoa(String.fromCharCode.apply(null, new Uint8Array(data.data)));
      this.logoUploaded = true;
    });
     //Should invoke VA config only for chat and chat+callback templates
    if (!(this.featureFlags.isCareAssistantEnabled && this.selectedMediaType() !== MediaTypes.CALLBACK)) {
      return;
    }
    this.CvaService.listConfigs(this.Authinfo.getOrgId())
      .then((result) => {
        this.configuredVirtualAssistantServices = _.sortBy(result.items, (item) => item.name);
        this.hasConfiguredVirtualAssistantServices = !_.isEmpty(this.configuredVirtualAssistantServices);
        //if the virtual assistant list has only one VA available. use it by default.
        if (this.configuredVirtualAssistantServices.length === 1 && !this.isEditFeature) {
          const data: any = this.configuredVirtualAssistantServices[0];
          this.selectedVA = _.assignIn(new CVAConfig, data);
          this.vaSelectionCommit();
        } else if (this.isEditFeature) {
          this.populateVirtualAssistantInfo();
        }
      })
      .catch ((error) => {
        this.configuredVirtualAssistantServices = [];
        this.hasConfiguredVirtualAssistantServices = false;
        this.Notification.errorWithTrackingId(error, 'careChatTpl.getVirtualAssistantListError');
      });
  }

  public isExpertOnlyEscalationSelected() {
    // if eva is configured AND escalation to agent is not selected
    return this.evaConfig.isEvaFlagEnabled && this.evaConfig.isEvaConfigured && this.template.configuration.routingLabel &&
      this.template.configuration.routingLabel === this.SunlightConstantsService.routingLabels.EXPERT;
  }

  public getAttributeValue(attributeName, fieldName, modelName, i): any {
    const models: any = this.template.configuration.pages;
    const model: any = _.get(models, modelName);

    return this.getAttributeByModelName(attributeName, fieldName, model, i);
  }

  private getAttributeByModelName(attributeName, fieldName, model, i): any {
    const fields: any = model.fields;
    let field: any = _.get(fields, fieldName);

    if (field.attributes instanceof Array) {
      field = field.attributes[i];
    }

    if (field) {
      return _.get(field, attributeName);
    }
    return undefined;
  }
}

export default angular
  .module('Sunlight')
  .service('TemplateWizardService', TemplateWizardService).name;
