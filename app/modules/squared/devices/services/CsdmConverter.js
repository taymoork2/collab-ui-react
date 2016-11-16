(function () {
  'use strict';

  angular.module('Squared').service('CsdmConverter',

    /* @ngInject  */
    function ($translate) {

      function CloudberryDevice(obj) {
        this.url = obj.url;
        this.isCloudberryDevice = true;
        this.type = 'cloudberry';
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
        this.image = "images/devices-hi/" + (obj.imageFilename || 'unknown.png');
      }

      function HuronDevice(obj) {
        this.url = obj.url;
        this.type = 'huron';
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
        this.cssColorClass = getCssColorClass(obj);
        this.state = getState(obj);
        this.photos = _.isEmpty(obj.photos) ? null : obj.photos;
        this.isHuronDevice = true;
        this.product = obj.product in huron_model_map ? huron_model_map[obj.product].displayName : getProduct(obj);
        this.image = "images/devices-hi/" + (obj.imageFilename || 'unknown.png');
        this.huronId = getHuronId(obj);
        this.addOnModuleCount = obj.addOnModuleCount;
      }

      var huron_model_map = {
        "MODEL_CISCO_7811": {
          displayName: "Cisco 7811"
        },
        "MODEL_CISCO_7821": {
          displayName: "Cisco 7821"
        },
        "MODEL_CISCO_7832": {
          displayName: "Cisco 7832"
        },
        "MODEL_CISCO_7841": {
          displayName: "Cisco 7841"
        },
        "MODEL_CISCO_7861": {
          displayName: "Cisco 7861"
        },
        "MODEL_CISCO_8811": {
          displayName: "Cisco 8811"
        },
        "MODEL_CISCO_8831": {
          displayName: "Cisco 8831"
        },
        "MODEL_CISCO_8841": {
          displayName: "Cisco 8841"
        },
        "MODEL_CISCO_8845": {
          displayName: "Cisco 8845"
        },
        "MODEL_CISCO_8851": {
          displayName: "Cisco 8851"
        },
        "MODEL_CISCO_8851NR": {
          displayName: "Cisco 8851NR"
        },
        "MODEL_CISCO_8861": {
          displayName: "Cisco 8861"
        },
        "MODEL_CISCO_8865": {
          displayName: "Cisco 8865"
        },
        "MODEL_CISCO_8865NR": {
          displayName: "Cisco 8865NR"
        },
        "MODEL_CISCO_ATA_190": {
          displayName: "Cisco ATA 190"
        }
      };

      function UnusedAccount(obj) {
        this.url = obj.url;
        this.type = 'cloudberry';
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
          message: translateOrDefault("CsdmStatus.errorCodes.inactive.message", "An account exists for a device, but there's no corresponding device or activation code. You can delete this account.")
        }];
      }

      function Code(obj) {
        obj.state = obj.status;
        this.isCode = true;

        this.url = obj.url;
        this.type = obj.type || 'cloudberry';
        this.cisUuid = obj.id;
        this.tags = getTags(obj.description);
        this.expiryTime = obj.expiryTime;
        this.expiresOn = obj.expiryTime;
        this.friendlyExpiryTime = convertExpiryTime(obj.expiryTime);
        this.product = t('spacesPage.unactivatedDevice');
        this.tags = getTags(obj.description);
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

      function updatePlaceFromItem(place, item) {

        if (item.isPlace) {
          updatePlaceFromPlace(place, item);
        } else if (item.isCode) {
          updatePlaceFromCode(place, item);
        } else {
          updatePlaceFromDevice(place, item);
        }
      }

      function updatePlaceFromDevice(place, device) {
        var updatedPlace = place;
        updatedPlace.type = device.type || updatedPlace.type;
        updatedPlace.cisUuid = device.cisUuid || device.uuid;
        updatedPlace.displayName = device.displayName;
        updatedPlace.sipUrl = device.sipUrl;
        Place.bind(updatedPlace)(updatedPlace);
      }

      function updatePlaceFromCode(place, code) {
        var updatedPlace = place;
        updatedPlace.type = code.type || 'cloudberry';
        updatedPlace.cisUuid = code.cisUuid || code.uuid;
        updatedPlace.displayName = code.displayName;
        Place.bind(updatedPlace)(updatedPlace);
      }

      function updatePlaceFromPlace(place, placeToUpdateFrom) {

        if (_.isEmpty(placeToUpdateFrom.devices)) {
          placeToUpdateFrom = _.merge(placeToUpdateFrom, _.pick(place, ['devices']));
        }
        if (_.isEmpty(placeToUpdateFrom.codes)) {
          placeToUpdateFrom = _.merge(placeToUpdateFrom, _.pick(place, ['codes']));
        }
        Place.bind(place)(placeToUpdateFrom);
        place.devices = placeToUpdateFrom.devices;
        place.codes = placeToUpdateFrom.codes;
      }

      function Place(obj) {
        this.url = obj.url;
        this.isPlace = true;
        this.type = obj.type || (obj.machineType == 'lyra_space' ? 'cloudberry' : 'huron');
        this.readableType = getLocalizedType(obj.type);
        this.entitlements = obj.entitlements;
        this.cisUuid = obj.cisUuid || obj.uuid;
        this.displayName = obj.displayName;
        this.sipUrl = obj.sipUrl;
        this.numbers = obj.numbers;
        this.canDelete = true;
        this.accountType = obj.placeType || 'MACHINE';
        this.image = "images/devices-hi/unknown.png";
        this.devices = obj.devices || {};
        this.codes = obj.codes || {};
      }

      function decodeHuronTags(description) {
        var tagString = _.replace(description, /\['/g, '["').replace(/']/g, '"]').replace(/',/g, '",').replace(/,'/g, ',"');
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
          .filter({
            type: 'software',
            level: 'INFO'
          })
          .map('description')
          .head()
          .value();
      }

      function getUpgradeChannel(obj) {
        var channel = _.chain(getEvents(obj))
          .filter({
            type: 'upgradeChannel',
            level: 'INFO'
          })
          .map('description')
          .head()
          .value();

        var labelKey = 'CsdmStatus.upgradeChannels.' + channel;
        var label = $translate.instant('CsdmStatus.upgradeChannels.' + channel);
        if (label === labelKey) {
          label = channel;
        }
        return {
          label: label,
          value: channel
        };
      }

      function getIp(obj) {
        return _.chain(getEvents(obj))
          .filter({
            type: 'ip',
            level: 'INFO'
          })
          .map('description')
          .head()
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
            return 'disabled';
          default:
            switch ((obj.status || {}).connectionStatus) {
              case 'CONNECTED':
                if (hasIssues(obj)) {
                  return 'warning';
                }
                return 'success';
              default:
                return 'danger';
            }
        }
      }

      function getLocalizedType(type) {
        if (type === 'huron') {
          return t('addDeviceWizard.chooseDeviceType.deskPhone');
        }
        return t('addDeviceWizard.chooseDeviceType.roomSystem');
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
          return _.uniq(tags);
        } catch (e) {
          try {
            tags = JSON.parse("[\"" + description + "\"]");
            return _.uniq(tags);
          } catch (e) {
            return [];
          }
        }
      }

      return {
        updatePlaceFromItem: updatePlaceFromItem,
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
