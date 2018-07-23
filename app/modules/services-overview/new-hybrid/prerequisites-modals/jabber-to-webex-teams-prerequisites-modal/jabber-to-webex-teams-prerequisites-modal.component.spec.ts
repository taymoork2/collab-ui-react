import moduleName from './index';
import { Analytics } from 'modules/core/analytics';
import { JabberToWebexTeamsPrerequisitesModalController } from './jabber-to-webex-teams-prerequisites-modal.component';
import { Notification } from 'modules/core/notifications';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsPrerequisitesModalController, {
  $scope: ng.IScope;
  $state: ng.ui.IStateService;
  Analytics: Analytics;
  Notification: Notification;
}, {
}>;

describe('Component: jabberToWebexTeamsPrerequisitesModal:', () => {

  beforeEach(function (this: Test) {
    this.initModules(
      moduleName,
    );
    this.injectDependencies(
      '$scope',
      '$state',
      'Analytics',
      'Notification',
    );
    this.$scope.dismissSpy = jasmine.createSpy('dismissSpy');
  });

  beforeEach(function (this: Test) {
    this.compileComponent('jabberToWebexTeamsPrerequisitesModal', {
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

    describe('primary CTA button:', () => {
      it('should be a "Next" button if not all prereqs are selected', function () {
        // no prereqs selected yet
        expect(this.view.find('.modal-footer .btn--primary [translate="common.next"]')).toExist();

        // only one prereq selected
        this.view.find('cr-checkbox-item:eq(0) input').click();
        expect(this.view.find('.modal-footer .btn--primary [translate="common.next"]')).toExist();
      });

      it('should be a "Finish" button if all prereqs are selected', function () {
        // both prereqs selected
        this.view.find('cr-checkbox-item:eq(0) input').click();
        this.view.find('cr-checkbox-item:eq(1) input').click();
        expect(this.view.find('.modal-footer .btn--primary [translate="common.next"]')).not.toExist();
        expect(this.view.find('.modal-footer .btn--primary [translate="common.finish"]')).toExist();
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

    describe('(get) hasPrereqs():', () => {
      it('should return false if "preReqs" property does not have enough entries', function () {
        // zero entries
        expect(_.size(this.controller.preReqs)).toBe(0);
        expect(this.controller.hasPrereqs).toBe(false);

        // only one entry
        _.set(this.controller.preReqs, 'fake-entry-1', 'fake-value');
        expect(_.size(this.controller.preReqs)).toBe(1);
        expect(this.controller.hasPrereqs).toBe(false);
      });

      it('should return true if "preReqs" property has enough entries and all entries are selected, false otherwise', function () {
        expect(_.size(this.controller.preReqIds)).toBe(2);
        _.set(this.controller.preReqs, 'fake-entry-1', { isSelected: true });
        _.set(this.controller.preReqs, 'fake-entry-2', { isSelected: true });
        expect(this.controller.hasPrereqs).toBe(true);

        _.set(this.controller.preReqs, 'fake-entry-2', { isSelected: false });
        expect(this.controller.hasPrereqs).toBe(false);
      });
    });

    describe('nextOrFinish():', () => {
      beforeEach(function (this: Test) {
        spyOn(this.controller, 'next');
        spyOn(this.controller, 'finish');
      });

//      // TODO (mipark2): restore this once 'engci-maven.cisco.com' (64.103.77.42) is back in service again
//      it('should call "next()" if not all prereqs are selected', function () {
//        spyOnProperty(this.controller, 'hasPrereqs', 'get').and.returnValue(false);
//        this.controller.nextOrFinish();
//        expect(this.controller.next).toHaveBeenCalled();
//      });

//      // TODO (mipark2): restore this once 'engci-maven.cisco.com' (64.103.77.42) is back in service again
//      it('should call "finish()" if all prereqs are selected', function () {
//        spyOnProperty(this.controller, 'hasPrereqs', 'get').and.returnValue(true);
//        this.controller.nextOrFinish();
//        expect(this.controller.finish).toHaveBeenCalled();
//      });
    });

    describe('next():', () => {
      it('should jump to add profile page', function () {
        spyOn(this.$state, 'go');
        this.controller.next();
        expect(this.$state.go).toHaveBeenCalledWith('jabber-to-webex-teams.modal.add-profile');
      });
    });

    describe('finish():', () => {
      it('should notify success and dismiss the modal', function () {
        spyOn(this.Notification, 'success');
        spyOn(this.controller, 'dismiss');
        this.controller.finish();
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.controller.dismiss).toHaveBeenCalled();
      });
    });
  });
});
