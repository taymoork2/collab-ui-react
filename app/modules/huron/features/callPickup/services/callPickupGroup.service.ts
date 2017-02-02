import { IPickupGroup } from 'modules/huron/features/callPickup/services/callPickupGroup';
import { IMemberNumber, IMember, ICardMemberCheckbox } from 'modules/huron/features/callPickup/services';
interface IPickupGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IPickupGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IPickupGroup>>;
}

export class CallPickupGroupService {
  private pickupGroupResource: IPickupGroupResource;
  private callPickupCopy: IPickupGroup;
  private callPickupProperties: Array<string> = ['name', 'notificationTimer', 'playSound', 'displayCallingPartyId', 'displayCalledPartyId'];
 /* @ngInject */
  constructor(private $resource: ng.resource.IResourceService,
              private HuronConfig,
              private Authinfo,
              private UserNumberService,
              ) {
    this.pickupGroupResource = <IPickupGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callpickups/:callPickupGroupId', { wide: true },
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public saveCallPickupGroup(pickupGroup: IPickupGroup): ng.IPromise<IPickupGroup> {
    return this.pickupGroupResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, pickupGroup).$promise;
  }

  public getListOfPickupGroups(): ng.IPromise<IPickupGroup[]> {
    return this.pickupGroupResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => _.get(response, 'callpickups'));
  }

  public deletePickupGroup(uuid: string) {
    return this.pickupGroupResource.delete({
      customerId: this.Authinfo.getOrgId(),
      callPickupGroupId: uuid,
    }).$promise;
  }

  public getCallPickupGroup(callPickupId): ng.IPromise<IPickupGroup> {
   return this.pickupGroupResource.get({
      customerId: this.Authinfo.getOrgId(),
      callPickupGroupId: callPickupId,
    }).$promise.then( callPickup => {
      this.callPickupCopy = this.cloneCallPickupData(<IPickupGroup>_.pick( callPickup, this.callPickupProperties));
      _.extend(this.callPickupCopy, { numbers : _.map(callPickup.numbers, 'uuid') });
      return callPickup;
    });
  }

  public updateCallPickup(pickupGroupId: string, pickupGroup: IPickupGroup) {
    return this.pickupGroupResource.update({
      callPickupGroupId: pickupGroupId,
      customerId: this.Authinfo.getOrgId(),
    }, pickupGroup).$promise;
  }

  public getMemberNumbers(uuid: string): ng.IPromise<IMemberNumber[]> {
    return this.UserNumberService.get({
      customerId: this.Authinfo.getOrgId(),
      userId: uuid,
    }).$promise.then(
      (response) => {
        return _.get(response, 'numbers', []);
      });
  }

  public createCheckBoxes(member: IMember, numbers: IMemberNumber[]): ICardMemberCheckbox[] {
    _.forEach(numbers, function(number, index){
        member.checkboxes[index] = {
          label: number.internal + (number.external ? ' & ' + number.external : '' ),
          sublabel: '',
          value: number.primary ? true : false,
          numberUuid: number.uuid,
        };
    });
    return member.checkboxes;
  }

  public getOriginalConfig(): IPickupGroup {
    return this.cloneCallPickupData(this.callPickupCopy);
  }

  private cloneCallPickupData(callPickupData: IPickupGroup): IPickupGroup {
    return _.cloneDeep(callPickupData);
  }

  public matchesOriginalConfig(callpickup: IPickupGroup): boolean {
    return _.isEqual(callpickup, this.callPickupCopy);
  }

  public verifyLineSelected(selectedMembers: IMember[]): boolean {
    let result = true;
    if (selectedMembers) {
      result = _.every(selectedMembers, member => member.saveNumbers.length > 0);
    }
    return result;
  }
}
