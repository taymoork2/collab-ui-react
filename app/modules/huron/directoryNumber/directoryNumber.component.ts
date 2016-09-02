interface IDirectoryNumberOption {
  value: string,
  label: string,
}

class DirectoryNumber {

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

  private $onChanges(changes): void {
    // populate internalOptions
    if (changes.internalNumbers) {
      if (changes.internalNumbers.currentValue && _.isArray(changes.internalNumbers.currentValue)) {
        this.internalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(changes.internalNumbers.currentValue);
      }
    }

    // populate externalOptions
    if (changes.externalNumbers) {
      if (changes.externalNumbers.currentValue && _.isArray(changes.externalNumbers.currentValue)) {
        this.externalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(changes.externalNumbers.currentValue);
        this.externalOptions.unshift(this.noneOption);
      }
    }

    // add internalSelected as an IDirectoryNumberOption object to internalOptions
    if (changes.internalSelected) {
      if (changes.internalSelected.currentValue) {
        this.internalSelected = this.setCurrentOption(changes.internalSelected.currentValue, this.internalOptions);
      }
    }

    // add externalSelected as an IDirectoryNumberOption object to externalOptions
    if (changes.externalSelected) {
      if (changes.externalSelected.currentValue) {
        this.externalSelected = this.setCurrentOption(changes.externalSelected.currentValue, this.externalOptions);
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
      }
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
      return _.endsWith(externalOption.value, this.internalSelected.value);
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
  public bindings: {[binding: string]: string} = {
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
