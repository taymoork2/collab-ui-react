
class AddResourceComponentCtrl implements ng.IComponentController {

  private serviceId: string;
  private connectorType: string;

  /* @ngInject */
  constructor(
    private $modal,
    private $state,
    private FusionUtils
  ) {  }

  public $onInit() {
    this.connectorType = this.FusionUtils.serviceId2ConnectorType(this.serviceId);
  }

  public openAddResourceModal = () => {
    this.$modal.open({
      resolve: {
        connectorType: () => this.connectorType,
        serviceId: () => this.serviceId,
        firstTimeSetup: false
      },
      controller: 'AddResourceController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/add-resource-modal.html',
      type: 'small'
    })
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
    serviceId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('addHybridResourceButton', new AddResourceComponent())
  .name;
