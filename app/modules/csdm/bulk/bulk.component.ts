import { IStateService } from 'angular-ui-router';

class BulkCtrl implements ng.IComponentController {
  /* @ngInject */
  constructor(private $state: IStateServiceWithSidePanel) {
  }

  public size() {
    return _.size(this.$state.params.selectedDevices);
  }

  public askDelete() {
    this.$state.go('deviceBulkFlow.delete', {
      selectedDevices: this.$state.params.selectedDevices,
      devicesDeleted: this.$state.params.devicesDeleted,
    });
  }
}

export class BulkComponent implements ng.IComponentOptions {
  public controller = BulkCtrl;
  public controllerAs = 'bulk';
  public template = require('./bulk.html');
}

interface IStateServiceWithSidePanel extends IStateService {
  sidepanel?: { close: Function };
}
