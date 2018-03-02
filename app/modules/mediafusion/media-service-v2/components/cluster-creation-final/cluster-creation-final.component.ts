export class ClusterCreationFinalController implements ng.IComponentController {


  public clusterName: string = '';
  public hostName: string = '';

  /* @ngInject */
  constructor(
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, host } = changes;
    if (cluster && cluster.currentValue) {
      this.clusterName = cluster.currentValue;
    }
    if (host && host.currentValue) {
      this.hostName = host.currentValue;
    }
  }


}

export class ClusterCreationFinalComponent implements ng.IComponentOptions {
  public controller = ClusterCreationFinalController;
  public template = require('./cluster-creation-final.tpl.html');
  public bindings = {
    cluster: '<',
    host: '<',
  };
}
