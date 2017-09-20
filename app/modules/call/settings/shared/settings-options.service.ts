import { IOption } from 'modules/huron/dialing/dialing.service';
import { IDialPlan, DialPlanService } from 'modules/huron/dialPlans';
import { NumberService, NumberType } from 'modules/huron/numbers';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { HuntGroupService } from 'modules/call/features/hunt-group';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { Notification } from 'modules/core/notifications';

export class HuronSettingsOptions {
  public preferredLanguageOptions: IOption[];
  public dateFormatOptions: IOption[];
  public timeFormatOptions: IOption[];
  public defaultCountryOptions: IOption[];
  public timeZoneOptions: IOption[];
  public companyCallerIdOptions: IOption[];
  public companyVoicemailOptions: IOption[];
  public emergencyServiceNumberOptions: IEmergencyNumberOption[];
  public companyMohOptions: IOption[];
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
    private MediaOnHoldService: MediaOnHoldService,
    private Notification: Notification,
    private FeatureToggleService,
    private Authinfo,
    private DirectoryNumberService,
    private CeService,
  ) { }

  public getOptions(): ng.IPromise<HuronSettingsOptions> {
    const settingsOptions = new HuronSettingsOptions();
    return this.$q.all({
      dateFormatOptions: this.loadDateFormatOptions(),
      timeFormatOptions: this.loadTimeFormatOptions(),
      defaultCountryOptions: this.loadDefaultCountryOptions(),
      preferredLanguageOptions: this.loadPreferredLanguageOptions(),
      timeZoneOptions: this.loadTimeZoneOptions(),
      companyCallerIdOptions: this.loadCompanyCallerIdNumbers(undefined),
      companyVoicemailOptions: this.loadCompanyVoicemailNumbers(undefined),
      emergencyServiceNumbers: this.loadEmergencyServiceNumbers(undefined),
      companyMohOptions: this.loadCompanyMohOptions(),
      dialPlan: this.loadDialPlan(),
      extensionsAssigned: this.areExtensionsAssigned(),
    }).then(response => {
      settingsOptions.dateFormatOptions = _.get<IOption[]>(response, 'dateFormatOptions');
      settingsOptions.timeFormatOptions = _.get<IOption[]>(response, 'timeFormatOptions');
      settingsOptions.defaultCountryOptions = _.get<IOption[]>(response, 'defaultCountryOptions');
      settingsOptions.preferredLanguageOptions = _.get<IOption[]>(response, 'preferredLanguageOptions');
      settingsOptions.timeZoneOptions = _.get<IOption[]>(response, 'timeZoneOptions');
      settingsOptions.companyCallerIdOptions = _.get<IOption[]>(response, 'companyCallerIdOptions');
      settingsOptions.companyVoicemailOptions = _.get<IOption[]>(response, 'companyVoicemailOptions');
      settingsOptions.emergencyServiceNumberOptions = _.get<IEmergencyNumberOption[]>(response, 'emergencyServiceNumbers');
      settingsOptions.companyMohOptions = _.get<IOption[]>(response, 'companyMohOptions', []);
      settingsOptions.dialPlan = _.get<IDialPlan>(response, 'dialPlan');
      settingsOptions.extensionsAssigned = _.get<boolean>(response, 'extensionsAssigned');
      return settingsOptions;
    }).catch(error => {
      this.Notification.errorWithTrackingId(error);
      return this.$q.reject();
    });
  }

  private loadDateFormatOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getDateFormats();
  }

  private loadTimeFormatOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getTimeFormats();
  }

  private loadDefaultCountryOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getSiteCountries()
      .then(countries => {
        return _.sortBy(this.ServiceSetup.getTranslatedSiteCountries(countries), 'label');
      });
  }

  private loadPreferredLanguageOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getSiteLanguages()
    .then(languages => {
      return _.sortBy(this.ServiceSetup.getTranslatedSiteLanguages(languages), 'label');
    });
  }

  public loadCompanyCallerIdNumbers(filter: string | undefined): ng.IPromise<IOption[]> {
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

  public loadCompanyVoicemailNumbers(filter: string | undefined): ng.IPromise<IOption[]> {
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

  private loadTimeZoneOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getTimeZones().then(timezones => {
      return this.ServiceSetup.getTranslatedTimeZones(timezones);
    });
  }

  private loadCompanyMohOptions(): ng.IPromise<IOption[]> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.huronMOHEnable)
      .then(supportsCompanyMoh => {
        if (supportsCompanyMoh) {
          return this.MediaOnHoldService.getCompanyMohOptions()
          .then(mediaOptions => {
            return mediaOptions;
          });
        } else {
          return this.$q.resolve([]);
        }
      });
  }

  public loadEmergencyServiceNumbers(filter: string | undefined): ng.IPromise<IEmergencyNumberOption[]> {
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
