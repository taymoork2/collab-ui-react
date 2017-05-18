require('./_add-resource.scss');

class AddResourceComponentCtrl implements ng.IComponentController {

  private modalWindowOptions: any;
  private isPartnerAdmin = false;
  private hasPartnerRegistrationFeatureToggle = false;
  public title: string;
  /* @ngInject */
  constructor(
    private $modal,
    private $state,
    private Authinfo,
    private FeatureToggleService,
    private $translate: ng.translate.ITranslateService,
  ) {  }

  public $onInit() {
    if (this.Authinfo.isCustomerLaunchedFromPartner()) {
      this.isPartnerAdmin = true;
    }
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridPartnerRegistration)
      .then(enabled => {
        this.hasPartnerRegistrationFeatureToggle = enabled;
      });
    this.title = this.$translate.instant('hercules.overview.add-resource-button');
    if (this.$state.current.name === 'private-trunk-overview.settings' || this.$state.current.name === 'private-trunk-overview.list') {
      this.title = this.$translate.instant('servicesOverview.cards.privateTrunk.destinationTitle');
    }
  }

  public openAddResourceModal = () => {
    if (this.isPartnerAdmin && !this.hasPartnerRegistrationFeatureToggle) {
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
  };
}

export default angular
  .module('Hercules')
  .component('addHybridResourceButton', new AddResourceComponent())
  .name;
