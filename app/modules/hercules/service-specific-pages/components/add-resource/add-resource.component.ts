require('./_add-resource.scss');

class AddResourceComponentCtrl implements ng.IComponentController {

  private modalWindowOptions: any;
  private isPartnerAdmin = false;

  /* @ngInject */
  constructor(
    private $modal,
    private $state,
    private Authinfo,
  ) {  }

  public $onInit() {
    if (this.Authinfo.isCustomerLaunchedFromPartner()) {
      this.isPartnerAdmin = true;
    }
  }

  public openAddResourceModal = () => {
    if (this.isPartnerAdmin) {
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
