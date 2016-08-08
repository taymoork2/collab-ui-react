(function () {
  'use strict';

  angular.module('Squared').service('CsdmConverter',

    /* @ngInject  */
    function ($translate) {

      function CloudberryDevice(obj) {
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
        this.accountType = obj.accountType || 'MACHINE';
        this.photos = _.isEmpty(obj.photos) ? null : obj.photos;
        this.cssColorClass = getCssColorClass(obj);
        this.state = getState(obj);
        this.upgradeChannel = getUpgradeChannel(obj);
        this.needsActivation = getNeedsActivation(obj);
        this.diagnosticsEvents = getDiagnosticsEvents(obj);
        this.rsuKey = obj.remoteSupportUser && obj.remoteSupportUser.token;
        this.canDelete = true;
        this.canReportProblem = true;
        this.hasRemoteSupport = true;
        this.canEditDisplayName = this.accountType === 'MACHINE';
        this.supportsCustomTags = true;
        this.update = function (updated) {
          this.displayName = updated.displayName;
        };
        this.image = obj.product in cloudberry_model_map ? cloudberry_model_map[obj.product] : "images/devices-hi/unknown.png";
      }

      var cloudberry_model_map = {
        "Cisco TelePresence DX80": "images/devices-hi/dx80.png",
        "Cisco TelePresence DX70": "images/devices-hi/dx70.png",
        "Cisco TelePresence SX10": "images/devices-hi/sx10.png",
        "Cisco TelePresence SX20": "images/devices-hi/sx20.png",
        "Cisco TelePresence SX80": "images/devices-hi/sx80.png",
        "Cisco TelePresence MX200 G2": "images/devices-hi/mx200g2.png",
        "Cisco TelePresence MX300 G2": "images/devices-hi/mx300g2.png",
        "Cisco TelePresence MX700": "images/devices-hi/mx700d.png", // incorrect, should be "images/devices-hi/mx700.png" but missing
        "Cisco TelePresence MX700 SpeakerTrack": "images/devices-hi/mx700dspeakertrack.png", // incorrect, should be "images/devices-hi/mx700speakertrack.png" but missing
        "Cisco TelePresence MX700 Dual": "images/devices-hi/mx700d.png", // pic exist, but not endpoint?
        "Cisco TelePresence MX700 Dual Speakertrack": "images/devices-hi/mx700dspeakertrack.png", // pic exist, but not endpoint?
        "Cisco TelePresence MX800": "images/devices-hi/mx800.png",
        "Cisco TelePresence MX800 Dual": "images/devices-hi/mx800dspeakertrack.png",
        "Cisco TelePresence MX800 SpeakerTrack": "images/devices-hi/mx800speakertrack.png",
        "Project Swedish Island": "images/devices-hi/swedish_island.png",
        "Cisco Spark Board 55": "images/devices-hi/spark_board_55.png",
        "Darling": "images/devices-hi/spark_board_55.png"
      };

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
        this.accountType = obj.accountType || 'PERSON';
        this.displayName = obj.displayName;
        this.tags = getTags(decodeHuronTags(obj.description));
        this.tagString = getTagString(decodeHuronTags(obj.description));
        this.cssColorClass = getCssColorClass(obj);
        this.state = getState(obj);
        this.photos = _.isEmpty(obj.photos) ? null : obj.photos;
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
        this.accountType = obj.accountType || 'MACHINE';
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
        this.expiryTime = obj.expiryTime;
        this.expiresOn = obj.expiryTime;
        this.friendlyExpiryTime = convertExpiryTime(obj.expiryTime);
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
        this.accountType = obj.accountType || 'MACHINE';
        this.supportsCustomTags = true;
        this.updateName = function (newName) {
          this.displayName = newName;
        };
      }

      function Place(obj) {
        this.url = obj.url;
        this.type = obj.type || 'cloudberry';
        this.entitlements = obj.entitlements;
        this.cisUuid = obj.cisUuid || obj.uuid;
        this.displayName = obj.displayName;
        this.sipUrl = obj.sipUrl;
        this.devices = obj.type === 'huron' ? obj.phones : convertCloudberryDevices(obj.devices);
        this.numbers = obj.numbers;
        this.isUnused = obj.devices || false;
        this.canDelete = true;
        this.accountType = obj.placeType || 'MACHINE';
        this.image = "images/devices-hi/unknown.png";
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

      function convertCloudberryDevices(data) {
        return _.mapValues(data, convertCloudberryDevice);
      }

      function convertHuronDevices(data) {
        return _.mapValues(data, convertHuronDevice);
      }

      function convertAccounts(data) {
        return _.mapValues(data, convertAccount);
      }

      function convertPlaces(data) {
        return _.mapValues(data, convertPlace);
      }

      function convertCloudberryDevice(data) {
        return new CloudberryDevice(data);
      }

      function convertHuronDevice(data) {
        return new HuronDevice(data);
      }

      function convertAccount(data) {
        return new UnusedAccount(data);
      }

      function convertPlace(data) {
        return new Place(data);
      }

      function convertCode(data) {
        return new Code(data);
      }

      function getProduct(obj) {
        return obj.product == 'UNKNOWN' ? '' : obj.product || obj.description;
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
        convertPlace: convertPlace,
        convertPlaces: convertPlaces,
        convertCode: convertCode,
        convertCodes: convertCodes,
        convertCloudberryDevice: convertCloudberryDevice,
        convertCloudberryDevices: convertCloudberryDevices,
        convertHuronDevice: convertHuronDevice,
        convertHuronDevices: convertHuronDevices,
        convertAccount: convertAccount,
        convertAccounts: convertAccounts
      };

    }
  );
})();
