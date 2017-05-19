require('./_add-resource.scss');

class AddResourceComponentCtrl implements ng.IComponentController {

  private modalWindowOptions: any;
  private isPartnerAdmin = false;
  private allowPartnerRegistration: boolean;

  /* @ngInject */
  constructor(
    private $modal,
    private $state,
    private Authinfo,
    private FeatureToggleService,
  ) {  }

  public $onInit() {
    if (this.Authinfo.isCustomerLaunchedFromPartner()) {
      this.isPartnerAdmin = true;
    }
    if (this.allowPartnerRegistration) {
      // Also check the feature toggle
      this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridPartnerRegistration)
        .then(enabled => {
          this.allowPartnerRegistration = enabled;
        });
    }
  }

  public openAddResourceModal = () => {
    if (this.isPartnerAdmin && !this.allowPartnerRegistration) {
      this.$modal.open({
        templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
        type: 'dialog',
      });
      return;
    }
    this.$modal.open(this.modalWindowOptions)
    .result
    .finally(() => {
      this.$state.reload();
    });

  }

}

class AddResourceComponent implements ng.IComponentOptions {
  public controller = AddResourceComponentCtrl;
  public templateUrl = 'modules/hercules/service-specific-pages/components/add-resource/add-resource-button.html';
  public bindings = {
    modalWindowOptions: '<',
    allowPartnerRegistration: '<',
  };
}

export default angular
  .module('Hercules')
  .component('addHybridResourceButton', new AddResourceComponent())
  .name;
