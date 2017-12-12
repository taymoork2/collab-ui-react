import { CallPickupGroupService, IPickupGroup } from 'modules/call/features/call-pickup/shared';

class CallPickupNameCtrl implements ng.IComponentController {
  public callPickupName: string;
  public errorNameInput: boolean = false;
  private onUpdate: Function;
  private listOfCallPickups: ng.IPromise<IPickupGroup[]> ;
  public isNew: boolean;
  public ucKeyup?: Function;
  public ucKeypress?: Function;

  /* @ngInject */
  constructor(
    private CallPickupGroupService: CallPickupGroupService,
  ) {
    this.listOfCallPickups = this.CallPickupGroupService.getListOfPickupGroups();
  }

  public onChange(): void {
    const scope = this;
    const reg = /^$|^[A-Za-z\-\_\d\s]+$/;
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
    .then((callPickups) => {
      _.mapValues(callPickups, callPickup => callPickup.name.toLowerCase());
      return (_.findIndex(callPickups, { name : name.toLowerCase() }) === -1) ?  true : false;
    });
  }

  public keyup($event: KeyboardEvent) {
    if (_.isFunction(this.ucKeyup)) {
      this.ucKeyup({ $event: $event });
    }
  }

  public keypress($event: KeyboardEvent) {
    if (_.isFunction(this.ucKeypress)) {
      this.ucKeypress({ $event: $event });
    }
  }
}

export class CallPickupNameComponent implements ng.IComponentOptions {
  public controller = CallPickupNameCtrl;
  public template = require('modules/call/features/call-pickup/call-pickup-name/call-pickup-name.component.html');
  public bindings = {
    onUpdate: '&',
    callPickupName: '<',
    isNew: '<',
    ucKeyup: '&?',
    ucKeypress: '&?',
  };
}
