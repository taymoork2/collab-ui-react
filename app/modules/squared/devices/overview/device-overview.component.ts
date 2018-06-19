import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { AccessibilityService, KeyCodes } from 'modules/core/accessibility';
import { AtaDeviceModal } from 'modules/squared/devices/ataDevices/ataDevice';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { CsdmDeviceService } from 'modules/squared/devices/services/CsdmDeviceService';
import { CsdmUpgradeChannelService } from 'modules/squared/devices/services/CsdmUpgradeChannelService';
import { DeviceOverviewService } from './deviceOverview.service';
import { EmergencyServicesService } from 'modules/squared/devices/emergencyServices/emergencyServices.service';
import { FeedbackService } from 'modules/core/feedback/feedbackservice.js';
import { KemService } from 'modules/squared/devices/services/KemService';
import { Notification } from 'modules/core/notifications';
import { PstnModel, PstnService } from 'modules/huron/pstn';
import IDevice = csdm.IDevice;
import { IPromise } from 'angular';
import { CsdmHuronDeviceService } from '../services/CsdmHuronDeviceService';

interface ITimeZoneOption {
  id: string;
  label: string;
}

interface ITimeZone {
  timeZone: string;
  country: string;
  emergencyCallbackNumber: string;
}

interface IAdminUserDetais {
  displayName: string;
  firstName: string;
  lastName: string;
  userName: string;
  cisUuid: string;
  organizationId: string;
}

interface IChannel {
  label: string;
  value: string;
}

export interface IDeviceOverviewStateParams {
  currentDevice: IDevice;
  huronDeviceService: CsdmHuronDeviceService;
  deviceDeleted: (url: string) => boolean;
}

class DeviceOverview implements ng.IComponentController {
  private adminUserDetails: IAdminUserDetais;
  private huronDeviceService = this.$stateParams.huronDeviceService;
  private channels: string[];
  public currentDevice: IDevice;
  public deviceHasInformation = false;
  public canChangeUpgradeChannel = false;
  public shouldShowUpgradeChannel = false;
  public selectedUpgradeChannel;
  public upgradeChannelOptions: IChannel[];
  public updatingUpgradeChannel = false;
  public lines = [];
  public linesAreLoaded = false;
  public tzIsLoaded = false;
  public searchTimeZonePlaceholder;
  public timeZoneOptions: ITimeZoneOption[];
  public timeZone;
  public selectedTimeZone;
  public updatingTimeZone;
  public countryIsLoaded = false;
  public country = '';
  public countryPlaceholder = '';
  public countryOptions;
  public selectedCountry;
  public updatingCountry = false;
  public hideE911Edit = true;
  public faxEnabled = false;
  public cpcEnabled = false;
  public updatingT38Settings = false;
  public updatingCpcSettings = false;
  public emergencyCallbackNumber = '';
  public emergencyAddress = '';
  public emergencyAddressStatus = '';
  public e911NotFound = false;
  public isE911Available = false;
  public showE911 = false;
  public showT38 = false;
  public isKEMAvailable = false;
  public kemNumber: number;
  public huronPollInterval: IPromise<any>;
  public newTag;
  public isAddingTag;
  public jumpToAccount = false;
  public showNewAdvancedSettings = false;
  public showAdvancedSettings = false;
  public actionList = [{
    actionKey: 'common.edit',
    actionFunction: () => {
      this.goToEmergencyServices();
    },
  }];

  /* @ngInject */
  constructor(private $element: ng.IRootElementService,
              private $interval: ng.IIntervalService,
              private $q: ng.IQService,
              private $state,
              private $stateParams: IDeviceOverviewStateParams,
              private $scope: ng.IScope,
              private $timeout: ng.ITimeoutService,
              private $translate: ng.translate.ITranslateService,
              private $window: ng.IWindowService,
              private AccessibilityService: AccessibilityService,
              private AtaDeviceModal: AtaDeviceModal,
              private Authinfo: Authinfo,
              private ConfirmAtaRebootModal,
              private CsdmDataModelService: ICsdmDataModelService,
              private CsdmDeviceService: CsdmDeviceService,
              private CsdmUpgradeChannelService: CsdmUpgradeChannelService,
              private DeviceOverviewService: DeviceOverviewService,
              private EmergencyServicesService: EmergencyServicesService,
              private FeatureToggleService,
              private FeedbackService: FeedbackService,
              private KemService: KemService,
              private LaunchAdvancedSettingsModal,
              private Notification: Notification,
              private PstnModel: PstnModel,
              private PstnService: PstnService,
              private RemDeviceModal,
              private RemoteSupportModal,
              private ResetDeviceModal,
              private ServiceSetup,
              private TerminusService,
              private Utils,
              private Userservice,
              private WizardFactory) {
    this.displayDevice(this.$stateParams.currentDevice);

    this.FeatureToggleService.csdmDeviceAccountJumpGetStatus().then((response) => {
      this.jumpToAccount = response;
    });

    FeatureToggleService.csdmDeviceConfigGetStatus().then((response) => {
      this.showNewAdvancedSettings = response;
    });

    FeatureToggleService.atlasDevicesAdvancedSettingsGetStatus().then((response) => {
      this.showAdvancedSettings = response;
    });

    this.fetchT38Visibility();
    this.fetchDetailsForLoggedInUser();

    this.CsdmDataModelService.reloadDevice(this.$stateParams.currentDevice).then((updatedDevice) => {
      this.displayDevice(updatedDevice);
    });
  }

