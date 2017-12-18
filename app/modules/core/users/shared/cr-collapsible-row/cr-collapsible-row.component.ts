class CrCollapsibleRowController implements ng.IComponentController {
  public showContent: boolean;
  private onUpdate: Function;
  private rowId: string;
  private rowTitle: string;

  public $onInit(): void {
    if (!this.rowTitle) {
      this.rowTitle = this.rowId;
    }
  }

  public toggleContent(): void {
    this.showContent = !this.showContent;
    this.onUpdate({
      $event: {
        itemId: this.rowId,
        item: {
          showContent: this.showContent,
        },
      },
    });
  }
}

export class CrCollapsibleRowComponent implements ng.IComponentOptions {
  public controller = CrCollapsibleRowController;
  public template = require('./cr-collapsible-row.html');
  public transclude = true;
  public bindings = {
    rowId: '<',
    rowTitle: '<?',
    headerClass: '@?',
    contentClass: '@?',
    showContent: '<?',
    onUpdate: '&',
  };
}
