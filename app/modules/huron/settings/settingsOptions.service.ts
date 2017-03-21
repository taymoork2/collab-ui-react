import { IOption } from 'modules/huron/dialing/dialing.service';
import { NumberService, NumberType } from 'modules/huron/numbers';

export class HuronSettingsOptions {
  public preferredLanguageOptions: Array<IOption>;
  public dateFormatOptions: Array<IOption>;
  public timeFormatOptions: Array<IOption>;
  public defaultCountryOptions: Array<IOption>;
  public timeZoneOptions: Array<IOption>;
  public premiumNumbers: string;
  public companyCallerIdOptions: Array<IOption>;
  public companyVoicemailOptions: Array<IOption>;
  public emergencyServiceNumberOptions: Array<IEmergencyNumberOption>;
}

export interface IEmergencyNumberOption extends IOption {
  pattern: string;
}

export class HuronSettingsOptionsService {

 /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private ServiceSetup,
    private NumberService: NumberService,
    private TelephoneNumberService,
  ) { }

  public getOptions(): ng.IPromise<HuronSettingsOptions> {
    let settingsOptions = new HuronSettingsOptions();
    return this.$q.all({
      dateFormatOptions: this.loadDateFormatOptions(),
      timeFormatOptions: this.loadTimeFormatOptions(),
      defaultCountryOptions: this.loadDefaultCountryOptions(),
      preferredLanguageOptions: this.loadPreferredLanguageOptions(),
      timeZoneOptions: this.loadTimeZoneOptions(),
      companyCallerIdOptions: this.loadCompanyCallerIdNumbers(undefined),
      companyVoicemailOptions: this.loadCompanyVoicemailNumbers(undefined),
      emergencyServiceNumbers: this.loadEmergencyServiceNumbers(undefined),
    }).then(response => {
      settingsOptions.dateFormatOptions = _.get<Array<IOption>>(response, 'dateFormatOptions');
      settingsOptions.timeFormatOptions = _.get<Array<IOption>>(response, 'timeFormatOptions');
      settingsOptions.defaultCountryOptions = _.get<Array<IOption>>(response, 'defaultCountryOptions');
      settingsOptions.preferredLanguageOptions = _.get<Array<IOption>>(response, 'preferredLanguageOptions');
      settingsOptions.timeZoneOptions = _.get<Array<IOption>>(response, 'timeZoneOptions');
      settingsOptions.premiumNumbers = _.get<string>(response, 'premiumNumbers');
      settingsOptions.companyCallerIdOptions = _.get<Array<IOption>>(response, 'companyCallerIdOptions');
      settingsOptions.companyVoicemailOptions = _.get<Array<IOption>>(response, 'companyVoicemailOptions');
      settingsOptions.emergencyServiceNumberOptions = _.get<Array<IEmergencyNumberOption>>(response, 'emergencyServiceNumbers');
      return settingsOptions;
    });
  }

  private loadDateFormatOptions(): ng.IPromise<Array<IOption>> {
    return this.ServiceSetup.getDateFormats();
  }

  private loadTimeFormatOptions(): ng.IPromise<Array<IOption>> {
    return this.ServiceSetup.getTimeFormats();
  }

  private loadDefaultCountryOptions(): ng.IPromise<Array<IOption>> {
    return this.ServiceSetup.getSiteCountries()
      .then(countries => {
        return _.sortBy(this.ServiceSetup.getTranslatedSiteCountries(countries), 'label');
      });
  }

  private loadPreferredLanguageOptions(): ng.IPromise<Array<IOption>> {
    return this.ServiceSetup.getSiteLanguages()
    .then(languages => {
      return _.sortBy(this.ServiceSetup.getTranslatedSiteLanguages(languages), 'label');
    });
  }

  public loadCompanyCallerIdNumbers(filter: string | undefined): ng.IPromise<Array<IOption>> {
    return this.NumberService.getNumberList(filter, NumberType.EXTERNAL)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return <IOption> {
            value: externalNumber.number,
            label: this.TelephoneNumberService.getDIDLabel(externalNumber.number),
          };
        });
      });
  }

  public loadCompanyVoicemailNumbers(filter: string | undefined): ng.IPromise<Array<IOption>> {
    return this.NumberService.getNumberList(filter, NumberType.EXTERNAL, false)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return <IOption> {
            value: externalNumber.number,
            label: this.TelephoneNumberService.getDIDLabel(externalNumber.number),
          };
        });
      });
  }

  private loadTimeZoneOptions(): ng.IPromise<Array<IOption>> {
    return this.ServiceSetup.getTimeZones().then(timezones => {
      return this.ServiceSetup.getTranslatedTimeZones(timezones);
    });
  }

  public loadEmergencyServiceNumbers(filter: string | undefined): ng.IPromise<Array<IEmergencyNumberOption>> {
    return this.NumberService.getNumberList(filter, NumberType.EXTERNAL, true)
      .then(externalNumbers => {
        return _.map(externalNumbers, externalNumber => {
          return <IEmergencyNumberOption> {
            value: externalNumber.uuid,
            pattern: externalNumber.number,
            label: this.TelephoneNumberService.getDIDLabel(externalNumber.number),
          };
        });
      });
  }

}
