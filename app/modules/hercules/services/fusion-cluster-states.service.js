(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('FusionClusterStatesService', FusionClusterStatesService);

  /* @ngInject */
  function FusionClusterStatesService() {
    var service = {
      getStateSeverity: getStateSeverity,
      getSeverityLabel: getSeverityLabel,
      getMergedUpgradeState: getMergedUpgradeState,
      getMergedStateSeverity: getMergedStateSeverity,
    };

    return service;

    ////////////////

    function getStateSeverity(data) {
      // We give a severity and a weight to all possible states.
      // This has to be synced with the the API consumed
      // by Atlas' general overview page (in the Hybrid Services card)

      // Also note that this function accepts both a connector or just a string
      var value = 0;
      var state = data;
      if (angular.isString(data.state)) {
        // Duck typing, if it has a state it must be a connector!
        // Override the state with 'has_alarms' if necessary
        if (data.alarms.length > 0) {
          state = 'has_alarms';
        } else {
          state = data.state;
        }
      }

      switch (state) {
      case 'running':
        break;
      case 'not_installed':
        value = 1;
        break;
      case 'disabled':
      case 'downloading':
      case 'installing':
      case 'not_configured':
      case 'uninstalling':
      case 'registered':
        value = 2;
        break;
      case 'has_alarms':
      case 'offline':
      case 'stopped':
      case 'unknown':
      default:
        value = 3;
      }

      return value;
    }

    function getSeverityLabel(value) {
      var label = '';
      switch (value) {
      case 0:
        label = 'ok';
        break;
      case 1:
        label = 'unknown';
        break;
      case 2:
        label = 'warning';
        break;
      case 3:
        label = 'error';
        break;
      }
      return label;
    }

    function getMergedUpgradeState(connectors) {
      var allAreUpgraded = _.every(connectors, 'upgradeState', 'upgraded');
      return allAreUpgraded ? 'upgraded' : 'upgrading';
    }

    // Special function, returning a FULL state with a name, a severity and
    // a severity label
    function getMergedStateSeverity(connectors) {
      if (connectors.length === 0) {
        return {
          name: 'not_installed',
          severity: getStateSeverity('not_installed'),
          label: getSeverityLabel(getStateSeverity('not_installed'))
        };
      }
      var mostSevereConnector = _.chain(connectors)
        .sortBy(function (connector) {
          return getStateSeverity(connector);
        })
        .last()
        .value();
      return {
        name: mostSevereConnector.state,
        severity: getStateSeverity(mostSevereConnector),
        label: getSeverityLabel(getStateSeverity(mostSevereConnector))
      };
    }
  }
})();
