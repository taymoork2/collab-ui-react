/**
 * VirtualAssistantModalCtrl
 */
class VirtualAssistantModalCtrl implements ng.IComponentController {

  public loading: boolean;
  public title = '';
  public features: any[] = [];
  public dismiss: Function;                   // Dismiss callback for modal dialog

  /* @ngInject*/
  constructor(
    public $state,
    public Authinfo,
    public VirtualAssistantService) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {

    this.title = 'sunlightDetails.newFeatures.newVirtualAssistantModalTitle';

    const serviceCards: any[] = [];
    if (this.$state.isVirtualAssistantEnabled) {
      serviceCards.push(this.VirtualAssistantService.cvaServiceCard);
      if (this.$state.isExpertVirtualAssistantEnabled) {
        this.loading = true;
        this.VirtualAssistantService.evaServiceCard.disabled = false;
        const vaCtrl = this;
        return vaCtrl.VirtualAssistantService.listExpertAssistants().then(function (data: any) {
          if (data && data.items && data.items.length >= 1) {
            vaCtrl.VirtualAssistantService.evaServiceCard.disabled = true;
          }
        }).finally (function() {
          vaCtrl.loading = false;
          serviceCards.push(vaCtrl.VirtualAssistantService.evaServiceCard);

          if (vaCtrl.Authinfo.isCare()) {
            vaCtrl.features = serviceCards;
          }
        });
      } else {
        if (this.Authinfo.isCare()) {
          this.features = serviceCards;
        }
      }

    }
  }

  public ok(featureId: string): void {
    // For now, it will do nothing but close the modal for expert virtual assistant
    if (featureId === this.VirtualAssistantService.cvaServiceCard.id) {
      this.$state.go('care.assistant', {
        type: this.VirtualAssistantService.cvaServiceCard.type,
      });
    }
    this.dismiss();
  }

  public purchaseLink(): void {
    this.dismiss();
    this.$state.go('my-company.subscriptions');
  }
}

/**
 * Virtual Assistant dialog Component used for Creating new Customer/Expert Virtual Assistant
 */
export class VirtualAssistantModalComponent implements ng.IComponentOptions {
  public controller = VirtualAssistantModalCtrl;
  public template = require('modules/sunlight/features/featureLanding/newCareFeatureModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('virtualAssistantModal', new VirtualAssistantModalComponent());
