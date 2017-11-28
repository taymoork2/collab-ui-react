import {
  CallLocationSettingsData, CallLocationSettingsService,
  LocationSettingsOptionsService, LocationSettingsOptions,
  VoicemailPilotNumber, LocationCallerId,
} from './shared';
import { SWIVEL } from 'modules/huron/pstn';
import { IOption } from 'modules/huron/dialing';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { PstnService, PstnModel } from 'modules/huron/pstn';
import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init';
import { Notification } from 'modules/core/notifications';
import { EmergencyNumber } from 'modules/huron/phoneNumber';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class CallLocationCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public name: string;
  public form: ng.IFormController;

  public callLocationSettingsData: CallLocationSettingsData;
  public locationSettingsOptions: LocationSettingsOptions;
  public loading: boolean = false;
  public processing: boolean = false;
  public huronFeaturesUrl: string = 'call-locations';
  public showRoutingPrefix: boolean = true;
  public number: IOption | null = null;
  public secondFirstTimeSetup: boolean = false;

  /* @ngInject */
  constructor(
    private CallLocationSettingsService: CallLocationSettingsService,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private LocationSettingsOptionsService: LocationSettingsOptionsService,
    private SettingSetupInitService: SettingSetupInitService,
    private PstnService: PstnService,
    private PstnModel: PstnModel,
    private PhoneNumberService: PhoneNumberService,
    private Authinfo,
  ) {}

  public $onInit(): void {
    if (this.$state.current.name === 'call-locations-edit' && !this.uuid) {
      this.$state.go(this.huronFeaturesUrl);
    } else {
      this.loading = true;
      this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
    }

    this.PstnService.getCustomerV2(this.Authinfo.getOrgId()).then(() => {
      this.PstnModel.setCustomerId(this.Authinfo.getOrgId());
      this.PstnModel.setCustomerExists(true);
    });

    if (this.ftsw) {
      this.$scope.$watch(() => {
        return _.get(this.form, '$invalid');
      }, invalid => {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      });

      this.$scope.$watch(() => {
        return this.loading;
      }, loading => {
        this.$scope.$emit('wizardNextButtonDisable', !!loading);
      });
    }
  }

  private initComponentData(): ng.IPromise<string | void> {
    return this.LocationSettingsOptionsService.getOptions()
      .then(locationOptions => this.locationSettingsOptions = locationOptions)
      .then(() => {
        return this.CallLocationSettingsService.get(this.uuid)
          .then(locationSettings => {
            this.secondFirstTimeSetup = this.SettingSetupInitService.hasDefaultLocation();
            this.callLocationSettingsData = locationSettings;
            this.setEmergencyCallbackNumber(this.callLocationSettingsData.emergencyNumber);
          })
          .catch(error => this.Notification.processErrorResponse(error, 'locations.getFailed'));
      });
  }

  public setupCallLocationNext(): ng.IPromise<void> {
    return this.saveLocation();
  }

  public saveLocation(): ng.IPromise<void> {
    this.processing = true;
    this.updateECBNValue();
    return this.CallLocationSettingsService.save(this.callLocationSettingsData)
      .then(locationSettingsData => {
        this.name = locationSettingsData.location.name;
        this.callLocationSettingsData = locationSettingsData;
        this.setEmergencyCallbackNumber(this.callLocationSettingsData.emergencyNumber);
        this.Notification.success('locations.saveSuccess');
      })
      .catch(() => {
        this.callLocationSettingsData = this.CallLocationSettingsService.getOriginalConfig();
      })
      .finally(() => {
        this.processing = false;
        this.resetForm();
      });
  }

  public updateECBNValue(): void {
    if (this.number) {
      if (!this.callLocationSettingsData.emergencyNumber) {
        this.callLocationSettingsData.emergencyNumber = new EmergencyNumber();
      }
      this.callLocationSettingsData.emergencyNumber.name = this.callLocationSettingsData.location.name;
      this.callLocationSettingsData.emergencyNumber.pattern = this.number.value;
    }
  }

  public onNameChanged(name: string): void {
    this.callLocationSettingsData.location.name = name;
    this.checkForChanges();
  }

  public onMoHChanged(locationMediaId: string): void {
    this.callLocationSettingsData.mediaId = locationMediaId;
    this.checkForChanges();
  }

  public onTimeZoneChanged(timeZone: string): void {
    this.callLocationSettingsData.location.timeZone = timeZone;
    this.checkForChanges();
  }

  public onTimeFormatChanged(timeFormat: string): void {
    this.callLocationSettingsData.location.timeFormat = timeFormat;
    this.checkForChanges();
  }

  public onDateFormatChanged(dateFormat: string): void {
    this.callLocationSettingsData.location.dateFormat = dateFormat;
    this.checkForChanges();
  }

  public onPreferredLanguageChanged(preferredLanguage: string): void {
    this.callLocationSettingsData.location.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  public onDefaultToneChanged(tone: string): void {
    this.callLocationSettingsData.location.tone = tone;
    this.checkForChanges();
  }

  public onSteeringDigitChanged(steeringDigit: string): void {
    this.callLocationSettingsData.location.steeringDigit = steeringDigit;
    this.checkForChanges();
  }

  public onRegionCodeChanged(regionCode: string, useSimplifiedNationalDialing: boolean): void {
    _.set(this.callLocationSettingsData.location.regionCodeDialing, 'regionCode', regionCode);
    _.set(this.callLocationSettingsData.location.regionCodeDialing, 'simplifiedNationalDialing', useSimplifiedNationalDialing);
    this.checkForChanges();
  }

  public onLocationCosRestrictionsChanged(restrictions): void {
    this.callLocationSettingsData.cosRestrictions = restrictions;
    this.checkForChanges();
  }

  public onRoutingPrefixChanged(routingPrefix: string): void {
    this.callLocationSettingsData.location.routingPrefix = routingPrefix;
    this.checkForChanges();
  }

  public onExtensionLengthChanged(extensionLength: number): void {
    this.callLocationSettingsData.customerVoice.extensionLength = extensionLength;
    this.checkForChanges();
  }

  public onExtensionRangeChanged(extensionRanges: InternalNumberRange[]): void {
    this.callLocationSettingsData.internalNumberRanges = extensionRanges;
    this.checkForChanges();
  }

  public onCallerIdChanged(callerId: LocationCallerId): void {
    this.callLocationSettingsData.location.callerId = callerId;
    this.checkForChanges();
  }

  public onCompanyVoicemailChanged(_voicemailPilotNumber: string, _voicemailPilotNumberGenerated: boolean, companyVoicemailEnabled: boolean): void {
    _.set(this.callLocationSettingsData.customer, 'hasVoicemailService', companyVoicemailEnabled);
    this.checkForChanges();
  }

  public onExtTransferChanged(allowExternalTransfer: boolean): void {
    this.callLocationSettingsData.location.allowExternalTransfer = allowExternalTransfer;
    this.checkForChanges();
  }

  public onLocationVoicemailChanged(voicemailPilotNumber: VoicemailPilotNumber): void {
    this.callLocationSettingsData.location.voicemailPilotNumber = voicemailPilotNumber;
    this.checkForChanges();
  }

  public checkForChanges(): void {
    if (this.CallLocationSettingsService.matchesOriginalConfig(this.callLocationSettingsData)) {
      this.resetForm();
    }
  }

  public showES(): boolean {
    return this.PstnModel.getProvider().apiImplementation !== SWIVEL;
  }

  public onEcbnChange(value: IOption): void {
    this.number = value;
    this.updateECBNValue();
    this.checkForChanges();
  }

  private isValidNumber(): boolean {
    if (this.callLocationSettingsData.emergencyNumber && !_.isEmpty(this.callLocationSettingsData.emergencyNumber.pattern)) {
      const options = this.locationSettingsOptions.emergencyNumbersOptions.filter(option => {
        return option.value === this.callLocationSettingsData.emergencyNumber.pattern;
      });
      if (!_.isEmpty(options)) {
        return true;
      }
      return false;
    }
    return true;
  }

  private isValidAddress(): boolean {
    if (this.callLocationSettingsData.address && this.callLocationSettingsData.address.validated) {
      return true;
    }
    return false;
  }

  public saveDisabled(): boolean {
    if (this.PstnModel.isCustomerExists()) {
      if (this.callLocationSettingsData && this.isValidAddress() && this.isValidNumber()) {
        return this.form.$invalid;
      }
      return true;
    }
    return this.form.$invalid;
  }

  public onCancel(): void {
    this.callLocationSettingsData = this.CallLocationSettingsService.getOriginalConfig();
    //creates IOption for this.number
    this.setEmergencyCallbackNumber(this.callLocationSettingsData.emergencyNumber);
    this.resetForm();
  }

  private resetForm(): void {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

  private setEmergencyCallbackNumber(emergencyNumber: EmergencyNumber | null): void {
    if (!emergencyNumber) {
      return;
    }
    let options: IOption[] = [];
    if (!_.isEmpty(emergencyNumber.pattern)) {
      options = this.locationSettingsOptions.emergencyNumbersOptions.filter(option => {
        return option.value === emergencyNumber.pattern;
      });
    }
    if (options.length > 0) {
      this.number = options[0];
    } else {
      this.number = {
        label: this.PhoneNumberService.getNationalFormat(emergencyNumber.pattern),
        value: emergencyNumber.pattern,
      } as IOption;
    }
  }
}

export class CallLocationComponent implements ng.IComponentOptions {
  public controller = CallLocationCtrl;
  public template = require('modules/call/locations/location.component.html');
  public bindings = {
    ftsw: '<',
    uuid: '<',
    name: '<',
  };
}
