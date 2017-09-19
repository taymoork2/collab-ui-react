export class ClusterSettingsLinkCtrl implements ng.IComponentController {

  private clusterId: string;
  public clusterType: 'c_mgmt' | 'mf_mgmt' | 'hds_app' | 'ept';

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public goToClusterSettings(): void {
    if (this.clusterType === 'c_mgmt') {
      this.$state.go('expressway-cluster.settings', {
        id: this.clusterId,
      });
    } else if (this.clusterType === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.settings', {
        id: this.clusterId,
      });
    } else if (this.clusterType === 'hds_app') {
      this.$state.go('hds-cluster.settings', {
        id: this.clusterId,
      });
    } else if (this.clusterType === 'ept') {
      this.$state.go('private-trunk-settings', {
        id: this.clusterId,
      });
    }
  }

}

export class ClusterSettingsLinkComponent implements ng.IComponentOptions {
  public controller = ClusterSettingsLinkCtrl;
  public template = require('modules/hercules/cluster-sidepanel/cluster-settings-link/cluster-settings-link.component.html');
  public bindings = {
    clusterId: '<',
    clusterType: '<',
  };
}
