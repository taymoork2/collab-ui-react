interface IAdminListItem {
  readonly email: string;
  readonly displayName: string;
}

class AdminListCtrl implements ng.IComponentController {
  public static readonly DEFAULT_DISPLAY_LIMIT: number = 3;
  public static readonly DEFAULT_ORDER_BY: string = 'email';

  public members: IAdminListItem[];
  private _orderBy: string | undefined;
  private _displayLimit: number | undefined;
  private displayLimitReset: number;
  private isExpanded: boolean;

  //////////

  get orderBy(): string {
    return this._orderBy || AdminListCtrl.DEFAULT_ORDER_BY;
  }

  set orderBy(val: string) {
    this._orderBy = val;
  }

  get displayLimit(): number {
    return this._displayLimit || AdminListCtrl.DEFAULT_DISPLAY_LIMIT;
  }

  set displayLimit(val: number) {
    this._displayLimit = val;
  }

  //////////

  /* @ngInject */
  constructor() {}

  public $onInit(): void {
    this.isExpanded = false;
    this.displayLimitReset = this.displayLimit;
  }

  public showToggleLink(): boolean {
    return _.get(this, 'members.length', 0) > this.displayLimitReset;
  }

  public showDisplayName(admin: IAdminListItem): boolean {
    return !!admin.displayName && admin.displayName !== admin.email;
  }

  public toggleList() {
    this.displayLimit = (this.isExpanded) ? this.displayLimitReset : _.get(this, 'members.length', 0);
    this.isExpanded = !this.isExpanded;
  }
}

export class AdminListComponent implements ng.IComponentOptions {
  public controller = AdminListCtrl;
  public template = require('modules/core/customers/customerSubscriptions/adminList/adminList.html');
  public bindings = {
    displayLimit: '<?',
    members: '<',
    orderBy: '@?',
    title: '@',
  };
}
