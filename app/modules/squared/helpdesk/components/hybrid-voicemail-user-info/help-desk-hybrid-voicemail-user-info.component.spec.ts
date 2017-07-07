import helpDeskHybridVoicemailUserInfo from './index';

describe('helpDeskHybridVoicemailUserInfo', () => {

  let test;
  const expectedMwiStatus = true;
  const expectedVoicemailPilot = '12345';

  beforeEach(function () {
    this.initModules(helpDeskHybridVoicemailUserInfo, 'Core');
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      'UCCService',
      '$q',
    );
    test = this;
    spyOn(this.UCCService, 'getOrgVoicemailConfiguration').and.returnValue(this.$q.resolve({
      voicemailOrgEnableInfo: {
        orgHybridVoicemailEnabled: true,
      },
    }));
    spyOn(this.UCCService, 'getUserVoicemailInfo').and.returnValue(this.$q.resolve({
      vmInfo: {
        mwiStatus: expectedMwiStatus,
        voicemailPilot: expectedVoicemailPilot,
      },
    }));
  });

  function initController(userId: string, orgId: string, entitled: boolean) {
    return test.$componentController('helpDeskHybridVoicemailUserInfo', null, { userId: userId, orgId: orgId, entitled: entitled });
  }

  it('should read the voicemail APIs and populate the required user info: ', () => {

    const entitled = true;
    const controller = initController('1234', '5678', entitled);
    controller.$onInit();
    test.$rootScope.$apply();

    expect(controller.visible).toBe(true);
    expect(controller.status).toBe('common.on');
    expect(controller.mwi).toBe(expectedMwiStatus);
    expect(controller.pilot).toBe(expectedVoicemailPilot);
  });

  it('should not show the section if the user is not entitled, and not call the voicemail APIs', () => {

    const entitled = false;
    const controller = initController('1234', '5678', entitled);
    controller.$onInit();
    test.$rootScope.$apply();

    expect(controller.visible).toBe(false);
    expect(test.UCCService.getOrgVoicemailConfiguration).not.toHaveBeenCalled();
    expect(test.UCCService.getUserVoicemailInfo).not.toHaveBeenCalled();
  });

  it('should show a message if the org is not enabled, and not call the getUserVoicemailInfo API', () => {

    const entitled = true;
    test.UCCService.getOrgVoicemailConfiguration.and.returnValue(test.$q.resolve({
      voicemailOrgEnableInfo: {
        orgHybridVoicemailEnabled: false,
      },
    }));

    const controller = initController('1234', '5678', entitled);
    controller.$onInit();
    test.$rootScope.$apply();

    expect(controller.status).toBe('helpdesk.hybridVoicemail.orgNotEnabled');
    expect(test.UCCService.getOrgVoicemailConfiguration).toHaveBeenCalled();
    expect(test.UCCService.getUserVoicemailInfo).not.toHaveBeenCalled();
  });

});
