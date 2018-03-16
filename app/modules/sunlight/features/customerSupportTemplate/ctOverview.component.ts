import { CtBaseController } from './ctBase.controller';

class CtOverviewController extends CtBaseController {

  public overviewCards;
  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public CTService,
    public $translate: ng.translate.ITranslateService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
  }

  public $onInit(): void {
    this.overviewCards = this.CTService.getOverviewPageCards(
      this.TemplateWizardService.selectedMediaType(),
      this.TemplateWizardService.featureFlags.isCareProactiveChatTrialsEnabled,
      this.TemplateWizardService.featureFlags.isCareAssistantEnabled);

    this.isValid();
  }

  public isValid() {
    this.TemplateWizardService.pageValidationResult.overview = true;
    return this.TemplateWizardService.pageValidationResult.isOverviewValid;
  }

  public overviewPageTooltipText(cardName) {
    switch (cardName) {
      case 'agentUnavailable': return this.$translate.instant('careChatTpl.agentUnavailableToggleTooltipMessage');
      case 'customerInformation': return '';
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
}

export default angular
  .module('Sunlight')
  .component('ctOverviewComponent', new CtOverviewComponent())
  .name;
