import { IOption } from 'modules/huron/dialing/dialing.service';
import { IDialPlan, DialPlanService } from 'modules/huron/dialPlans';

export class LocationSettingsOptions {
  public preferredLanguageOptions: IOption[];
  public timeZoneOptions: IOption[];
  public defaultToneOptions: IOption[];
  public dialPlan: IDialPlan;
}

export class LocationSettingsOptionsService {

  /* @ngInject */
  constructor(
     private $q: ng.IQService,
     private DialPlanService: DialPlanService,
     private ServiceSetup,
  ) { }

  public getOptions(): ng.IPromise<LocationSettingsOptions> {
    const locationOptions = new LocationSettingsOptions();
    return this.$q.all({
      timeZoneOptions: this.loadTimeZoneOptions().then(timeZoneOptions => locationOptions.timeZoneOptions = timeZoneOptions),
      preferredLanguageOptions: this.loadPreferredLanguageOptions().then(preferredLanguageOptions => locationOptions.preferredLanguageOptions = preferredLanguageOptions),
      defaultToneOptions: this.loadDefaultToneOptions().then(defaultToneOptions => locationOptions.defaultToneOptions = defaultToneOptions),
      dialPlan: this.loadDialPlan().then(dialPlan => locationOptions.dialPlan = dialPlan),
    }).then(() => {
      return locationOptions;
    });
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
}
