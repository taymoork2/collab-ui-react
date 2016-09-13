import { LineConsumerType } from '../../huron/lines/services';
import { DialingType, ICOSRestrictionResponse } from './dialing.service';


describe('Service: DialingService', () => {
  beforeEach(function() {
    this.initModules('huron.dialing');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      '$state',
      '$q',
      'DialingService'
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.$state, 'go').and.returnValue(this.$q.when());

    let getDialingResponseEmpty: ICOSRestrictionResponse = {
      customer: [],
      place: []
    };

    let getDialingResponse: ICOSRestrictionResponse = {
      customer: [],
      place: [{
        restriction: DialingType.INTERNATIONAL,
        blocked: true,
        uuid: '11111'
      }, {
        restriction: DialingType.LOCAL,
        blocked: false,
        uuid: '22222'
      }]
    };

    this.getDialingResponseEmpty = getDialingResponseEmpty;
    this.getDialingResponse = getDialingResponse;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct values on getSelected', function() {
    expect(this.DialingService.getSelected(1)).toBe(this.DialingService.cbAlwaysAllow);
    expect(this.DialingService.getSelected(0)).toBe(this.DialingService.cbNeverAllow);
    expect(this.DialingService.getSelected(-1)).toBe(this.DialingService.cbUseGlobal);
  });

  it('initializingDialingService empty', function() {

    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/restrictions')
      .respond(200, this.getDialingResponseEmpty);
    this.DialingService.initializeDialing('places', '100000').then(() => {
      expect(this.DialingService.getInternationalDialing(LineConsumerType.PLACES)).toBe(this.DialingService.cbUseGlobal.label + ' internationalDialingPanel.on');
      expect(this.DialingService.getLocalDialing(LineConsumerType.PLACES)).toBe(this.DialingService.cbUseGlobal.label + ' internationalDialingPanel.on');
    });
    this.$httpBackend.flush();
  });

  it('initializingDialingService with details', function() {

    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/restrictions')
      .respond(200, this.getDialingResponse);
    this.DialingService.initializeDialing('places', '100000').then(() => {
      expect(this.DialingService.getInternationalDialing(LineConsumerType.PLACES)).toBe(this.DialingService.cbNeverAllow.label);
      expect(this.DialingService.getLocalDialing(LineConsumerType.PLACES)).toBe(this.DialingService.cbAlwaysAllow.label);
    });
    this.$httpBackend.flush();
  });

  it('saves international dialing info', function() {
    this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/restrictions')
      .respond(200, {});
    this.DialingService.setInternationalDialing(this.DialingService.cbAlwaysAllow, 'places', '100000').then((response: boolean) => {
      expect(response).toBe(true);
    });
    this.$httpBackend.flush();
  });

  it('saves local dialing info', function() {
    this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/restrictions')
      .respond(200, {});
    this.DialingService.setLocalDialing(this.DialingService.cbNeverAllow, 'places', '100000').then((response: boolean) => {
      expect(response).toBe(true);
    });
    this.$httpBackend.flush();
  });

});
