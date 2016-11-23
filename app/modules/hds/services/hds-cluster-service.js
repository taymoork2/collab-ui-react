(function () {
  'use strict';

  /* @ngInject */
  function HDSClusterService() {
    var clusterCache = {
      hds_app: {}
    };

    function getRunningStateSeverity(state) {
      // we give a severity and a weight to all possible states
      // this has to be synced with the server generating the API consumed
      // by the general overview page (state of Call connectors, etc.)
      var label, value;
      switch (state) {
        case 'running':
          label = 'ok';
          value = 0;
          break;
        case 'not_installed':
          label = 'neutral';
          value = 1;
          break;
        case 'disabled':
        case 'downloading':
        case 'installing':
        case 'not_configured':
        case 'uninstalling':
        case 'registered':
        case 'initializing':
          label = 'warning';
          value = 2;
          break;
        case 'has_alarms':
        case 'offline':
        case 'stopped':
        case 'not_operational':
        case 'unknown':
        default:
          label = 'error';
          value = 3;
      }

      return {
        label: label,
        value: value
      };
    }

    function getClustersByConnectorType(type) {
      var clusters = _.chain(clusterCache[type])
        .values() // turn them to an array
        .sortBy(function (cluster) {
          return cluster.name.toLocaleUpperCase();
        })
        .value();
      return clusters;
    }


    return {
      getClustersByConnectorType: getClustersByConnectorType,
      getRunningStateSeverity: getRunningStateSeverity,
    };
  }

  angular
    .module('HDS')
    .service('HDSClusterService', HDSClusterService);

}());
