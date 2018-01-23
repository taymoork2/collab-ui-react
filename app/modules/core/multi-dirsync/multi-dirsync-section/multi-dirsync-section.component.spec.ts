import testModule, { IDirectorySync } from '../index';

describe('MultiDirsyncSection Component:', function () {
  // html locators
  const DISABLED = '#dirsyncDisabled span';
  const DISABLED_LINK = '#dirsyncDisabled a';
  const DOMAIN_NAME = '#dirsyncEnabled span';
  const DOMAIN_STATUS = '#dirsyncEnabled cs-statusindicator';
  const DROPDOWN_BUTTON = '.dropdown-toggle';
  const DROPDOWN_MENU = 'li a';

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'ModalService',
      'MultiDirSyncService',
      'Notification',
    );

    this.fixture = getJSONFixture('core/json/settings/multiDirsync.json');
    const directorySyncResponseBeans: IDirectorySync[] = [
      _.cloneDeep(this.fixture.dirsyncRow),
      _.cloneDeep(this.fixture.dirsyncRowDisabled),
    ];
    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(true),
    });

    spyOn(this.MultiDirSyncService, 'getDomains').and.returnValue(this.$q.resolve({
      data: {
        directorySyncResponseBeans: directorySyncResponseBeans,
      },
    }));
    spyOn(this.MultiDirSyncService, 'deactivateDomain').and.returnValue(this.$q.resolve(true));

    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Analytics, 'trackAddUsers');
    spyOn(this.$state, 'go');

    this.$state.modal = {
      closed: this.$q.resolve(),
      dismiss: jasmine.createSpy('dismiss'),
    };
  });

  function initComponent() {
    this.compileComponent('multiDirsyncSection', {});
    this.$scope.$apply();
  }

  describe('Positive Tests -', function () {
    it('should load with expected defaults when there is data', function () {
      initComponent.call(this);
      expect(this.view.find(DOMAIN_NAME).first().html()).toEqual(this.fixture.dirsyncRow.domains[0].domainName);
      expect(this.view.find(DOMAIN_STATUS).first()).toContainElement('.success');

      this.view.find(DROPDOWN_BUTTON).click();
      this.$scope.$apply();
      expect(this.view.find(DROPDOWN_MENU).first().html()).toEqual('globalSettings.multiDirsync.turnOff');
      expect(this.view.find(DROPDOWN_MENU).last().html()).toEqual('globalSettings.multiDirsync.seeAllDomains');
    });

    it('should turn off domain', function () {
      initComponent.call(this);

      this.view.find(DROPDOWN_BUTTON).click();
      this.$scope.$apply();
      this.view.find(DROPDOWN_MENU).first().click();

      expect(this.MultiDirSyncService.deactivateDomain).toHaveBeenCalledWith(this.fixture.dirsyncRow.domains[0].domainName);
    });

    it('should turn go to settings page', function () {
      initComponent.call(this);

      this.view.find(DROPDOWN_BUTTON).click();
      this.$scope.$apply();
      this.view.find(DROPDOWN_MENU).last().click();
      this.$scope.$apply();

      expect(this.$state.go).toHaveBeenCalledWith('settings', {
        showSettings: 'dirsync',
      });
      expect(this.$state.modal.dismiss).toHaveBeenCalled();
    });
  });

  describe('Negative Tests -', function () {
    const ERROR_FOUR_HUNDRED = { status: 400 };
    const ERROR_FIVE_HUNDRED = { status: 500 };

    it('should show disabled when domains API fails', function () {
      this.MultiDirSyncService.getDomains.and.returnValue(this.$q.reject(ERROR_FIVE_HUNDRED));
      initComponent.call(this);

      expect(this.view.find(DISABLED).html()).toEqual('common.disabled');
      expect(this.view.find(DISABLED_LINK).html()).toEqual('userManage.org.turnOnDirSync');
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(ERROR_FIVE_HUNDRED, 'globalSettings.multiDirsync.domainsError');
    });

    it('should show disabled when there are no domains (error 400)', function () {
      this.MultiDirSyncService.getDomains.and.returnValue(this.$q.reject(ERROR_FOUR_HUNDRED));
      initComponent.call(this);

      expect(this.view.find(DISABLED).html()).toEqual('common.disabled');
      expect(this.view.find(DISABLED_LINK).html()).toEqual('userManage.org.turnOnDirSync');
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });

    it('should go to initialization page when link is clicked on disabled screen', function () {
      this.MultiDirSyncService.getDomains.and.returnValue(this.$q.reject(ERROR_FIVE_HUNDRED));
      initComponent.call(this);

      this.view.find(DISABLED_LINK).click();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledTimes(1);
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.advanced.add.ob.installConnector');
    });

    it('should notify on failed delete', function () {
      this.MultiDirSyncService.deactivateDomain.and.returnValue(this.$q.reject(ERROR_FIVE_HUNDRED));
      initComponent.call(this);

      this.view.find(DROPDOWN_BUTTON).click();
      this.$scope.$apply();
      this.view.find(DROPDOWN_MENU).first().click();

      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(ERROR_FIVE_HUNDRED, 'globalSettings.multiDirsync.deleteError', {
        domainName: this.fixture.dirsyncRow.domains[0].domainName,
      });
    });
  });
});
