import { CallLocationSettingsData, CallLocationSettingsService, LocationSettingsOptionsService, LocationSettingsOptions, VoicemailPilotNumber } from 'modules/call/locations/shared';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { LocationCallerId } from 'modules/call/locations/shared';
import { PstnService } from 'modules/huron/pstn';
import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init';
import { Notification } from 'modules/core/notifications';

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
  public isTerminusCustomer: boolean = false;

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
    private Authinfo,
  ) {}

  public $onInit(): void {
    if (this.$state.current.name === 'call-locations-edit' && !this.uuid) {
      this.$state.go(this.huronFeaturesUrl);
    } else {
      this.loading = true;
      this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
    }

    this.PstnService.getCustomer(this.Authinfo.getOrgId()).then(() => {
      this.isTerminusCustomer = true;
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
            this.callLocationSettingsData = locationSettings;
            this.showRoutingPrefix = this.setShowRoutingPrefix(locationSettings.customerVoice.routingPrefixLength);
          })
          .catch(error => this.Notification.processErrorResponse(error, 'locations.getFailed'));
      });
  }

  public setupCallLocationNext(): ng.IPromise<void> {
    return this.saveLocation();
  }

  public saveLocation(): ng.IPromise<void> {
    this.processing = true;
    return this.CallLocationSettingsService.save(this.callLocationSettingsData)
      .then(locationSettingsData => {
        this.callLocationSettingsData = locationSettingsData;
        this.Notification.success('locations.saveSuccess');
      })
      .finally(() => {
        this.processing = false;
        this.resetForm();
      });
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

  public onCancel(): void {
    this.callLocationSettingsData = this.CallLocationSettingsService.getOriginalConfig();
    this.resetForm();
  }

  private resetForm(): void {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

  private setShowRoutingPrefix(routingPrefixLength: number | null): boolean {
    // if ftsw check which option was chosen
    if (this.ftsw) {
      return this.SettingSetupInitService.getSelected() === 2;
    } else { // in edit mode check if routingPrefixLength is null or 0
      if (_.isNull(routingPrefixLength) || routingPrefixLength === 0) {
        return false;
      } else {
        return true;
      }
    }
  }
}

export class CallLocationComponent implements ng.IComponentOptions {
  public controller = CallLocationCtrl;
  public templateUrl = 'modules/call/locations/location.component.html';
  public bindings = {
    ftsw: '<',
    uuid: '<',
    name: '<',
  };
}
