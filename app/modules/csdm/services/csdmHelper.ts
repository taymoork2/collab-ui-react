export class DeviceHelper {

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
    const channel: any = _.head(_.chain(DeviceHelper.getEvents(obj))
      .filter({
        type: 'upgradeChannel',
        level: 'INFO',
      })
      .map('description')
      .value());

    const labelKey = 'CsdmStatus.upgradeChannels.' + channel;
    let label = this.$translate.instant('CsdmStatus.upgradeChannels.' + channel);
    if (label === labelKey) {
      label = channel;
    }
    return {
      label: label,
      value: channel,
    };
  }

  public getActiveInterface(obj): string {
    if (obj.status) {
      const translationKey = 'CsdmStatus.activeInterface.' + (obj.status.activeInterface || '').toLowerCase();
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
    return this.getIsOnline(obj) && obj.status && obj.status.level && obj.status.level !== 'OK';
  }

  public getDiagnosticsEvents(obj) {
    if (DeviceHelper.hasIssues(obj)) {
      return _.map(DeviceHelper.getNotOkEvents(obj), (e) => {
        return this.diagnosticsEventTranslated(e);
      });
    }
    return [];
  }

  public translateErrorCode(errorCode: string) {
    return this.diagnosticsEventTranslated({ type: errorCode });
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
    switch ((obj || {}).connectionStatus) {
      case 'CONNECTED':
        if (DeviceHelper.hasIssues(obj)) {
          return {
            readableState: this.t('CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES'),
            priority: '1',
          };
        }
        return {
          readableState: this.t('CsdmStatus.connectionStatus.CONNECTED'),
          priority: '5',
        };
      case 'CONNECTED_WITH_ISSUES':
        return {
          readableState: this.t('CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES'),
          priority: '1',
        };
      case 'OFFLINE_EXPIRED':
        return {
          readableState: this.t('CsdmStatus.connectionStatus.OFFLINE_EXPIRED'),
          priority: '3',
        };
      case 'DISCONNECTED':
      case 'UNKNOWN':
      default:
        return {
          readableState: this.t('CsdmStatus.connectionStatus.DISCONNECTED'),
          priority: '2',
        };
    }
  }

  public static translateConnectionStatusToColor(connectionStatus: string): string {
    return DeviceHelper.getCssColorClass({ connectionStatus: connectionStatus });
  }

  public static getCssColorClass(obj) {
    switch ((obj || {}).connectionStatus) {
      case 'CONNECTED':
        if (DeviceHelper.hasIssues(obj)) {
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

export class HuronDeviceHelper {
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
