import hybridVoicemailSettings from './voicemail-settings.component';

describe('Component: HybridVoicemailCtrl ', () => {

  let $componentController, $scope, $q, Notification;

  beforeEach(function () {
    this.initModules(hybridVoicemailSettings);
  });

  beforeEach(inject( (_$componentController_, $rootScope, _$q_, _Notification_) => {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    Notification = _Notification_;
  }));

  it('should show Success notification when HybridVoiceMail is disabled', () => {
    spyOn(Notification, 'success');
    let ctrl = $componentController('hybridVoicemailSettings', {
      UCCService: {
        enableHybridVoicemail: jasmine.createSpy('enableHybridVoicemail').and.returnValue($q.resolve()),
      },
    });
    ctrl.toggleVoicemail(false);
    $scope.$apply();
    expect(Notification.success.calls.count()).toBe(1);
  });

  it('should show Success notification when HybridVoiceMail is enabled', () => {
    spyOn(Notification, 'success');
    let ctrl = $componentController('hybridVoicemailSettings', {
      UCCService: {
        disableHybridVoicemail: jasmine.createSpy('disableHybridVoicemail').and.returnValue($q.resolve()),
      },
    });
    ctrl.toggleVoicemail(true);
    $scope.$apply();
    expect(Notification.success.calls.count()).toBe(1);
  });
});
