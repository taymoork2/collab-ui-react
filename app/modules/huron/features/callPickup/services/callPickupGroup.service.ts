import { Member } from 'modules/huron/members';
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
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
    private UserNumberService,
    private $q: ng.IQService,
  ) {
    this.pickupGroupResource = <IPickupGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callpickups/:callPickupGroupId', { wide: true },
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public areAllLinesInPickupGroup(member: Member): ng.IPromise<boolean> {
    let scope = this;
    let promises: Array<ng.IPromise<boolean>> = [];
    let disabled = true;
    return scope.getMemberNumbers(member.uuid)
    .then(
      (data: IMemberNumber[]) => {
        disabled = true;
        _.forEach(data, function(memberNumber) {
          let promise = scope.isLineInPickupGroup(memberNumber.internal);
          promises.push(promise);
          promise.then((line: boolean) => {
            if (!line) {
              disabled = false;
            }
          });
        });
        return scope.$q.all(promises).then(function() {
          return disabled;
        });
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

  public getPickupGroupNameByLine(directoryNumber: string): ng.IPromise<string> {
    let internalPoolId = <IPickupGroupResource>this.$resource(
                                 this.HuronConfig.getCmiV2Url() +
                                 '/customers/:customerId/numbers',
                                 { wide: true, number: directoryNumber },
                                 { update: { method: 'GET' } },
                               );

    return internalPoolId.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      let number = _.get(response, 'numbers');

      // The numbers/{number} is really numbers/{internalPoolId} - bad API name
      let pickupFeatures = <IPickupGroupResource>this.$resource(
                                  this.HuronConfig.getCmiV2Url() +
                                  '/customers/:customerId/numbers/:internalPoolId',
                                  { wide: true, features: 'CALL_FEATURE_PICKUP_GROUP' },
                                  { update: { method: 'GET' } },
                                );

      return pickupFeatures.get({
        customerId: this.Authinfo.getOrgId(),
        internalPoolId: number[0].uuid,
      }).$promise.then(response => {
        let features = _.get(response, 'features');

        if (_.isEmpty(features)) {
          return ''; // Not in a pickup group
        } else {
          return features[0].name;
        }
      });
    });
  }

  public isLineInPickupGroup(directoryNumber: string): ng.IPromise<boolean> {
    let internalPoolId = <IPickupGroupResource>this.$resource(
                                 this.HuronConfig.getCmiV2Url() +
                                 '/customers/:customerId/numbers',
                                 { wide: true, number: directoryNumber },
                                 { update: { method: 'GET' } },
                               );

    return internalPoolId.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      let number = _.get(response, 'numbers');

      // The numbers/{number} is really numbers/{internalPoolId} - bad API name
      let pickupFeatures = <IPickupGroupResource>this.$resource(
                                  this.HuronConfig.getCmiV2Url() +
                                  '/customers/:customerId/numbers/:internalPoolId',
                                  { wide: true, features: 'CALL_FEATURE_PICKUP_GROUP' },
                                  { update: { method: 'GET' } },
                                );

      return pickupFeatures.get({
        customerId: this.Authinfo.getOrgId(),
        internalPoolId: number[0].uuid,
      }).$promise.then(response => {
        let features = _.get(response, 'features');

        if (_.isEmpty(features)) {
          return false;
        } else {
          return true;
        }
      });
    });
  }

  public createCheckBox(member: IMember, number: IMemberNumber, index, sublabel, value, disabled): ICardMemberCheckbox[] {
    member.checkboxes[index] = {
      label: number.internal + (number.external ? ' & ' + number.external : '' ),
      sublabel: sublabel,
      value: value,
      numberUuid: number.uuid,
      disabled: disabled,
    };
    return member.checkboxes;
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
