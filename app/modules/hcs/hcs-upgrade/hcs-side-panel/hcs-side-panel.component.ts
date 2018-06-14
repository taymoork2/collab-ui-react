export class HcsSidePanelController implements ng.IComponentController {
  public status;
  public node;

  /* @ngInject */
  constructor(
    private $stateParams,
  ) {}

  public $onInit() {
    this.status = this.$stateParams.status;
    this.node = this.$stateParams.node;
  }
}

export class HcsSidePanelComponent implements ng.IComponentOptions {
  public controller = HcsSidePanelController;
  public template = require('./hcs-side-panel.component.html');
}
