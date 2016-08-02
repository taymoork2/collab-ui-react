(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionClusterListController', FusionClusterListController);

  /* @ngInject */
  function FusionClusterListController($filter, $state, $translate, hasF410FeatureToggle, hasMediaFeatureToggle, FusionClusterService, XhrNotificationService, WizardFactory) {
    if (!hasF410FeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    var vm = this;
    var clustersCache = [];
    var activeFilter = 'all';

    vm.loading = true;
    vm.backState = 'services-overview';
    vm.displayedClusters = [];
    vm.placeholder = {
      name: $translate.instant('hercules.fusion.list.all'),
      filterValue: 'all',
      count: 0
    };

    if (hasMediaFeatureToggle) {
      vm.filters = [{
        name: $translate.instant('hercules.fusion.list.expressway'),
        filterValue: 'expressway',
        count: 0
      }, {
        name: $translate.instant('hercules.fusion.list.mediafusion'),
        filterValue: 'mediafusion',
        count: 0
      }];
    } else {
      vm.filters = [{
        name: $translate.instant('hercules.fusion.list.expressway'),
        filterValue: 'expressway',
        count: 0
      }];
    }
    vm.countHosts = countHosts;
    vm.getHostnames = getHostnames;
    vm.setFilter = setFilter;
    vm.searchData = searchData;
    vm.openService = openService;
    vm.openSettings = openSettings;
    vm.addResource = addResource;
    vm._helpers = {
      formatTimeAndDate: formatTimeAndDate,
      hasServices: hasServices
    };

    loadClusters();

    function loadClusters() {
      if (hasMediaFeatureToggle) {
        FusionClusterService.getAll()
          .then(function (clusters) {
            clustersCache = clusters;
            updateFilters();
            vm.displayedClusters = clusters;
          }, XhrNotificationService.notify)
          .finally(function () {
            vm.loading = false;
          });
      } else {
        FusionClusterService.getAllNonMediaClusters()
          .then(function (clusters) {
            clustersCache = clusters;
            updateFilters();
            vm.displayedClusters = clusters;
          }, XhrNotificationService.notify)
          .finally(function () {
            vm.loading = false;
          });
      }

    }

    function countHosts(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .size()
        .value();
    }

    function getHostnames(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .sort()
        .map(_.escape)
        .join('<br />')
        .value();
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
      activeFilter = filter.filterValue || 'all';
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

    function openService(serviceId, clusterId) {
      if (serviceId === 'squared-fusion-uc') {
        $state.go('call-service.list', {
          'clusterId': clusterId
        });
      } else if (serviceId === 'squared-fusion-cal') {
        $state.go('calendar-service.list', {
          'clusterId': clusterId
        });
      } else if (serviceId === 'squared-fusion-media') {
        $state.go('media-service-v2.list');
      }
    }

    function openSettings(type, id) {
      if (type === 'c_mgmt') {
        $state.go('expressway-settings', {
          id: id
        });
      } else if (type === 'mf_mgmt') {
        $state.go('mediafusion-settings', {
          id: id
        });
      }
    }

    function formatTimeAndDate(upgradeSchedule) {
      var time = labelForTime(upgradeSchedule.scheduleTime);
      var day;
      if (upgradeSchedule.scheduleDays.length === 7) {
        day = $translate.instant('weekDays.everyDay', {
          day: $translate.instant('weekDays.day')
        });
      } else {
        day = labelForDay(upgradeSchedule.scheduleDays[0]);
      }
      return time + ' ' + day;
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
      if (currentLanguage === 'en_US') {
        return moment(time, 'HH:mm').format('hh:mm A');
      } else {
        return time;
      }
    }

    function labelForDay(day) {
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + day)
      });
    }

    function hasServices(cluster) {
      return cluster.servicesStatuses.some(function (serviceStatus) {
        return serviceStatus.serviceId !== 'squared-fusion-mgmt' && serviceStatus.total > 0;
      });
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
  }
})();
