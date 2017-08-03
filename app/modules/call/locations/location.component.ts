import { CallLocationSettingsData, CallLocationSettingsService, LocationSettingsOptionsService, LocationSettingsOptions } from 'modules/call/locations/shared';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { Notification } from 'modules/core/notifications';

class CallLocationCtrl implements ng.IComponentController {
  public uuid: string;
  public name: string;
  public form: ng.IFormController;

  public callLocationSettingsData: CallLocationSettingsData;
  public locationSettingsOptions: LocationSettingsOptions;
  public loading: boolean = false;
  public processing: boolean = false;
  public huronFeaturesUrl: string = 'call-locations';
  public showRoutingPrefix: boolean = true;

  /* @ngInject */
  constructor(
    private CallLocationSettingsService: CallLocationSettingsService,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private $q: ng.IQService,
    private LocationSettingsOptionsService: LocationSettingsOptionsService,
  ) {}

  public $onInit(): void {
    if (this.$state.current.name === 'call-locations-edit' && !this.uuid) {
      this.$state.go(this.huronFeaturesUrl);
    } else {
      this.loading = true;
      this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
    }
  }

  private initComponentData() {
    return this.LocationSettingsOptionsService.getOptions().then(locationOptions => this.locationSettingsOptions = locationOptions)
      .then(() => {
        this.CallLocationSettingsService.get(this.uuid)
          .then(locationSettings => {
            this.callLocationSettingsData = locationSettings;
            this.showRoutingPrefix = this.setShowRoutingPrefix(locationSettings.customerVoice.routingPrefixLength);
          })
          .catch(error => this.Notification.processErrorResponse(error, 'locations.getFailed'));
      });
  }

  public saveLocation(): void {
    this.processing = true;
    this.CallLocationSettingsService.save(this.callLocationSettingsData)
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

  public onExtensionRangeChanged(extensionRanges: InternalNumberRange[]): void {
    this.callLocationSettingsData.internalNumberRanges = extensionRanges;
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
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  private setShowRoutingPrefix(routingPrefixLength: number | null): boolean {
    if (_.isNull(routingPrefixLength) || routingPrefixLength === 0) {
      return false;
    } else {
      return true;
    }
  }
}

export class CallLocationComponent implements ng.IComponentOptions {
  public controller = CallLocationCtrl;
  public templateUrl = 'modules/call/locations/location.component.html';
  public bindings = {
    uuid: '<',
    name: '<',
  };
}
