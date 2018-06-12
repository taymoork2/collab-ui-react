import { LineConsumerType } from 'modules/huron/lines/services';
import { AutoAnswer, AutoAnswerPhone, AutoAnswerMember } from './autoAnswer';
import { AutoAnswerConst, ISetAutoAnswer } from './autoAnswer.service';

describe('Service: AutoAnswerService', () => {
  beforeEach(function () {
    this.initModules('huron.auto-answer');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'AutoAnswerService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    this.getAutoAnswerResponse = getJSONFixture('huron/json/autoAnswer/autoAnswerGetResponse.json');
    this.autoAnswerRead = getJSONFixture('huron/json/autoAnswer/autoAnswer.json');
    this.autoAnswerData = new AutoAnswer();
    _.forEach(_.get(this.autoAnswerRead, AutoAnswerConst.PHONES, []), (phone: AutoAnswerPhone) => {
      this.autoAnswerData.phones.push(
        new AutoAnswerPhone({
          uuid: phone.uuid,
          name: phone.name,
          description: phone.description,
          model: phone.model,
          enabled: phone.enabled,
          mode: phone.enabled ? phone.mode : undefined }));
    });
    this.autoAnswerData.member = new AutoAnswerMember(_.get(this.autoAnswerRead, AutoAnswerConst.MEMBER));

    this.getAutoAnswerNoEnabledPhoneResponse = getJSONFixture('huron/json/autoAnswer/autoAnswerNoEnabledPhoneGetResponse.json');
    this.autoAnswerNoEnabledPhoneData = _.cloneDeep(this.autoAnswerData);
    this.autoAnswerNoEnabledPhoneData.phones[0].enabled = false;
    this.autoAnswerNoEnabledPhoneData.phones[0].mode = undefined;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get AutoAnswer data for a place and line and filter out phones that do not support AutoAnswer', function () {
    this.autoAnswerData.ownerType = LineConsumerType.PLACES;
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/autoanswers')
      .respond(200, this.getAutoAnswerResponse);
    this.AutoAnswerService.getSupportedPhonesAndMember(LineConsumerType.PLACES, '12345', '0000000').then(response => {
      expect(response).toEqual(this.autoAnswerData);
    });
    this.$httpBackend.flush();
  });

  it('should update AutoAnswer when set to a different phone', function () {
    const updatedAutoAnswerPhones: AutoAnswerPhone[] = _.cloneDeep(this.autoAnswerData.phones);
    this.AutoAnswerService.setAutoAnswer(updatedAutoAnswerPhones, this.autoAnswerData.phones[1].uuid, true, AutoAnswerConst.SPEAKERPHONE);
    const updatePayload: ISetAutoAnswer = {
      phoneUuid: updatedAutoAnswerPhones[1].uuid,
      enabled: true,
      mode: updatedAutoAnswerPhones[1].mode,
    };

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345/numbers/0000000/features/autoanswers', updatePayload)
      .respond(200);

    expect(this.AutoAnswerService.createUpdateAutoAnswerPayload(this.autoAnswerData.phones, updatedAutoAnswerPhones)).toEqual(updatePayload);
    this.AutoAnswerService.updateAutoAnswer(LineConsumerType.USERS, '12345', '0000000', updatePayload);
    this.$httpBackend.flush();
  });

  it('should update AutoAnswer when set to a different mode', function () {
    const updatedAutoAnswerPhones: AutoAnswerPhone[] = _.cloneDeep(this.autoAnswerData.phones);
    this.AutoAnswerService.setAutoAnswer(updatedAutoAnswerPhones, this.autoAnswerData.phones[0].uuid, true, AutoAnswerConst.HEADSET);
    const updatePayload: ISetAutoAnswer = {
      phoneUuid: updatedAutoAnswerPhones[0].uuid,
      enabled: true,
      mode: updatedAutoAnswerPhones[0].mode,
    };

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/autoanswers', updatePayload)
      .respond(200);

    expect(this.AutoAnswerService.createUpdateAutoAnswerPayload(this.autoAnswerData.phones, updatedAutoAnswerPhones)).toEqual(updatePayload);
    this.AutoAnswerService.updateAutoAnswer(LineConsumerType.PLACES, '12345', '0000000', updatePayload);
    this.$httpBackend.flush();
  });

  it('should update AutoAnswer when set to a disabled', function () {
    const updatedAutoAnswerPhones: AutoAnswerPhone[] = _.cloneDeep(this.autoAnswerData.phones);
    this.AutoAnswerService.setAutoAnswer(updatedAutoAnswerPhones, this.autoAnswerData.phones[0].uuid, false, undefined);
    const updatePayload: ISetAutoAnswer = {
      phoneUuid: updatedAutoAnswerPhones[0].uuid,
      enabled: false,
      mode: undefined,
    };

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345/numbers/0000000/features/autoanswers', updatePayload)
      .respond(200);

    expect(this.AutoAnswerService.createUpdateAutoAnswerPayload(this.autoAnswerData.phones, updatedAutoAnswerPhones)).toEqual(updatePayload);
    this.AutoAnswerService.updateAutoAnswer(LineConsumerType.USERS, '12345', '0000000', updatePayload);
    this.$httpBackend.flush();
  });

  it('should enable AutoAnswer for user where there is none enabled previously', function () {
    this.autoAnswerNoEnabledPhoneData.ownerType = LineConsumerType.USERS;
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345/numbers/0000000/features/autoanswers')
      .respond(200, this.getAutoAnswerNoEnabledPhoneResponse);
    this.AutoAnswerService.getSupportedPhonesAndMember(LineConsumerType.USERS, '12345', '0000000').then(response => {
      expect(response).toEqual(this.autoAnswerNoEnabledPhoneData);
    });

    const updatedAutoAnswerPhones: AutoAnswerPhone[] = _.cloneDeep(this.autoAnswerNoEnabledPhoneData.phones);
    this.AutoAnswerService.setAutoAnswer(updatedAutoAnswerPhones, this.autoAnswerNoEnabledPhoneData.phones[1].uuid, true, AutoAnswerConst.SPEAKERPHONE);
    const updatePayload: ISetAutoAnswer = {
      phoneUuid: updatedAutoAnswerPhones[1].uuid,
      enabled: true,
      mode: updatedAutoAnswerPhones[1].mode,
    };

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345/numbers/0000000/features/autoanswers', updatePayload)
      .respond(200);

    expect(this.AutoAnswerService.createUpdateAutoAnswerPayload(this.autoAnswerData.phones, updatedAutoAnswerPhones)).toEqual(updatePayload);
    this.AutoAnswerService.updateAutoAnswer(LineConsumerType.USERS, '12345', '0000000', updatePayload);
    this.$httpBackend.flush();
  });
});
