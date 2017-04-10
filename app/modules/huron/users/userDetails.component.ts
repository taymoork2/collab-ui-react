interface IUserDetailsFeatures {
  detail?: string | undefined;
  name: string;
}

class UserDetails implements ng.IComponentController {
  public details: IUserDetailsFeatures[];

  /* @ngInject */
  constructor( ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let detailChanges = changes['details'];
    if (detailChanges) {
      if (detailChanges.currentValue && _.isArray(detailChanges.currentValue)) {
        this.details = <IUserDetailsFeatures[]> detailChanges.currentValue;
      }
    }
  }
}

export class UserDetailsComponent implements ng.IComponentOptions {
  public controller = UserDetails;
  public templateUrl = 'modules/huron/users/userDetails.html';
  public bindings = {
    details: '<',
  };
}
