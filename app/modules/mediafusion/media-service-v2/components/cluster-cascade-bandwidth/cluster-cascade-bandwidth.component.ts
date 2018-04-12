import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ClusterCascadeBandwidthService } from './cluster-cascade-bandwidth.service';

export class ClusterCascadeBandwidthController implements ng.IComponentController {
  public bandwidthChange: boolean = false;
  public inValidValue: boolean = true;
  public clusterId: string;
  public cluster: ICluster;
  private onCascadeBandwidthUpdate?: Function;
  public cascadeBandwidthConfiguration: number = 42;
  public bandwidthError: boolean = false;
  public isWizard: boolean = false;
  public sipSettingsEnabled: boolean = false;


  public clusterBandwidth = {
    title: 'mediaFusion.clusterBandwidth.title',
  };

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private ClusterCascadeBandwidthService: ClusterCascadeBandwidthService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster , isWizard, sipSettingsEnabled } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterId = this.cluster.id;
      this.getProperties(this.clusterId);
    } else if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    }
    if (sipSettingsEnabled && sipSettingsEnabled.currentValue) { this.sipSettingsEnabled = sipSettingsEnabled.currentValue; }
  }

  public validate(): void {
    this.bandwidthChange = true;
    this.inValidValue = true;
    if (this.cascadeBandwidthConfiguration >= 5 && this.cascadeBandwidthConfiguration <= 50) {
      this.inValidValue = false;
      this.bandwidthError = false;
    } else {
      this.bandwidthError = true;
    }
    if (_.isFunction(this.onCascadeBandwidthUpdate)) {
      this.onCascadeBandwidthUpdate({ response: { cascadeBandwidth: this.cascadeBandwidthConfiguration , inValidBandwidth : this.inValidValue } });
    }
  }

  private getProperties(clusterId): void {
    this.HybridServicesClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        const cascadeBandwidth = properties['mf.maxCascadeBandwidth'];
        this.cascadeBandwidthConfiguration = cascadeBandwidth ? cascadeBandwidth : this.cascadeBandwidthConfiguration;
      });
  }

  public saveCascadeConfig(): void {
    this.ClusterCascadeBandwidthService.saveCascadeConfig(this.clusterId, this.cascadeBandwidthConfiguration);
  }
}

export class ClusterCascadeBandwidthComponent implements ng.IComponentOptions {
  public controller = ClusterCascadeBandwidthController;
  public template = require('./cluster-cascade-bandwidth.html');
  public bindings = {
    cluster: '<',
    isWizard: '<',
    sipSettingsEnabled: '<',
    onCascadeBandwidthUpdate: '&?',
  };
}
