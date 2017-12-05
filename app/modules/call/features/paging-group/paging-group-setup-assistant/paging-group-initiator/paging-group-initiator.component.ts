import { FeatureMemberService } from 'modules/huron/features/services';
import { Member, USER_REAL_USER, USER_PLACE } from 'modules/huron/members';
import { IMemberWithPicture, CUSTOM } from 'modules/call/features/paging-group/shared';

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

  public fetchInitiators(): ng.IPromise<Member[]> {
    return this.FeatureMemberService.getMemberSuggestions(this.initiatorName)
      .then((data: Member[]) => {
        this.availableInitiators = _.reject(data, (mem) => {
          return _.some(this.selectedInitiators, (member) => {
            return _.get(member, 'member.uuid') === mem.uuid;
          });
        });

        const promises: ng.IPromise<any>[] = [];
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
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'pagingGroup.initiatorFetchFailure');
        // return empty array
        return this.$q.resolve([]);
      });
  }

  public selectInitiators(member: Member): void {
    if (member) {
      this.initiatorName = '';
      const memberWithPicture: IMemberWithPicture = {
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
    const index = _.findIndex(this.selectedInitiators, function (mem) {
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
  public template = require('modules/call/features/paging-group/paging-group-setup-assistant/paging-group-initiator/paging-group-initiator.component.html');
  public bindings = {
    onUpdate: '&',
    initiatorType: '<',
    selectedInitiators: '<',
    cardThreshold: '@',
  };
}
