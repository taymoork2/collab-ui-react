import moduleName from './index';
import { JabberToWebexTeamsProfilesController } from './jabber-to-webex-teams-profiles.component';
import { Notification } from 'modules/core/notifications';
import { IToolkitModalService } from 'modules/core/modal';
import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsProfilesController, {
  $q: ng.IQService;
  $scope: ng.IScope;
  $state: ng.ui.IStateService;
  JabberToWebexTeamsService: JabberToWebexTeamsService;
  ModalService: IToolkitModalService;
  Notification: Notification;
}, {}>;

describe('Component: jabberToWebexTeamsProfiles:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'JabberToWebexTeamsService',
      'ModalService',
      'Notification',
    );
    installPromiseMatchers();
    spyOn(this.JabberToWebexTeamsService, 'listUcManagerProfiles').and.returnValue(this.$q.resolve(profiles));
    spyOn(this.JabberToWebexTeamsService, 'deleteUcManagerProfile').and.returnValue(this.$q.resolve({}));
    spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
    spyOn(this.Notification, 'success');
    spyOn(this.$state, 'go');
  });

  function initComponent(this: Test) {
    this.compileComponent('jabberToWebexTeamsProfiles', {
    });
  }

  function getCard(cardNumber: number) {
    return this.view.find('.cs-card').eq(cardNumber);
  }

  function getCardMenuItem(cardNumber: number, menuItemNumber: number) {
    return this.view.find(`.cs-card:nth-child(${cardNumber + 1}) li:nth-child(${menuItemNumber + 1}) > a`).eq(0);
  }

  describe('primary behaviors (view):', () => {
    beforeEach(initComponent);

    it('should show the list of profiles', function (this: Test) {
      expect(this.view.find('.cs-card').length).toBe(profiles.length);
      expect(getCard.apply(this, [1]).find('.h5').text()).toBe(profiles[0].templateName);
    });

    it('should go to add profile when the "add" button is clicked', function (this: Test) {
      this.view.find('button[name="add-profile"]').click();
      this.$scope.$digest();
      expect(this.$state.go).toHaveBeenCalledWith('jabber-to-webex-teams.modal.add-profile');
    });

    it('should go to edit state with correct profile information when "edit" is clicked', function (this: Test) {
      getCardMenuItem.apply(this, [1, 0]).click();
      this.$scope.$digest();
      expect(this.$state.go).toHaveBeenCalledWith('jabber-to-webex-teams.modal.edit-profile', { profileData: profiles[0] });
    });

    it('should call delete service with correct profile id when  "delete" is clicked', function (this: Test) {
      getCardMenuItem.apply(this, [1, 1]).click();
      this.$scope.$digest();
      expect(this.JabberToWebexTeamsService.deleteUcManagerProfile).toHaveBeenCalledWith(profiles[0].id);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  const profiles = [
    {
      templateName: 'TemplateName1',
      id: 'id1',
    },
    {
      templateName: 'aTemplateName2',
      id: 'id2',
    },
    {
      templateName: 'wTemplateName3',
      id: 'id3',
    },
  ];
});
