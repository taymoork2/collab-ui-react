import { IDirectoryConnector } from 'modules/core/featureToggle';

class DirConnectorsController implements ng.IComponentController {

  public connectors: Array<IDirectoryConnector>;
  private onDeregister: Function;

  constructor(
  ) {
  }

  public $onInit() {
  }

  public hasConnectors(): boolean {
    return _.size(this.connectors) > 0;
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    const { connectors } = changes;
    if (connectors && connectors.currentValue) {
      this.connectors = _.cloneDeep(connectors.currentValue);
    }
  }

  public deregister(connector: IDirectoryConnector): void {
    this.onDeregister({ connector: connector });
  }

}

/////////////////////

export class DirConnectorsComponent implements ng.IComponentOptions {
  public controller = DirConnectorsController;
  public templateUrl = 'modules/core/settings/dirsync/dirConnectors.html';
  public bindings = {
    connectors: '<',
    onDeregister: '&',
  };
}

export default angular
  .module('Core')
  .component('dirConnectorsConfig', new DirConnectorsComponent())
  .name;

