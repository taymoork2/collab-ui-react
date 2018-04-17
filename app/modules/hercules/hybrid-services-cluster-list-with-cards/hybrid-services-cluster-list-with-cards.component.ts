import './hybrid-services-cluster-list-with-cards.scss';

import { Config } from 'modules/core/config/config';
import { EnterprisePrivateTrunkService } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesClusterService, IResourceGroups, HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { ClusterTargetType } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

interface IFilter {
  name: string;
  filterValue: string;
  count: number;
}

interface IGroupCache {
  targetType: ClusterTargetType;
  display: boolean;
  groups: any[];
  unassigned: any[];
}

class HybridServicesClusterListWithCardsCtrl implements ng.IComponentController {
  private hasCucmSupportFeatureToggle: boolean;
  private hasEnterprisePrivateTrunkingFeatureToggle: boolean;
  private groupsCache: IGroupCache[] = [];

  public loading = true;
  public showCucmClusters = this.hasCucmSupportFeatureToggle && this.Authinfo.isEntitled(this.Config.entitlements.fusion_khaos);
  public displayedGroups: IGroupCache[] = [];
  public backState = 'services-overview';
  public openAllGroups = false;
  public placeholder: IFilter = {
    name: this.$translate.instant('hercules.fusion.list.all'),
    filterValue: 'all',
    count: 0,
  };
  public filters = this.setupFilters();
  public hasMultipleReleaseChannelOptions = false;

  /* @ngInject */
  constructor(
    private $filter: ng.IFilterService,
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Authinfo,
    private Config: Config,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
    private WizardFactory,
  ) {
    this.loadResources = this.loadResources.bind(this);
    this.loadSipDestinations = this.loadSipDestinations.bind(this);
  }

