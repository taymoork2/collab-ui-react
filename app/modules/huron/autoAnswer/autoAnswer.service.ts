import { LineConsumerType } from 'modules/huron/lines/services';
import { AutoAnswerPhone, AutoAnswerMember, AutoAnswer } from 'modules/huron/autoAnswer';

export interface IAutoAnswerResource extends ng.resource.IResourceClass<ng.resource.IResource<AutoAnswer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISetAutoAnswer>>;
}

export class AutoAnswerConst {
  public static PHONES = 'phones';
  public static MEMBER  = 'member';
  public static ENABLED = 'enabled';
  public static SPEAKERPHONE = 'AUTO_ANSWER_WITH_SPEAKERPHONE';
  public static HEADSET = 'AUTO_ANSWER_WITH_HEADSET';
}

export interface ISetAutoAnswer {
  phoneUuid: string;
  enabled: boolean;
  mode: string | undefined;
}

export interface IAutoAnswerPhone {
  uuid: string;
  name: string;
  description: string;
  model: string;
  autoAnswer: {
    supported: boolean;
    enabled: boolean;
    mode: string;
  };
}

export class AutoAnswerService {
  private autoAnswerService: IAutoAnswerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private DeviceService,
  ) {
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.autoAnswerService = <IAutoAnswerResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId/features/autoanswers', {},
      {
        update: updateAction,
      });
  }

  public getSupportedPhonesAndMember(_type: LineConsumerType, _typeId: string, _numberId: string): ng.IPromise<AutoAnswer> {
    return this.autoAnswerService.get({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }).$promise.then(data => {
        let autoAnswer = new AutoAnswer();
        autoAnswer.ownerType = _type as string;

        let phoneList: Array<IAutoAnswerPhone> = _.get(data, AutoAnswerConst.PHONES, []);
        autoAnswer.phones = _.map(_.filter(phoneList, (phone) => { return phone.autoAnswer.supported === true ; }), (supportedPhone) => {
          return new AutoAnswerPhone({
              uuid: supportedPhone.uuid,
              name: supportedPhone.name,
              description: _.first(this.DeviceService.getTags(this.DeviceService.decodeHuronTags(supportedPhone.description))) as string,
              model: supportedPhone.model,
              enabled: supportedPhone.autoAnswer.enabled,
              mode: supportedPhone.autoAnswer.enabled === true ? supportedPhone.autoAnswer.mode : undefined });
        });

        let member = _.get(data, AutoAnswerConst.MEMBER);
        if (!_.isUndefined(member) && !_.isNull(member)) {
          autoAnswer.member = new AutoAnswerMember(member);
        }
        return autoAnswer;
      }
    );
  }

  public createUpdateAutoAnswerPayload(origPhoneData: Array<AutoAnswerPhone>, currPhoneData: Array<AutoAnswerPhone>): ISetAutoAnswer | undefined {
      let currEnabledPhone: AutoAnswerPhone = _.find(currPhoneData, AutoAnswerConst.ENABLED);
      let origEnabledPhone: AutoAnswerPhone = _.find(origPhoneData, AutoAnswerConst.ENABLED);
      let updateAutoAnswerData: ISetAutoAnswer | undefined ;

      if (currEnabledPhone) {
        updateAutoAnswerData = { phoneUuid: currEnabledPhone.uuid, enabled: true, mode: currEnabledPhone.mode };
      } else if (origEnabledPhone) {
        updateAutoAnswerData = { phoneUuid: origEnabledPhone.uuid, enabled: false, mode: undefined };
      }

      return updateAutoAnswerData;
  }

  public setAutoAnswer(_phones: Array<AutoAnswerPhone>, _phoneId: string | undefined, _enabled: boolean, mode: string | undefined): void {
    let prevEnabledPhone: AutoAnswerPhone = _.find(_phones, AutoAnswerConst.ENABLED);
    if (prevEnabledPhone) {
      if (prevEnabledPhone.uuid === _phoneId) {
        if (!_enabled) {
          prevEnabledPhone.enabled = _enabled;
          prevEnabledPhone.mode = undefined;
        } else {
          prevEnabledPhone.mode = mode;
        }
      } else {
        let phone: AutoAnswerPhone = _.find(_phones, { uuid: _phoneId });
        if (phone) {
          phone.enabled = _enabled;
          phone.mode = mode;
          prevEnabledPhone.enabled = false;
          prevEnabledPhone.mode = undefined;
        }
      }
    } else {
      let phone: AutoAnswerPhone = _.find(_phones, { uuid: _phoneId });
      if (phone) {
          phone.enabled = _enabled;
          phone.mode = mode;
      }
    }
  }

  public updateAutoAnswer(_type: LineConsumerType, _typeId: string, _numberId: string | undefined, data: ISetAutoAnswer) {
    return this.autoAnswerService.update({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }, data).$promise;
  }

}
