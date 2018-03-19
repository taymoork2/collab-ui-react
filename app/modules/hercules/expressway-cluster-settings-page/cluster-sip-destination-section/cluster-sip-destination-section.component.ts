import { IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';
import { USSService } from 'modules/hercules/services/uss.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class ClusterSipDestinationSectionController implements ng.IComponentController {
  public cluster: IExtendedClusterFusion;
  public sipDomain: string;
  public override: 'active' | 'inactive' = 'inactive';
  public clusterHasCallService: boolean;
  public defaultSIPDomainOverrideForm: ng.IFormController;
  public defaultSipDomain: string;
  public state: 'loading' | 'connect_not_set_up' | 'not_a_call_cluster' | 'ok' | 'unknown' = 'loading';

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private ModalService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.$q.all({
      defaultSipDomain: this.USSService.getOrg(this.Authinfo.getOrgId()).then(org => org.sipDomain),
      currentClustersSipDomain: this.USSService.getSipDomainForClusters(),
      callServiceConnectIsEnabled: this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec'),
    })
    .then(result => {
      this.sipDomain = result.defaultSipDomain;
      this.defaultSipDomain = _.clone(this.sipDomain);
      const clusterSipDomain = _.find(result.currentClustersSipDomain, { clusterId: this.cluster.id });
      // override is using string because of the input type=radio from the toolkit, it works much better
      this.override = !!(clusterSipDomain && clusterSipDomain.sipDomain !== '') ? 'active' : 'inactive';
      if (this.override === 'active') {
        this.sipDomain = clusterSipDomain.sipDomain;
      }

      if (!result.callServiceConnectIsEnabled) {
        this.state = 'connect_not_set_up';
      } else if (!this.cluster.provisioning.some(provisioning => provisioning.connectorType === 'c_ucmc')) {
        this.state = 'not_a_call_cluster';
      } else {
        this.state = 'ok';
      }
    })
    .catch(() => {
      this.state = 'unknown';
    });
  }

  public changeOverride(): void {
    if (this.override === 'inactive') {
      this.ModalService.open({
        title: this.$translate.instant('hercules.clusterSipDestination.removeModal.title'),
        message: this.$translate.instant('hercules.clusterSipDestination.removeModal.message'),
        close: this.$translate.instant('common.remove'),
        btnType: 'primary',
      }).result
      .then(() => {
        return this.USSService.deleteSipDomainForCluster(this.cluster.id)
          .then(() => {
            // Display again the default SIP destination
            this.sipDomain = _.clone(this.defaultSipDomain);
            this.Notification.success('hercules.clusterSipDestination.removeModal.notification');
          });
      })
      .catch(() => {
        this.override = 'active';
      });
    } else {
      // Empty the input field
      this.sipDomain = '';
    }
  }
}

export class ClusterSipDestinationSectionComponent implements ng.IComponentOptions {
  public controller = ClusterSipDestinationSectionController;
  public template = require('./cluster-sip-destination-section.html');
  public bindings = {
    cluster: '<',
  };
}
