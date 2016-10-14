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
    let callerIdResponse = {
      externalCallerIdType: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
      customCallerIdName: null,
      customCallerIdNumber: null,
    };
    this.callerIdResponse = callerIdResponse;
  });

  it('getCallerId', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/12345/numbers/00000/features/callerids')
      .respond(200, this.callerIdResponse);
    this.CallerIDService.getCallerId('places', '12345', '00000', '999999').then((data: ICallerID) => {
      expect(data.externalCallerIdType.label).toBe('Blocked Outbound Caller ID');
      expect(data.externalCallerIdType.value).toBe('EXT_CALLER_ID_BLOCKED_CALLER_ID');
      expect(this.CallerIDService.getOptions().length).toBe(3);
      expect(this.CallerIDService.getSelected('EXT_CALLER_ID_BLOCKED_CALLER_ID').externalCallerIdType).toBe('EXT_CALLER_ID_BLOCKED_CALLER_ID');
    });
    this.$httpBackend.flush();
  });

  it('isCustom returns whether its a custom or not', function() {
    expect(this.CallerIDService.isCustom({
      label: 'Custom',
    })).toBe(true);
    expect(this.CallerIDService.isCustom({
      label: 'Blocked Outbound Caller ID',
    })).toBe(false);
  });
});
