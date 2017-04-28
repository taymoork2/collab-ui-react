(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionClusterListController', FusionClusterListController);

  /* @ngInject */
  function FusionClusterListController($filter, $modal, $state, $translate, Analytics, Authinfo, Config, EnterprisePrivateTrunkService, FusionClusterService, HybridServicesClusterStatesService, Notification, ResourceGroupService, WizardFactory, hasCucmSupportFeatureToggle, hasEnterprisePrivateTrunkingFeatureToggle) {
    var vm = this;
    var groupsCache = [];
    vm.displayedGroups = _.cloneDeep(groupsCache);

    Analytics.trackHSNavigation(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CLUSTER_LIST);

    vm.showCucmClusters = hasCucmSupportFeatureToggle && Authinfo.isEntitled(Config.entitlements.fusion_khaos);
    vm.loading = true;
    vm.backState = 'services-overview';
    vm.openAllGroups = false;
    vm.placeholder = {
      name: $translate.instant('hercules.fusion.list.all'),
      filterValue: 'all',
      count: 0,
    };
    vm.filters = setupFilters();
    vm._loadSipDestinations = loadSipDestinations;

    vm.addResource = addResource;
    vm.addResourceGroup = addResourceGroup;
    vm.hasMultipleReleaseChannelOptions = false;
    vm.searchData = searchData;
    vm.setDefaultReleaseChannel = setDefaultReleaseChannel;
    vm.setFilter = setFilter;

    loadResources();

    function loadResources() {
      vm.loading = true;
      FusionClusterService.getResourceGroups()
        .then(function (response) {
          var formattedData = formatDataForTheUI(response);
          groupsCache = formattedData;
          updateFilters();
          vm.displayedGroups = formattedData;
        })
        .then(loadSipDestinations)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loading = false;
        });
      ResourceGroupService.getAllowedChannels()
        .then(function (channels) {
          if (channels && channels.length > 1) {
            vm.hasMultipleReleaseChannelOptions = true;
          }
        });
    }

    function loadSipDestinations() {
      if (!hasEnterprisePrivateTrunkingFeatureToggle) {
        return;
      }

      EnterprisePrivateTrunkService.fetch()
        .then(function (destinations) {
          return _.map(destinations, function (destination) {
            return {
              name: destination.name,
              id: destination.resourceId,
              targetType: 'ept',
              servicesStatuses: [{
                serviceId: 'ept',
                state: {
                  cssClass: HybridServicesClusterStatesService.getStatusIndicatorCSSClass(destination.serviceStatus),
                },
                total: 1,
              }],
            };
          });
        })
        .then(function (destinations) {
          groupsCache[5] = ({
            targetType: 'ept',
            display: Authinfo.isEntitled(Config.entitlements.huron),
            unassigned: destinations,
          });
          updateFilters();
        });
    }

    function formatDataForTheUI(response) {
      return [
        {
          targetType: 'c_mgmt',
          display: Authinfo.isEntitled(Config.entitlements.fusion_mgmt),
          groups: response.groups,
          unassigned: _.filter(response.unassigned, { targetType: 'c_mgmt' }),
        },
        {
          targetType: 'mf_mgmt',
          display: Authinfo.isEntitled(Config.entitlements.mediafusion),
          unassigned: _.filter(response.unassigned, { targetType: 'mf_mgmt' }),
        },
        {
          targetType: 'hds_app',
          display: Authinfo.isEntitled(Config.entitlements.hds),
          unassigned: _.filter(response.unassigned, { targetType: 'hds_app' }),
        },
        {
          targetType: 'cs_mgmt',
          display: Authinfo.isEntitled(Config.entitlements.context),
          unassigned: _.filter(response.unassigned, { targetType: 'cs_mgmt' }),
        },
        {
          targetType: 'ucm_mgmt',
          display: vm.showCucmClusters,
          unassigned: _.filter(response.unassigned, { targetType: 'ucm_mgmt' }),
        },
        {
          targetType: 'ept',
          display: Authinfo.isEntitled(Config.entitlements.huron) && hasEnterprisePrivateTrunkingFeatureToggle,
          unassigned: [], // Populated in a later step, by calling EnterprisePrivateTrunkService
        },
      ];
    }

    function setupFilters() {
      var filters = [];
      if (Authinfo.isEntitled(Config.entitlements.fusion_mgmt)) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.expressway'),
          filterValue: 'c_mgmt',
          count: 0,
        });
      }
      if (hasEnterprisePrivateTrunkingFeatureToggle) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.ept'),
          filterValue: 'ept',
          count: 0,
        });
      }
      if (Authinfo.isEntitled(Config.entitlements.mediafusion)) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.mediafusion'),
          filterValue: 'mf_mgmt',
          count: 0,
        });
      }
      if (Authinfo.isEntitled(Config.entitlements.hds)) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.hds'),
          filterValue: 'hds_app',
          count: 0,
        });
      }
      if (Authinfo.isEntitled(Config.entitlements.context)) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.context'),
          filterValue: 'cs_mgmt',
          count: 0,
        });
      }
      if (vm.showCucmClusters) {
        filters.push({
          name: $translate.instant('hercules.fusion.list.cucm'),
          filterValue: 'ucm_mgmt',
          count: 0,
        });
      }
      return filters;
    }

    function updateFilters() {
      vm.placeholder.count = _.reduce(groupsCache, function (acc, entry) {
        if (entry.groups) {
          acc = acc + _.reduce(entry.groups, function (a, group) {
            return a + group.clusters.length;
          }, 0);
        }
        acc = acc + entry.unassigned.length;
        return acc;
      }, 0);
      vm.filters = _.map(vm.filters, function (filter) {
        var total = 0;
        var entry = _.find(groupsCache, { targetType: filter.filterValue });
        if (entry.groups) {
          total = total + _.reduce(entry.groups, function (a, group) {
            return a + group.clusters.length;
          }, 0);
        }
        filter.count = total + entry.unassigned.length;
        return filter;
      });
    }

    function setFilter(filter) {
      if (filter.filterValue === 'all') {
        vm.displayedGroups = _.cloneDeep(groupsCache);
      } else {
        vm.displayedGroups = _.map(groupsCache, function (group) {
          return _.extend({}, group, { display: filter.filterValue === group.targetType });
        });
      }
    }

    function searchData(searchStr) {
      vm.openAllGroups = searchStr !== '';
      if (searchStr === '') {
        vm.displayedGroups = groupsCache;
      } else {
        vm.displayedGroups = [
          _.assign({}, vm.displayedGroups[0], {
            groups: _.chain(vm.displayedGroups[0].groups)
              .map(function (group) {
                var response = _.cloneDeep(group);
                response.clusters = $filter('filter')(response.clusters, { name: searchStr });
                return response;
              })
              .filter(function (group) {
                return group.clusters.length > 0;
              })
              .value(),
            unassigned: $filter('filter')(vm.displayedGroups[0].unassigned, { name: searchStr }),
          }),
          _.assign({}, vm.displayedGroups[1], {
            unassigned: $filter('filter')(vm.displayedGroups[1].unassigned, { name: searchStr }),
          }),
          _.assign({}, vm.displayedGroups[2], {
            unassigned: $filter('filter')(vm.displayedGroups[2].unassigned, { name: searchStr }),
          }),
          _.assign({}, vm.displayedGroups[3], {
            unassigned: $filter('filter')(vm.displayedGroups[3].unassigned, { name: searchStr }),
          }),
          _.assign({}, vm.displayedGroups[4], {
            unassigned: $filter('filter')(vm.displayedGroups[4].unassigned, { name: searchStr }),
          }),
          _.assign({}, vm.displayedGroups[5], {
            unassigned: $filter('filter')(vm.displayedGroups[5].unassigned, { name: searchStr }),
          }),
        ];
      }
    }

    function addResource() {
      var initialState = {
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
      var wizard = WizardFactory.create(initialState);
      $state.go(initialState.currentStateName, {
        wizard: wizard,
      });
    }

    function addResourceGroup() {
      $modal.open({
        type: 'full',
        controller: 'AddResourceGroupController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/add-resource-group/add-resource-group.html',
      }).result
      .then(loadResources);
    }

    function setDefaultReleaseChannel() {
      $modal.open({
        type: 'small',
        controller: 'SetDefaultReleaseChannelController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/set-default-release-channel/set-default-release-channel.html',
        resolve: {
          unassignedClusters: function () {
            return groupsCache[0].unassigned;
          },
        },
      }).result
      .then(loadResources);
    }
  }
})();
