(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionClusterListController', FusionClusterListController);

  /* @ngInject */
  function FusionClusterListController($filter, $modal, $state, $translate, Authinfo, Config, hasF237FeatureToggle, hasMediaFeatureToggle, FusionClusterService, XhrNotificationService, WizardFactory) {

    var vm = this;
    if (hasF237FeatureToggle) {
      var groupsCache = {};
      vm.displayedGroups = {
        groups: [],
        unassigned: []
      };
    } else {
      var clustersCache = [];
      vm.displayedClusters = [];
    }

    vm.showResourceGroups = hasF237FeatureToggle;
    vm.loading = true;
    vm.backState = 'services-overview';
    vm.openAllGroups = false;
    vm.placeholder = {
      name: $translate.instant('hercules.fusion.list.all'),
      filterValue: 'all',
      count: 0
    };

    vm.filters = [];
    if (Authinfo.isEntitled(Config.entitlements.fusion_mgmt)) {
      vm.filters.push({
        name: $translate.instant('hercules.fusion.list.expressway'),
        filterValue: 'c_mgmt',
        count: 0
      });
    }
    if (hasMediaFeatureToggle && Authinfo.isEntitled(Config.entitlements.mediafusion)) {
      vm.filters.push({
        name: $translate.instant('hercules.fusion.list.mediafusion'),
        filterValue: 'mf_mgmt',
        count: 0
      });
    }

    vm.setFilter = setFilter;
    vm.searchData = searchData;
    vm.addResource = addResource;
    vm.addResourceGroup = addResourceGroup;
    vm.refreshList = refreshList;

    refreshList();

    function refreshList() {
      if (hasF237FeatureToggle) {
        loadResourceGroups();
      } else {
        loadClusters();
      }
    }

    function loadClusters() {
      vm.loading = true;
      FusionClusterService.getAll()
        .then(function (clusters) {
          if (!hasMediaFeatureToggle) {
            return filterHMClusters(clusters);
          }
          return clusters;
        })
        .then(function (clusters) {
          clustersCache = clusters;
          updateFilters();
          vm.displayedClusters = clusters;
        }, XhrNotificationService.notify)
        .finally(function () {
          vm.loading = false;
        });
    }

    function loadResourceGroups() {
      vm.loading = true;
      FusionClusterService.getResourceGroups()
        .then(removeHybridMediaClustersIfNecessary)
        .then(function (groups) {
          groupsCache = groups;
          updateFilters();
          vm.displayedGroups = groups;
        })
        .catch(XhrNotificationService.notify)
        .finally(function () {
          vm.loading = false;
        });
    }

    function removeHybridMediaClustersIfNecessary(response) {
      if (!hasMediaFeatureToggle) {
        return {
          // Hybrid Media should never be part of any resource group as of now
          // but we never know so filter anyway…
          groups: _.map(response.groups, function (group) {
            var response = _.cloneDeep(group);
            response.clusters = filterHMClusters(response.clusters);
            return response;
          }),
          unassigned: filterHMClusters(response.unassigned)
        };
      }
      return response;
    }

    function filterHMClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.targetType !== 'mf_mgmt';
      });
    }

    function updateFilters() {
      if (hasF237FeatureToggle) {
        var assignedClustersCount = _.reduce(groupsCache.groups, function (acc, group) {
          return acc + group.clusters.length;
        }, 0);
        var unassignedClustersCount = groupsCache.unassigned.length;
        vm.placeholder.count = assignedClustersCount + unassignedClustersCount;

        _.each(vm.filters, function (filter, index) {
          var filteredAssignedClustersCount = _.reduce(groupsCache.groups, function (acc, group) {
            return acc + _.filter(group.clusters, { targetType: filter.filterValue }).length;
          }, 0);
          var filteredUnassignedClustersCount = _.filter(groupsCache.unassigned, { targetType: filter.filterValue }).length;
          vm.filters[index].count = filteredAssignedClustersCount + filteredUnassignedClustersCount;
        });
      } else {
        vm.placeholder.count = clustersCache.length;
        _.each(vm.filters, function (filter, index) {
          var clustersCount = _.filter(clustersCache, { targetType: filter.filterValue }).length;
          vm.filters[index].count = clustersCount;
        });
      }
    }

    function setFilter(filter) {
      if (hasF237FeatureToggle) {
        if (filter.filterValue === 'all') {
          vm.displayedGroups = groupsCache;
        } else {
          vm.displayedGroups = {
            groups: _.chain(groupsCache.groups)
              .map(function (group) {
                var response = _.cloneDeep(group);
                response.clusters = _.filter(response.clusters, { targetType: filter.filterValue });
                return response;
              })
              .filter(function (group) {
                return group.clusters.length > 0;
              })
              .value(),
            unassigned: _.filter(groupsCache.unassigned, { targetType: filter.filterValue }),
          };
        }
      } else {
        if (filter.filterValue === 'all') {
          vm.displayedClusters = clustersCache;
        } else {
          vm.displayedClusters = _.filter(clustersCache, { targetType: filter.filterValue });
        }
      }
    }

    function searchData(searchStr) {
      vm.openAllGroups = searchStr !== '';
      if (hasF237FeatureToggle) {
        if (searchStr === '') {
          vm.displayedGroups = groupsCache;
        } else {
          vm.displayedGroups = {
            groups: _.chain(groupsCache.groups)
              .map(function (group) {
                var response = _.cloneDeep(group);
                response.clusters = $filter('filter')(response.clusters, { name: searchStr });
                return response;
              })
              .filter(function (group) {
                return group.clusters.length > 0;
              })
              .value(),
            unassigned: $filter('filter')(groupsCache.unassigned, { name: searchStr }),
          };
        }
      } else {
        if (searchStr === '') {
          vm.displayedClusters = clustersCache;
        } else {
          // Filter on the cluster name only
          vm.displayedClusters = $filter('filter')(clustersCache, {
            name: searchStr
          });
        }
      }
    }

    function addResource() {
      var initialState = {
        data: {
          targetType: '',
          expressway: {},
          mediafusion: {}
        },
        history: [],
        currentStateName: 'add-resource.type-selector',
        wizardState: {
          'add-resource.type-selector': {
            nextOptions: {
              expressway: 'add-resource.expressway.service-selector',
              mediafusion: 'add-resource.mediafusion.hostname'
            }
          },
          // expressway
          'add-resource.expressway.service-selector': {
            next: 'add-resource.expressway.hostname'
          },
          'add-resource.expressway.hostname': {
            next: 'add-resource.expressway.name'
          },
          'add-resource.expressway.name': {
            next: 'add-resource.expressway.resource-group'
          },
          'add-resource.expressway.resource-group': {
            next: 'add-resource.expressway.end'
          },
          'add-resource.expressway.end': {},
          // mediafusion
          'add-resource.mediafusion.hostname': {
            next: 'add-resource.mediafusion.name'
          },
          'add-resource.mediafusion.name': {
            next: 'add-resource.mediafusion.end'
          },
          'add-resource.mediafusion.end': {}
        }
      };
      var wizard = WizardFactory.create(initialState);
      $state.go(initialState.currentStateName, {
        wizard: wizard
      });
    }

    function addResourceGroup() {
      $modal.open({
        type: 'modal',
        controller: 'AddResourceGroupController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/add-resource-group/add-resource-group.html'
      }).result
      .then(refreshList);
    }
  }
})();
