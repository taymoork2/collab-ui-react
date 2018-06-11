
describe ('component: userVoicemail', () => {
  const SAVE_BUTTON = '.button-container .btn--primary';
  const CANCEL_BUTTON = '.button-container button:not(.btn--primary)';
  const TOGGLE_VOICEMAIL = '.toggle-switch #enableVoicemail';
  beforeEach(function() {
    this.initModules('huron.voicemail');
    this.injectDependencies('$scope',
      '$modal',
      '$translate',
      '$q',
      'HuronUserService',
      'HuronVoicemailService',
      'Authinfo',
      'FeatureToggleService',
      'Notification',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.services = ['voice'];
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.HuronUserService, 'getUserV1').and.returnValue(this.$q.resolve({
      user: {},
    }));
    spyOn(this.HuronVoicemailService, 'isFeatureEnabledAvril').and.returnValue(this.$q.resolve(false));
    spyOn(this.HuronVoicemailService, 'isFeatureEnabledAvrilOnly').and.returnValue(this.$q.resolve(false));
    spyOn(this.HuronUserService, 'getUserServices').and.returnValue(this.$q.resolve(
    ));
    spyOn(this.HuronUserService, 'updateUserV1').and.returnValue(this.$q.resolve(
    ));
    spyOn(this.HuronUserService, 'getUserV2Numbers').and.returnValue(this.$q.resolve({
      data: [{ }] },
    ));
    spyOn(this.HuronVoicemailService, 'isEnabledForUser').and.returnValue('true');
    spyOn(this.HuronVoicemailService, 'update').and.callThrough();

    this.compileComponent('ucUserVoicemail', {
      ownerId: '12345',
    });
  });

  it('should be able to Save User voicemail', function () {
    expect(this.view.find(SAVE_BUTTON)).not.toExist();
    expect(this.view.find(TOGGLE_VOICEMAIL)).toExist();
    this.view.find(TOGGLE_VOICEMAIL).click();
    expect(this.view.find(SAVE_BUTTON)).toExist();
    expect(this.view.find(CANCEL_BUTTON)).toExist();
    this.view.find(SAVE_BUTTON).click();
    expect(this.HuronVoicemailService.update).toHaveBeenCalled();
  });

  it('should do nothing on Cancel', function () {
    expect(this.view.find(SAVE_BUTTON)).not.toExist();
    expect(this.view.find(TOGGLE_VOICEMAIL)).toExist();
    this.view.find(TOGGLE_VOICEMAIL).click();
    this.view.find(CANCEL_BUTTON).click();
    expect(this.HuronVoicemailService.update).not.toHaveBeenCalled();
  });
});
