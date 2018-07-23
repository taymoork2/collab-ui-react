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

  public convertBytes(bytesValue: string) {
    const bytes: number = _.parseInt(bytesValue);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0 || bytes === NaN) {
      return '0' + ' ' + sizes[0];
    }
    const i = _.floor(Math.log(bytes) / Math.log(1024));
    return _.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }
}

export class HcsSidePanelComponent implements ng.IComponentOptions {
  public controller = HcsSidePanelController;
  public template = require('./hcs-side-panel.component.html');
}
