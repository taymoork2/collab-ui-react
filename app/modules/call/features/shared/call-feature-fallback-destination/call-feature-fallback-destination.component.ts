import { CallFeatureFallbackDestinationService, FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { MemberService, Member } from 'modules/huron/members';
import { NumberService } from 'modules/huron/numbers';
import { Line } from 'modules/huron/lines/services/line';
import { FeatureMemberService } from 'modules/huron/features/services';
import { HuronVoicemailService } from 'modules/huron/voicemail';

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
    private HuronVoicemailService: HuronVoicemailService,
    private FeatureMemberService: FeatureMemberService,
    private CallFeatureFallbackDestinationService: CallFeatureFallbackDestinationService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { fallbackDestination, showReversionLookup } = changes;
    if (fallbackDestination && fallbackDestination.currentValue) {
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
      this.selectedReversionNumber = '';
    } else {
      if (!_.isNull(fallbackDestinationChanges.currentValue.numberUuid)) {
        this.showMember = true;
        this.showReversionLookup = false;
        this.CallFeatureFallbackDestinationService.getDirectoryNumber(fallbackDestinationChanges.currentValue.numberUuid).then( dn => this.directoryNumber = dn);
        this.HuronVoicemailService.isEnabledForDnOwner(fallbackDestinationChanges.currentValue.numberUuid).then( isEnabled => this.hasVoicemail = isEnabled);
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

  public onSelectReversionMember(data: any): void {
    this.fallbackDestForm.$setValidity('', true, this.fallbackDestForm);
    this.selectedReversionNumber = '';
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
    this.fallbackDestForm.$setValidity('', true, this.fallbackDestForm);
    this.selectedReversionNumber = '';
    this.onChangeFn({
      fallbackDestination: new FallbackDestination({
        number: model,
        numberUuid: null,
        sendToVoicemail: false,
      }),
    });
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
    this.selectedReversionNumber = '';
    this.showMember = false;
    this.showReversionLookup = true;
    this.fallbackDestForm.$setDirty();
    this.fallbackDestForm.$setValidity('', false, this.fallbackDestForm);
    this.thumbnailSrc = undefined;
  }

  private getPrimaryNumber(member: Member): Line {
    return _.find<Line>(member.numbers, (item) => {
      return item.primary === true;
    });
  }

}

export class CallFeatureFallbackDestinationComponent implements ng.IComponentOptions {
  public controller = CallFeatureFallbackDestinationCtrl;
  public templateUrl = 'modules/call/features/shared/call-feature-fallback-destination/call-feature-fallback-destination.component.html';
  public bindings = {
    fallbackDestination: '<',
    showReversionLookup: '<',
    isNew: '<',
    onChangeFn: '&',
  };
}
