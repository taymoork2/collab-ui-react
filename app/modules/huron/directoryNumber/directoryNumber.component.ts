import { INumber } from 'modules/huron/numbers';
interface IDirectoryNumberOption {
  value: string | null;
  label: string;
}

class DirectoryNumber implements ng.IComponentController {

  public externalRefreshFn: Function;
  public externalSelected: IDirectoryNumberOption;
  public externalNumbers: string[];
  public inputPlaceholder: string;
  public internalNumbers: INumber[];
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

  private isHI1484: boolean = false;
  private isLoading: boolean = true;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
  ) { }

  public $onInit(): void {
    this.inputPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.placeholder = this.$translate.instant('directoryNumberPanel.chooseNumber');
    this.nonePlaceholder = this.$translate.instant('directoryNumberPanel.none');
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(result => this.isHI1484 = result)
    .finally( () => {
      this.noneOption = {
        value: null,
        label: this.nonePlaceholder,
      };
      this.isLoading = false;
    });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (!this.isLoading) {
      const {
        internalNumbers,
        externalNumbers,
        internalSelected,
        externalSelected,
      } = changes;

      // populate internalOptions
      if (internalNumbers) {
        if (internalNumbers.currentValue && _.isArray(internalNumbers.currentValue)) {
          if (this.isHI1484) {
            this.internalOptions = this.convertStringArrayToDirectoryNumberOptionsArrayInternalLocation(internalNumbers.currentValue as string[]);
          } else {
            this.internalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(internalNumbers.currentValue as string[]);
          }
        }
      }

      // populate externalOptions
      if (externalNumbers) {
        if (externalNumbers.currentValue && _.isArray(externalNumbers.currentValue)) {
          this.externalOptions = this.convertStringArrayToDirectoryNumberOptionsArray(externalNumbers.currentValue as string[]);
          this.externalOptions.unshift(this.noneOption);
        }
      }

      // add internalSelected as an IDirectoryNumberOption object to internalOptions
      if (internalSelected && internalSelected.currentValue) {
        if (this.isHI1484) {
          this.internalSelected = this.setCurrentOptionFromLineObject(internalSelected.currentValue);
        } else {
          this.internalSelected = this.setCurrentOption(internalSelected.currentValue, this.internalOptions);
        }
      }

      // add externalSelected as an IDirectoryNumberOption object to externalOptions
      if (externalSelected) {
        if (externalSelected.currentValue) {
          this.externalSelected = this.setCurrentOption(externalSelected.currentValue, this.externalOptions);
        } else {
          this.externalSelected = this.noneOption;
        }
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

  public compareInternalAndSiteToSiteNumber(): boolean {
    if (_.isString(this.internalSelected)) {
      return true;
    } else if (_.isUndefined(this.internalSelected)) {
      return true;
    } else {
      return this.internalSelected.value === this.internalSelected.label;
    }
  }

  private setCurrentOptionFromLineObject(currentValue: any) {
    const existingOption: IDirectoryNumberOption = _.find(this.internalOptions, { value: currentValue.internal });
    if (!existingOption) {
      const currentExternalNumberOption: IDirectoryNumberOption = {
        value: currentValue.internal,
        label: currentValue.siteToSite,
      };
      this.internalOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

  private setCurrentOption(currentValue: string, existingOptions: IDirectoryNumberOption[]) {
    const existingOption: IDirectoryNumberOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      const currentExternalNumberOption: IDirectoryNumberOption = {
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
      externalNumber: _.get(this.externalSelected, 'value', null),
    });
  }

  private setMatchingExternalNumber(): void {
    const matchingExternalNumber = _.find(this.externalOptions, (externalOption) => {
      if (_.isString(externalOption.value) && _.isString(this.internalSelected.label)) {
        return _.endsWith(externalOption.value, this.internalSelected.label);
      }
    });

    if (matchingExternalNumber) {
      this.externalSelected = matchingExternalNumber;
    }
  }

  private convertStringArrayToDirectoryNumberOptionsArrayInternalLocation(dirNumbers: any[]): IDirectoryNumberOption[] {
    return _.map(dirNumbers, (dirNumber) => {
      return {
        value: dirNumber.internal,
        label: dirNumber.siteToSite,
      };
    });
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
  public template = require('modules/huron/directoryNumber/directoryNumber.html');
  public bindings = {
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
