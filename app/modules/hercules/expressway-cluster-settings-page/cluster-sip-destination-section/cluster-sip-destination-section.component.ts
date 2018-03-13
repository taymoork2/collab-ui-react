import { IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
// import { Notification } from 'modules/core/notifications';
import { USSService } from 'modules/hercules/services/uss.service';

export class ClusterSipDestinationSectionController implements ng.IComponentController {
  public cluster: IExtendedClusterFusion;
  public defaultSipDomain: string;
  public loading = true;
  public override: boolean;
  public clusterHasCallService: boolean;
  public defaultSIPDomainOverrideForm: ng.IFormController;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Authinfo,
    // private Notification: Notification,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.clusterHasCallService = this.cluster.provisioning.some(provisioning => provisioning.connectorType === 'c_ucmc');
    this.$q.all({
      defaultSipDomain: this.USSService.getOrg(this.Authinfo.getOrgId()).then(org => org.sipDomain),
      currentClustersSipDomain: this.USSService.getSipDomainForClusters(),
    })
    .then(result => {
      this.defaultSipDomain = result.defaultSipDomain;
      const clusterSipDomain = _.find(result.currentClustersSipDomain, { clusterId: this.cluster.id });
      this.override = clusterSipDomain && clusterSipDomain.sipDomain !== '';
    })
    .finally(() => {
      this.loading = false;
    });
  }

  public changeOverride(): void {
    // console.warn('changeOverride()', this.override);
    // console.warn('this.defaultSIPDomainOverrideForm', this.defaultSIPDomainOverrideForm);
  }
}

export class ClusterSipDestinationSectionComponent implements ng.IComponentOptions {
  public controller = ClusterSipDestinationSectionController;
  public template = require('./cluster-sip-destination-section.html');
  public bindings = {
    cluster: '<',
  };
}
