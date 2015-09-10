'use strict';

angular.module('Squared').service('CsdmConverter',

  /* @ngInject  */
  function ($translate) {

    function Device(obj) {
      this.url = obj.url;
      this.mac = obj.mac;
      this.ip = getIp(obj);
      this.serial = obj.serial;
      this.cisUuid = obj.cisUuid;
      this.product = getProduct(obj);
      this.hasIssues = hasIssues(obj);
      this.software = getSoftware(obj);
      this.isOnline = getIsOnline(obj);
      this.displayName = obj.displayName;
      this.cssColorClass = getCssColorClass(obj);
      this.readableState = getReadableState(obj);
      this.needsActivation = getNeedsActivation(obj);
      this.diagnosticsEvents = getDiagnosticsEvents(obj);
      this.readableActivationCode = getReadableActivationCode(obj);
      this.update = function (updated) {
        this.displayName = updated.displayName;
      };
      this.image = (function () {
        switch (obj.product) {
        case "Cisco TelePresence SX10":
          return "images/devices/cisco_sx10.png";
        }
      }());
    }

    function Code(obj) {
      obj.state = obj.status;

      this.url = obj.url;
      this.cisUuid = obj.id;
      this.displayName = obj.displayName;
      this.activationCode = obj.activationCode;
      this.readableState = getReadableState(obj);
      this.cssColorClass = getCssColorClass(obj);
      this.needsActivation = getNeedsActivation(obj);
      this.readableActivationCode = getReadableActivationCode(obj);
      this.updateName = function (newName) {
        this.displayName = newName;
      };
    }

    function convertCodes(data) {
      return _.mapValues(data, convertCode);
    }

    function convertDevices(data) {
      return _.mapValues(data, convertDevice);
    }

    function convertDevice(data) {
      return new Device(data);
    }

    function convertCode(data) {
      return new Code(data);
    }

    function getProduct(obj) {
      return obj.product == 'UNKNOWN' ? '' : obj.product;
    }

    function getSoftware(obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'software',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    }

    function getIp(obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'ip',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    }

    function hasIssues(obj) {
      return obj.status && obj.status.level && obj.status.level != 'OK';
    }

    function getDiagnosticsEvents(obj) {
      return _.map(getNotOkEvents(obj), function (e) {
        return diagnosticsEventTranslated(e);
      });
    }

    function diagnosticsEventTranslated(e) {
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
    }

    function translateOrDefault(translateString, defaultValue) {
      if (isTranslatable(translateString)) {
        return $translate.instant(translateString);
      } else {
        return defaultValue;
      }
    }

    function isTranslatable(key) {
      return $translate.instant(key) !== key;
    }

    function getNotOkEvents(obj) {
      return _.reject(getEvents(obj), function (e) {
        return e.level == 'INFO' && (e.type == 'ip' || e.type == 'software');
      });
    }

    function getEvents(obj) {
      return (obj.status && obj.status.events) || [];
    }

    function getNeedsActivation(obj) {
      return obj.state == 'UNCLAIMED';
    }

    function getReadableActivationCode(obj) {
      if (obj.activationCode) {
        return obj.activationCode.match(/.{4}/g).join(' ');
      }
    }

    function getIsOnline(obj) {
      return (obj.status || {}).connectionStatus == 'CONNECTED';
    }

    function getReadableState(obj) {
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
    }

    function getCssColorClass(obj) {
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
    }

    function t(key) {
      return $translate.instant(key);
    }

    return {
      convertCode: convertCode,
      convertCodes: convertCodes,
      convertDevice: convertDevice,
      convertDevices: convertDevices,
    };

  }
);
