
/**
 * Display a 3-column row with  [name] [status], and [link]
 */
class DirSyncStatusRowController implements ng.IComponentController {
  public name: string;
  public enabled: boolean;
  public onClick: Function;
  public linkTitle: string;

  constructor(
  ) {
  }

  public $onInit() {
  }

  public $onChanges(_changes: { [bindings: string]: ng.IChangesObject }) {
  }

  public handleClick(): void {
    this.onClick();
  }

}

/////////////////////

export class DirSyncStatusRowComponent implements ng.IComponentOptions {
  public controller = DirSyncStatusRowController;
  public templateUrl = 'modules/core/settings/dirsync/dirSyncStatusRow.html';
  public bindings = {
    name: '<',
    enabled: '<',
    linkTitle: '<',
    onClick: '&',
  };
}

angular
  .module('Core')
  .component('dirSyncStatusRow', new DirSyncStatusRowComponent());

