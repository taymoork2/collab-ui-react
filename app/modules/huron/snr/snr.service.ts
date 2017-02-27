import { SingleNumberReach } from './snr';

interface ISnrResource extends ng.resource.IResourceClass<ng.resource.IResource<SingleNumberReach>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<SingleNumberReach>>;
}
export class SnrService {
  private snrService: ISnrResource;
  /* @ngInject */
  constructor(
    private Authinfo,
    private TelephoneNumberService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig) {
    let saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    this.snrService = <ISnrResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations/:remotedestinationId', {}, {
      update: updateAction,
      save: saveAction,
    });
  }

  public getSnrList(_userId: string): ng.IPromise<any> {
    return this.snrService.query({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }).$promise;
  }


  public getSnr(_userId: string, _id: string): ng.IPromise<SingleNumberReach> {
    return this.snrService.get({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
      remotedestinationId: _id,
    }).$promise;
  }

  public createSnr(_userId: string, payload: any): ng.IPromise<any> {
    payload.name = 'RD-' + this.getRandomString();
    payload.autoAssignRemoteDestinationProfile = 'true';
    return this.snrService.save({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }, payload).$promise;
  }

  public updateSnr(_userId: string, _id: string, payload: SingleNumberReach): ng.IPromise<any> {
    return this.snrService.update({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
      remotedestinationId: _id,
    }, payload).$promise;
  }

  public deleteSnr(_userId: string, _id: string): ng.IPromise<any> {
    return this.snrService.remove({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
      remotedestinationId: _id,
    }).$promise;
  }

  public saveSnr(_userId: string, _id: string, snr: SingleNumberReach) {
    if (_.isEmpty(_id)) {
      return this.createSnr(_userId, snr);
    } else if (snr.destination) {
      return this.updateSnr(_userId, _id, snr);
    } else {
      return this.deleteSnr(_userId, _id);
    }
  }

  public getRandomString(): string {
    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 12; i++) {
      let randIndex = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randIndex, randIndex + 1);
    }
    return randomString;
  }

  public validate(number: any) {
    let newNumber = number;
    if (number && this.TelephoneNumberService.validateDID(number)) {
      newNumber = this.TelephoneNumberService.getDIDValue(number);
    } else if (number.indexOf('@') === -1) {
      newNumber = _.replace(number, /-/g, '');
    }
    return newNumber.replace(/ /g, '');
  }
}
