import IDevice = csdm.IDevice;
import IPlace = csdm.IPlace;
import Dictionary = _.Dictionary;
import IPlaceExtended = csdm.IPlaceExtended;
import ICode = csdm.ICode;

export class CsdmConverter {
  private helper: Helper;

  constructor($translate) {
    this.helper = new Helper($translate);
  }

  public updatePlaceFromItem(place, item) {
    if (item.isPlace) {
      this.updatePlaceFromPlace(place, item);
    } else {
      this.updatePlaceFromDevice(place, item);
    }
  }

  private updatePlaceFromDevice(updatedPlace: Place, device) {

    updatedPlace.updateFrom(this.helper, this,
      {
        url: updatedPlace.url,
        type: device.type || updatedPlace.type,
        cisUuid: device.cisUuid || device.uuid,
        displayName: device.displayName,
        sipUrl: device.sipUrl,
      });

    _.each(updatedPlace.devices, (existingDevice) => {
      existingDevice.displayName = device.displayName;
    });
  }

  private updatePlaceFromPlace(place: Place, placeToUpdateFrom) {
    place.updateFrom(this.helper, this, placeToUpdateFrom);
    if (placeToUpdateFrom.devices !== null) {
      place.devices = placeToUpdateFrom.devices;
    }
  }

  // Hack, these two fields should be set correctly in CSDM. Adding here until we can fix this.
  public convertDevicesForPlace(devices, type, displayName) {
    const converted: Dictionary<IDevice> = type === 'huron' ? this.convertHuronDevices(devices) : this.convertCloudberryDevices(devices);
    return _.map(converted, (device) => {
      device.accountType = 'MACHINE';
      device.displayName = displayName;
      return device;
    });
  }

  public convertCloudberryDevices(data): Dictionary<IDevice> {
    return _.mapValues(data, d => this.convertCloudberryDevice(d));
  }

  public convertHuronDevices(data): Dictionary<IDevice> {
    return _.mapValues(data, d => this.convertHuronDevice(d));
  }

  public convertPlaces(data): IPlace {
    return _.mapValues(data, d => this.convertPlace(d));
  }

  public convertCloudberryDevice(data): IDevice {
    return new CloudberryDevice(this.helper, data);
  }

  public convertHuronDevice(data): IDevice {
    return new HuronDevice(this.helper, data);
  }

  public convertPlace(data): IPlace {
    return new Place(this.helper, this, data);
  }

  public convertCode(data): Code {
    return new Code(data);
  }
}

class CloudberryDevice implements IDevice {
  public state: { key: string, readableState: string };
  public isATA: boolean;
  public serial: string;
  public isOnline: boolean;
  public canReset: boolean;
  public canDelete: boolean;
  public canReportProblem: boolean;
  public supportsCustomTags: boolean;
  public cisUuid: string;
  public image: string;
  public sipUrl: string;
  public tags: string[];

  public accountType: string;
  public displayName: string;
  public url: string;
  public isCloudberryDevice: boolean;
  public readonly type: string;
  public mac: string;
  public ip: any;
  public createTime: string;
  public product: string;
  public productFamily: string;
  public hasIssues: boolean;
  public software: string;
  public lastConnectionTime: string | null;
  public photos: string[];
  public cssColorClass: string;
  public upgradeChannel: { label: string; value: string };
  public readableActiveInterface: string;
  public diagnosticsEvents: { type: string; message: string }[];
  public rsuKey: string;
  public hasRemoteSupport: boolean;
  public hasAdvancedSettings: boolean;
  public update: (updated) => any;

