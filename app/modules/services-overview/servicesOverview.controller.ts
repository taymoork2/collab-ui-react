import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewHybridServicesCard } from './hybridServicesCard';
import { ServicesOverviewHybridAndGoogleCalendarCard } from './hybridAndGoogleCalendarCard';
import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';
import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';
import { ServicesOverviewHybridContextCard } from './hybridContextCard';

export class ServicesOverviewCtrl {

  private cards: Array<ServicesOverviewCard>;

  /* @ngInject */
  constructor(
    private $state: ng.IQService,
    private $q: ng.IQService,
    private $modal: ng.IQService,
    private Auth,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private FusionClusterService,
    private FusionClusterStatesService,
    private CloudConnectorService,
  ) {
    this.cards = [
      new ServicesOverviewMessageCard(this.Authinfo),
      new ServicesOverviewMeetingCard(this.Authinfo),
      new ServicesOverviewCallCard(this.Authinfo, this.Config),
      new ServicesOverviewCareCard(this.Authinfo),
      new ServicesOverviewHybridServicesCard(this.Authinfo),
      new ServicesOverviewHybridAndGoogleCalendarCard(this.$state, this.$q, this.$modal, this.Authinfo, this.CloudConnectorService, this.FusionClusterStatesService),
      new ServicesOverviewHybridCalendarCard(this.Authinfo, this.FusionClusterStatesService),
      new ServicesOverviewHybridCallCard(this.Authinfo, this.FusionClusterStatesService),
      new ServicesOverviewHybridMediaCard(this.Authinfo, this.Config, this.FusionClusterStatesService),
      new ServicesOverviewHybridDataSecurityCard(this.Authinfo, this.Config, this.FusionClusterStatesService),
      new ServicesOverviewHybridContextCard(this.FusionClusterStatesService),
    ];

    this.loadWebexSiteList();

    this.loadHybridServicesStatuses();

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPMRonM2)
      .then(supports => {
        if (supports) {
          this.getPMRStatus();
        }
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.contactCenterContext)
      .then(supports => {
        // Invoke the event handler passing in true if feature toggle is enabled AND the user is Entitled to view this card.
        // When this feature flag is removed, move the entitlement check to hybridContextCard's constructor
        this.forwardEvent('hybridContextToggleEventHandler', supports && Authinfo.isContactCenterContext());
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.csdmPstn)
      .then(supports => {
        this.forwardEvent('csdmPstnFeatureToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.atlasHerculesGoogleCalendar)
      .then(supports => {
        this.forwardEvent('googleCalendarFeatureToggleEventHandler', supports);
      });
  }

  public getHybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
    });
  }

  public getCloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
    });
  }

  private forwardEvent(handlerName, ...eventArgs: Array<any>) {
    _.each(this.cards, function (card) {
      if (_.isFunction(card[handlerName])) {
        card[handlerName].apply(card, eventArgs);
      }
    });
  }

  private loadHybridServicesStatuses() {
    this.FusionClusterService.getAll()
      .then((clusterList) => {
        let servicesStatuses: Array<any> = [
          this.FusionClusterService.getStatusForService('squared-fusion-mgmt', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-cal', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-uc', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-media', clusterList),
          this.FusionClusterService.getStatusForService('spark-hybrid-datasecurity', clusterList),
          this.FusionClusterService.getStatusForService('contact-center-context', clusterList),
        ];
        this.forwardEvent('hybridStatusEventHandler', servicesStatuses);
        this.forwardEvent('hybridClustersEventHandler', clusterList);
      });
  }

  private loadWebexSiteList() {
    let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    siteList = siteList.concat(this.Authinfo.getConferenceServicesWithLinkedSiteUrl() || []);
    this.forwardEvent('updateWebexSiteList', siteList);
  }

  private getPMRStatus() {
    let customerAccount = this.Auth.getCustomerAccount(this.Authinfo.getOrgId());
    this.forwardEvent('updatePMRStatus', customerAccount);
  }
}

angular
  .module('Hercules')
  .controller('ServicesOverviewCtrl', ServicesOverviewCtrl);
