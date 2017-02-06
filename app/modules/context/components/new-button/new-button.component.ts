require('./_new-button.scss');

class NewButtonComponentCtrl implements ng.IComponentController {

  private modalWindowOptions: any;

  /* @ngInject */
  constructor(
    private $modal,
    private $state,
  ) {  }

  public $onInit() {
  }

  public openNewModal = () => {
    this.$modal.open(this.modalWindowOptions)
    .result
    .finally(() => {
      this.$state.reload();
    });
  }

}

class NewButtonComponent implements ng.IComponentOptions {
  public controller = NewButtonComponentCtrl;
  public templateUrl = 'modules/context/components/new-button/new-button.html';
  public bindings = {
    modalWindowOptions: '<',
  };
}

export default angular
  .module('Context')
  .component('newButton', new NewButtonComponent())
  .name;
