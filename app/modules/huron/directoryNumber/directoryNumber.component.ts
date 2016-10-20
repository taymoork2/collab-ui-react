interface IDirectoryNumberOption {
  value: string | null;
  label: string;
}

class DirectoryNumber implements ng.IComponentController {

  public externalRefreshFn: Function;
  public externalSelected: IDirectoryNumberOption;
  public externalNumbers: string[];
  public inputPlaceholder: string;
  public internalNumbers: string[];
  public esnPrefix: string;
  public internalRefreshFn: Function;
  public internalSelected: IDirectoryNumberOption;
  public nonePlaceholder: string;
  public onChangeFn: Function;
  public placeholder: string;
  public showInternalExtensions: boolean;

  private externalOptions: IDirectoryNumberOption[] = [];
  private internalOptions: IDirectoryNumberOption[] = [];
  private noneOption: IDirectoryNumberOption;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService
  ) {
    this.inputPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.placeholder = this.$translate.instant('directoryNumberPanel.chooseNumber');
    this.nonePlaceholder = this.$translate.instant('directoryNumberPanel.none');
    this.noneOption = {
      value: null,
      label: this.nonePlaceholder,
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    // populate internalOptions
    let internalNumbersChange = changes['internalNumbers'];
    if (internalNumbersChange) {
      if (internalNumbersChange.currentValue && _.isArray(internalNumbersChange.currentValue)) {
        this.internalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(internalNumbersChange.currentValue as string[]);
      }
    }

    // populate externalOptions
    let externalNumbersChange = changes['externalNumbers'];
    if (externalNumbersChange) {
      if (externalNumbersChange.currentValue && _.isArray(externalNumbersChange.currentValue)) {
        this.externalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(externalNumbersChange.currentValue as string[]);
        this.externalOptions.unshift(this.noneOption);
      }
    }

    // add internalSelected as an IDirectoryNumberOption object to internalOptions
    let internalSelectedChange = changes['internalSelected'];
    if (internalSelectedChange) {
      if (internalSelectedChange.currentValue) {
        this.internalSelected = this.setCurrentOption(internalSelectedChange.currentValue, this.internalOptions);
      }
    }

    // add externalSelected as an IDirectoryNumberOption object to externalOptions
    let externalSelectedChange = changes['externalSelected'];
    if (externalSelectedChange) {
      if (externalSelectedChange.currentValue) {
        this.externalSelected = this.setCurrentOption(externalSelectedChange.currentValue, this.externalOptions);
      } else {
        this.externalSelected = this.noneOption;
      }
    }
  }

  public get showExtensions(): boolean {
    return _.isUndefined(this.showInternalExtensions) || this.showInternalExtensions;
  }

  public changeInternal(): void {
    if (!this.showExtensions) {
      this.setMatchingExternalNumber();
    }
    this.change();
  }

  public changeExternal(): void {
    this.change();
  }

  public refreshInternal(filter: string): void {
    this.internalRefreshFn({
      filter: filter,
    });
  }

  public refreshExternal(filter: string): void {
    this.externalRefreshFn({
      filter: filter,
    });
  }

  private setCurrentOption(currentValue: string, existingOptions: IDirectoryNumberOption[]) {
    let existingOption: IDirectoryNumberOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      let currentExternalNumberOption: IDirectoryNumberOption = {
        value: currentValue,
        label: currentValue,
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

  private change(): void {
    this.onChangeFn({
      internalNumber: this.internalSelected.value,
      externalNumber: this.externalSelected.value,
    });
  }

  private setMatchingExternalNumber(): void {
    let matchingExternalNumber = _.find(this.externalOptions, (externalOption) => {
      if (_.isString(externalOption.value) && _.isString(this.internalSelected.value)) {
        return _.endsWith(externalOption.value, this.internalSelected.value);
      }
    });

    if (matchingExternalNumber) {
      this.externalSelected = matchingExternalNumber;
    }
  }

  private convertStringArrayToDirectoryNumberOptionsArray(dirNumbers: string[]): IDirectoryNumberOption[] {
    return _.map(dirNumbers, (dirNumber) => {
      return {
        value: dirNumber,
        label: dirNumber,
      };
    });
  }

}

export class DirectoryNumberComponent implements ng.IComponentOptions {
  public controller = DirectoryNumber;
  public templateUrl = 'modules/huron/directoryNumber/directoryNumber.html';
  public bindings = <{ [binding: string]: string }>{
    showInternalExtensions: '<',
    internalSelected: '<',
    internalNumbers: '<',
    internalRefreshFn: '&',
    internalIsWarn: '<',
    internalWarnMsg: '<',
    esnPrefix: '<',
    externalSelected: '<',
    externalNumbers: '<',
    externalRefreshFn: '&',
    onChangeFn: '&',
  };
}
