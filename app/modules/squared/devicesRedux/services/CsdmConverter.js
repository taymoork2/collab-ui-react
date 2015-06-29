'use strict';

angular.module('Squared').service('CsdmConverter',

  /* @ngInject  */
  function ($translate) {

    var convert = function (data) {
      return _.mapValues(data, function (obj) {
        return {
          url: obj.url,
          mac: obj.mac,
          ip: getIp(obj),
          serial: obj.serial,
          product: getProduct(obj),
          hasIssues: hasIssues(obj),
          software: getSoftware(obj),
          isOnline: getIsOnline(obj),
          displayName: obj.displayName,
          cssColorClass: getCssColorClass(obj),
          readableState: getReadableState(obj),
          needsActivation: getNeedsActivation(obj),
          diagnosticsEvents: getDiagnosticsEvents(obj),
          readableActivationCode: getReadableActivationCode(obj) // pyramidsort ftw!
        };
      });
    };

    var getProduct = function (obj) {
      return obj.product == 'UNKNOWN' ? '' : obj.product;
    };

    var getSoftware = function (obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'software',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    };

    var getIp = function (obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'ip',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    };

    var hasIssues = function (obj) {
      return obj.status && obj.status.level && obj.status.level != 'OK';
    };

    var getDiagnosticsEvents = function (obj) {
      return _.map(getNotOkEvents(obj), function (e) {
        return diagnosticsEventTranslated(e);
      });
    };

    var diagnosticsEventTranslated = function (e) {
      if (isTranslatable('CsdmStatus.errorCodes.' + e.type + '.type')) {
        return {
          type: translateOrDefault('CsdmStatus.errorCodes.' + e.type + '.type', e.type),
          message: translateOrDefault('CsdmStatus.errorCodes.' + e.type + '.message', e.description)
        };
      } else if (e.description) {
        return {
          type: $translate.instant('CsdmStatus.errorCodes.unknown.type'),
          message: $translate.instant('CsdmStatus.errorCodes.unknown.message_with_description', {
            errorCode: e.type,
            description: e.description
          })
        };
      } else {
        return {
          type: $translate.instant('CsdmStatus.errorCodes.unknown.type'),
          message: $translate.instant('CsdmStatus.errorCodes.unknown.message', {
            errorCode: e.type
          })
        };
      }
    };

    var translateOrDefault = function (translateString, defaultValue) {
      if (isTranslatable(translateString)) {
        return $translate.instant(translateString);
      } else {
        return defaultValue;
      }
    };

    var isTranslatable = function (key) {
      return $translate.instant(key) !== key;
    };

    var getNotOkEvents = function (obj) {
      return _.reject(getEvents(obj), function (e) {
        return e.level == 'INFO' && (e.type == 'ip' || e.type == 'software');
      });
    };

    var getEvents = function (obj) {
      return (obj.status && obj.status.events) || [];
    };

    var getNeedsActivation = function (obj) {
      return obj.state == 'UNCLAIMED';
    };

    var getReadableActivationCode = function (obj) {
      if (obj.activationCode) {
        return obj.activationCode.match(/.{4}/g).join(' ');
      }
    };

    var getIsOnline = function (obj) {
      return (obj.status || {}).connectionStatus == 'CONNECTED';
    };

    var getReadableState = function (obj) {
      if (hasIssues(obj)) {
        return t('CsdmStatus.issuesDetected');
      }
      switch (obj.state) {
      case 'UNCLAIMED':
        return t('CsdmStatus.NeedsActivation');
      case 'CLAIMED':
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return t('CsdmStatus.Online');
        default:
          return t('CsdmStatus.Offline');
        }
      }
      return t('CsdmStatus.Unknown');
    };

    var getCssColorClass = function (obj) {
      if (hasIssues(obj)) {
        return 'device-status-red';
      }
      switch (obj.state) {
      case 'UNCLAIMED':
        return 'device-status-yellow';
      case 'CLAIMED':
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return 'device-status-green';
        default:
          return 'device-status-gray';
        }
      }
      return 'device-status-yellow';
    };

    var t = function (key) {
      return $translate.instant(key);
    };

    return {
      convert: convert
    };

  }
);
