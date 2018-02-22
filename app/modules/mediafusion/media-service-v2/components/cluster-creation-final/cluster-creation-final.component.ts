export class ClusterCreationFinalController implements ng.IComponentController {


  public clusterName: string = '';
  public hostName: string = '';

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster, host } = changes;
    if (cluster && cluster.currentValue) {
      this.clusterName = cluster.currentValue;
    }
    if (host && host.currentValue) {
      this.hostName = host.currentValue;
    }
    this.$log.log('host' + this.hostName);
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
