import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService, IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal/index';
import { Notification } from 'modules/core/notifications/notification.service';
import { UCCService } from 'modules/hercules/services/ucc-service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';

interface IHybridCard {
  entitled: boolean;
  services: IServiceStatusWithSetup[];
}

interface IOrg {
  id: string;
  services: IServiceStatusWithSetup[];
}

class HelpDeskHybridServicesOrgCardComponentCtrl implements ng.IComponentController {

  private hybridServiceIds: HybridServiceId[] = ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media', 'spark-hybrid-datasecurity', 'contact-center-context', 'spark-hybrid-impinterop'];
  private hybridServicesCard: IHybridCard;
  private org: IOrg;
  public loadingHSData: boolean;
  public hybridServicesComparator = this.HybridServicesUtilsService.hybridServicesComparator;


  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private CloudConnectorService: CloudConnectorService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private LicenseService,
    private Notification: Notification,
    private UCCService: UCCService,
  ) { }

  public $onInit() {
    this.hybridServicesCard = this.buildCard(this.org, this.hybridServiceIds);
  }

  public buildCard(org: IOrg, hybridServiceIds: HybridServiceId[]) {

    const hybridServicesCard: IHybridCard = {
      entitled: _.some(hybridServiceIds, (serviceId) => {
        return this.LicenseService.orgIsEntitledTo(org, serviceId);
      }) || this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-gcal') || this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-ec'),
      services: [],
    };
    if (!hybridServicesCard.entitled) {
      return hybridServicesCard;
    }

    this.HybridServicesClusterService.getAll(org.id)
      .then((clusterList) => {
        _.forEach(hybridServiceIds, (serviceId) => {
          if (this.LicenseService.orgIsEntitledTo(org, serviceId)) {
            hybridServicesCard.services.push(this.HybridServicesClusterService.getStatusForService(serviceId, clusterList));
          }
        });
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'helpdesk.unexpectedError');
      });

    if (this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-gcal')) {
      this.CloudConnectorService.getService(org.id)
        .then((service) => {
          hybridServicesCard.services.push(service);
        })
        .catch((response) => {
          this.Notification.errorResponse(response, 'helpdesk.unexpectedError');
        });
    }

    if (this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-ec')) {
      this.UCCService.getOrgVoicemailConfiguration(org.id)
        .then((data) => {
          hybridServicesCard.services.push({
            serviceId: 'voicemail',
            cssClass: this.UCCService.mapStatusToCss(data.voicemailOrgEnableInfo.orgVoicemailStatus),
            setup: data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled,
            status: 'operational', // Just set to some dummy value, will not be used in the template
          });
        })
        .catch((error) => {
          this.Notification.errorResponse(error, 'helpdesk.hybridVoicemail.cannotReadStatus');
        });
    }

    return hybridServicesCard;
  }

  public openHybridServicesModal() {
    this.loadingHSData = true;
    this.HybridServicesClusterService.getAll(this.org.id)
      .then((hsData) => {
        this.$modal.open({
          templateUrl: 'modules/squared/helpdesk/helpdesk-extended-information.html',
          controller: 'HelpdeskExtendedInfoDialogController as modal',
          resolve: {
            title: () => {
              return 'helpdesk.hybridServicesDetails';
            },
            data: () => {
              return hsData;
            },
          },
        });
      })
      .catch((error) => {
        this.Notification.errorResponse(error, 'hercules.genericFailure');
      })
      .finally(() => {
        this.loadingHSData = false;
      });
  }

}


export class HelpDeskHybridServicesOrgCardComponent implements ng.IComponentOptions {
  public controller = HelpDeskHybridServicesOrgCardComponentCtrl;
  public templateUrl = 'modules/squared/helpdesk/components/hybrid-services-org-card/help-desk-hybrid-services-org-card.component.html';
  public bindings = {
    org: '<',
  };
}
