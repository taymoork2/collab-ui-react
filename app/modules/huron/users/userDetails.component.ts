import { LocationsService, MEMBER_TYPE_USER } from 'modules/call/locations';

interface IUserDetailsFeature {
  detail?: string | undefined;
  name: string;
  state?: string;
  actionAvailable?: boolean;
}
const SPARK_CALL_ENTITLEMENT: string = 'ciscouc';

class UserDetails implements ng.IComponentController {
  public details: IUserDetailsFeature[];
  public userDetails;
  public onUserDetailClick: Function;
  public hasOnUserDetailClick: boolean = false;
  public hasActionAvailable: boolean = false;
  public dirsyncEnabled: boolean = false;
  public ishI1484: boolean = false;
  public userLocation: string;
  public hasSparkCall: boolean;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private FeatureToggleService,
    private $q: ng.IQService,
    public $state: ng.ui.IStateService,
    public LocationsService: LocationsService,
  ) { }

  public openPanel(): void {
    this.$state.go('user-overview.userLocationDetails', { memberType: MEMBER_TYPE_USER });
  }

  public getUserLocation(): void {
    this.LocationsService.getUserLocation(this.userDetails.id).then(result => {
      this.userLocation = result.name;
    });
  }

  public action(userDetail: IUserDetailsFeature): void {
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
    this.hasSparkCall = this.hasEntitlement(SPARK_CALL_ENTITLEMENT);
    this.loadFeatureToggles();
    this.getUserLocation();
  }

  private hasEntitlement(entitlement: string): boolean {
    if (this.userDetails.entitlements) {
      for (let i: number = 0; i < this.userDetails.entitlements.length; i++) {
        if (this.userDetails.entitlements[i] === entitlement ) {
          return true;
        }
      }
    }
    return false;
  }

  private loadFeatureToggles(): ng.IPromise<any> {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(result => this.ishI1484 = result);
    return this.$q.resolve();
  }

  private determineHasActionAvailable(details: IUserDetailsFeature[]): void {
    this.hasActionAvailable = _.some(details, 'actionAvailable');
    this.dirsyncEnabled = _.some(details, 'dirsyncEnabled');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
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
  public template = require('modules/huron/users/userDetails.html');
  public bindings = {
    details: '<',
    onUserDetailClick: '&',
    userDetails: '<',
  };
}
