import { CallPickupGroupService } from 'modules/huron/features/callPickup/services/callPickupGroup.service';
import { IPickupGroup } from 'modules/huron/features/callPickup/services';

class CallPickupNameCtrl implements ng.IComponentController {
  public callPickupName: string;
  public errorNameInput: boolean = false;
  private onUpdate: Function;
  private listOfCallPickups: ng.IPromise<IPickupGroup[]> ;
  public isNew: boolean;

  /* @ngInject */
  constructor(private CallPickupGroupService: CallPickupGroupService,
              ) {
    this.listOfCallPickups = this.CallPickupGroupService.getListOfPickupGroups();
  }

  public onChange(): void {
    let scope = this;
    let reg = /^$|^[A-Za-z\-\_\d\s]+$/;
    this.uniquePickupName(this.callPickupName).then(function(unique){
      scope.errorNameInput = !reg.test(scope.callPickupName) || !unique;
      scope.onUpdate({
        name: scope.callPickupName,
        isValid: !scope.errorNameInput,
      });
    });
  }

  public uniquePickupName(name: string): ng.IPromise<boolean> {
    return this.listOfCallPickups
    .then(
      (callPickups) => {
        _.mapValues(callPickups, callPickup => callPickup.name.toLowerCase());
        return (_.findIndex(callPickups, { name : name.toLowerCase() }) === -1) ?  true : false;
    });
  }
}

export class CallPickupNameComponent implements ng.IComponentOptions {
  public controller = CallPickupNameCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupName/callPickupName.html';
  public bindings = {
    onUpdate: '&',
    callPickupName: '<',
    isNew: '<',
  };
}