  private fetchDetailsForLoggedInUser(): void {
    this.Userservice.getUser('me', (data) => {
      if (data.success) {
        this.adminUserDetails = {
          firstName: data.name && data.name.givenName,
          lastName: data.name && data.name.familyName,
          displayName: data.displayName,
          userName: data.userName,
          cisUuid: data.id,
          organizationId: data.meta.organizationID,
        };
      }
    });
  }

  private fetchT38Visibility(): void {
    if (this.currentDevice.isATA) {
      if (!this.PstnModel.getProviderId()) {
        this.PstnService.getCustomer(this.Authinfo.getOrgId()).then((customer) => {
          this.PstnService.getCarrierCapabilities(customer.pstnCarrierId).then((capabilities) => {
            this.showT38 = _.some(capabilities, { capability: 'T38' });
          });
        });
      } else {
        this.PstnService.getCarrierCapabilities(this.PstnModel.getProviderId()).then((capabilities) => {
          this.showT38 = _.some(capabilities, { capability: 'T38' });
        });
      }
    }
  }

  private displayDevice(device: IDevice): IPromise<void[]> {
    const lastDevice = this.currentDevice;
    const promises: IPromise<any>[] = [];

    this.currentDevice = device;

    if (this.currentDevice.isHuronDevice() && (!lastDevice || lastDevice.product !== this.currentDevice.product)) {
      this.isKEMAvailable = this.KemService.isKEMAvailable(this.currentDevice.product);
      this.kemNumber = this.isKEMAvailable ? this.KemService.getKemOption(this.currentDevice.addOnModuleCount) : '';
    }

    if (!this.huronPollInterval) {
      this.huronPollInterval = this.$interval(this.pollLines.bind(this), 30000);
      this.$scope.$on('$destroy', () => {
        this.$interval.cancel(this.huronPollInterval);
      });
    }
    promises.push(this.pollLines());

    if (this.currentDevice.isHuronDevice()) {
      if (!this.tzIsLoaded) {
        const timeZonePromise = this.initTimeZoneOptions().then(() => {
          return this.getCurrentDeviceInfo();
        });
        promises.push(timeZonePromise);
      }
      if (!this.countryIsLoaded) {
        const countryPromise = this.initCountryOptions().then(() => {
          return this.getCurrentDeviceInfo();
        });
        promises.push(countryPromise);
      }
    }

    if (this.currentDevice.isATA) {
      promises.push(this.getCurrentAtaSettings());
    }

    this.deviceHasInformation = !!(this.currentDevice.ip || this.currentDevice.mac || this.currentDevice.serial || this.currentDevice.software || this.currentDevice.hasRemoteSupport);

    const placeUpgradeChannelSupported = this.currentDevice.productFamily === 'Cloudberry' || this.currentDevice.productFamily === 'Novum';
    this.canChangeUpgradeChannel = _.size(this.channels) > 1 && !this.currentDevice.isHuronDevice() && this.currentDevice.isOnline && !placeUpgradeChannelSupported;
    this.shouldShowUpgradeChannel = _.size(this.channels) > 1 && !this.currentDevice.isHuronDevice() && (!this.currentDevice.isOnline || placeUpgradeChannelSupported);

    this.upgradeChannelOptions = _.map(this.channels, (c) => {
      return this.getUpgradeChannelObject(c);
    });

    this.resetSelectedChannel();
    return this.$q.all(promises);
  }

