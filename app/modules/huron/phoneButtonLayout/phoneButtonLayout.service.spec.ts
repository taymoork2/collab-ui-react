import phoneButtonLayoutModule from './index';

describe('Service: PhoneButtonLayoutService', () => {
  beforeEach(function() {
    this.initModules(phoneButtonLayoutModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'PhoneButtonLayoutService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    const getUserButtonLayouts = {
      url: this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/100000/buttonlayouts',
      buttonLayout: [{
        type: 'FEATURE_LINE',
        index: 2,
        destination: '234234',
        label: 'simple label',
        callPickupEnabled: false,
        appliesToSharedLines: false,
      }, {
        type: 'FEATURE_PRIVACY',
        index: 2,
        destination: '234234',
        label: 'simple label',
        callPickupEnabled: false,
        appliesToSharedLines: false,
      }],
    };

    const putUserButtonLayouts =  [{
      type: 'FEATURE_LINE',
      index: 2,
      destination: '234234',
      label: 'simple label',
      callPickupEnabled: false,
      appliesToSharedLines: false,
    }, {
      type: 'FEATURE_PRIVACY',
      index: 2,
      destination: '234234',
      label: 'simple label',
      callPickupEnabled: false,
      appliesToSharedLines: false,
    }, {
      type: 'FEATURE_CALL_PARK',
      index: 3,
      destination: '23423',
      label: 'simple label1',
      callPickupEnabled: false,
      appliesToSharedLines: false,
    }];
    this.getUserButtonLayouts = getUserButtonLayouts;
    this.putUserButtonLayouts = putUserButtonLayouts;

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get user\'s phonebuttons', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/100000/buttonlayouts')
      .respond(200, this.getUserButtonLayouts);
    this.PhoneButtonLayoutService.getPhoneButtons('users', 100000).then(function(data) {
      expect(data.buttonLayout.length).toBe(2);
    });
    this.$httpBackend.flush();
  });

  it('should update user\'s phonebuttons', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/100000/buttonlayouts',
      function(putUserButtonLayouts) {
        putUserButtonLayouts = JSON.parse(putUserButtonLayouts);
        expect(putUserButtonLayouts).toBeDefined();
        expect(putUserButtonLayouts.buttonLayout).toBeDefined();
        return true;
      }).respond(200);
    this.PhoneButtonLayoutService.updatePhoneButtons('users', 100000, this.putUserButtonLayouts);
    this.$httpBackend.flush();
  });

  it('should get place\'s phonebuttons', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/buttonlayouts')
      .respond(200, this.getUserButtonLayouts);
    this.PhoneButtonLayoutService.getPhoneButtons('places', 100000).then(function(data) {
      expect(data.buttonLayout.length).toBe(2);
    });
    this.$httpBackend.flush();
  });

  it('should update place\'s phonebuttons', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/buttonlayouts',
      function(putUserButtonLayouts) {
        putUserButtonLayouts = JSON.parse(putUserButtonLayouts);
        expect(putUserButtonLayouts).toBeDefined();
        expect(putUserButtonLayouts.buttonLayout).toBeDefined();
        return true;
      }).respond(200);
    this.PhoneButtonLayoutService.updatePhoneButtons('places', 100000, this.putUserButtonLayouts);
    this.$httpBackend.flush();
  });
});
