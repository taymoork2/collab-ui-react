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

  public cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export class HcsSidePanelComponent implements ng.IComponentOptions {
  public controller = HcsSidePanelController;
  public template = require('./hcs-side-panel.component.html');
}
