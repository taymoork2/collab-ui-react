'use strict';

angular.module('Squared').service('CsdmConverter',

  /* @ngInject  */
  function ($translate) {

    function Device(obj) {
      this.url = obj.url;
      this.mac = obj.mac;
      this.ip = getIp(obj);
      this.tags = getTags(obj);
      this.serial = obj.serial;
      this.createTime = obj.createTime;
      this.cisUuid = obj.cisUuid;
      this.product = getProduct(obj);
      this.hasIssues = hasIssues(obj);
      this.software = getSoftware(obj);
      this.isOnline = getIsOnline(obj);
      this.tagString = getTagString(obj);
      this.displayName = obj.displayName;
      this.cssColorClass = getCssColorClass(obj);
      this.readableState = getReadableState(obj);
      this.upgradeChannel = getUpgradeChannel(obj);
      this.needsActivation = getNeedsActivation(obj);
      this.diagnosticsEvents = getDiagnosticsEvents(obj);
      this.readableActivationCode = getReadableActivationCode(obj);
      this.rsuKey = obj.remoteSupportUser && obj.remoteSupportUser.token;
      this.canDelete = true;
      this.canReportProblem = true;
      this.hasRemoteSupport = true;
      this.canEditDisplayName = true;
      this.supportsCustomTags = true;
      this.update = function (updated) {
        this.displayName = updated.displayName;
      };
      this.image = (function () {
        switch (obj.product) {
        case "Cisco TelePresence SX10":
          return "images/devices-hi/sx10.png";
        default:
          return "images/devices-hi/unknown.png";
        }
      }());
    }

    function HuronDevice(obj) {
      this.url = obj.url;
      this.mac = obj.mac;
      this.ip = getIp(obj);
      this.cisUuid = obj.cisUuid;
      this.product = getProduct(obj);
      this.isOnline = getIsOnline(obj);
      this.canReset = true;
      this.canDelete = true;
      this.displayName = obj.displayName;
      this.cssColorClass = getCssColorClass(obj);
      this.readableState = getReadableState(obj);
      this.isHuronDevice = true;
    }

    function HuronDeviceDetailed(obj, huronDevice) {
      this.url = huronDevice.url;
      this.mac = huronDevice.mac;
      this.ip = huronDevice.ip;
      this.cisUuid = huronDevice.userUuid;
      this.product = obj.model;
      this.isOnline = getIsHuronOnline(obj);
      this.canReset = true;
      this.canDelete = true;
      this.displayName = huronDevice.displayName;
      this.cssColorClass = getHuronCssColorClass(obj);
      this.readableState = getHuronReadableState(obj);
      this.isHuronDevice = true;
      this.image = "images/devices-hi/" + (obj.model.trim().replace(/ /g, '_') + '.jpg').toLowerCase();
    }

    function UnusedAccount(obj) {
      this.url = obj.url;
      this.cisUuid = obj.id;
      this.displayName = obj.displayName;
      this.product = 'Account';
      this.cssColorClass = 'device-status-red';
      this.readableState = t('CsdmStatus.Inactive');
      this.isOnline = false;
      this.isUnused = true;
      this.canDelete = true;
      this.hasIssues = true;
      this.image = "images/devices-hi/unknown.png";
      this.diagnosticsEvents = [{
        type: translateOrDefault('CsdmStatus.errorCodes.inactive.type', 'Account with no device'),
        message: translateOrDefault('CsdmStatus.errorCodes.inactive.message', 'There exists an account for a ' +
          'device, but no corresponding device or activation code. You can probably delete this account.')
      }];
    }

    function Code(obj) {
      obj.state = obj.status;

      this.url = obj.url;
      this.cisUuid = obj.id;
      this.tags = getTags(obj);
      this.expiryTime = convertExpiryTime(obj.expiryTime);
      this.product = 'Activation Code';
      this.tagString = getTagString(obj);
      this.displayName = obj.displayName;
      this.activationCode = obj.activationCode;
      this.readableState = getReadableState(obj);
      this.cssColorClass = getCssColorClass(obj);
      this.needsActivation = getNeedsActivation(obj);
      this.readableActivationCode = getReadableActivationCode(obj);
      this.canDelete = true;
      this.canEditDisplayName = true;
      this.image = "images/devices-hi/unknown.png";
      this.supportsCustomTags = true;
      this.updateName = function (newName) {
        this.displayName = newName;
      };
    }

    function convertExpiryTime(expiryTime) {
      return moment().to(expiryTime);
    }

    function convertCodes(data) {
      return _.mapValues(data, convertCode);
    }

    function convertDevices(data) {
      return _.mapValues(data, convertDevice);
    }

    function convertHuronDevices(data) {
      return _.mapValues(data, convertHuronDevice);
    }

    function convertAccounts(data) {
      return _.mapValues(data, convertAccount);
    }

    function convertDevice(data) {
      return new Device(data);
    }

    function convertHuronDevice(data) {
      return new HuronDevice(data);
    }

    function convertAccount(data) {
      return new UnusedAccount(data);
    }

    function convertHuronDeviceDetailed(data, huronDevice) {
      return new HuronDeviceDetailed(data, huronDevice);
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

    function getUpgradeChannel(obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'upgradeChannel',
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
      // return obj.status && obj.status.level && obj.status.level != 'OK';
      return getIsOnline(obj) && obj.status && obj.status.level && obj.status.level != 'OK';
    }

    function getDiagnosticsEvents(obj) {
      if (hasIssues(obj)) {
        return _.map(getNotOkEvents(obj), function (e) {
          return diagnosticsEventTranslated(e);
        });
      }
      return [];
    }

    function diagnosticsEventTranslated(e) {
      if (isTranslatable('CsdmStatus.errorCodes.' + e.type + '.type')) {
        return {
          type: translateOrDefault('CsdmStatus.errorCodes.' + e.type + '.type', e.type),
          message: translateOrDefault('CsdmStatus.errorCodes.' + e.type + '.message', e.description, e.references)
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

    function translateOrDefault(translateString, defaultValue, parameters) {
      if (isTranslatable(translateString)) {
        return $translate.instant(translateString, parameters);
      } else {
        return defaultValue;
      }
    }

    function isTranslatable(key) {
      return $translate.instant(key) !== key;
    }

    function getNotOkEvents(obj) {
      return _.reject(getEvents(obj), function (e) {
        return e.level == 'INFO' && (e.type == 'ip' || e.type == 'software' || e.type == 'upgradeChannel');
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
      default:
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return t('CsdmStatus.Online');
        default:
          return t('CsdmStatus.Offline');
        }
      }
    }

    function getCssColorClass(obj) {
      if (hasIssues(obj)) {
        return 'device-status-red';
      }
      switch (obj.state) {
      case 'UNCLAIMED':
        return 'device-status-yellow';
      default:
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return 'device-status-green';
        default:
          return 'device-status-gray';
        }
      }
    }

    function t(key) {
      return $translate.instant(key);
    }

    function getTags(obj) {
      try {
        var tags = JSON.parse(obj.description);
        return _.unique(tags);
      } catch (e) {
        return [];
      }
    }

    function getTagString(obj) {
      var tags = getTags(obj);
      return tags.join(', ');
    }

    function getHuronUrl(obj) {
      return obj.actions && obj.actions.href;
    }

    function getIsHuronOnline(obj) {
      return obj.registrationStatus == 'registered';
    }

    function getHuronCssColorClass(obj) {
      if (obj.registrationStatus == 'registered') {
        return 'device-status-green';
      } else if (obj.state == 'unregistered') {
        return 'device-status-gray';
      }
      return 'device-status-yellow';
    }

    var getHuronReadableState = function (obj) {
      switch (obj.registrationStatus) {
      case 'registered':
        return t('CsdmStatus.Online');
      case 'unregistered':
        return t('CsdmStatus.Offline');
      }
      return t('CsdmStatus.Unknown');
    };

    return {
      convertCode: convertCode,
      convertCodes: convertCodes,
      convertDevice: convertDevice,
      convertDevices: convertDevices,
      convertHuronDevice: convertHuronDevice,
      convertHuronDevices: convertHuronDevices,
      convertAccount: convertAccount,
      convertAccounts: convertAccounts,
      convertHuronDeviceDetailed: convertHuronDeviceDetailed,
    };

  }
);
