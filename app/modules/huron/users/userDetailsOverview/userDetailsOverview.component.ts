import { IPreferredLanugageOption } from '../../preferredLanguage/preferredLanugage.interfaces';
import { UserOverviewService } from '../../../core/users/userOverview/userOverview.service';
import { Notification } from '../../../core/notifications';

interface IUserDetailsOverviewFeature {
  selectedLanguageCode?: string | undefined;
  languageOptions: IPreferredLanugageOption[];
  currentUserId: string;
  hasSparkCall: boolean;
}
class UserDetailsOverview implements ng.IComponentController {
  public preferredLanguageDetails: IUserDetailsOverviewFeature;
  public preferredLanguageDetailsCopy: IUserDetailsOverviewFeature;
  public preferredLanguageOptions: IPreferredLanugageOption[];
  public preferredLanguage: any;
  public plIsLoaded: boolean = false;
  public prefLanguageSaveInProcess: boolean = false;
  public onPrefLanguageChange: boolean = false;
  public hasSparkCall: boolean = true;
  public displayDescription: string;
  /* @ngInject */
  constructor(
    private UserOverviewService: UserOverviewService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.initPreferredLanguageData();
    this.setDisplayDescription();
  }

  private initPreferredLanguageData(): void {
    if (!_.isEmpty(this.preferredLanguageDetails)) {
      let selectedLanguageCode = _.get(this.preferredLanguageDetails, 'selectedLanguageCode');
      let languageOptions = _.get(this.preferredLanguageDetails, 'languageOptions');
      this.preferredLanguage = this.findPreferredLanguageByCode(languageOptions, selectedLanguageCode);
      this.preferredLanguageOptions = <IPreferredLanugageOption[]> languageOptions;
      this.preferredLanguageDetailsCopy = _.cloneDeep(this.preferredLanguageDetails);
      this.hasSparkCall = this.preferredLanguageDetails.hasSparkCall;
      this.plIsLoaded = true;
    }
  }

  public setPreferredLanguage(preferredLanguage: any): void {
    this.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  public savePreferredLanguage(): void {
    this.prefLanguageSaveInProcess = true;
    if (!this.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      let prefLang = this.preferredLanguage.value ? this.preferredLanguage.value : null;
      this.UserOverviewService.updateUserPreferredLanguage(this.preferredLanguageDetails.currentUserId, prefLang)
        .then(() => {
          this.preferredLanguageDetails.selectedLanguageCode = prefLang;
          this.preferredLanguageDetailsCopy.selectedLanguageCode = prefLang;
          this.Notification.success('preferredLanguage.placesCallOverviewSaveSuccess');
        })
        .catch(error => {
          this.Notification.errorResponse(error, 'preferredLanguage.failedToSaveChanges');
        }).finally(() => {
          this.resetPreferredLanguageFlags();
          this.plIsLoaded = true;
        });
    }
  }

  public onCancelPreferredLanguage(): void {
    if (!this.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      let copyPrefLanguageCode = this.preferredLanguageDetailsCopy.selectedLanguageCode;
      let copyLanguageOptions = this.preferredLanguageDetailsCopy.languageOptions;
      this.preferredLanguage = this.findPreferredLanguageByCode(copyLanguageOptions, copyPrefLanguageCode);
    }
    this.resetPreferredLanguageFlags();
  }

  private checkForChanges(): void {
    if (this.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      this.resetPreferredLanguageFlags();
    }
  }

  private checkForPreferredLanguageChanges(preferredLanguage): boolean {
    return _.isEqual(preferredLanguage.value, this.preferredLanguageDetailsCopy.selectedLanguageCode);

  }

  private resetPreferredLanguageFlags(): void {
    this.prefLanguageSaveInProcess = false;
    this.onPrefLanguageChange = false;
  }

  private findPreferredLanguageByCode(languages, language_code): any {
    return _.find(languages, function (language) {
      return language['value'] === language_code;
    });
  }

  private setDisplayDescription() {
    this.displayDescription = this.hasSparkCall ?
        this.$translate.instant('preferredLanguage.description', {
          module: this.$translate.instant('preferredLanguage.userModule'),
        }) :
        this.$translate.instant('preferredLanguage.descriptionForCloudberryDevice');
  }
}

export class UserDetailsOverviewComponent implements ng.IComponentOptions {
  public controller = UserDetailsOverview;
  public templateUrl = 'modules/huron/users/userDetailsOverview/userDetailsOverview.html';
  public bindings = {
    preferredLanguageDetails: '<',
  };
}
