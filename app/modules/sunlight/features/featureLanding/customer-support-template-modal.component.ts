class CustomerSupportTemplateModalCtrl implements ng.IComponentController {

  public title = '';
  public features: any[] = [];
  public hasCall: Boolean = false;
  public isDisabled: Boolean = false;
  public hasWarning: Boolean = false;
  public dismiss: Function;                   // Dismiss callback for modal dialog
  public callbackServiceDescription = '';
  public chatCallbackServiceDescription = '';

  /* @ngInject*/
  constructor(
    public $state,
    public Authinfo) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {

    if (this.$state.isHybridToggleEnabled) {
      this.hasCall = this.isHybridOrSparkCallEnabled();
      this.hasWarning = this.isHybridOrSparkCallEnabled();
      this.title = 'sunlightDetails.newFeatures.newWebTemplateModalTitle';
      this.callbackServiceDescription = 'sunlightDetails.newFeatures.selectCADesc';
      this.chatCallbackServiceDescription = 'sunlightDetails.newFeatures.selectCHCADesc';
    } else {
      this.hasCall = this.Authinfo.isSquaredUC();
      this.hasWarning = true;
      this.title = 'sunlightDetails.newFeatures.newCustomerSupportTemplateModalTitle';
      this.callbackServiceDescription = this.hasCall ? 'sunlightDetails.newFeatures.selectCADesc'
      : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';
      this.chatCallbackServiceDescription = this.hasCall ? 'sunlightDetails.newFeatures.selectCHCADesc'
      : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';
    }

    this.isDisabled = this.hasCall;
    const serviceCards: any[] = [];
    const serviceColor =  'feature-cst-color';
    serviceCards.push({ //careChatService
      id: 'chat',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icons: ['icon-message'],
      color: serviceColor,
      disabled: false,
      showWarning: false,
    });

    serviceCards.push({ //careCallbackService
      id: 'callback',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: this.callbackServiceDescription,
      icons: ['icon-calls'],
      warningIcon: 'icon-info icon-offset-l',
      warning : 'sunlightDetails.newFeatures.noCallWarningMessage',
      color: serviceColor,
      disabled: !this.isDisabled,
      showWarning: !this.hasWarning,
    });

    serviceCards.push({ //careChatCallbackService
      id: 'chatPlusCallback',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: this.chatCallbackServiceDescription,
      icons: ['icon-message', 'icon-calls'],
      warningIcon: 'icon-info icon-offset-l',
      warning : 'sunlightDetails.newFeatures.noCallWarningMessage',
      color: serviceColor,
      disabled: !this.isDisabled,
      showWarning: !this.hasWarning,
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

  /**
  * This method returns true if either hybrid or spark call is enabled, else will return false.
  */
  public isHybridOrSparkCallEnabled(): boolean {
    if (this.$state.isHybridAndEPTConfigured || this.$state.isSparkCallConfigured) {
      return true;
    } else {
      return false;
    }
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