  constructor(helper: Helper, obj) {
    this.url = obj.url;
    this.isCloudberryDevice = true;
    this.type = 'cloudberry';
    this.mac = obj.mac;
    this.ip = Helper.getIp(obj);
    this.serial = obj.serial;
    this.sipUrl = obj.sipUrl;
    this.createTime = obj.createTime;
    this.cisUuid = obj.cisUuid;
    this.product = Helper.getProduct(obj);
    this.productFamily = obj.productFamily;
    this.hasIssues = Helper.hasIssues(obj);
    this.software = Helper.getSoftware(obj);
    this.isOnline = Helper.getIsOnline(obj);
    this.lastConnectionTime = Helper.getLastConnectionTime(obj);
    this.tags = Helper.getTags(obj.description);
    this.displayName = obj.displayName;
    this.accountType = obj.accountType || 'MACHINE';
    this.photos = _.isEmpty(obj.photos) ? null : obj.photos;
    this.cssColorClass = Helper.getCssColorClass(obj);
    this.state = helper.getState(obj);
    this.upgradeChannel = helper.getUpgradeChannel(obj);
    this.readableActiveInterface = helper.getActiveInterface(obj);
    this.diagnosticsEvents = helper.getDiagnosticsEvents(obj);
    this.rsuKey = obj.remoteSupportUser && obj.remoteSupportUser.token;
    this.canDelete = true;
    this.canReportProblem = true;
    this.hasRemoteSupport = obj.productFamily === 'Cloudberry' || obj.productFamily === 'Darling';
    this.hasAdvancedSettings = obj.productFamily === 'Cloudberry';
    this.supportsCustomTags = true;
    this.update = (updated) => {
      this.displayName = updated.displayName;
    };
    this.image = 'images/devices-hi/' + (obj.imageFilename || obj.imageFileName || 'unknown.png');
  }
}

class HuronDevice implements IDevice {
  public state: { key: string, readableState: string };
  public diagnosticsEvents: csdm.IDeviceDiagnosticEvent[];
  public upgradeChannel: csdm.IDeviceUpgradeChannel;
  public hasIssues: boolean;
  public readableActiveInterface: string;
  public cssColorClass: string;
  public photos: string[];
  public product: string;
  public productFamily: string;
  public serial: string;
  public isOnline: boolean;
  public canReset: boolean;
  public canDelete: boolean;
  public canReportProblem: boolean;
  public supportsCustomTags: boolean;
  public cisUuid: string;
  public image: string;
  public sipUrl: string;
  public isATA: boolean;
  public ip: string;
  public mac: string;
  public displayName: string;
  public accountType: string;
  public url: string;
  public tags: string[];
  public readonly type: string;
  public isHuronDevice: boolean;
  public huronId: string;
  public addOnModuleCount: number;

  constructor(helper: Helper, obj) {
    this.url = obj.url;
    this.type = 'huron';
    this.isATA = (obj.product || '').indexOf('ATA') > 0;
    this.mac = obj.mac;
    this.ip = Helper.getIp(obj);
    this.cisUuid = obj.cisUuid;
    this.sipUrl = obj.sipUrl;
    this.isOnline = Helper.getIsOnline(obj);
    this.canReset = true;
    this.canDelete = true;
    this.canReportProblem = true;
    this.supportsCustomTags = true;
    this.accountType = obj.accountType || 'PERSON';
    this.displayName = obj.displayName;
    this.tags = Helper.getTags(HuronHelper.decodeHuronTags(obj.description));
    this.cssColorClass = Helper.getCssColorClass(obj);
    this.state = helper.getState(obj);
    this.photos = _.isEmpty(obj.photos) ? null : obj.photos;
    this.isHuronDevice = true;
    this.product = obj.product in HuronHelper.huron_model_map ? HuronHelper.huron_model_map[obj.product].displayName : Helper.getProduct(obj);
    this.productFamily = obj.productFamily;
    this.image = 'images/devices-hi/' + (obj.imageFilename || 'unknown.png');
    this.huronId = HuronHelper.getHuronId(obj);
    this.addOnModuleCount = obj.addOnModuleCount;
  }
}

class HuronHelper {
  public static huron_model_map = {
    MODEL_CISCO_7811: {
      displayName: 'Cisco 7811',
    },
    MODEL_CISCO_7821: {
      displayName: 'Cisco 7821',
    },
    MODEL_CISCO_7832: {
      displayName: 'Cisco 7832',
    },
    MODEL_CISCO_7841: {
      displayName: 'Cisco 7841',
    },
    MODEL_CISCO_7861: {
      displayName: 'Cisco 7861',
    },
    MODEL_CISCO_8811: {
      displayName: 'Cisco 8811',
    },
    MODEL_CISCO_8831: {
      displayName: 'Cisco 8831',
    },
    MODEL_CISCO_8841: {
      displayName: 'Cisco 8841',
    },
    MODEL_CISCO_8845: {
      displayName: 'Cisco 8845',
    },
    MODEL_CISCO_8851: {
      displayName: 'Cisco 8851',
    },
    MODEL_CISCO_8851NR: {
      displayName: 'Cisco 8851NR',
    },
    MODEL_CISCO_8861: {
      displayName: 'Cisco 8861',
    },
    MODEL_CISCO_8865: {
      displayName: 'Cisco 8865',
    },
    MODEL_CISCO_8865NR: {
      displayName: 'Cisco 8865NR',
    },
    MODEL_CISCO_ATA_190: {
      displayName: 'Cisco ATA190-SC Port 1',
    },
  };

