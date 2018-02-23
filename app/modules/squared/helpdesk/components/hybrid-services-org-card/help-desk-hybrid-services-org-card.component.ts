import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService, IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal/index';
import { Notification } from 'modules/core/notifications/notification.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

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
  public isConsumerOrg = false;
  public loadingHSData: boolean;
  public hybridServicesComparator = this.HybridServicesUtilsService.hybridServicesComparator;


  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private CloudConnectorService: CloudConnectorService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private LicenseService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
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

    if (org.id === 'consumer') {
      this.isConsumerOrg = true;
    } else {
      const servicesPromise = this.ServiceDescriptorService.getServices()
        .then(this.ServiceDescriptorService.filterEnabledServices);
      const clusterListPromise = this.HybridServicesClusterService.getAll(org.id);
      this.$q.all({
        services: servicesPromise,
        clusterList: clusterListPromise,
      }).then((results) => {
        _.forEach(results.services, (service) => {
          if (_.includes(hybridServiceIds, service.id) && this.LicenseService.orgIsEntitledTo(org, service.id)) {
            const status = this.HybridServicesClusterService.processClustersToAggregateStatusForService(service.id, results.clusterList);
            hybridServicesCard.services.push({
              serviceId: service.id,
              setup: service.enabled,
              status: status,
              cssClass: this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(status),
            });
          }
        });
      })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'helpdesk.hybridServicesOrganization.fmsError',
            feedbackInstructions: true,
          });
        });
    }


    if (this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-gcal')) {
      this.CloudConnectorService.getService('squared-fusion-gcal', org.id)
        .then((service) => {
          hybridServicesCard.services.push(service);
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'helpdesk.hybridServicesOrganization.googleCalendarError',
            feedbackInstructions: true,
          });
        });
    }

    if (this.LicenseService.orgIsEntitledTo(org, 'squared-fusion-cal')) {
      this.CloudConnectorService.getService('squared-fusion-o365', org.id)
        .then((service) => {
          hybridServicesCard.services.push(service);
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'helpdesk.hybridServicesOrganization.office365Error',
            feedbackInstructions: true,
          });
        });
    }

    return hybridServicesCard;
  }

  public openHybridServicesModal() {
    this.loadingHSData = true;
    this.HybridServicesClusterService.getAll(this.org.id)
      .then((hsData) => {
        this.$modal.open({
          template: require('modules/squared/helpdesk/helpdesk-extended-information.html'),
          controller: 'HelpdeskExtendedInfoDialogController',
          controllerAs: 'modal',
          resolve: {
            title: () => 'helpdesk.hybridServicesDetails',
            data: () => hsData,
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
  public template = require('modules/squared/helpdesk/components/hybrid-services-org-card/help-desk-hybrid-services-org-card.component.html');
  public bindings = {
    org: '<',
  };
}
