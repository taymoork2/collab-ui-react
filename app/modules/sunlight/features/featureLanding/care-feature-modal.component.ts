/**
 * CareFeatureModalCtrl
 */
class CareFeatureModalCtrl implements ng.IComponentController {

  public title: string;
  public features: any[] = [];
  public dismiss: Function;                   // Dismiss callback for modal dialog

  /* @ngInject*/
  constructor(
    public $modal,
    public $state,
    public Authinfo,
    public AbcService,
  ) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {
    this.title = 'sunlightDetails.newFeatures.newCareTemplateModalTitle';

    const serviceCards: any[] = [];
    serviceCards.push({ //Customer Support Template
      id: 'customerSupportTemplate',
      label: 'common.customerSupportTemplate',
      description: 'sunlightDetails.newFeatures.selectCSTDesc',
      icons: ['icon-picture-in-picture'],
      color: 'feature-cst-color',
      disabled: false,
    });

    if (this.$state.isAppleBusinessChatEnabled) {
      serviceCards.push(this.AbcService.abcServiceCard);
    }

    if (this.$state.isVirtualAssistantEnabled) {
      serviceCards.push({ //Virtual Assistant
        id: 'virtualAssistant',
        label: 'sunlightDetails.newFeatures.virtualAssistant',
        description: 'careChatTpl.virtualAssistant.featureText.selectDesc',
        icons: ['icon-bot-four'],
        style: 'virtual-assistant-icon',
        color: 'feature-va-color',
        disabled: false,
      });
    }

    if (this.Authinfo.isCare()) {
      this.features = serviceCards;
    }
  }

  public ok(featureId): void {
    let templateStr = '<customer-support-template-modal dismiss="$dismiss()" class="care-modal"></customer-support-template-modal>';
    if (this.$state.isHybridToggleEnabled) {
      templateStr = '<care-hybrid-feature-modal dismiss="$dismiss()" class="care-modal"></care-hybrid-feature-modal>';
    }
    if (featureId === 'virtualAssistant') {
      templateStr = '<virtual-assistant-modal dismiss="$dismiss()" class="care-modal"></virtual-assistant-modal>';
    }
    if (featureId === 'appleBusinessChat') {
      this.$state.go('care.' + featureId);
      this.dismiss();
      return;
    }
    this.$modal.open({
      template: templateStr,
    });
    this.dismiss();
  }

  public purchaseLink(): void {
    this.dismiss();
    this.$state.go('my-company.subscriptions');
  }
}

/**
 * Care Feature dialog Component used for Creating new Customer Support Template or Virtual Assistant
 */
export class CareFeatureModalComponent implements ng.IComponentOptions {
  public controller = CareFeatureModalCtrl;
  public template = require('modules/sunlight/features/featureLanding/newCareFeatureModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('careFeatureModal', new CareFeatureModalComponent());
