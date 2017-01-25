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

  // function initSpies() {
  //  // spyOn(HybridVoicemailCtrl, 'toggleVoicemail');
  //   spyOn(Notification, 'errorWithTrackingId');
  // }

  it('shows Success notification when HybridVoiceMail is disabled', () => {
    spyOn(Notification, 'success');
    let ctrl = $componentController('hybridVoicemailSettings');
    ctrl.toggleVoicemail(false);
    $scope.$apply();
    expect(Notification.success.calls.count()).toBe(1);
  });

  it('shows Success notification when HybridVoiceMail is enabled', () => {
    spyOn(Notification, 'success');
    let ctrl = $componentController('hybridVoicemailSettings');
    ctrl.toggleVoicemail(true);
    $scope.$apply();
    expect(Notification.success.calls.count()).toBe(1);
  });
});
