import { ICallerID } from './callerId';
describe('Service: CallerIDService', () => {
  beforeEach(function () {
    this.initModules('huron.caller-id');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'CallerIDService',
      'CompanyNumberService',
      'LineService',
      '$q',
    );
    spyOn(this.CallerIDService, 'listCompanyNumbers').and.returnValue(this.$q.when([]));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('11111');
    this.callerIdResponse = <ICallerID> {
      externalCallerIdType: {
        label: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
        value: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
      },
      customCallerIdName: '',
      customCallerIdNumber: '',
    };
  });

  it('getCallerId', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/00000/features/callerids')
      .respond(200, this.callerIdResponse);
    this.CallerIDService.getCallerId('places', '12345', '00000').then((data: ICallerID) => {
      expect(data.externalCallerIdType).toEqual({
        label: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
        value: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
      });
    });
    this.$httpBackend.flush();
  });
});
