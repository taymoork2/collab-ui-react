import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

class HybridServicesUserHomedClusterAndHostnameComponentCtrl implements ng.IComponentController {

  public loading: boolean;
  public hostname: string;
  public clustername: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
  ) {
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { connectorId } = changes;
    if (connectorId && connectorId.currentValue) {
      this.getUserData(connectorId.currentValue);
    }
  }

  private getUserData(connectorId) {
    this.loading = true;
    this.HybridServicesClusterService.getHomedClusternameAndHostname(connectorId)
      .then((data) => {
        this.hostname = data.hostname || this.$translate.instant('common.notFound');
        this.clustername = data.clustername || this.$translate.instant('common.notFound');
      })
      .catch(() => {
        this.hostname = this.$translate.instant('common.notFound');
        this.clustername = this.$translate.instant('common.notFound');
      })
      .finally(() => {
        this.loading = false;
      });
  }

}

export class HybridServicesUserHomedClusterAndHostnameComponent implements ng.IComponentOptions {
  public controller = HybridServicesUserHomedClusterAndHostnameComponentCtrl;
  public template = require('./hybrid-services-user-homed-cluster-and-hostname.component.html');
  public bindings = {
    connectorId: '<',
  };
}
