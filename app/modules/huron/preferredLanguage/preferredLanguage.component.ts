import { IPreferredLanugageOption } from './preferredLanguage.interfaces';

class PreferredLanguage implements ng.IComponentController {
  public hasSparkCall: boolean;
  public plIsLoaded: boolean;
  public prefLanguageSaveInProcess: boolean = false;
  public preferredLanguage: IPreferredLanugageOption[];
  public preferredLanguageOptions: any[];
  public onPrefLanguageChange: boolean = false;
  public onChangeFn: Function;
  public nonePlaceholder: string;
  public description: string;

  public options: IPreferredLanugageOption[] = [];
  public optionSelected: IPreferredLanugageOption;
  public noneOption: IPreferredLanugageOption;

  /* @ngInject */
  constructor(
      private $translate: ng.translate.ITranslateService,
  ) {
    this.nonePlaceholder = this.$translate.instant('directoryNumberPanel.none');
    this.noneOption = {
      featureToggle: null,
      value: '',
      label: this.nonePlaceholder,
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      preferredLanguage,
      preferredLanguageOptions,
    } = changes;
    if (preferredLanguageOptions) {
      if (preferredLanguageOptions.currentValue && _.isArray(preferredLanguageOptions.currentValue)) {
        this.options = <IPreferredLanugageOption[]> preferredLanguageOptions.currentValue;
      }
    }
    if (preferredLanguage) {
      if (preferredLanguage.currentValue) {
        this.optionSelected = <IPreferredLanugageOption> preferredLanguage.currentValue;
      } else {
        this.optionSelected = this.noneOption;
      }
    }
  }

  public onChangePreferredLanugage(): void {
    this.onChangeFn({
      preferredLanguage: this.optionSelected,
    });
    this.onPrefLanguageChange = true;
  }
}

export class PreferredLanguageComponent implements ng.IComponentOptions {
  public controller = PreferredLanguage;
  public template = require('modules/huron/preferredLanguage/preferredLanguage.html');
  public bindings = {
    plIsLoaded: '=',
    hasSparkCall: '<',
    onPrefLanguageChange: '=',
    prefLanguageSaveInProcess: '=',
    preferredLanguage: '<',
    preferredLanguageOptions: '<',
    onChangeFn: '&',
    description: '<',
  };
}
