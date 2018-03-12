import './deviceSettings.scss';
import { CsdmConfigurationService } from '../../devices/services/CsdmConfigurationService';
import { CsdmUpgradeChannelService } from '../../devices/services/CsdmUpgradeChannelService';

class DeviceSettings implements ng.IComponentController {
  public ownerType: string;
  public ownerId: string;
  public ownerDisplayName: string;
  public deviceList: any;

  public upgradeChannelOptions;
  private shouldShowUpgradeChannel;
  private selectedUpgradeChannel;
  public updatingUpgradeChannel;
  public unsupportedDeviceTypeForUpgradeChannel: string;

  public shouldShowSettingsLockDown;
  private _settingsLockedDown;
  public updatingSettingsLockDown;
  public unsupportedDeviceTypeForSettingsLockDown: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
    private CsdmUpgradeChannelService: CsdmUpgradeChannelService,
    private CsdmConfigurationService: CsdmConfigurationService,
    private Notification,
    private BotAuthorizationsModal,
  ) {}

  public $onInit(): void {
    this.fetchAsyncSettings();
  }

  public onSaveUpgradeChannel() {
    this.updatingUpgradeChannel = true;
    this.CsdmConfigurationService.updateRuleForPlace(this.ownerId, 'software_channel', this.selectedUpgradeChannel.value)
      .then(() => {
        this.Notification.success('deviceOverviewPage.channelUpdated');
      })
      .catch(error => {
        this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        this.resetSelectedUpgradeChannel();
      })
      .finally(() => {
        this.updatingUpgradeChannel = false;
      });
  }

  get settingsLockedDown(): boolean {
    return this._settingsLockedDown;
  }

  set settingsLockedDown(newSetting: boolean) {
    this.updatingSettingsLockDown = true;
    this.CsdmConfigurationService.updateRuleForPlace(this.ownerId, 'gui_settings_enabled', !newSetting)
      .then(() => {
        this.Notification.success('deviceSettings.settingsLockUpdated');
        this._settingsLockedDown = newSetting;
      })
      .catch(error => {
        this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        this.resetSettingsLockedDown();
      })
      .finally(() => {
        this.updatingSettingsLockDown = false;
      });
  }
  public startManageApiAccessFlow() {
    this.BotAuthorizationsModal.open(this.ownerId, this.ownerDisplayName, this.ownerType);
  }
  private fetchAsyncSettings(): void {
    const firstUnsupportedDevice = _.find(this.deviceList || [], (d: any) =>
          d.productFamily !== 'Cloudberry' && d.productFamily !== 'Novum');
    if (firstUnsupportedDevice) {
      this.unsupportedDeviceTypeForUpgradeChannel = firstUnsupportedDevice.product;
    }
    this.CsdmUpgradeChannelService.getUpgradeChannelsPromise().then(channels => {
      this.shouldShowUpgradeChannel = channels.length > 1;
      if (this.shouldShowUpgradeChannel) {
        this.upgradeChannelOptions = _.map(channels, (channel: string) => {
          return this.getUpgradeChannelObject(channel);
        });
        this.resetSelectedUpgradeChannel();
      }
    });

    this.FeatureToggleService.csdmPlaceGuiSettingsGetStatus().then(placeGuiSettings => {
      if (placeGuiSettings) {
        const firstUnsupportedDevice = _.find(this.deviceList || [], (d: any) =>
          d.productFamily !== 'Cloudberry' && d.productFamily !== 'Novum');
        if (firstUnsupportedDevice) {
          this.unsupportedDeviceTypeForSettingsLockDown = firstUnsupportedDevice.product;
        }
        this.shouldShowSettingsLockDown = true;
        this.resetSettingsLockedDown();
      }
    });
  }

  private resetSelectedUpgradeChannel() {
    this.CsdmConfigurationService.getRuleForPlace(this.ownerId, 'software_channel').then(rule => {
      this.selectedUpgradeChannel = this.getUpgradeChannelObject(rule.value);
    }).catch(() => {
      this.selectedUpgradeChannel = {
        label: 'Nothing Selected',
      };
    });
  }

  private resetSettingsLockedDown() {
    this.CsdmConfigurationService.getRuleForPlace(this.ownerId, 'gui_settings_enabled').then(rule => {
      this._settingsLockedDown = !rule.value;
    }).catch(() => {
      this._settingsLockedDown = false;
    });
  }

  private getUpgradeChannelObject(channel) {
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
}

export class DeviceSettingsComponent implements ng.IComponentOptions {
  public controller = DeviceSettings;
  public template = require('modules/squared/places/deviceSettings/deviceSettings.html');
  public bindings = <{ [binding: string]: string }>{
    ownerId: '<',
    ownerDisplayName: '<',
    ownerType: '<',
    deviceList: '<',
  };
}
