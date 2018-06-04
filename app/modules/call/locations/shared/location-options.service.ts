import { IOption } from 'modules/huron/dialing/dialing.service';
import { IDialPlan, DialPlanService } from 'modules/huron/dialPlans';
import { NumberService, NumberType } from 'modules/huron/numbers';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { Notification } from 'modules/core/notifications';

export class LocationSettingsOptions {
  public mediaOnHoldOptions: IOption[];
  public dateFormatOptions: IOption[];
  public timeFormatOptions: IOption[];
  public preferredLanguageOptions: IOption[];
  public timeZoneOptions: IOption[];
  public defaultToneOptions: IOption[];
  public dialPlan: IDialPlan;
  public locationCallerIdOptions: IOption[];
  public companyVoicemailOptions: IOption[];
  public emergencyNumbersOptions: IOption[];
}

export class LocationSettingsOptionsService {

  /* @ngInject */
  constructor(
     private $q: ng.IQService,
     private MediaOnHoldService: MediaOnHoldService,
     private DialPlanService: DialPlanService,
     private NumberService: NumberService,
     private PhoneNumberService: PhoneNumberService,
     private Notification: Notification,
     private ServiceSetup,
     private FeatureToggleService,
  ) { }

  public getOptions(): ng.IPromise<LocationSettingsOptions> {
    const locationOptions = new LocationSettingsOptions();
    return this.$q.all({
      mediaOnHoldOptions: this.loadMoHOptions().then(mediaOnHoldOptions => locationOptions.mediaOnHoldOptions = mediaOnHoldOptions),
      dateFormatOptions: this.loadDateFormatOptions().then(dateFormatOptions => locationOptions.dateFormatOptions = dateFormatOptions),
      timeFormatOptions: this.loadTimeFormatOptions().then(timeFormatOptions => locationOptions.timeFormatOptions = timeFormatOptions),
      timeZoneOptions: this.loadTimeZoneOptions().then(timeZoneOptions => locationOptions.timeZoneOptions = timeZoneOptions),
      preferredLanguageOptions: this.loadPreferredLanguageOptions().then(preferredLanguageOptions => locationOptions.preferredLanguageOptions = preferredLanguageOptions),
      defaultToneOptions: this.loadDefaultToneOptions().then(defaultToneOptions => locationOptions.defaultToneOptions = defaultToneOptions),
      dialPlan: this.loadDialPlan().then(dialPlan => locationOptions.dialPlan = dialPlan),
      locationCallerIdOptions: this.loadLocationCallerIdNumbers(undefined).then(callerIdNumbers => locationOptions.locationCallerIdOptions = callerIdNumbers),
      companyVoicemailOptions: this.loadCompanyVoicemailNumbers(undefined).then(companyVoicemailNumbers => locationOptions.companyVoicemailOptions = companyVoicemailNumbers),
      emergencyNumbersOptions: this.loadEmergencyNumbersOptions().then(emergencyNumbersOptions => locationOptions.emergencyNumbersOptions = emergencyNumbersOptions),
    }).then(() => {
      return locationOptions;
    })
      .catch(error => {
        this.Notification.errorWithTrackingId(error);
        return this.$q.reject();
      });
  }

  public loadMoHOptions(): ng.IPromise<IOption[]> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.huronMOHEnable)
      .then(supportsMoh => {
        if (supportsMoh) {
          return this.MediaOnHoldService.getLocationMohOptions();
        }
      });
  }

  private loadDateFormatOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getDateFormats();
  }

  private loadTimeFormatOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getTimeFormats();
  }

  private loadTimeZoneOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getTimeZones().then(timezones => {
      return this.ServiceSetup.getTranslatedTimeZones(timezones);
    });
  }

  private loadPreferredLanguageOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getSiteLanguages()
      .then(languages => {
        return _.sortBy(this.ServiceSetup.getTranslatedSiteLanguages(languages), 'label');
      });
  }

  private loadDefaultToneOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getSiteCountries()
      .then(countries => {
        return _.sortBy(this.ServiceSetup.getTranslatedSiteCountries(countries), 'label');
      });
  }

  private loadDialPlan(): ng.IPromise<IDialPlan> {
    return this.DialPlanService.getDialPlan();
  }

  public loadLocationCallerIdNumbers(filter: string | undefined): ng.IPromise<IOption[]> {
    return this.NumberService.getNumberList(filter, NumberType.EXTERNAL)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return {
            value: _.get(externalNumber, 'external'),
            label: this.PhoneNumberService.getNationalFormat(_.get(externalNumber, 'external')),
          } as IOption;
        });
      });
  }

  public loadCompanyVoicemailNumbers(filter: string | undefined): ng.IPromise<IOption[]> {
    return this.NumberService.getNumberList(filter, NumberType.EXTERNAL, false)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return {
            value: _.get(externalNumber, 'external'),
            label: this.PhoneNumberService.getNationalFormat(_.get(externalNumber, 'external')),
          } as IOption;
        });
      });
  }

  public loadEmergencyNumbersOptions(): ng.IPromise<IOption[]> {
    return this.NumberService.getNumberList(undefined, NumberType.EXTERNAL, true)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return {
            value: _.get(externalNumber, 'external'),
            label: this.PhoneNumberService.getNationalFormat(_.get(externalNumber, 'external')),
          } as IOption;
        });
      });
  }
}
