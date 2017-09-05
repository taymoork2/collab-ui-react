class PagingGroupNumberCtrl implements ng.IComponentController {
  public extension: string;
  public internalNumberOptions: string[];
  public onNumberFilter: Function;
  public onChangeFn: Function;
  public filterPlaceholder: string;
  public selected: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { extension, internalNumberOptions } = changes;

    if (extension && extension.currentValue) {
      this.selected = this.setCurrentOption(extension.currentValue, this.internalNumberOptions);
    }

    if (internalNumberOptions && internalNumberOptions.currentValue) {
      this.setCurrentOption(this.selected, internalNumberOptions.currentValue);
    }
  }

  public onNumberChanged(): void {
    this.onChangeFn({
      extension: this.selected,
    });
  }

  public fetchNumbers(filter): void {
    this.onNumberFilter({
      filter: filter,
    });
  }

  private setCurrentOption(currentValue: string, existingOptions: string[]): string {
    if (_.indexOf(existingOptions, currentValue) === -1) {
      existingOptions.unshift(currentValue);
    }
    return currentValue;
  }

}

export class PagingGroupNumberComponent implements ng.IComponentOptions {
  public controller = PagingGroupNumberCtrl;
  public template = require('modules/call/features/paging-group/paging-group-number/paging-group-number.component.html');
  public bindings = {
    extension: '<',
    internalNumberOptions: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