  public $onInit() {
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CLUSTER_LIST);
    this.loadResources();
  }

  public addResource(): void {
    const initialState = {
      data: {
        targetType: '',
        expressway: {},
        mediafusion: {},
        context: {},
      },
      history: [],
      currentStateName: 'add-resource.type-selector',
      wizardState: {
        'add-resource.type-selector': {
          nextOptions: {
            expressway: 'add-resource.expressway.service-selector',
            mediafusion: 'add-resource.mediafusion.hostname',
            context: 'add-resource.context',
            cucm: 'add-resource.cucm.hostname',
          },
        },
        // expressway
        'add-resource.expressway.service-selector': {
          next: 'add-resource.expressway.hostname',
        },
        'add-resource.expressway.hostname': {
          next: 'add-resource.expressway.name',
        },
        'add-resource.expressway.name': {
          next: 'add-resource.expressway.resource-group',
        },
        'add-resource.expressway.resource-group': {
          next: 'add-resource.expressway.end',
        },
        'add-resource.expressway.end': {},
        // mediafusion
        'add-resource.mediafusion.hostname': {
          next: 'add-resource.mediafusion.name',
        },
        'add-resource.mediafusion.name': {
          next: 'add-resource.mediafusion.end',
        },
        'add-resource.mediafusion.end': {},
        // context
        'add-resource.context': {},
        // cucm
        'add-resource.cucm.hostname': {
          next: 'add-resource.cucm.name',
        },
        'add-resource.cucm.name': {
          next: 'add-resource.cucm.end',
        },
        'add-resource.cucm.end': {},
      },
    };
    const wizard = this.WizardFactory.create(initialState);
    this.$state.go(initialState.currentStateName, {
      wizard: wizard,
    });
  }

  public addResourceGroup(): void {
    this.$modal.open({
      type: 'full',
      controller: 'AddResourceGroupController',
      controllerAs: 'vm',
      template: require('modules/hercules/hybrid-services-cluster-list-with-cards/add-resource-group.html'),
    })
    .result
    .then(this.loadResources);
  }

  public setFilter(filter: IFilter): void {
    if (filter.filterValue === 'all') {
      this.displayedGroups = _.cloneDeep(this.groupsCache);
    } else {
      this.displayedGroups = _.map(this.groupsCache, (group) => {
        return _.extend({}, group, { display: filter.filterValue === group.targetType });
      });
    }
  }

  public searchData(searchStr: string): void {
    this.openAllGroups = searchStr !== '';
    if (searchStr === '') {
      this.displayedGroups = this.groupsCache;
    } else {
      this.displayedGroups = [
        _.assign({}, this.groupsCache[0], {
          groups: _.chain(this.groupsCache[0].groups)
            .map((group) => {
              const response = _.cloneDeep(group);
              response.clusters = this.$filter('filter')(response.clusters, { name: searchStr });
              return response;
            })
            .filter((group) => group.clusters.length > 0)
            .value(),
          unassigned: this.$filter('filter')(this.groupsCache[0].unassigned, { name: searchStr }),
        }),
        _.assign({}, this.groupsCache[1], {
          unassigned: this.$filter('filter')(this.groupsCache[1].unassigned, { name: searchStr }),
        }),
        _.assign({}, this.groupsCache[2], {
          unassigned: this.$filter('filter')(this.groupsCache[2].unassigned, { name: searchStr }),
        }),
        _.assign({}, this.groupsCache[3], {
          unassigned: this.$filter('filter')(this.groupsCache[3].unassigned, { name: searchStr }),
        }),
        _.assign({}, this.groupsCache[4], {
          unassigned: this.$filter('filter')(this.groupsCache[4].unassigned, { name: searchStr }),
        }),
        _.assign({}, this.groupsCache[5], {
          unassigned: this.$filter('filter')(this.groupsCache[5].unassigned, { name: searchStr }),
        }),
      ];
    }
  }

  public setDefaultReleaseChannel(): void {
    this.$modal.open({
      type: 'small',
      controller: 'SetDefaultReleaseChannelController',
      controllerAs: 'vm',
      template: require('modules/hercules/hybrid-services-cluster-list-with-cards/set-default-release-channel.html'),
      resolve: {
        unassignedClusters: () => this.groupsCache[0].unassigned,
      },
    })
    .result
    .then(this.loadResources);
  }

  private formatDataForTheUI(response: IResourceGroups): IGroupCache[] {
    return [
      {
        targetType: 'c_mgmt',
        display: this.Authinfo.isEntitled(this.Config.entitlements.fusion_mgmt),
        groups: response.groups,
        unassigned: _.filter(response.unassigned, { targetType: 'c_mgmt' }),
      },
      {
        targetType: 'mf_mgmt',
        display: this.Authinfo.isEntitled(this.Config.entitlements.mediafusion),
        groups: [],
        unassigned: _.filter(response.unassigned, { targetType: 'mf_mgmt' }),
      },
      {
        targetType: 'hds_app',
        display: this.Authinfo.isEntitled(this.Config.entitlements.hds),
        groups: [],
        unassigned: _.filter(response.unassigned, { targetType: 'hds_app' }),
      },
      {
        targetType: 'cs_mgmt',
        display: this.Authinfo.isEntitled(this.Config.entitlements.context),
        groups: [],
        unassigned: _.filter(response.unassigned, { targetType: 'cs_mgmt' }),
      },
      {
        targetType: 'ucm_mgmt',
        display: this.showCucmClusters,
        groups: [],
        unassigned: _.filter(response.unassigned, { targetType: 'ucm_mgmt' }),
      },
      {
        targetType: 'ept',
        display: this.Authinfo.isEntitled(this.Config.entitlements.huron) && this.hasEnterprisePrivateTrunkingFeatureToggle,
        groups: [],
        unassigned: [], // Populated in a later step, by calling EnterprisePrivateTrunkService
      },
    ];
  }

  private setupFilters() {
    const filters: IFilter[] = [];
    if (this.Authinfo.isEntitled(this.Config.entitlements.fusion_mgmt)) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.expressway'),
        filterValue: 'c_mgmt',
        count: 0,
      });
    }
    if (this.hasEnterprisePrivateTrunkingFeatureToggle) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.ept'),
        filterValue: 'ept',
        count: 0,
      });
    }
    if (this.Authinfo.isEntitled(this.Config.entitlements.mediafusion)) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.mediafusion'),
        filterValue: 'mf_mgmt',
        count: 0,
      });
    }
    if (this.Authinfo.isEntitled(this.Config.entitlements.hds)) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.hds'),
        filterValue: 'hds_app',
        count: 0,
      });
    }
    if (this.Authinfo.isEntitled(this.Config.entitlements.context)) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.context'),
        filterValue: 'cs_mgmt',
        count: 0,
      });
    }
    if (this.showCucmClusters) {
      filters.push({
        name: this.$translate.instant('hercules.fusion.list.cucm'),
        filterValue: 'ucm_mgmt',
        count: 0,
      });
    }
    return filters;
  }

  private updateFilters() {
    this.placeholder.count = _.reduce(this.groupsCache, (acc, entry) => {
      if (entry.groups) {
        acc = acc + _.reduce(entry.groups, (a, group) => {
          return a + group.clusters.length;
        }, 0);
      }
      acc = acc + entry.unassigned.length;
      return acc;
    }, 0);
    this.filters = _.map(this.filters, (filter) => {
      let total = 0;
      const entry = _.find(this.groupsCache, { targetType: filter.filterValue });
      if (entry.groups) {
        total = total + _.reduce(entry.groups, (a, group) => {
          return a + group.clusters.length;
        }, 0);
      }
      filter.count = total + entry.unassigned.length;
      return filter;
    });
  }

  private loadResources() {
    this.loading = true;
    this.HybridServicesClusterService.getResourceGroups()
      .then((response) => {
        const formattedData = this.formatDataForTheUI(response);
        this.groupsCache = formattedData;
        this.updateFilters();
        this.displayedGroups = formattedData;
      })
      .then(this.loadSipDestinations)
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally(() => {
        this.loading = false;
      });

    this.ResourceGroupService.getAllowedChannels()
      .then((channels) => {
        if (channels && channels.length > 1) {
          this.hasMultipleReleaseChannelOptions = true;
        }
      });
  }

  // Public for testing
  public loadSipDestinations() {
    if (!this.hasEnterprisePrivateTrunkingFeatureToggle) {
      return;
    }

    this.EnterprisePrivateTrunkService.fetch()
      .then((destinations) => {
        // TODO: check the shape of destination and see if it has .serviceStatus like expected below
        return _.map(destinations, (destination) => {
          return {
            name: destination.name,
            id: destination.uuid,
            targetType: 'ept',
            extendedProperties: {
              servicesStatuses: [{
                serviceId: 'ept',
                state: {
                  cssClass: this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(destination.status.state as HighLevelStatusForService),
                  name: destination.status.state,
                },
                total: 1,
              }],
            },
          };
        });
      })
      .then((destinations) => {
        this.groupsCache[5] = ({
          targetType: 'ept',
          display: this.Authinfo.isEntitled(this.Config.entitlements.huron),
          groups: [],
          unassigned: destinations,
        });
        this.updateFilters();
      });
  }
}

export class HybridServicesClusterListWithCardsComponent implements ng.IComponentOptions {
  public controller = HybridServicesClusterListWithCardsCtrl;
  public template = require('modules/hercules/hybrid-services-cluster-list-with-cards/hybrid-services-cluster-list-with-cards.component.html');
  public bindings = {
    hasCucmSupportFeatureToggle: '<',
    hasEnterprisePrivateTrunkingFeatureToggle: '<',
  };
}