  public goToAccount(): void {
    if (this.currentDevice.accountType === 'MACHINE') {
      this.$state.go('places', {
        preSelectedPlaceId: this.currentDevice.cisUuid,
      });
    } else {
      this.$state.go('users.list', {
        preSelectedUserId: this.currentDevice.cisUuid,
      });
    }
  }

  public reactivateRoomDevice(): void {
    const wizardState = {
      data: {
        function: 'showCode',
        admin: this.adminUserDetails,
        account: {
          type: this.currentDevice.accountType === 'MACHINE' ? 'shared' : 'personal',
          deviceType: 'cloudberry',
          cisUuid: this.currentDevice.cisUuid,
          name: this.currentDevice.displayName,
          organizationId: this.Authinfo.getOrgId(),
        },
        recipient: {
          cisUuid: this.Authinfo.getUserId(),
          email: this.Authinfo.getPrimaryEmail(),
          displayName: this.adminUserDetails.displayName,
          organizationId: this.adminUserDetails.organizationId,
        },
        title: 'addDeviceWizard.newCode',
      },
      history: [],
      currentStateName: 'addDeviceFlow.showActivationCode',
      wizardState: {
        'addDeviceFlow.showActivationCode': {},
      },
    };
    const wizard = this.WizardFactory.create(wizardState);
    this.$state.go('addDeviceFlow.showActivationCode', {
      wizard: wizard,
    });
  }

  private getCurrentAtaSettings(): IPromise<void> {
    this.updatingT38Settings = true;
    this.updatingCpcSettings = true;
    return this.huronDeviceService.getAtaInfo(this.currentDevice).then((result) => {
      this.faxEnabled = result.t38FaxEnabled;
      this.cpcEnabled = result.cpcDelay > 2;
      this.updatingT38Settings = false;
      this.updatingCpcSettings = false;
    });
  }

  private getEmergencyInformation(): void {
    if (!this.currentDevice.isHuronDevice()) {
      this.emergencyCallbackNumber = _.get(this, 'lines[0].alternate');
      this.showE911 = !!this.emergencyCallbackNumber;
      if (this.showE911) {
        this.getEmergencyAddress();
      } else if (_.get(this, 'lines[0]')) {
        this.EmergencyServicesService.getCompanyECN().then((result) => {
          this.showE911 = result;
          this.emergencyCallbackNumber = result;
          if (result) {
            this.hideE911Edit = false;
            this.getEmergencyAddress();
          }
        });
      }
    } else {
      this.showE911 = true;
      this.getEmergencyAddress();
    }
  }

  private getEmergencyAddress(): void {
    if (this.emergencyCallbackNumber) {
      this.TerminusService.customerNumberE911V2().get({
        customerId: this.Authinfo.getOrgId(),
        number: this.emergencyCallbackNumber,
      }).$promise.then((info) => {
        this.emergencyAddress = info.e911Address;
        this.emergencyAddressStatus = info.status;
      }).then(() => {
        this.isE911Available = true;
      }).catch(() => {
        this.e911NotFound = true;
      });
    } else {
      this.e911NotFound = true;
    }
  }

  private initTimeZoneOptions(): IPromise<void> {
    this.searchTimeZonePlaceholder = this.$translate.instant('serviceSetupModal.searchTimeZone');

    if (!this.timeZoneOptions) {
      return this.ServiceSetup.getTimeZones().then((timezones) => {
        this.timeZoneOptions = this.ServiceSetup.getTranslatedTimeZones(timezones);
      });
    } else {
      return this.$q.resolve();
    }
  }

  private initCountryOptions(): IPromise<void> {
    this.countryPlaceholder = this.$translate.instant('deviceOverviewPage.countryPlaceholder');
    if (!this.countryOptions) {
      return this.DeviceOverviewService.getCountryOptions().then((countries) => {
        this.countryOptions = countries;
      });
    } else {
      return this.$q.resolve();
    }
  }

  private getCurrentDeviceInfo(): IPromise<void> {
    return this.huronDeviceService.getDeviceInfo(this.currentDevice).then((result: ITimeZone) => {
      this.timeZone = result.timeZone;
      this.emergencyCallbackNumber = result.emergencyCallbackNumber;
      this.selectedTimeZone = this.getTimeZoneFromId(result);
      this.tzIsLoaded = true;
      this.country = result.country;
      this.selectedCountry = this.DeviceOverviewService.findCountryByCode(this.countryOptions, result.country);
      this.countryIsLoaded = true;
    }).then(() => {
      this.getEmergencyInformation();
    });
  }

