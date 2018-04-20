import { IOption } from 'modules/huron/dialing/dialing.service';

class PreferredLanguageCtrl implements ng.IComponentController {
  public preferredLanguage: string;
  public selected: IOption;
  public onChangeFn: Function;
  public preferredLanguageOptions: IOption[];
  public preferredLanguagePlaceholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.preferredLanguagePlaceholder = this.$translate.instant('serviceSetupModal.preferredLanguagePlaceholder');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { preferredLanguage } = changes;
    if (preferredLanguage && preferredLanguage.currentValue) {
      this.selected = _.find(this.preferredLanguageOptions, { value: this.preferredLanguage });
    }
  }

  public onPreferredLanguageChanged() {
    this.onChangeFn({
      preferredLanguage: _.get(this.selected, 'value'),
    });
  }
}

export class PreferredLanguageComponent implements ng.IComponentOptions {
  public controller = PreferredLanguageCtrl;
  public template = require('modules/call/settings/settings-preferred-language/settings-preferred-language.component.html');
  public bindings = {
    preferredLanguage: '<',
    preferredLanguageOptions: '<',
    onChangeFn: '&',
  };
}
