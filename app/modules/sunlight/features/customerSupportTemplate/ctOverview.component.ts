import { CtBaseController } from './ctBase.controller';

class CtOverviewController extends CtBaseController {

  public overviewCards;
  private cardMode: string;
  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public CTService,
    public $translate: ng.translate.ITranslateService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.TemplateWizardService.setCardMode(this.cardMode);
  }

  public $onInit(): void {
    this.overviewCards = this.CTService.getOverviewPageCards(
      this.TemplateWizardService.selectedMediaType(),
      this.TemplateWizardService.featureFlags.isCareProactiveChatTrialsEnabled,
      this.TemplateWizardService.featureFlags.isCareAssistantEnabled);

  }

  public overviewPageTooltipText(cardName) {
    switch (cardName) {
      case 'agentUnavailable': return this.$translate.instant('careChatTpl.agentUnavailableToggleTooltipMessage');
      case 'customerInformation':
      case 'customerInformationCallback': return this.$translate.instant('careChatTpl.customerInfoToggleTooltipMessage');
      case 'virtualAssistant': return this.$translate.instant('careChatTpl.virtualAssistantToggleTooltipMessage');
      default: return '';
    }
  }

  public getCardConfig(name) {
    const conf =
      (name === 'proactivePrompt' || name === 'virtualAssistant') ?
        this.template.configuration[name] :
        this.template.configuration.pages[name];
    return conf;
  }

  public isOverviewCardConfigurable(cardName) {
    switch (cardName) {
      case 'virtualAssistant':
        return this.TemplateWizardService.hasConfiguredVirtualAssistantServices;
      default:
        return true;
    }
  }

  public shouldShowOverviewPageTooltip(cardName) {
    switch (this.TemplateWizardService.selectedMediaType()) {
      case 'chat': return ((cardName === 'agentUnavailable' && this.TemplateWizardService.isExpertOnlyEscalationSelected()) || ((cardName === 'virtualAssistant') && !this.TemplateWizardService.hasConfiguredVirtualAssistantServices));
      case 'callback': return (cardName === 'customerInformation');
      case 'chatPlusCallback': return ((cardName === 'agentUnavailable' && this.TemplateWizardService.isExpertOnlyEscalationSelected()) || (cardName === 'customerInformationCallback') || ((cardName === 'virtualAssistant') && !this.TemplateWizardService.hasConfiguredVirtualAssistantServices));
      default: return false;
    }
  }
}

export class CtOverviewComponent implements ng.IComponentOptions {
  public controller = CtOverviewController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctOverview.tpl.html');
  public bindings = {
    cardMode: '@',
  };
}

export default angular
  .module('Sunlight')
  .component('ctOverviewComponent', new CtOverviewComponent())
  .name;
