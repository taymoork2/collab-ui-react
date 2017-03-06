(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('FusionUtils', FusionUtils);

  /*@ngInject*/
  function FusionUtils($translate) {
    // Visual order to respect accross Atlas UI
    var orderedConnectors = ['c_mgmt', 'c_cal', 'c_ucmc', 'mf_mgmt', 'hds_app'];
    var orderedServices = ['squared-fusion-mgmt', 'squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-media', 'spark-hybrid-datasecurity'];

    return {
      connectorType2RouteName: connectorType2RouteName,
      connectorType2ServicesId: connectorType2ServicesId,
      serviceId2ConnectorType: serviceId2ConnectorType,
      serviceId2Icon: serviceId2Icon,
      getLocalizedReleaseChannel: getLocalizedReleaseChannel,
      getTimeSinceText: getTimeSinceText,
      getLocalTimestamp: getLocalTimestamp,
      hybridServicesComparator: hybridServicesComparator,
      hybridConnectorsComparator: hybridConnectorsComparator,
    };

    //////////

    function connectorType2RouteName(connectorType) {
      switch (connectorType) {
        case 'c_cal':
          return 'calendar-service';
        case 'c_ucmc':
          return 'call-service';
        default:
          return '';
      }
    }

    function connectorType2ServicesId(connectorType) {
      switch (connectorType) {
        case 'c_cal':
          return ['squared-fusion-cal'];
        case 'c_ucmc':
          return ['squared-fusion-uc', 'squared-fusion-ec'];
        case 'c_mgmt':
          return ['squared-fusion-mgmt'];
        case 'mf_mgmt':
          return ['squared-fusion-media'];
        case 'hds_app':
          return ['spark-hybrid-datasecurity'];
        case 'cs_mgmt':
          return ['contact-center-context'];
        default:
          return [];
      }
    }

    function serviceId2ConnectorType(serviceId) {
      switch (serviceId) {
        case 'squared-fusion-cal':
          return 'c_cal';
        case 'squared-fusion-uc':
        case 'squared-fusion-ec':
          return 'c_ucmc';
        case 'squared-fusion-mgmt':
          return 'c_mgmt';
        case 'squared-fusion-media':
          return 'mf_mgmt';
        case 'spark-hybrid-datasecurity':
          return 'hds_app';
        case 'contact-center-context':
          return 'cs_mgmt';
        default:
          return '';
      }
    }

    function serviceId2Icon(serviceId) {
      if (!serviceId) {
        return 'icon icon-circle-question';
      }
      switch (serviceId) {
        case 'squared-fusion-cal':
        case 'squared-fusion-gcal':
          return 'icon icon-circle-calendar';
        case 'squared-fusion-uc':
          return 'icon icon-circle-call';
        case 'squared-fusion-media':
          return 'icon icon-circle-telepresence';
        case 'contact-center-context':
          return 'icon icon-circle-world';
        default:
          return 'icon icon-circle-question';
      }
    }

    function getLocalizedReleaseChannel(channel) {
      return $translate.instant('hercules.fusion.add-resource-group.release-channel.' + channel);
    }

    function getTimeSinceText(timestamp) {
      var timestampText = moment(timestamp).calendar(null, {
        sameElse: 'LL', // e.g. December 15, 2016
      });
      if (timestampText.startsWith('Last') || timestampText.startsWith('Today') || timestampText.startsWith('Tomorrow') || timestampText.startsWith('Yesterday')) {
        // Lowercase the first letter for some well known English terms (it just looked bad with these uppercase). Other languages are left alone.
        timestampText = timestampText[0].toLowerCase() + timestampText.slice(1);
      }
      return $translate.instant('hercules.cloudExtensions.sinceTime', {
        timestamp: timestampText,
      });
    }

    function getLocalTimestamp(timestamp, format) {
      var timezone = jstz.determine().name();
      if (timezone === null || _.isUndefined(timezone)) {
        timezone = 'UTC';
      }
      return moment(timestamp).local().tz(timezone).format(format || 'LLL (z)');
    }

    function hybridServicesComparator(serviceType1, serviceType2) {
      if (serviceType1 === serviceType2) {
        return 0;
      }
      if (_.indexOf(orderedServices, serviceType1) < _.indexOf(orderedServices, serviceType2)) {
        return -1;
      } else {
        return 1;
      }
    }

    function hybridConnectorsComparator(connectorType1, connectorType2) {
      if (connectorType1 === connectorType2) {
        return 0;
      }
      if (_.indexOf(orderedConnectors, connectorType1) < _.indexOf(orderedConnectors, connectorType2)) {
        return -1;
      } else {
        return 1;
      }
    }
  }
}());
