import locationCompanyVoicemail from './index';
//TO BE RREMOVED once location and I1559 Ga
describe('Component: locationCompanyVoicemail', () => {
  const VOICEMAIL_TOGGLE = 'input#companyVoicemailToggle';
  const VOICEMAIL_TO_EMAIL_CHECKBOX = 'input#voicemailToEmail';

  beforeEach(function() {
    this.initModules(locationCompanyVoicemail);
    this.injectDependencies(
      '$scope',
      'Authinfo',
      'FeatureToggleService',
      '$q',
    );

    spyOn(this.Authinfo, 'isMessageEntitled').and.returnValue(true);
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    spyOn(this.FeatureToggleService, 'avrilI1558GetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('ucLocationCompanyVoicemail', {
      ftsw: 'ftsw',
      features: 'features',
      companyVoicemailEnabled: 'companyVoicemailEnabled',
      onChangeFn: 'onChangeFn(companyVoicemailEnabled, features)',
    });

  });

  describe('Initial state: Voicemail disabled', () => {
    it('should have a toggle switch', function() {
      expect(this.view).toContainElement(VOICEMAIL_TOGGLE);
    });

    it('should have a toggle switch in the off position', function() {
      expect(this.view.find(VOICEMAIL_TOGGLE)).not.toBeChecked();
    });

    it('should not have External Voicemail Access and Voicemail to Email checkboxes when voicemail is off', function() {
      expect(this.view).not.toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
    });
  });
});
