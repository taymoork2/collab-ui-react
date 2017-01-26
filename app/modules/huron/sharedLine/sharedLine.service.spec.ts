import { SharedLine, SharedLineUser, SharedLinePlace } from './index';
import { LineConsumerType } from '../lines/services';

describe('Service: SharedLineService', () => {
  beforeEach(function() {
    this.initModules('huron.shared-line');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'SharedLineService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    let sharedLineUser: SharedLine = new SharedLine({
      uuid: '0001',
      primary: true,
      user: new SharedLineUser({
        uuid: '0003',
        firstName: 'Lorenzo',
        lastName: 'Llama',
        userName: 'lorenzo.llama@thellama.com',
      }),
      place: new SharedLinePlace({
        uuid: null,
        displayName: null,
      }),
      phones: [],
    });

    let sharedLinePlace: SharedLine = new SharedLine({
      uuid: '0002',
      primary: true,
      user: new SharedLineUser({
        uuid: null,
        firstName: null,
        lastName: null,
        userName: null,
      }),
      place: new SharedLinePlace({
        uuid: '0004',
        displayName: 'Scary Place',
      }),
      phones: [],
    });

    this.sharedLineUser = sharedLineUser;
    this.sharedLinePlace = sharedLinePlace;
    this.sharedLineList = [sharedLineUser, sharedLinePlace];
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should return a shared line', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/sharedlines')
      .respond(200, this.sharedLineUser);
    this.SharedLineService.getSharedLine(LineConsumerType.PLACES, '12345', '0000000').then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.sharedLineUser));
    });
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/0000000/features/sharedlines').respond(500);
    this.SharedLineService.getSharedLine(LineConsumerType.PLACES, '12345', '0000000').then(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
    this.$httpBackend.flush();
  });
});
