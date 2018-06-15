import { IPreferredLanugageOption, IPreferredLanguageFeature } from 'modules/huron/preferredLanguage';
import { IToolkitModalService } from 'modules/core/modal';

class PreferredLanguageDetails implements ng.IComponentController {
  public preferredLanguageFeature: IPreferredLanguageFeature;
  public preferredLanguageFeatureCopy: IPreferredLanguageFeature;
  public preferredLanguageOptions: IPreferredLanugageOption[];
  public preferredLanguage: IPreferredLanugageOption[];
  public prefLanguageSaveInProcess: boolean = false;
  public onPrefLanguageChange: boolean = false;
  public hasSparkCall: boolean = true;
  public displayDescription: string;
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
  ) { }

  public $onInit(): void {
    this.initPreferredLanguageData();
    this.setDisplayDescription();
  }

  private initPreferredLanguageData(): void {
    if (!_.isEmpty(this.preferredLanguageFeature) ) {
      const selectedLanguageCode = _.get(this.preferredLanguageFeature, 'selectedLanguageCode');
      this.preferredLanguageOptions = this.preferredLanguageFeature.languageOptions;
      this.preferredLanguage = this.findPreferredLanguageByCode(this.preferredLanguageOptions, selectedLanguageCode);
      this.preferredLanguageFeatureCopy = _.cloneDeep(this.preferredLanguageFeature);
      this.hasSparkCall = this.preferredLanguageFeature.hasSparkCall;
    }
  }

  public setPreferredLanguage(preferredLanguage: any): void {
    this.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  public openSaveModal(): void {
    this.ModalService.open({
      title: this.$translate.instant('preferredLanguage.saveModal.title'),
      message: this.$translate.instant('preferredLanguage.saveModal.message1') + '<br/><br/>'
        + this.$translate.instant('preferredLanguage.saveModal.message2'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result.then(() => {
      this.onSave();
    });
  }

  public onSave(): void {
    if (this.preferredLanguageFeature.save) {
      this.preferredLanguageFeature.save(this.preferredLanguage);
      this.resetPreferredLanguageFlags();
    }
  }

  public onCancelPreferredLanguage(): void {
    if (!this.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      const copyPrefLanguageCode = this.preferredLanguageFeatureCopy.selectedLanguageCode;
      const copyLanguageOptions = this.preferredLanguageFeatureCopy.languageOptions;
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
    return _.isEqual(preferredLanguage.value, this.preferredLanguageFeatureCopy.selectedLanguageCode);

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
    this.displayDescription = this.$translate.instant('preferredLanguage.description', {
      module: this.$translate.instant('preferredLanguage.userModule'),
    });
  }
}

export class PreferredLanguageDetailsComponent implements ng.IComponentOptions {
  public controller = PreferredLanguageDetails;
  public template = require('modules/huron/preferredLanguage/preferredLanguageDetails/preferredLanguageDetails.html');
  public bindings = {
    preferredLanguageFeature: '<',
  };
}
