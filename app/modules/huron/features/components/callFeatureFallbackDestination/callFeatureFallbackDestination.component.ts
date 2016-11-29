import { CallFeatureFallbackDestinationService, FallbackDestination } from 'modules/huron/features/components/callFeatureFallbackDestination/services';
import { MemberService, Member } from 'modules/huron/members';
import { NumberService } from 'modules/huron/numbers';
import { Line } from 'modules/huron/lines/services/line';
import { FeatureMemberService } from 'modules/huron/features/services';
import { VoicemailService } from 'modules/huron/voicemail/services';

class CallFeatureFallbackDestinationCtrl implements ng.IComponentController {
  public fallbackDestination: FallbackDestination;
  public showReversionLookup: boolean;
  public isNew: boolean;
  public onChangeFn: Function;

  public callDestInputs: Array<string> = ['internal', 'external'];

  public selectedReversionNumber: any;
  public showMember: boolean;
  public fallbackDestForm: ng.IFormController;
  public directoryNumber: any;
  public hasVoicemail: boolean = false;
  public thumbnailSrc: string | undefined = undefined;

  /* @ngInject */
  constructor(
    private MemberService: MemberService,
    private NumberService: NumberService,
    private VoicemailService: VoicemailService,
    private FeatureMemberService: FeatureMemberService,
    private CallFeatureFallbackDestinationService: CallFeatureFallbackDestinationService,
    private CustomerVoiceCmiService,
    private TelephoneNumberService,
    private Authinfo,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { fallbackDestination, showReversionLookup } = changes;
    if (fallbackDestination && fallbackDestination.currentValue) {
      if (this.fallbackDestForm) {
        this.fallbackDestForm.$setValidity('', true, this.fallbackDestForm);
      }
      this.processCallFeatureFallbackDestChanges(fallbackDestination);
    }

    if (showReversionLookup && showReversionLookup.currentValue) {
      if (this.fallbackDestForm && showReversionLookup.currentValue) {
        this.fallbackDestForm.$setValidity('', false, this.fallbackDestForm);
      }
    }
  }

  private processCallFeatureFallbackDestChanges(fallbackDestinationChanges: ng.IChangesObject): void {
    if (_.isNull(fallbackDestinationChanges.currentValue.number) && _.isNull(fallbackDestinationChanges.currentValue.numberUuid)) {
      this.showMember = false;
      this.showReversionLookup = false;
      this.selectedReversionNumber = undefined;
    } else {
      if (!_.isNull(fallbackDestinationChanges.currentValue.numberUuid)) {
        this.showMember = true;
        this.showReversionLookup = false;
        this.CallFeatureFallbackDestinationService.getDirectoryNumber(fallbackDestinationChanges.currentValue.numberUuid).then( dn => this.directoryNumber = dn);
        this.VoicemailService.isVoiceMailEnabledForDnOwner(fallbackDestinationChanges.currentValue.numberUuid).then( isEnabled => this.hasVoicemail = isEnabled);
        if (!_.isNull(fallbackDestinationChanges.currentValue.memberUuid)) {
          this.FeatureMemberService.getMemberPicture(fallbackDestinationChanges.currentValue.memberUuid)
            .then(featureMember => this.thumbnailSrc = featureMember.thumbnailSrc);
        }
      } else {
        this.directoryNumber = undefined;
        this.hasVoicemail = false;
        if (!_.isNull(fallbackDestinationChanges.currentValue.number)) {
          this.showMember = true;
          this.showReversionLookup = false;
        } else {
          this.showMember = false;
          this.showReversionLookup = true;
        }
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

  public getExternalRegionCode(): ng.IPromise<any> {
    return this.CustomerVoiceCmiService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public onSelectReversionMember(data: any): void {
    this.fallbackDestForm.$setValidity('', true, this.fallbackDestForm);
    this.selectedReversionNumber = undefined;
    this.showMember = true;
    this.showReversionLookup = false;
    let fallbackDestination: FallbackDestination;

    if (_.has(data, 'directoryNumber')) { // number
      fallbackDestination = new FallbackDestination({
        number: _.get<string | null>(data, 'number', null),
        numberUuid: null,
        sendToVoicemail: false,
      });
    } else { // member
      fallbackDestination = new FallbackDestination({
        name: this.CallFeatureFallbackDestinationService.getDisplayName(<Member>data),
        numberUuid: _.get<string | null>(this.getPrimaryNumber(<Member>data), 'uuid', null),
        memberUuid: _.get(data, 'uuid', null),
        sendToVoicemail: false,
      });
    }
    this.onChangeFn({
      fallbackDestination: fallbackDestination,
    });
  }

  public setSelectedReversionNumber(model) {
    this.selectedReversionNumber = model;
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
    this.selectedReversionNumber = undefined;
    this.showMember = false;
    this.showReversionLookup = true;
    this.fallbackDestForm.$setDirty();
    this.fallbackDestForm.$setValidity('', false, this.fallbackDestForm);
    this.thumbnailSrc = undefined;
  }

  public validateReversionNumber(): void {
    if (_.isObject(this.selectedReversionNumber)) {
      this.TelephoneNumberService.setRegionCode(_.get(this.selectedReversionNumber, 'code'));
      let isValid = this.TelephoneNumberService.validateDID(_.get(this.selectedReversionNumber, 'phoneNumber'));
      if (isValid) {
        this.fallbackDestForm.$setValidity('', true, this.fallbackDestForm);
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

export class CallFeatureFallbackDestinationComponent implements ng.IComponentOptions {
  public controller = CallFeatureFallbackDestinationCtrl;
  public templateUrl = 'modules/huron/features/components/callFeatureFallbackDestination/callFeatureFallbackDestination.html';
  public bindings = {
    fallbackDestination: '<',
    showReversionLookup: '<',
    isNew: '<',
    onChangeFn: '&',
  };
}