  public static decodeHuronTags(description) {
    const tagString = _.replace(description, /\['/g, '["').replace(/']/g, '"]').replace(/',/g, '",').replace(/,'/g, ',"');
    return tagString;
  }

  public static getHuronId(obj) {
    return obj.url && obj.url.substr(obj.url.lastIndexOf('/') + 1);
  }
}

export class Helper {

  constructor(private $translate) {
  }

  public translateOrDefault(translateString, defaultValue, parameters?) {
    if (this.isTranslatable(translateString)) {
      return this.$translate.instant(translateString, parameters);
    } else {
      return defaultValue;
    }
  }

  public isTranslatable(key) {
    return this.$translate.instant(key) !== key;
  }

  public static getNotOkEvents(obj) {
    const events = _.reject(this.getEvents(obj), (e) => {
      return e.level === 'INFO' && (e.type === 'ip' || e.type === 'software' || e.type === 'upgradeChannel');
    });
    return events;
  }

  public static getEvents(obj): { type: string, level: string, description: string }[] {
    return (obj.status && obj.status.events) || [];
  }

  public static getIsOnline(obj) {
    const conStatus = (obj.status || {}).connectionStatus;
    return conStatus === 'CONNECTED' || conStatus === 'CONNECTED_WITH_ISSUES';
  }

  public static getLastConnectionTime(obj) {
    const localeData: any = moment.localeData(moment.locale());
    localeData._calendar.sameElse = 'lll';
    return (obj.status && obj.status.lastStatusReceivedTime) ? moment(obj.status.lastStatusReceivedTime).calendar() : null;
  }

  public static getProduct(obj) {
    return obj.product === 'UNKNOWN' ? '' : obj.product || obj.description;
  }

  public static getSoftware(obj): any {
    return _.head(_.chain(this.getEvents(obj))
      .filter({
        type: 'software',
        level: 'INFO',
      })
      .map('description')
      .value());
  }

  public getUpgradeChannel(obj): { label: string, value: string } {
    const channel: any = _.head(_.chain(Helper.getEvents(obj))
      .filter({
        type: 'upgradeChannel',
        level: 'INFO',
      })
      .map('description')
      .value());

    const labelKey = 'CsdmStatus.upgradeChannels.' + channel;
    let label = channel && this.$translate.instant('CsdmStatus.upgradeChannels.' + channel) || channel;
    if (label === labelKey) {
      label = channel;
    }
    return {
      label: label,
      value: channel,
    };
  }

  public getActiveInterface(obj): string {
    if (obj.status && obj.status.activeInterface) {
      const translationKey = 'CsdmStatus.activeInterface.' + obj.status.activeInterface.toLowerCase();
      if (this.isTranslatable(translationKey)) {
        return this.$translate.instant(translationKey);
      }
    }
    return '';
  }

  public static getIp(obj): any {
    return _.head(_.chain(this.getEvents(obj))
      .filter({
        type: 'ip',
        level: 'INFO',
      })
      .map('description')
      .value());
  }

  public static hasIssues(obj) {
    return obj.status && obj.status.level && obj.status.level !== 'OK';
  }

  public getDiagnosticsEvents(obj) {
    if (Helper.hasIssues(obj)) {
      return _.map(Helper.getNotOkEvents(obj), (e) => {
        return this.diagnosticsEventTranslated(e);
      });
    }
    return [];
  }

  public diagnosticsEventTranslated(e) {
    const type_lower = _.toLower(e.type);
    if (this.isTranslatable('CsdmStatus.errorCodes.' + type_lower + '.type')) {
      const additionalParameters = this.parametersFromKey(type_lower);
      return {
        type: this.translateOrDefault('CsdmStatus.errorCodes.' + type_lower + '.type', e.type),
        message: this.translateOrDefault('CsdmStatus.errorCodes.' + type_lower + '.message', e.description, _.merge(e.references, additionalParameters)),
      };
    } else if (e.description) {
      return {
        type: this.$translate.instant('CsdmStatus.errorCodes.unknown.type'),
        message: this.$translate.instant('CsdmStatus.errorCodes.unknown.message_with_description', {
          errorCode: e.type,
          description: e.description,
        }),
      };
    } else {
      return {
        type: this.$translate.instant('CsdmStatus.errorCodes.unknown.type'),
        message: this.$translate.instant('CsdmStatus.errorCodes.unknown.message', {
          errorCode: e.type,
        }),
      };
    }
  }

  public parametersFromKey(key: string) {
    switch (key) {
      case 'provisioningdeveloperoptions': return { xconfigpath: 'xConfiguration Spark DeveloperOptions' };
    }
    return;
  }

  public getState(obj) {
    const state = (obj.status || {}).connectionStatus;
    switch (state) {
      case 'CONNECTED_WITH_ISSUES':
        return {
          key: state,
          readableState: this.t('CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES'),
          priority: '1',
        };
      case 'CONNECTED':
        if (Helper.hasIssues(obj)) {
          return {
            key: 'CONNECTED_WITH_ISSUES',
            readableState: this.t('CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES'),
            priority: '1',
          };
        }
        return {
          key: state,
          readableState: this.t('CsdmStatus.connectionStatus.CONNECTED'),
          priority: '5',
        };
      case 'OFFLINE_EXPIRED':
        return {
          key: 'OFFLINE_EXPIRED',
          readableState: this.t('CsdmStatus.connectionStatus.OFFLINE_EXPIRED'),
          priority: '3',
        };
      case 'DISCONNECTED':
      case 'UNKNOWN':
      default:
        return {
          key: state,
          readableState: this.t('CsdmStatus.connectionStatus.DISCONNECTED'),
          priority: '2',
        };
    }
  }

  public static getCssColorClass(obj) {
    switch ((obj.status || {}).connectionStatus) {
      case 'CONNECTED':
        if (Helper.hasIssues(obj)) {
          return 'warning';
        }
        return 'success';
      case 'CONNECTED_WITH_ISSUES':
        return 'warning';
      case 'OFFLINE_EXPIRED':
        return 'expired';
      case 'DISCONNECTED':
      case 'UNKNOWN':
      default:
        return 'danger';
    }
  }

  public getLocalizedType(type) {
    if (type === 'huron') {
      return this.t('addDeviceWizard.chooseDeviceType.ciscoPhone');
    }
    return this.t('addDeviceWizard.chooseDeviceType.roomSystem');
  }

  private t(key) {
    return this.$translate.instant(key);
  }

  public static getTags(description): string[] {
    if (!description) {
      return [];
    }
    let tags: string[];
    try {
      tags = JSON.parse(description);
      return _.uniq(tags);
    } catch (e) {
      try {
        tags = JSON.parse('["' + description + '"]');
        return _.uniq(tags);
      } catch (e) {
        return [];
      }
    }
  }
}

class Code implements ICode {
  public expiryTime: any;
  public activationCode: string;

  constructor(obj) {
    this.expiryTime = obj.expiryTime;
    this.activationCode = obj.activationCode;
  }
}
class Place implements IPlaceExtended {
  public sipUrl: string;
  public readableType: string;
  public isPlace: boolean;
  public devices: Map<string, IDevice>;
  public cisUuid: string;
  public id: string;
  public type: string;
  public url: string;
  public entitlements: any[];
  public displayName: string;
  public externalLinkedAccounts: any[] | undefined;
  public tags: string[];
  public numbers: string[];
  public canDelete: boolean;
  public accountType: string;
  public image: string;
  public codes: Map<string, Code>;

  constructor(helper: Helper, converter: CsdmConverter, obj) {
    this.updateFrom(helper, converter, obj);
  }

  public updateFrom(helper: Helper, converter: CsdmConverter, obj) {
    this.url = obj.url;
    this.isPlace = true;
    this.type = obj.type || (obj.machineType === 'lyra_space' ? 'cloudberry' : 'huron');
    this.readableType = helper.getLocalizedType(this.type);
    this.entitlements = obj.entitlements;
    this.cisUuid = obj.cisUuid || obj.uuid;
    this.displayName = obj.displayName;
    this.sipUrl = obj.sipUrl;
    this.numbers = obj.numbers;
    this.canDelete = true;
    this.accountType = obj.placeType || 'MACHINE';
    this.image = 'images/devices-hi/unknown.png';
    this.devices = converter.convertDevicesForPlace(obj.devices || {}, this.type, this.displayName);
    this.codes = obj.codes || {};
    this.externalLinkedAccounts = obj.externalLinkedAccounts || [];
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmConverter', CsdmConverter)
  .name;

