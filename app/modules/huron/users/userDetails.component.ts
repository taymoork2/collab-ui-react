interface IUserDetailsFeature {
  detail?: string | undefined;
  name: string;
  state?: string;
  actionAvailable?: boolean;
}

class UserDetails implements ng.IComponentController {
  public details: IUserDetailsFeature[];
  public onUserDetailClick: Function;
  public hasOnUserDetailClick: boolean = false;
  public hasActionAvailable: boolean = false;
  public dirsyncEnabled: boolean = false;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
  ) { }

  public action(userDetail: IUserDetailsFeature) {
    if (userDetail.actionAvailable) {
      this.onUserDetailClick({
        userDetail: userDetail,
      });
    }
  }

  public $onInit() {
    this.$scope.$watchCollection(
      () => this.details,
      (details) => this.determineHasActionAvailable(details),
    );
  }

  private determineHasActionAvailable(details: IUserDetailsFeature[]): void {
    this.hasActionAvailable = _.some(details, 'actionAvailable');
    this.dirsyncEnabled = _.some(details, 'dirsyncEnabled');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { details } = changes;
    if (details && details.currentValue && _.isArray(details.currentValue)) {
      const detailChanges = <IUserDetailsFeature[]> details.currentValue;
      this.determineHasActionAvailable(detailChanges);
      this.details = detailChanges;
    }
  }

  public $postLink() {
    this.hasOnUserDetailClick = Boolean(this.$element.attr('on-user-detail-click'));
  }
}

export class UserDetailsComponent implements ng.IComponentOptions {
  public controller = UserDetails;
  public templateUrl = 'modules/huron/users/userDetails.html';
  public bindings = {
    details: '<',
    onUserDetailClick: '&',
  };
}