  private getTimeZoneFromId(timeZone: ITimeZone): ITimeZoneOption | undefined {
    if (timeZone && timeZone.timeZone) {
      return _.find(this.timeZoneOptions, (o) => {
        return o.id === timeZone.timeZone;
      });
    }
  }

  private pollLines(): IPromise<void> {
    return this.huronDeviceService.getLinesForDevice(this.currentDevice).then((result) => {
      this.lines = result;
      this.linesAreLoaded = true;
    }).then(() => {
      if (!this.currentDevice.isHuronDevice()) {
        this.getEmergencyInformation();
      }
    });
  }

  private setTimeZone(timezone): IPromise<void> {
    return this.huronDeviceService.setTimezoneForDevice(this.currentDevice, timezone).then(() => {
      this.timeZone = timezone;
    });
  }

  private setCountry(country): IPromise<void> {
    return this.huronDeviceService.setCountryForDevice(this.currentDevice, country).then(() => {
      this.country = country;
    });
  }

  public saveT38Settings(): void {
    if (this.currentDevice.isATA) {
      this.ConfirmAtaRebootModal
        .open({
          name: this.$translate.instant('ataSettings.t38Label'),
        })
        .then(() => {
          this.executeSaveT38Settings();
        })
        .catch(() => {
          this.getCurrentAtaSettings();
        });
    } else {
      this.executeSaveT38Settings();
    }
  }

  public executeSaveT38Settings(): void {
    this.updatingT38Settings = true;
    this.$timeout(() => {
      const settings = {
        t38FaxEnabled: this.faxEnabled,
      };
      this.huronDeviceService.setSettingsForAta(this.currentDevice, settings)
        .then(() => {
          this.Notification.success('ataSettings.savedT38');
        })
        .catch((error) => {
          this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        })
        .finally(() => {
          this.updatingT38Settings = false;
        });
    }, 100);
  }

  public saveCpcSettings(): void {
    this.ConfirmAtaRebootModal
      .open({
        name: this.$translate.instant('ataSettings.cpcLabel'),
      })
      .then(() => {
        this.executeSaveCpcSettings();
      })
      .catch(() => {
        this.getCurrentAtaSettings();
      });
  }

  private executeSaveCpcSettings(): void {
    this.updatingCpcSettings = true;
    this.$timeout(() => {
      const settings = {
        cpcDelay: this.cpcEnabled ? 240 : 2,
      };
      this.huronDeviceService.setSettingsForAta(this.currentDevice, settings)
        .then(() => {
          this.Notification.success('ataSettings.savedCpc');
        })
        .catch((error) => {
          this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
          this.getCurrentAtaSettings();
        })
        .finally(() => {
          this.updatingCpcSettings = false;
        });
    }, 100);
  }

  public saveTimeZoneAndWait(): void {
    if (this.currentDevice.isATA) {
      this.ConfirmAtaRebootModal
        .open({ name: this.$translate.instant('deviceOverviewPage.timeZone') })
        .then(() => {
          this.executeSaveTimeZoneAndWait();
        })
        .catch(() => {
          this.getCurrentDeviceInfo();
        });
    } else {
      this.executeSaveTimeZoneAndWait();
    }
  }

  private executeSaveTimeZoneAndWait(): void {
    const newValue = this.selectedTimeZone.id;
    if (newValue !== this.timeZone) {
      this.updatingTimeZone = true;
      this.setTimeZone(newValue)
        .then(_.partial(() => {
          this.waitForDeviceToUpdateTimeZone(newValue);
        }))
        .catch((error) => {
          this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
          this.getCurrentDeviceInfo();
        })
        .finally(() => {
          this.updatingTimeZone = false;
        });
    }
  }

  public saveCountryAndWait(): void {
    if (this.currentDevice.isATA) {
      this.ConfirmAtaRebootModal
        .open({
          name: this.$translate.instant('deviceOverviewPage.country'),
        })
        .then(() => {
          this.executeSaveCountryAndWait();
        })
        .catch(() => {
          this.getCurrentDeviceInfo();
        });
    } else {
      this.executeSaveCountryAndWait();
    }
  }

  private executeSaveCountryAndWait(): void {
    const newValue = this.selectedCountry.value;
    if (newValue !== this.country) {
      this.updatingCountry = true;
      this.setCountry(newValue)
        .then(_.partial(() => {
          this.waitForDeviceToUpdateCountry(newValue);
        }))
        .catch((error) => {
          this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
          this.getCurrentDeviceInfo();
        })
        .finally(() => {
          this.updatingCountry = false;
          this.selectedCountry = this.DeviceOverviewService.findCountryByCode(this.countryOptions, newValue);
        });
    }
  }

