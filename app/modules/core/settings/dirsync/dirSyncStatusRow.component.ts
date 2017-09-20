
/**
 * Display a 3-column row with  [name] [status], and [link]
 */
class DirSyncStatusRowController implements ng.IComponentController {
  public name: string;
  public enabled: boolean;
  public onClick: Function;
  public linkTitle: string;
  public statusClass: string;

  constructor(
  ) {
  }

  public $onInit() {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { enabled } = changes;
    if (enabled) {
      this.statusClass = enabled.currentValue ? 'success' : 'disabled';
    }
  }

  public handleClick(): void {
    this.onClick();
  }
}

/////////////////////

export class DirSyncStatusRowComponent implements ng.IComponentOptions {
  public controller = DirSyncStatusRowController;
  public template = require('modules/core/settings/dirsync/dirSyncStatusRow.html');
  public bindings = {
    name: '<',
    enabled: '<',
    linkTitle: '<',
    onClick: '&',
  };
}
