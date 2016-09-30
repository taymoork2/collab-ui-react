class PagingGroupNameCtrl implements ng.IComponentController {
  public pagingGroupName: string;
  public errorNameInput: boolean = false;
  private onUpdate: Function;

  public onChange(): void {
    this.errorNameInput = this.pagingGroupName.indexOf('<') !== -1 || this.pagingGroupName.indexOf('>') !== -1;
    this.onUpdate({
      name: this.pagingGroupName,
      isValid: !this.errorNameInput,
    });
  }
}

export class PgNameComponent implements ng.IComponentOptions {
  public controller = PagingGroupNameCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgName/pgName.html';
  public bindings = {
    onUpdate: '&',
    pagingGroupName: '<',
  };
}