  private goToEmergencyServices(): void {
    const data = {
      currentAddress: this.emergencyAddress,
      currentHuronDevice: this.currentDevice,
      currentNumber: this.emergencyCallbackNumber,
      status: this.emergencyAddressStatus,
      staticNumber: !this.currentDevice.isHuronDevice(),
    };

    if (this.$state.current.name === 'user-overview.csdmDevice' || this.$state.current.name === 'place-overview.csdmDevice') {
      this.$state.go(this.$state.current.name + '.emergencyServices', data);
    } else {
      this.$state.go('device-overview.emergencyServices', data);
    }
  }

  private waitForDeviceToUpdateTimeZone(newValue): IPromise<{}> {
    const deferred = this.$q.defer();
    this.pollDeviceForNewTimeZone(newValue, new Date().getTime() + 5000, deferred);
    return deferred.promise;
  }

  private waitForDeviceToUpdateCountry(newValue): IPromise<{}> {
    const deferred = this.$q.defer();
    this.pollDeviceForNewCountry(newValue, new Date().getTime() + 5000, deferred);
    return deferred.promise;
  }

  private pollDeviceForNewTimeZone(newValue, endTime, deferred): void {
    this.huronDeviceService.getDeviceInfo(this.currentDevice).then((result) => {
      if (result.timeZone === newValue) {
        this.Notification.success('deviceOverviewPage.timeZoneUpdated');
        return deferred.resolve();
      }
      if (new Date().getTime() > endTime) {
        return deferred.reject(this.$translate.instant('deviceOverviewPage.timeZoneUpdateFailed'));
      }
      this.$timeout(() => {
        this.pollDeviceForNewTimeZone(newValue, endTime, deferred);
      }, 1000);
    });
  }

  private pollDeviceForNewCountry(newValue, endTime, deferred): void {
    this.huronDeviceService.getDeviceInfo(this.currentDevice).then((result) => {
      //Temporary workaround to handle null reset until CMI Device API returns null.
      if (result.country === newValue || newValue === null) {
        this.Notification.success('deviceOverviewPage.countryUpdated');
        return deferred.resolve();
      }
      if (new Date().getTime() > endTime) {
        return deferred.reject(this.$translate.instant('deviceOverviewPage.countryUpdateFailed'));
      }
      this.$timeout(() => {
        this.pollDeviceForNewCountry(newValue, endTime, deferred);
      }, 1000);
    });
  }

