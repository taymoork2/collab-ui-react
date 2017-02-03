export class ClusterSettingsLinkCtrl implements ng.IComponentController {

  private clusterId: string;
  private clusterType: 'c_mgmt' | 'mf_mgmt' | 'hds_app';

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public goToClusterSettings(): void {
    if (this.clusterType === 'c_mgmt') {
      this.$state.go('expressway-settings', {
        id: this.clusterId,
      });
    } else if (this.clusterType === 'mf_mgmt') {
      this.$state.go('mediafusion-settings', {
        id: this.clusterId,
      });
    } else if (this.clusterType === 'hds_app') {
      this.$state.go('hds-cluster-settings', {
        id: this.clusterId,
      });
    }
  }

}

export class ClusterSettingsLinkComponent implements ng.IComponentOptions {
  public controller = ClusterSettingsLinkCtrl;
  public template = `<div class="small">
  <a translate="hercules.softwareUpgrade.editSettingsLink" ng-click="$ctrl.goToClusterSettings()"></a>
</div>`;
  public bindings = {
    clusterId: '<',
    clusterType: '<',
  };
}
