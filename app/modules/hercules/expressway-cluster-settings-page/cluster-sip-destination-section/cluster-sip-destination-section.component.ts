import { IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
// import { Notification } from 'modules/core/notifications';
import { USSService } from 'modules/hercules/services/uss.service';

export class ClusterSipDestinationSectionController implements ng.IComponentController {
  public cluster: IExtendedClusterFusion;
  public defaultSipDomain: string;
  public loading = true;
  public override: boolean;
  public clusterHasCallService: boolean;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    // private Notification: Notification,
    private USSService: USSService,
  ) {}

  public $onInit() {
    // TODO: use this property in the template
    this.clusterHasCallService = this.cluster.provisioning.some(provisioning => provisioning.connectorType === 'c_ucmc');
    this.$q.all({
      defaultSipDomain: this.USSService.getOrg(this.Authinfo.getOrgId()).then(org => org.sipDomain),
      currentClusterSipDomain: this.$timeout(() => {}, 2000).then(() => this.$q.resolve('')), // TODO: use USS
    })
    .then(result => {
      this.defaultSipDomain = result.defaultSipDomain;
      this.override = result.currentClusterSipDomain !== '';
    })
    .finally(() => {
      this.loading = false;
    });
    // TODO: fetch current configuration for the cluster
  }

  public updateClusterSIPDomain(domain: string) {
    window.console.warn(domain);
  }
}

export class ClusterSipDestinationSectionComponent implements ng.IComponentOptions {
  public controller = ClusterSipDestinationSectionController;
  public template = require('./cluster-sip-destination-section.html');
  public bindings = {
    cluster: '<',
  };
}
