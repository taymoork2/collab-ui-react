class CustomerSupportTemplateModalCtrl implements ng.IComponentController {

  public title = '';
  public features: any[] = [];
  public hasCall: Boolean = false;
  public dismiss: Function;                   // Dismiss callback for modal dialog

  /* @ngInject*/
  constructor(
    public $state,
    public Authinfo) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {

    this.hasCall = this.Authinfo.isSquaredUC();
    if (this.$state.isHybridEnabled) {
      this.title = 'sunlightDetails.newFeatures.newWebTemplateModalTitle';
    } else {
      this.title = 'sunlightDetails.newFeatures.newCustomerSupportTemplateModalTitle';
    }

    const callbackServiceDescription = this.hasCall ? 'sunlightDetails.newFeatures.selectCADesc'
      : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';
    const chatCallbackServiceDescription = this.hasCall ? 'sunlightDetails.newFeatures.selectCHCADesc'
      : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';
    const serviceCards: any[] = [];
    const serviceColor =  'feature-cst-color';
    serviceCards.push({ //careChatService
      id: 'chat',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icons: ['icon-message'],
      color: serviceColor,
      disabled: false,
    });

    serviceCards.push({ //careCallbackService
      id: 'callback',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: callbackServiceDescription,
      icons: ['icon-calls'],
      color: serviceColor,
      disabled: !this.hasCall,
    });

    serviceCards.push({ //careChatCallbackService
      id: 'chatPlusCallback',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: chatCallbackServiceDescription,
      icons: ['icon-message', 'icon-calls'],
      color: serviceColor,
      disabled: !this.hasCall,
    });

    if (this.Authinfo.isCare()) {
      this.features = serviceCards;
    }
  }

  public ok(featureId: string): void {
    this.$state.go('care.setupAssistant', {
      type: featureId,
    });
    this.dismiss();
  }

  public purchaseLink(): void {
    this.dismiss();
    this.$state.go('my-company.subscriptions');
  }
}

/**
 * Customer Support Template dialog Component used for Creating new Customer Support Template
 */
export class CustomerSupportTemplateModalComponent implements ng.IComponentOptions {
  public controller = CustomerSupportTemplateModalCtrl;
  public template = require('modules/sunlight/features/featureLanding/newCareFeatureModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('customerSupportTemplateModal', new CustomerSupportTemplateModalComponent());

