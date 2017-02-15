(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('FusionClusterStatesService', FusionClusterStatesService);

  /* @ngInject */
  function FusionClusterStatesService() {
    return {
      getAlarmSeverityCssClass: getAlarmSeverityCssClass,
      getMergedStateSeverity: getMergedStateSeverity,
      getMergedUpgradeState: getMergedUpgradeState,
      getSeverity: getSeverity,
      getSeverityLabel: getSeverityLabel,
      getStateSeverity: getStateSeverity,
      getStatusIndicatorCSSClass: getStatusIndicatorCSSClass,
    };

    ////////////////

    function connectorHasAlarms(connector) {
      return connector.alarms && connector.alarms.length > 0;
    }

    function getStateSeverity(data) {
      // Also note that this function accepts both a connector or just a string
      var state = data;
      if (data && _.isString(data.state)) {
        if (connectorHasAlarms(data)) {
          state = _.some(data.alarms, function (alarm) {
            return alarm.severity === 'critical' || alarm.severity === 'error';
          }) ? 'has_error_alarms' : 'has_warning_alarms';
        } else {
          state = data.state;
        }
      }

      var value = 0;
      switch (state) {
        case 'running':
          break;
        case 'not_installed':
        case 'not_configured':
        case 'no_nodes_registered':
        case 'disabled':
          value = 1;
          break;
        case 'downloading':
        case 'installing':
        case 'uninstalling':
        case 'registered':
        case 'has_warning_alarms':
          value = 2;
          break;
        case 'not_operational':
        case 'has_error_alarms':
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

    function getSeverityCssClass(value) {
      var cssClass = '';
      switch (value) {
        case 0:
          cssClass = 'success';
          break;
        case 1:
          cssClass = 'disabled';
          break;
        case 2:
          cssClass = 'warning';
          break;
        case 3:
          cssClass = 'danger';
          break;
      }
      return cssClass;
    }

    function getAlarmSeverityCssClass(alarmSeverity) {
      if (alarmSeverity === 'critical' || alarmSeverity === 'error') {
        return 'danger';
      }
      return 'warning';
    }

    function getMergedUpgradeState(connectors) {
      var allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
      return allAreUpgraded ? 'upgraded' : 'upgrading';
    }

    // Special function, returning a FULL state with a name, a severity and
    // a severity label
    function getMergedStateSeverity(connectors) {
      var stateSeverity;
      if (connectors.length === 0) {
        stateSeverity = getStateSeverity('not_installed');
        return {
          name: 'not_installed',
          severity: stateSeverity,
          label: getSeverityLabel(stateSeverity),
          cssClass: getSeverityCssClass(stateSeverity),
        };
      }
      var mostSevereConnector = _.chain(connectors)
        .sortBy(function (connector) {
          return getStateSeverity(connector);
        })
        .last()
        .value();
      return getSeverity(mostSevereConnector);
    }

    function getSeverity(connectorOrState) {
      var stateSeverity = getStateSeverity(connectorOrState);
      return {
        name: connectorOrState ? (connectorOrState.state || connectorOrState) : '',
        severity: stateSeverity,
        label: getSeverityLabel(stateSeverity),
        cssClass: getSeverityCssClass(stateSeverity),
      };
    }

    function getStatusIndicatorCSSClass(status) {
      var cssClass;
      switch (status) {
        case 'operational':
          cssClass = 'success';
          break;
        case 'outage':
          cssClass = 'danger';
          break;
        case 'setupNotComplete':
          cssClass = 'default';
          break;
        case 'impaired':
        case 'unknown':
        default:
          cssClass = 'warning';
      }
      return cssClass;
    }
  }
})();
