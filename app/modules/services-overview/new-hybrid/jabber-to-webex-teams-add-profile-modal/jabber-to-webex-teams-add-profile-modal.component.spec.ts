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
      it('call JabberToWebexTeamsService.create(...) ', function (this: Test) {
        spyOn(this.JabberToWebexTeamsService, 'create').and.returnValue(this.$q.resolve());
        this.controller.finish();
        expect(this.JabberToWebexTeamsService.create).toHaveBeenCalled();
      });

      it('should not call dismissModal if call service failed', function (this: Test) {
        spyOn(this.controller, 'dismissModal');
        this.controller.profileData.profileName = 'test_profile_name';
        this.controller.profileData.voiceServerDomainName = 'voice.alpha.cisco.com';
        this.$scope.$apply();
        this.controller.finish();
        expect(this.controller.dismissModal).not.toHaveBeenCalled();
      });
    });
  });
});
