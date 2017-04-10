import { FeatureMemberService } from 'modules/huron/features/featureMember.service';
import { Member, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';
import { IMemberWithPicture, CUSTOM } from 'modules/huron/features/pagingGroup';

class PagingInitiatorCtrl implements ng.IComponentController {
  public initiatorType: string;
  private onUpdate: Function;
  private cardThreshold: number;

  private initiatorName: string;
  private availableInitiators: Member[] = [];
  public selectedInitiators: IMemberWithPicture[];
  public errorInitiatorInput: boolean = false;

  /* @ngInject */
  constructor(private Notification,
              private FeatureMemberService: FeatureMemberService,
              private $q: ng.IQService) {
  }

  public fetchInitiators(): ng.IPromise<Array<Member>> {
    return this.FeatureMemberService.getMemberSuggestions(this.initiatorName).then(
      (data: Member[]) => {
        this.availableInitiators = _.reject(data, (mem) => {
          return _.some(this.selectedInitiators, (member) => {
            return _.get(member, 'member.uuid') === mem.uuid;
          });
        });

        let promises: Array<ng.IPromise<any>> = [];
        _.forEach(this.availableInitiators, (item: any): void => {
          // If Place is a room device type, remove from availableInitiators
          if (item.type === USER_PLACE) {
            promises.push(this.FeatureMemberService.getMachineAcct(item.uuid).then(
              (data) => {
                if (data.machineType === 'lyra_space') {
                  this.availableInitiators = _.reject(this.availableInitiators, item);
                }
              }).catch(() => {
                this.availableInitiators = _.reject(this.availableInitiators, item);
              }));
          }
        });

        return this.$q.all(promises).then(() => {
          this.errorInitiatorInput = (this.availableInitiators && this.availableInitiators.length === 0);
          return this.availableInitiators;
        });

      }, (response) => {
      this.Notification.errorResponse(response, 'pagingGroup.initiatorFetchFailure');
    });
  }

  public selectInitiators(member: Member): void {
    if (member) {
      this.initiatorName = '';
      let memberWithPicture: IMemberWithPicture = {
        member: member,
        picturePath: '',
      };

      if (member.type === USER_REAL_USER) {
        this.FeatureMemberService.getUser(member.uuid).then(
          (user) => {
            this.FeatureMemberService.populateFeatureMemberInfo(memberWithPicture, user);
          });
      }
      this.selectedInitiators.unshift(memberWithPicture);
      this.onUpdate({
        initiatorType: this.initiatorType,
        selectedInitiators: this.selectedInitiators,
      });
    }
    this.availableInitiators = [];
  }

  public onChange(): void {
    this.onUpdate({
      initiatorType: this.initiatorType,
      selectedInitiators: this.selectedInitiators,
    });
  }

  public getMembersPictures(member: Member): string {
    let index = _.findIndex(this.selectedInitiators, function (mem) {
      return (mem.member.uuid === member.uuid);
    });
    if (index !== -1) {
      return this.selectedInitiators[index].picturePath;
    } else {
      return '';
    }
  }

  public removeMembers(member: IMemberWithPicture): void {
    if (member) {
      this.selectedInitiators = _.reject(this.selectedInitiators, member);
      this.onUpdate({
        initiatorType: this.initiatorType,
        selectedInitiators: this.selectedInitiators,
      });
    }
  }

  public getMemberType(member: Member) {
    return this.FeatureMemberService.getMemberType(member);
  }

  public getDisplayNameInDropdown(member: Member) {
    return this.FeatureMemberService.getFullNameFromMember(member);
  }

  public getDisplayNameOnCard(member: Member) {
    return this.FeatureMemberService.getDisplayNameFromMember(member);
  }

  public getUserName(member: Member) {
    return this.FeatureMemberService.getUserName(member);
  }

  public showInitiatorCounts(): boolean {
    return ((this.selectedInitiators.length > this.cardThreshold) && (this.initiatorType === CUSTOM ));
  }
}

export class PgInitiatorComponent implements ng.IComponentOptions {
  public controller = PagingInitiatorCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgInitiator/pgInitiator.html';
  public bindings = {
    onUpdate: '&',
    initiatorType: '<',
    selectedInitiators: '<',
    cardThreshold: '@',
  };
}
