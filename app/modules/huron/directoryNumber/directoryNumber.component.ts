interface IDirectoryNumberOption {
  uuid: string,
  pattern: string,
}

class DirectoryNumberCtrl {
  public externalOptions: IDirectoryNumberOption[];
  public externalRefreshFn: Function;
  public externalSelected: IDirectoryNumberOption;
  public inputPlaceholder: string;
  public internalOptions: IDirectoryNumberOption[];
  public internalRefreshFn: Function;
  public internalSelected: IDirectoryNumberOption;
  public nonePlaceholder: string;
  public onChangeFn: Function;
  public placeholder: string;
  public showInternalExtensions: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService
  ) {}

  private $onInit(): void {
    this.inputPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.nonePlaceholder = this.$translate.instant('directoryNumberPanel.none');
    this.placeholder = this.$translate.instant('directoryNumberPanel.chooseNumber');
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

  private change(): void {
    this.onChangeFn({
      internalNumber: this.internalSelected,
      externalNumber: this.externalSelected,
    });
  }

  private setMatchingExternalNumber(): void {
    let matchingExternalNumber = _.find(this.externalOptions, (externalOption) => {
      return _.endsWith(externalOption.pattern, this.internalSelected.pattern);
    });
    if (matchingExternalNumber) {
      this.externalSelected = matchingExternalNumber;
    }
  }
}

class DirectoryNumberComponent implements ng.IComponentOptions {
  public controller = DirectoryNumberCtrl;
  public templateUrl = 'modules/huron/directoryNumber/directoryNumber.html';
  public bindings: {[binding: string]: string} = {
    showInternalExtensions: '<',
    internalSelected: '<',
    internalOptions: '<',
    internalRefreshFn: '&',
    internalIsWarn: '<',
    internalWarnMsg: '<',
    esnPrefix: '<',
    externalSelected: '<',
    externalOptions: '<',
    externalRefreshFn: '&',
    onChangeFn: '&',
  };
}

export default angular
  .module('huron.directory-number', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
  ])
  .component('ucDirectoryNumber', new DirectoryNumberComponent())
  .name;
