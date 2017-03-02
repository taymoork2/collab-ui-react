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
    private NumberSearchServiceV2,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
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
    let promises: Array<ng.IPromise<string>> = [];
    let disabled = true;
    return scope.getMemberNumbers(member.uuid)
    .then(
      (data: IMemberNumber[]) => {
        disabled = true;
        _.forEach(data, function(memberNumber) {
          let promise = scope.isLineInPickupGroup(memberNumber.internal);
          promises.push(promise);
          promise.then((line: string) => {
            if (line === '') {
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

  public isLineInPickupGroup(directoryNumber: string): ng.IPromise<string> {
    return this.NumberSearchServiceV2.get({
      customerId: this.Authinfo.getOrgId(),
      number: directoryNumber,
      wide: true,
    }).$promise.then(response => {
      let number = _.get(response, 'numbers');
      let pickupFeatures = <IPickupGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers/:internalPoolId',
                           { wide: true });
      return pickupFeatures.get({
        customerId: this.Authinfo.getOrgId(),
        internalPoolId: number[0].uuid,
      }).$promise.then(response => {
        let features = _.get(response, 'features');
        if (_.isEmpty(features)) {
          return '';
        } else {
          return features[0].name;
        }
      });
    });
  }

  public createCheckboxes(member: IMember, memberNumbers: IMemberNumber[]): ng.IPromise<any> {
    let scope = this;
    let autoSelect = true;
    let linesInPickupGroupPromises: Array<ng.IPromise<string>> = [];
    _.forEach(memberNumbers, function (number) {
      linesInPickupGroupPromises.push(scope.isLineInPickupGroup(number.internal));
    });
    return scope.$q.all(linesInPickupGroupPromises).then((pickupGroupName: string[]) => {
      _.forEach(memberNumbers, function (number, index) {
        let disabled = false;
        let sublabel = '';
        let value = false;
        if (pickupGroupName[index] !== '') {
          disabled = true;
          sublabel = scope.$translate.instant('callPickup.assignmentMsg') + pickupGroupName[index];
          value = false;
        } else {
          if (autoSelect) {
            let saveNumber = {
              uuid: number.uuid,
              internalNumber: number.internal,
            };
            member.saveNumbers.push(saveNumber);
            value = true;       //autoselect primary number or first available number
            autoSelect = false;
          } else {
            value = false;
          }
        }
        member.checkboxes[index] = {
          label: number.internal + (number.external ? ' & ' + number.external : ''),
          sublabel: sublabel,
          value: value,
          numberUuid: number.uuid,
          disabled: disabled,
        };
      });
    });
  }

  public createCheckBoxesForEdit(member: IMember, memberNumbers: IMemberNumber[], pickupName: string): ICardMemberCheckbox[] {
    let scope = this;
    _.forEach(memberNumbers, function (number, index) {
      scope.isLineInPickupGroup(number.internal)
      .then((pickupGroupName: string) => {
        let disabled = false;
        let sublabel = '';
        let value = false;
        if (pickupGroupName === pickupName) {
          value = true;
        } else if (pickupGroupName !== '' && pickupGroupName !== pickupName) {
          disabled = true;
          sublabel = scope.$translate.instant('callPickup.assignmentMsg') + pickupGroupName;
          value = false;
        }
        member.checkboxes[index] = {
          label: number.internal + (number.external ? ' & ' + number.external : ''),
          sublabel: sublabel,
          value: value,
          numberUuid: number.uuid,
          disabled: disabled,
        };
      });
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
