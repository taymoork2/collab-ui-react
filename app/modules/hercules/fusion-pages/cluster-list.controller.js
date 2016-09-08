(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionClusterListController', FusionClusterListController);

  /* @ngInject */
  function FusionClusterListController($filter, $modal, $state, $translate, hasF237FeatureToggle, hasF410FeatureToggle, hasMediaFeatureToggle, FusionClusterService, XhrNotificationService, WizardFactory) {
    if (!hasF410FeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    var vm = this;
    var clustersCache = [];
    // var groupsCache = {};

    vm.loading = true;
    vm.backState = 'services-overview';
    vm.displayedClusters = [];
    vm.displayedGroups = {
      groups: [],
      unassigned: []
    };
    vm.placeholder = {
      name: $translate.instant('hercules.fusion.list.all'),
      filterValue: 'all',
      count: 0
    };
    vm.showResourceGroups = hasF237FeatureToggle;

    vm.filters = [{
      name: $translate.instant('hercules.fusion.list.expressway'),
      filterValue: 'expressway',
      count: 0
    }];
    if (hasMediaFeatureToggle) {
      vm.filters.push({
        name: $translate.instant('hercules.fusion.list.mediafusion'),
        filterValue: 'mediafusion',
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
        .then(function removeHybridMediaClustersIfNecessary(clusters) {
          if (!hasMediaFeatureToggle) {
            return _.filter(clusters, function (cluster) {
              return cluster.targetType !== 'mf_mgmt';
            });
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
        .then(function removeHybridMediaClustersIfNecessary(response) {
          if (!hasMediaFeatureToggle) {
            var filterHMClusters = function (clusters) {
              _.filter(clusters, function (cluster) {
                return cluster.targetType !== 'mf_mgmt';
              });
            };
            return {
              // Hybrid Media should never be part of any resource group as of now
              // but we never know…
              groups: _.map(response.groups, function (group) {
                group.clusters = filterHMClusters(group.clusters);
                return group;
              }),
              unassigned: filterHMClusters(response.unassigned)
            };
          }
          return response;
        })
        .then(function (groups) {
          // TODO: update cache
          // TODO: updateFilters();
          vm.displayedGroups = groups;
        })
        .catch(XhrNotificationService.notify)
        .finally(function () {
          vm.loading = false;
        });
    }

    function updateFilters() {
      var expresswayClusters = _.filter(clustersCache, 'targetType', 'c_mgmt');
      var mediafusionClusters = _.filter(clustersCache, 'targetType', 'mf_mgmt');
      vm.placeholder.count = clustersCache.length;
      vm.filters[0].count = expresswayClusters.length;
      if (hasMediaFeatureToggle) {
        vm.filters[1].count = mediafusionClusters.length;
      }
    }

    function setFilter(filter) {
      if (filter.filterValue === 'expressway') {
        vm.displayedClusters = _.filter(clustersCache, 'targetType', 'c_mgmt');
      } else if (filter.filterValue === 'mediafusion') {
        vm.displayedClusters = _.filter(clustersCache, 'targetType', 'mf_mgmt');
      } else {
        vm.displayedClusters = clustersCache;
      }
    }

    function searchData(searchStr) {
      if (searchStr === '') {
        vm.displayedClusters = clustersCache;
      } else {
        // Filter on the cluster name only
        vm.displayedClusters = $filter('filter')(clustersCache, {
          name: searchStr
        });
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
