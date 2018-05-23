import { SingleNumberReach, IRSingleNumberReach } from './snr';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { LineService, LineConsumerType, Line } from 'modules/huron/lines/services';

export class SnrData {
  public lines: Line[];
  public snr: SingleNumberReach;
}

interface ISnrResource extends ng.resource.IResourceClass<ng.resource.IResource<IRSingleNumberReach>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class SnrService {
  private snrDataCopy: SnrData;
  private snrService: ISnrResource;
  /* @ngInject */
  constructor(
    private Authinfo,
    private PhoneNumberService: PhoneNumberService,
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private LineService: LineService,
    private HuronConfig) {
    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    this.snrService = <ISnrResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations/:remotedestinationId', {}, {
      update: updateAction,
      save: saveAction,
    });
  }

  public loadSnrData(userId: string): ng.IPromise<SnrData> {
    const snrData = new SnrData();
    return this.$q.all({
      snr: this.getFirstSnr(userId).then(snr => snrData.snr = snr),
      lines: this.LineService.getLineList(LineConsumerType.USERS, userId).then(lines => snrData.lines = lines),
    }).then(snrData => {
      this.snrDataCopy = this.cloneSnrData(snrData);
      return snrData;
    });
  }

  public getSnrList(_userId: string): ng.IPromise<any> {
    return this.snrService.query({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }).$promise;
  }

  public getFirstSnr(_userId: string): IPromise<SingleNumberReach> {
    return this.getSnrList(_userId)
      .then(snrList => {
        if (snrList && snrList.length > 0) {
          return this.getSnr(_userId, snrList[0].uuid).then(snr => snr);
        } else {
          return new SingleNumberReach();
        }
      });
  }

  public getSnr(_userId: string, _id: string): ng.IPromise<SingleNumberReach> {
    return this.snrService.get({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
      remotedestinationId: _id,
    }).$promise.then(snr => new SingleNumberReach(snr));
  }

  public createSnr(_userId: string, payload: SingleNumberReach): ng.IPromise<any> {
    return this.snrService.save({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }, {
      name: 'RD-' + this.getRandomString(),
      autoAssignRemoteDestinationProfile: 'true',
      destination: payload.destination,
      answerTooLateTimer: payload.answerTooLateTimer,
      enableMobileConnect: payload.enableMobileConnect,
      patterns: payload.patterns,
    }).$promise;
  }

  public updateSnr(_userId: string, _id: string, payload: SingleNumberReach): ng.IPromise<any> {
    return this.snrService.update({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
      remotedestinationId: _id,
    }, {
      destination: payload.destination,
      answerTooLateTimer: payload.answerTooLateTimer,
      enableMobileConnect: payload.enableMobileConnect,
      patterns: payload.patterns,
    }).$promise;
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
    } else {
      return this.updateSnr(_userId, _id, snr);
    }
  }

  public getRandomString(): string {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 12; i++) {
      const randIndex = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randIndex, randIndex + 1);
    }
    return randomString;
  }

  public validate(number: any) {
    let newNumber = number;
    if (number && this.PhoneNumberService.validateDID(number)) {
      newNumber = this.PhoneNumberService.getE164Format(number);
    } else if (number.indexOf('@') === -1) {
      newNumber = _.replace(number, /-/g, '');
    }
    return newNumber.replace(/ /g, '');
  }

  public getOriginalConfig(): SnrData {
    return this.cloneSnrData(this.snrDataCopy);
  }

  public matchesOriginalConfig(snrData: SnrData): boolean {
    return _.isEqual(snrData, this.snrDataCopy);
  }

  private cloneSnrData(snrData: SnrData): SnrData {
    return _.cloneDeep(snrData);
  }
}
