import moduleName from './index';
import { JabberToWebexTeamsAddProfileModalController } from './jabber-to-webex-teams-add-profile-modal.component';
import { Analytics } from 'modules/core/analytics';
import { Notification } from 'modules/core/notifications';
import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsAddProfileModalController, {
  $q: ng.IQService;
  $scope: ng.IScope;
  $state: ng.ui.IStateService;
  Analytics: Analytics;
  JabberToWebexTeamsService: JabberToWebexTeamsService;
  Notification: Notification;
}, {
}>;

describe('Component: jabberToWebexTeamsAddProfileModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'JabberToWebexTeamsService',
      'Notification',
    );
    this.$scope.dismissSpy = jasmine.createSpy('dismissSpy');
    this.$scope.hasAllPrereqsSettingsDoneSpy = spyOn(this.JabberToWebexTeamsService, 'hasAllPrereqsSettingsDone').and.returnValue(this.$q.resolve(true));
    this.$scope.savePrereqsSettingsSpy = spyOn(this.JabberToWebexTeamsService, 'savePrereqsSettings').and.returnValue(this.$q.resolve());
    this.$scope.createSpy = spyOn(this.JabberToWebexTeamsService, 'create').and.returnValue(this.$q.resolve());
  });

  beforeEach(function (this: Test) {
    this.compileComponent('jabberToWebexTeamsAddProfileModal', {
      dismiss: 'dismissSpy()',
    });
  });

  describe('primary behaviors (view):', () => {
    describe('dismissing the modal:', () => {
      it('should call "dismissModal()" when modal close button is clicked', function (this: Test) {
        this.view.find('.modal-header .close').click();
        expect(this.$scope.dismissSpy).toHaveBeenCalled();
      });

      it('should call "dismissModal()" when cancel binding is invoked', function (this: Test) {
        this.view.find('.modal-footer .cancel').click();
        expect(this.$scope.dismissSpy).toHaveBeenCalled();
      });
    });

    describe('primary Save button:', () => {
      it('the Save button should be disabled if the user has not fill enough infromation', function () {
        // nothing has been filled
        expect(this.view.find('.modal-footer .btn--primary')).toBeDisabled();

        // only template name is filled
        this.controller.profileData.profileName = 'test_profile_name';
        this.$scope.$apply();
        expect(this.view.find('.modal-footer .btn--primary')).toBeDisabled();

        // clear the profileName
        this.controller.profileData.profileName = '';

        // only voice server is filled
        this.controller.profileData.voiceServerDomainName = 'voice.alpha.cisco.com';
        this.$scope.$apply();
        expect(this.view.find('.modal-footer .btn--primary')).toBeDisabled();

        // only uds server is filled
        this.controller.profileData.udsServerAddress = 'uds.alpha.cisco.com';
        this.$scope.$apply();
        expect(this.view.find('.modal-footer .btn--primary')).toBeDisabled();
      });

      it('the Save button should be enabled if the user has fill a voice or uds server', function () {
        // voice server
        this.controller.profileData.profileName = 'test_profile_name';
        this.controller.profileData.voiceServerDomainName = 'voice.alpha.cisco.com';
        this.$scope.$apply();
        expect(this.view.find('.modal-footer .btn--primary')).not.toBeDisabled();

        //uds server
        this.controller.profileData.profileName = 'test_profile_name';
        this.controller.profileData.udsServerAddress = 'uds.alpha.cisco.com';
        this.$scope.$apply();
        expect(this.view.find('.modal-footer .btn--primary')).not.toBeDisabled();
      });
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('dismissModal():', () => {
      it('should track the event', function (this: Test) {
        spyOn(this.Analytics, 'trackAddUsers');
        this.controller.dismissModal();
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
      });
    });

    describe('checkAndFinish():', () => {
      it('should not call finish() if the form is invalid', function (this: Test) {
        spyOn(this.controller, 'finish');
        this.controller.checkAndFinish();
        expect(this.controller.finish).not.toHaveBeenCalled();
      });

      it('should call finish() if the form is valid', function (this: Test) {
        spyOn(this.controller, 'finish');
        this.controller.profileData.profileName = 'test_profile_name';
        this.controller.profileData.voiceServerDomainName = 'voice.alpha.cisco.com';
        this.$scope.$apply();
        this.controller.checkAndFinish();
        expect(this.controller.finish).toHaveBeenCalled();
      });
    });

    describe('finish():', () => {
      it('call JabberToWebexTeamsService.create(...) if hasAllPrereqsSettingsDone()', function (this: Test) {
        this.controller.finish();
        this.$scope.$apply();
        expect(this.JabberToWebexTeamsService.create).toHaveBeenCalled();
      });

      it('should call this.Notification.errorResponse if call service failed', function (this: Test) {
        spyOn(this.Notification, 'errorResponse');
        this.$scope.createSpy.and.returnValue(this.$q.reject());
        this.controller.finish();
        this.$scope.$apply();
        expect(this.Notification.errorResponse).toHaveBeenCalled();
      });

      it('should not call JabberToWebexTeamsService.create(...) if not hasAllPrereqsSettingsDone() and savePrereqsSettings() failed', function (this: Test) {
        this.$scope.hasAllPrereqsSettingsDoneSpy.and.returnValue(this.$q.resolve(false));
        this.$scope.savePrereqsSettingsSpy.and.returnValue(this.$q.reject());
        this.controller.finish();
        this.$scope.$apply();
        expect(this.JabberToWebexTeamsService.create).not.toHaveBeenCalled();
      });

      it('should call JabberToWebexTeamsService.create(...) if not hasAllPrereqsSettingsDone() and savePrereqsSettings() OK', function (this: Test) {
        this.$scope.hasAllPrereqsSettingsDoneSpy.and.returnValue(this.$q.resolve(false));
        this.controller.finish();
        this.$scope.$apply();
        expect(this.JabberToWebexTeamsService.create).toHaveBeenCalled();
      });
    });
  });
});
