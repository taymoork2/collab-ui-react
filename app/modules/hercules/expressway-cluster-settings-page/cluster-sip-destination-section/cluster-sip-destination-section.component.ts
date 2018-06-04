import { IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';
import { USSService } from 'modules/hercules/services/uss.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class ClusterSipDestinationSectionController implements ng.IComponentController {
  public cluster: IExtendedClusterFusion;
  public sipDestination: string;
  public override: 'active' | 'inactive' = 'inactive';
  public clusterHasCallService: boolean;
  public defaultSIPDestinationOverrideForm: ng.IFormController;
  public defaultSipDestination: string;
  public state: 'loading' | 'connect_not_set_up' | 'not_a_call_cluster' | 'ok' | 'unknown' = 'loading';
  public shouldWarnAboutRemovingOverride = false;

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
      defaultSipDestination: this.USSService.getOrg(this.Authinfo.getOrgId()).then(org => org.sipDomain),
      currentClustersSipDestination: this.USSService.getSipDestinationForClusters(),
      callServiceConnectIsEnabled: this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec'),
    })
      .then(result => {
        this.sipDestination = result.defaultSipDestination;
        this.defaultSipDestination = _.clone(this.sipDestination);
        const clusterSipDestination = _.find(result.currentClustersSipDestination, { clusterId: this.cluster.id });
      // override is using string because of the input type=radio from the toolkit, it works much better
        this.override = !!(clusterSipDestination && clusterSipDestination.sipDomain !== '') ? 'active' : 'inactive';
        if (this.override === 'active') {
          this.sipDestination = clusterSipDestination.sipDomain;
          this.shouldWarnAboutRemovingOverride = true;
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

  public destinationSaved(sipDestination): void {
    this.shouldWarnAboutRemovingOverride = sipDestination !== '';
  }

  public changeOverride(): void {
    if (this.override === 'inactive') {
      if (this.shouldWarnAboutRemovingOverride) {
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
                this.sipDestination = _.clone(this.defaultSipDestination);
                this.Notification.success('hercules.clusterSipDestination.removeModal.notification');
                this.shouldWarnAboutRemovingOverride = false;
              });
          })
          .catch(() => {
            this.override = 'active';
          });
      } else {
        this.sipDestination = _.clone(this.defaultSipDestination);
      }
    } else {
      // Empty the input field
      this.sipDestination = '';
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
