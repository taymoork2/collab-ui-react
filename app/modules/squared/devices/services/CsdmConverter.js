'use strict';

angular.module('Squared').service('CsdmConverter',

  /* @ngInject  */
  function ($translate) {

    function Device(obj) {
      this.url = obj.url;
      this.mac = obj.mac;
      this.ip = getIp(obj);
      this.serial = obj.serial;
      this.sipUrl = obj.sipUrl;
      this.createTime = obj.createTime;
      this.cisUuid = obj.cisUuid;
      this.product = getProduct(obj);
      this.hasIssues = hasIssues(obj);
      this.software = getSoftware(obj);
      this.isOnline = getIsOnline(obj);
      this.lastConnectionTime = getLastConnectionTime(obj);
      this.tags = getTags(obj.description);
      this.tagString = getTagString(obj.description);
      this.displayName = obj.displayName;
      this.cssColorClass = getCssColorClass(obj);
      this.state = getState(obj);
      this.upgradeChannel = getUpgradeChannel(obj);
      this.needsActivation = getNeedsActivation(obj);
      this.diagnosticsEvents = getDiagnosticsEvents(obj);
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
        case "Cisco TelePresence DX80":
          return "images/devices-hi/dx80.png";
        case "Cisco TelePresence DX70":
          return "images/devices-hi/dx70.png";
        case "Cisco TelePresence SX10":
          return "images/devices-hi/sx10.png";
        case "Cisco TelePresence SX20":
          return "images/devices-hi/sx20.png";
        case "Cisco TelePresence SX80":
          return "images/devices-hi/sx80.png";
        case "Cisco TelePresence MX200 G2":
          return "images/devices-hi/mx200g2.png";
        case "Cisco TelePresence MX300 G2":
          return "images/devices-hi/mx300g2.png";
        case "Project Swedish Island":
          return "images/devices-hi/swedish_island.png";
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
      this.isOnline = getIsOnline(obj);
      this.canReset = true;
      this.canDelete = true;
      this.canReportProblem = true;
      this.supportsCustomTags = true;
      this.displayName = obj.displayName;
      this.tags = getTags(decodeHuronTags(obj.description));
      this.tagString = getTagString(decodeHuronTags(obj.description));
      this.cssColorClass = getCssColorClass(obj);
      this.state = getState(obj);
      this.photos = (obj.photos == null || obj.photos.length == 0) ? null : obj.photos;
      this.isHuronDevice = true;
      this.product = obj.product in huron_model_map ? huron_model_map[obj.product].displayName : getProduct(obj);
      this.image = obj.product in huron_model_map ? huron_model_map[obj.product].image : "images/devices-hi/unknown.png";
      this.huronId = getHuronId(obj);
    }

    var huron_model_map = {
      "MODEL_CISCO_7811": {
        displayName: "Cisco 7811",
        image: "images/devices-hi/cisco_7811.png"
      },
      "MODEL_CISCO_7821": {
        displayName: "Cisco 7821",
        image: "images/devices-hi/cisco_7821.png"
      },
      "MODEL_CISCO_7841": {
        displayName: "Cisco 7841",
        image: "images/devices-hi/cisco_7841.png"
      },
      "MODEL_CISCO_7861": {
        displayName: "Cisco 7861",
        image: "images/devices-hi/cisco_7861.png"
      },
      "MODEL_CISCO_8811": {
        displayName: "Cisco 8811",
        image: "images/devices-hi/cisco_8811.png"
      },
      "MODEL_CISCO_8831": {
        displayName: "Cisco 8831",
        image: "images/devices-hi/cisco_8831.png"
      },
      "MODEL_CISCO_8841": {
        displayName: "Cisco 8841",
        image: "images/devices-hi/cisco_8841.png"
      },
      "MODEL_CISCO_8845": {
        displayName: "Cisco 8845",
        image: "images/devices-hi/cisco_8845.png"
      },
      "MODEL_CISCO_8851": {
        displayName: "Cisco 8851",
        image: "images/devices-hi/cisco_8851.png"
      },
      "MODEL_CISCO_8851NR": {
        displayName: "Cisco 8851NR",
        image: "images/devices-hi/cisco_8851.png"
      },
      "MODEL_CISCO_8861": {
        displayName: "Cisco 8861",
        image: "images/devices-hi/cisco_8861.png"
      },
      "MODEL_CISCO_8865": {
        displayName: "Cisco 8865",
        image: "images/devices-hi/cisco_8865.png"
      }
    };

    function UnusedAccount(obj) {
      this.url = obj.url;
      this.cisUuid = obj.id;
      this.displayName = obj.displayName;
      this.product = t('spacesPage.account');
      this.cssColorClass = 'device-status-gray';
      this.state = {
        readableState: t('CsdmStatus.Inactive'),
        priority: "4"
      };
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
      this.tags = getTags(obj.description);
      this.expiryTime = convertExpiryTime(obj.expiryTime);
      this.product = t('spacesPage.unactivatedDevice');
      this.tags = getTags(obj.description);
      this.tagString = getTagString(obj.description);
      this.displayName = obj.displayName;
      this.activationCode = obj.activationCode;
      this.state = getState(obj);
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

    function decodeHuronTags(description) {
      var tagString = (description || "").replace(/\['/g, '["').replace(/']/g, '"]').replace(/',/g, '",').replace(/,'/g, ',"');
      return tagString;
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

    function getLastConnectionTime(obj) {
      moment.localeData(moment.locale())._calendar.sameElse = 'lll';
      return (obj.status && obj.status.lastConnectionTime) ? moment(obj.status.lastConnectionTime).calendar() : null;
    }

    function getHuronId(obj) {
      return obj.url && obj.url.substr(obj.url.lastIndexOf('/') + 1);
    }

    function getState(obj) {
      switch (obj.state) {
      case 'UNCLAIMED':
        return {
          readableState: t('CsdmStatus.RequiresActivation'),
          priority: "3"
        };
      default:
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          if (hasIssues(obj)) {
            return {
              readableState: t('CsdmStatus.OnlineWithIssues'),
              priority: "1"
            };
          }
          return {
            readableState: t('CsdmStatus.Online'),
            priority: "5"
          };
        default:
          return {
            readableState: t('CsdmStatus.Offline'),
            priority: "2"
          };
        }
      }
    }

    function getCssColorClass(obj) {
      switch (obj.state) {
      case 'UNCLAIMED':
        return 'device-status-gray';
      default:
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          if (hasIssues(obj)) {
            return 'device-status-yellow';
          }
          return 'device-status-green';
        default:
          return 'device-status-red';
        }
      }
    }

    function t(key) {
      return $translate.instant(key);
    }

    function getTags(description) {
      if (!description) {
        return [];
      }
      try {
        var tags = JSON.parse(description);
        return _.unique(tags);
      } catch (e) {
        try {
          tags = JSON.parse("[\"" + description + "\"]");
          return _.unique(tags);
        } catch (e) {
          return [];
        }
      }
    }

    function getTagString(description) {
      var tags = getTags(description);
      return tags.join(', ');
    }

    return {
      convertCode: convertCode,
      convertCodes: convertCodes,
      convertDevice: convertDevice,
      convertDevices: convertDevices,
      convertHuronDevice: convertHuronDevice,
      convertHuronDevices: convertHuronDevices,
      convertAccount: convertAccount,
      convertAccounts: convertAccounts
    };

  }
);
