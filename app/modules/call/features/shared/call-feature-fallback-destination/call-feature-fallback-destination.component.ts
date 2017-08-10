import { CallFeatureFallbackDestinationService, FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { MemberService, Member } from 'modules/huron/members';
import { NumberService } from 'modules/huron/numbers';
import { Line } from 'modules/huron/lines/services/line';
import { FeatureMemberService } from 'modules/huron/features/services';
import { HuronVoicemailService } from 'modules/huron/voicemail';
import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';

class CallFeatureFallbackDestinationCtrl implements ng.IComponentController {
  public fallbackDestination: FallbackDestination;
  public showReversionLookup: boolean;
  public isNew: boolean;
  public onChangeFn: Function;

  public callDestInputs: string[] = ['internal', 'external'];

  public selectedReversionNumber: any;
  public showMember: boolean;
  public fallbackDestForm: ng.IFormController;
  public directoryNumber: any;
  public hasVoicemail: boolean = false;
  public thumbnailSrc: string | undefined = undefined;
  public isAlternate: boolean;
  public index: string = '';

  private inputTranslations: ICallDestinationTranslate;

  /* @ngInject */
  constructor(
    private MemberService: MemberService,
    private NumberService: NumberService,
    private HuronVoicemailService: HuronVoicemailService,
    private FeatureMemberService: FeatureMemberService,
    private CallFeatureFallbackDestinationService: CallFeatureFallbackDestinationService,
    private CallDestinationTranslateService: CallDestinationTranslateService,
  ) {
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { fallbackDestination, showReversionLookup, isAlternate } = changes;
    if (fallbackDestination && fallbackDestination.currentValue) {
      this.processCallFeatureFallbackDestChanges(fallbackDestination);
    }

    if (showReversionLookup && showReversionLookup.currentValue) {
      if (this.fallbackDestForm && showReversionLookup.currentValue) {
        this.fallbackDestForm.$setValidity('', false, this.fallbackDestForm);
      }
    }

    if (isAlternate && isAlternate.currentValue) {
      this.isAlternate = isAlternate.currentValue;
      this.index = (this.isAlternate) ? '1' : '';
    }
  }

  private processCallFeatureFallbackDestChanges(fallbackDestinationChanges: ng.IChangesObject<any>): void {
    if (_.isNull(fallbackDestinationChanges.currentValue.number) && _.isNull(fallbackDestinationChanges.currentValue.numberUuid)) {
      this.showMember = false;
      this.showReversionLookup = (this.fallbackDestination.number || this.fallbackDestination.numberUuid) ? false : true;
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

  public getMemberList(value: any): ng.IPromise<any[]> {
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
    if (this.isAlternate) {
      fallbackDestination.timer = 5;
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
        timer: this.isAlternate ? 5 : null,
      }),
    });
  }

  public onChangeSendToVoicemail(): void {
    const fallbackDestination = new FallbackDestination({
      name: this.fallbackDestination.name,
      numberUuid: this.fallbackDestination.numberUuid,
      number: this.fallbackDestination.number,
      memberUuid: this.fallbackDestination.memberUuid,
      sendToVoicemail: this.fallbackDestination.sendToVoicemail,
    });
    if (this.isAlternate) {
      fallbackDestination.timer = this.fallbackDestination.timer;
    }
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
    this.onChangeFn({
      fallbackDestination: new FallbackDestination(),
    });
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
    isAlternate: '<',
    onChangeFn: '&',
  };
}
