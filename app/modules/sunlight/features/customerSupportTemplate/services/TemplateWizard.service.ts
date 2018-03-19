import TemplateFactory from '../factory/ctCustomerSupportTemplate.factory';
export class TemplateWizardService {
  private templateFactory;

  /* @ngInject */
  constructor(
    public $translate: ng.translate.ITranslateService,
    public SunlightConstantsService,
    public CTService,
    public Authinfo,
  ) {
    this.templateFactory = new TemplateFactory(Authinfo, CTService, $translate, SunlightConstantsService);
  }

  /*
    States
   */
  private states: string[] = [];
  public isEditFeature = false;

  //TODO: each compoent will put it's validation status here
  public pageValidationResult = {
    isNameValid: false,
    chatStatusMsgValid: false,
  };

  //TODO: to set it from the right page
  public hasConfiguredVirtualAssistantServices = false;

  private mediaType;
  public currentState;
  public activeItem;
  public cardMode;
  public template;
  public featureFlags;
  public evaConfig;


  // constants
  public lengthConstants = this.CTService.getLengthValidationConstants();
  public selectedAvater = 'agent';
  public isCVAEnabled = false;
  private InvalidCharacters = /[<>]/i; // add your invalid character to this regex

  /*
  Common utilities
  */

  public selectedMediaType(): String { return this.mediaType; }
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
      case 'chat':
        return this.templateFactory.getDefaultChatTemplate(media);
      case 'callback':
        return this.templateFactory.getDefaultCallbackTemplate(media);
      case 'chatpluscallback':
        return this.templateFactory.getDefaultCallbackTemplate(media);
      default:
        return this.templateFactory.getDefaultChatTemplate(media);
    }
  }

  public setInitialState(): void {
    //TODO: feature flags to be handled
    this.featureFlags = {
      isCareAssistantEnabled: true,
      isCareProactiveChatTrialsEnabled: true, //vm.isCareProactiveChatTrialsEnabled,
      isEvaFlagEnabled: true, //vm.evaConfig.isEvaFlagEnabled,
    };
    this.states = this.CTService.getStatesBasedOnType(this.selectedMediaType(), this.featureFlags);
    this.currentState = this.states[0];

    //TODO: Dummy impl:  to populate the eva config from chatEscalation page
    this.evaConfig = {
      isEvaFlagEnabled: this.featureFlags.isEvaFlagEnabled,
      isEvaConfigured: true,
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
    const res = !(this.InvalidCharacters.test(input));
    return res;
  }

  public isValidField(fieldDisplayText, maxCharLimit) {
    return (fieldDisplayText.length <= maxCharLimit);
  }

  //TODO: to populate the logic
  private getProfileList() {

  }

  private setAvaterInBrandingPage() {
    this.selectedAvater = this.isCVAEnabled ? 'bot' : 'agent';
  }

  public isExpertOnlyEscalationSelected() {
    // if eva is configured AND escalation to agent is not selected
    return this.evaConfig.isEvaFlagEnabled && this.evaConfig.isEvaConfigured && this.template.configuration.routingLabel &&
      this.template.configuration.routingLabel === this.SunlightConstantsService.routingLabels.EXPERT;
  }
}

export default angular
  .module('Sunlight')
  .service('TemplateWizardService', TemplateWizardService).name;
