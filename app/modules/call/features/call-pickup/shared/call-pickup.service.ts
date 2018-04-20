import { Member } from 'modules/huron/members';
import { IMemberNumber, IMember, ICardMemberCheckbox, IPickupGroup } from 'modules/call/features/call-pickup/shared';
import { NumberService } from 'modules/huron/numbers';

interface IPickupGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IPickupGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IPickupGroup>>;
}

export class CallPickupGroupService {
  private pickupGroupResource: IPickupGroupResource;
  private callPickupCopy: IPickupGroup;
  private callPickupProperties: string[] = ['name', 'notificationTimer', 'playSound', 'displayCallingPartyId', 'displayCalledPartyId'];
  private hasLocations: boolean = false;
 /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
    private UserNumberService,
    private NumberService: NumberService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
  ) {
    this.pickupGroupResource = <IPickupGroupResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/callpickups/:callPickupGroupId', { wide: true },
      {
        update: {
          method: 'PUT',
        },
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.hI1484).then(supports => {
      this.hasLocations = supports;
    });
  }

  public areAllLinesInPickupGroup(member: Member): ng.IPromise<boolean> {
    const promises: ng.IPromise<void>[] = [];
    let disabled = true;
    return this.getMemberNumbers(member.uuid).then((data: IMemberNumber[]) => {
      disabled = true;
      _.forEach(data, (memberNumber) => {
        promises.push(this.isLineInPickupGroup(this.hasLocations ? memberNumber.siteToSite : memberNumber.internal).then((line: string) => {
          if (line === '') {
            disabled = false;
          }
        }));
      });
      return this.$q.all(promises).then(() => disabled);
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
    return this.NumberService.getNumberList(directoryNumber)
      .then((response) => this.NumberService.getNumber(response[0].uuid))
      .then((response) => {
        const features: any = _.get(response, 'features');
        const pickupName = _.find(features, (feature: any) => feature.type === 'CALL_FEATURE_PICKUP_GROUP');
        if (pickupName) {
          return pickupName.name;
        } else {
          return '';
        }
      });
  }

  public createCheckboxes(member: IMember, memberNumbers: IMemberNumber[]): ng.IPromise<any> {
    let autoSelect = true;
    const linesInPickupGroupPromises: ng.IPromise<string>[] = [];
    _.forEach(memberNumbers, (number) => {
      linesInPickupGroupPromises.push(this.isLineInPickupGroup(this.hasLocations ? number.siteToSite : number.internal));
    });
    return this.$q.all(linesInPickupGroupPromises).then((pickupGroupName: string[]) => {
      _.forEach(memberNumbers, (number, index) => {
        let disabled = false;
        let sublabel = '';
        let value = false;
        if (pickupGroupName[index] !== '') {
          disabled = true;
          sublabel = this.$translate.instant('callPickup.assignmentMsg', { pickupGroupName: pickupGroupName[index] });
          value = false;
        } else {
          if (autoSelect) {
            const saveNumber = {
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
          label: (this.hasLocations ? number.siteToSite : number.internal) + (number.external ? ' & ' + number.external : ''),
          sublabel: sublabel,
          value: value,
          numberUuid: number.uuid,
          disabled: disabled,
        };
      });
    });
  }

  public createCheckboxesForEdit(member: IMember, memberNumbers: IMemberNumber[], pickupName: string): ICardMemberCheckbox[] {
    _.forEach(memberNumbers, (number, index) => {
      this.isLineInPickupGroup(this.hasLocations ? number.siteToSite : number.internal)
      .then((pickupGroupName: string) => {
        let disabled = false;
        let sublabel = '';
        let value = false;
        if (pickupGroupName === pickupName) {
          value = true;
        } else if (pickupGroupName !== '' && pickupGroupName !== pickupName) {
          disabled = true;
          sublabel = this.$translate.instant('callPickup.assignmentMsg', { pickupGroupName: pickupGroupName });
          value = false;
        }
        member.checkboxes[index] = {
          label: (this.hasLocations ? number.siteToSite : number.internal) + (number.external ? ' & ' + number.external : ''),
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
