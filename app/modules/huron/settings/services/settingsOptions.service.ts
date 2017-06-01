import { IOption } from 'modules/huron/dialing/dialing.service';
import { IDialPlan, DialPlanService } from 'modules/huron/dialPlans';
import { NumberService, NumberType } from 'modules/huron/numbers';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { HuntGroupService } from 'modules/call/features/hunt-group';

export class HuronSettingsOptions {
  public preferredLanguageOptions: Array<IOption>;
  public dateFormatOptions: Array<IOption>;
  public timeFormatOptions: Array<IOption>;
  public defaultCountryOptions: Array<IOption>;
  public timeZoneOptions: Array<IOption>;
  public companyCallerIdOptions: Array<IOption>;
  public companyVoicemailOptions: Array<IOption>;
  public emergencyServiceNumberOptions: Array<IEmergencyNumberOption>;
  public dialPlan: IDialPlan;
  public extensionsAssigned: boolean;
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
    private PhoneNumberService: PhoneNumberService,
    private DialPlanService: DialPlanService,
    private HuntGroupService: HuntGroupService,
    private Authinfo,
    private DirectoryNumberService,
    private CeService,
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
      dialPlan: this.loadDialPlan(),
      extensionsAssigned: this.areExtensionsAssigned(),
    }).then(response => {
      settingsOptions.dateFormatOptions = _.get<Array<IOption>>(response, 'dateFormatOptions');
      settingsOptions.timeFormatOptions = _.get<Array<IOption>>(response, 'timeFormatOptions');
      settingsOptions.defaultCountryOptions = _.get<Array<IOption>>(response, 'defaultCountryOptions');
      settingsOptions.preferredLanguageOptions = _.get<Array<IOption>>(response, 'preferredLanguageOptions');
      settingsOptions.timeZoneOptions = _.get<Array<IOption>>(response, 'timeZoneOptions');
      settingsOptions.companyCallerIdOptions = _.get<Array<IOption>>(response, 'companyCallerIdOptions');
      settingsOptions.companyVoicemailOptions = _.get<Array<IOption>>(response, 'companyVoicemailOptions');
      settingsOptions.emergencyServiceNumberOptions = _.get<Array<IEmergencyNumberOption>>(response, 'emergencyServiceNumbers');
      settingsOptions.dialPlan = _.get<IDialPlan>(response, 'dialPlan');
      settingsOptions.extensionsAssigned = _.get<boolean>(response, 'extensionsAssigned');
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
            label: this.PhoneNumberService.getNationalFormat(externalNumber.number),
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
            label: this.PhoneNumberService.getNationalFormat(externalNumber.number),
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
            label: this.PhoneNumberService.getNationalFormat(externalNumber.number),
          };
        });
      });
  }

  private loadDialPlan(): ng.IPromise<IDialPlan> {
    return this.DialPlanService.getDialPlan();
  }

  private testForExtensions(): ng.IPromise<boolean> {
    return this.DirectoryNumberService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
      .then(extensionList => {
        return (_.isArray(extensionList) && extensionList.length > 0);
      });
  }

  private testForHuntGroup(): ng.IPromise<boolean> {
    return this.HuntGroupService.getHuntGroupList()
      .then(huntGroupList => {
        return (_.isArray(huntGroupList) && huntGroupList.length > 0);
      });
  }

  private testForAutoAttendant(): ng.IPromise<boolean> {
    return this.CeService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
      .then(aaList => {
        return (_.isArray(aaList) && aaList.length > 0);
      })
      .catch(() => false);
  }

  private areExtensionsAssigned(): ng.IPromise<any> {
    return this.$q.all({
      extensions: this.testForExtensions(),
      huntGroups: this.testForHuntGroup(),
      autoAttendant: this.testForAutoAttendant(),
    }).then(response => {
      if (response.extensions) {
        return true;
      } else if (response.huntGroups) {
        return true;
      } else if (response.autoAttendant) {
        return true;
      } else {
        return false;
      }
    });
  }

}