  public reportProblem(): void {
    let uploadLogsPromise;
    let feedbackId;
    if (this.currentDevice.isHuronDevice()) {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      feedbackId = '';
      for (let i = 32; i > 0; --i) {
        feedbackId += chars[Math.floor(Math.random() * chars.length)];
      }
      uploadLogsPromise = this.huronDeviceService.uploadLogs(this.currentDevice, feedbackId);
    } else {
      feedbackId = this.Utils.getUUID();
      uploadLogsPromise = this.CsdmDeviceService.uploadLogs(this.currentDevice.url, feedbackId, this.Authinfo.getPrimaryEmail());
    }

    uploadLogsPromise.then(() => {
      const appType = 'Atlas_' + this.$window.navigator.userAgent;
      return this.FeedbackService.getFeedbackUrl(appType, feedbackId);
    })
      .then((res) => {
        this.$window.open(res.data.url, '_blank');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'deviceOverviewPage.failedToUploadLogs');
      });
  }

  public deleteDevice(): void {
    this.RemDeviceModal
      .open(this.currentDevice)
      .then(() => {
        if (this.$state.sidepanel) {
          this.$state.sidepanel.close();
        }
        if (_.isFunction(this.$stateParams.deviceDeleted)) {
          this.$stateParams.deviceDeleted(this.currentDevice.url);
        }
      });
  }

  public openAtaSettings(): void {
    this.AtaDeviceModal
      .open(this.currentDevice);
  }

  public resetDevice(): void {
    this.ResetDeviceModal
      .open(this.currentDevice)
      .then(() => {
        if (this.$state.sidepanel) {
          this.$state.sidepanel.close();
        }
      });
  }

  public showAdvancedSettingsDialog(): void {
    this.LaunchAdvancedSettingsModal.open(this.currentDevice);
  }

  public showNewAdvancedSettingsDialog() {
    this.$state.go('deviceConfiguration.show', {
      selectedDevice: this.currentDevice,
    });
  }

  public showRemoteSupportDialog(): void {
    if (_.isFunction(this.Authinfo.isReadOnlyAdmin) && this.Authinfo.isReadOnlyAdmin()) {
      this.Notification.notifyReadOnly();
      return;
    }
    if (this.showRemoteSupportButton()) {
      this.RemoteSupportModal.open(this.currentDevice);
    }
  }

  public showRemoteSupportButton(): boolean {
    return this.currentDevice && this.currentDevice.hasRemoteSupport;
  }

  public addTag(): void {
    const tag = _.trim(this.newTag);
    if (tag && !_.includes(this.currentDevice.tags, tag)) {
      this.newTag = undefined;

      return this.CsdmDataModelService
        .updateTags(this.currentDevice, this.currentDevice.tags.concat(tag))
        .then((updatedDevice) => {
          return this.displayDevice(updatedDevice);
        })
        .catch((response) => {
          this.Notification.errorResponse(response, 'deviceOverviewPage.failedToSaveChanges');
        });
    } else {
      this.isAddingTag = false;
      this.newTag = undefined;
    }
  }

  public addTagOnEnter($event): void {
    if ($event.keyCode === KeyCodes.ENTER) {
      this.addTag();
    }
  }

  public removeTag(tag, index): IPromise<void> {
    const tags = _.without(this.currentDevice.tags, tag);
    return this.CsdmDataModelService.updateTags(this.currentDevice, tags)
      .then((updatedDevice) => {
        return this.displayDevice(updatedDevice);
      }, (response) => {
        // this only applies to the previous promise rejection from `updateTags()`
        this.Notification.errorResponse(response, 'deviceOverviewPage.failedToSaveChanges');
      })
      .catch((response) => {
        // this applies to the `displayDevice(updatedDevice)` promise
        this.Notification.errorResponse(response, 'deviceOverviewPage.failedToDisplayDevice');
      })
      .finally(() => {
        if (index < this.currentDevice.tags.length) {
          this.AccessibilityService.setFocus(this.$element, '#deleteTag' + index);
        } else {
          this.AccessibilityService.setFocus(this.$element, '#addNewTag');
        }
      });
  }

  private resetSelectedChannel(): void {
    this.selectedUpgradeChannel = this.currentDevice.upgradeChannel;
  }

  private getUpgradeChannelObject(channel: string): IChannel {
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

  public saveUpgradeChannelAndWait(): void {
    const newValue = this.selectedUpgradeChannel.value;
    if (newValue !== this.currentDevice.upgradeChannel.value) {
      this.updatingUpgradeChannel = true;
      this.saveUpgradeChannel(newValue)
        .then(_.partial(() => {
          this.waitForDeviceToUpdateUpgradeChannel(newValue);
        }))
        .catch((error) => {
          this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
          this.resetSelectedChannel();
        })
        .finally(() => {
          this.updatingUpgradeChannel = false;
        });
    }
  }

  private saveUpgradeChannel(newValue: string): IPromise<any> {
    return this.CsdmUpgradeChannelService.updateUpgradeChannel(this.currentDevice.url, newValue);
  }

  private waitForDeviceToUpdateUpgradeChannel(newValue): IPromise<{}> {
    const deferred = this.$q.defer();
    this.pollDeviceForNewChannel(newValue, new Date().getTime() + 5000, deferred);
    return deferred.promise;
  }

  private pollDeviceForNewChannel(newValue, endTime, deferred): void {
    this.CsdmDataModelService.reloadDevice(this.currentDevice).then((device) => {
      this.currentDevice = device;
      if (device.upgradeChannel.value === newValue) {
        this.Notification.success('deviceOverviewPage.channelUpdated');
        return deferred.resolve();
      }
      if (new Date().getTime() > endTime) {
        return deferred.reject(this.$translate.instant('deviceOverviewPage.channelUpdateFailed'));
      }
      this.$timeout(() => {
        this.pollDeviceForNewChannel(newValue, endTime, deferred);
      }, 1000);
    });
  }
}

export class DeviceOverviewComponent implements ng.IComponentOptions {
  public controller = DeviceOverview;
  public controllerAs = 'deviceOverview';
  public template = require('modules/squared/devices/overview/deviceOverview.tpl.html');
  public bindings = {
    channels: '<',
  };
}
