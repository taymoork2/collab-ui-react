import { FallbackDestination } from 'modules/huron/features/callPark/services/callPark';
import { CallParkService } from 'modules/huron/features/callPark/services';
import { MemberService, Member } from 'modules/huron/members';
import { NumberService } from 'modules/huron/numbers';
import { Line } from 'modules/huron/lines/services/line';

class CallParkReversionCtrl implements ng.IComponentController {
  public fallbackDestination: FallbackDestination;
  public onChangeFn: Function;
  public onMemberRemovedFn: Function;

  public callDestInputs: Array<string> = ['internal', 'external'];
  public reversionType: string = 'parker';
  public selectedReversionNumber: any;
  public showReversionLookup: boolean;
  public showMember: boolean;
  public openPanel: boolean = false;
  public cpReversionForm: ng.IFormController;
  public directoryNumber: any;

  /* @ngInject */
  constructor(
    private MemberService: MemberService,
    private NumberService: NumberService,
    private CallParkService: CallParkService,
    private CustomerVoiceCmiService,
    private TelephoneNumberService,
    private Authinfo,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let callParkChanges = changes['fallbackDestination'];
    if (callParkChanges && callParkChanges.currentValue) {
      if (this.cpReversionForm) {
        this.cpReversionForm.$setValidity('', true, this.cpReversionForm);
      }
      this.processCallParkReversionChanges(callParkChanges);
    }
  }

  private processCallParkReversionChanges(callParkChanges: ng.IChangesObject): void {
    if (_.isNull(callParkChanges.currentValue.number) && _.isNull(callParkChanges.currentValue.numberUuid)) {
      this.reversionType = 'parker';
      this.showMember = false;
      this.showReversionLookup = false;
      this.selectedReversionNumber = undefined;
    } else {
      this.reversionType = 'destination';
      this.directoryNumber = undefined;
      if (!_.isNull(callParkChanges.currentValue.numberUuid)) {
        this.showMember = true;
        this.showReversionLookup = false;
        this.CallParkService.getDirectoryNumber(callParkChanges.currentValue.numberUuid).then( (dn) => this.directoryNumber = dn);
      } else {
        this.isValidInternalNumber(callParkChanges.currentValue.number).then( isInternalNumber => {
          if (isInternalNumber) {
            this.showMember = true;
            this.showReversionLookup = false;
          } else {
            this.selectedReversionNumber = this.TelephoneNumberService.getDestinationObject(callParkChanges.currentValue.number);
            this.showMember = false;
            this.showReversionLookup = true;
          }
        });
      }
    }
  }

  public getMemberList(value: any): ng.IPromise<Array<any>> {
    if (isNaN(value)) {
      return this.MemberService.getMemberList(value, true).then( members => {
        return members;
      });
    } else {
      return this.NumberService.getNumberList(value, undefined, true).then(numbers => {
        return numbers;
      });
    }
  }

  public isValidInternalNumber(number: string): ng.IPromise<boolean> {
    return this.NumberService.getNumberList(number, undefined, true).then( numbers => {
      return numbers.length > 0;
    });
  }

  public getExternalRegionCode(): ng.IPromise<any> {
    return this.CustomerVoiceCmiService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public onSelectReversionMember(data: any): void {
    this.cpReversionForm.$setValidity('', true, this.cpReversionForm);
    this.selectedReversionNumber = undefined;
    this.showMember = true;
    this.showReversionLookup = false;
    let fallbackDestination = new FallbackDestination({
      name: this.CallParkService.getDisplayName(<Member>data) || data.number,
      numberUuid: _.get<string | null>(this.getPrimaryNumber(<Member>data), 'uuid', null),
      number: _.get<string | null>(data, 'number', null),
      memberUuid: data.uuid,
      sendToVoicemail: false,
    });
    this.onChangeFn({
      fallbackDestination: fallbackDestination,
    });
  }

  public setSelectedReversionNumber(model) {
    _.set(this, 'selectedReversionNumber', model);
  }

  public toggleMemberPanel(): void {
    if (this.openPanel) {
      this.openPanel = false;
    } else {
      this.openPanel = true;
    }
  }

  public onSelectRevertToParker(): void {
    this.cpReversionForm.$setValidity('', true, this.cpReversionForm);
    this.onChangeFn({
      fallbackDestination: new FallbackDestination(),
    });
  }

  public onSelectAnotherDestination(): void {
    this.cpReversionForm.$setValidity('', false, this.cpReversionForm);
    this.showMember = false;
    this.showReversionLookup = true;
  }

  public onChangeSendToVoicemail(): void {
    let fallbackDestination = new FallbackDestination({
      name: this.fallbackDestination.name,
      numberUuid: this.fallbackDestination.numberUuid,
      number: this.fallbackDestination.number,
      memberUuid: this.fallbackDestination.memberUuid,
      sendToVoicemail: this.fallbackDestination.sendToVoicemail,
    });
    this.onChangeFn({
      fallbackDestination: fallbackDestination,
    });
  }

  public removeMember(): void {
    this.openPanel = false;
    this.showMember = false;
    this.showReversionLookup = true;
    this.cpReversionForm.$setValidity('', false, this.cpReversionForm);
    this.onMemberRemovedFn();
  }

  public validateReversionNumber(): void {
    if (_.isObject(this.selectedReversionNumber)) {
      this.TelephoneNumberService.setRegionCode(_.get(this.selectedReversionNumber, 'code'));
      let isValid = this.TelephoneNumberService.validateDID(_.get(this.selectedReversionNumber, 'phoneNumber'));
      if (isValid) {
        this.cpReversionForm.$setValidity('', true, this.cpReversionForm);
        let number = this.TelephoneNumberService.getDIDValue(_.get(this.selectedReversionNumber, 'phoneNumber'));
        let fallbackDestination = new FallbackDestination({
          name: null,
          numberUuid: null,
          number: number,
          memberUuid: null,
          sendToVoicemail: false,
        });
        this.onChangeFn({
          fallbackDestination: fallbackDestination,
        });
      }
    }
  }

  private getPrimaryNumber(member: Member): Line {
    return _.find<Line>(member.numbers, (item) => {
      return item.primary === true;
    });
  }

}

export class CallParkReversionComponent implements ng.IComponentOptions {
  public controller = CallParkReversionCtrl;
  public templateUrl = 'modules/huron/features/callPark/callParkReversion/callParkReversion.html';
  public bindings = {
    fallbackDestination: '<',
    onMemberRemovedFn: '&',
    onChangeFn: '&',
  };
}
