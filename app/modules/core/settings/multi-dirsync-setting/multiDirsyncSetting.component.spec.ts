import testModule from '../index';

describe('MultiDirsyncSetting Component:', function () {
  const DELETE_ALL_ERROR = 'globalSettings.multiDirsync.deleteAllError';
  const DELETE_CONNECTOR_ERROR = 'globalSettings.multiDirsync.connectorError';
  const DELETE_DOMAIN_ERROR = 'globalSettings.multiDirsync.deleteError';
  const DISABLED_TEXT = 'common.disabled';
  const DOMAIN_ERROR = 'globalSettings.multiDirsync.domainsError';
  const TURN_OFF_DIRSYNC_TEXT = 'globalSettings.multiDirsync.turnOffDirSync';
  const TURN_ON_DIRSYNC_TEXT = 'globalSettings.multiDirsync.turnOnDirSync';

  // HTML locators
  const DIRSYNC_ROW = 'dirsync-row';
  const DISABLED_STATE_INDICATOR = '#dirsyncDisabled cs-statusindicator i';
  const DISABLED_STATE_TEXT = '#dirsyncDisabled span';
  const SECTION_DESCRIPTION_LINK = '.section__description a';
  const MENU_BUTTON = '#actionsButton';
  const MENU_ITEMS = '.dropdown-menu li';

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      '$scope',
      'ModalService',
      'MultiDirSyncSettingService',
      'Notification',
    );

    this.fixture = getJSONFixture('core/json/settings/multiDirsync.json');

    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(true),
    });

    spyOn(this.MultiDirSyncSettingService, 'getDomains').and.returnValue(this.$q.resolve({
      data: {
        directorySyncResponseBeans: [_.cloneDeep(this.fixture.dirsyncRow)],
      },
    }));
    spyOn(this.MultiDirSyncSettingService, 'deleteConnector').and.returnValue(this.$q.resolve(true));
    spyOn(this.MultiDirSyncSettingService, 'deactivateDomain').and.returnValue(this.$q.resolve(true));

    spyOn(this.Notification, 'errorWithTrackingId');

    this.initComponent = () => {
      this.compileComponent('multiDirsyncSetting', {});
      this.$scope.$apply();
    };
  });

  describe('Positive Tests -', function () {
    it('should load with expected defaults when there is data', function () {
      this.initComponent();
      expect(this.view).toContainElement(DIRSYNC_ROW);
      expect(this.view.find(SECTION_DESCRIPTION_LINK).html()).toEqual(TURN_OFF_DIRSYNC_TEXT);
    });

    it('should load with expected defaults when there is no data', function () {
      this.MultiDirSyncSettingService.getDomains.and.returnValue(this.$q.resolve({
        data: {
          directorySyncResponseBeans: [],
        },
      }));
      this.initComponent();
      expect(this.view).not.toContainElement(DIRSYNC_ROW);
      expect(this.view.find(SECTION_DESCRIPTION_LINK).html()).toEqual(TURN_ON_DIRSYNC_TEXT);
      expect(this.view).toContainElement(DISABLED_STATE_INDICATOR);
      expect(this.view.find(DISABLED_STATE_TEXT).html()).toEqual(DISABLED_TEXT);
    });

    describe('should call MultiDirSyncSettingService when', function () {
      beforeEach(function () {
        this.initComponent();
      });

      it('the "Turn Off All" link is clicked', function () {
        this.initComponent();
        this.view.find(SECTION_DESCRIPTION_LINK).click();
        this.$scope.$apply();
        this.$scope.$apply();
        expect(this.MultiDirSyncSettingService.deactivateDomain).toHaveBeenCalledWith(undefined);
        expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
      });

      it('"Turn Off <domain>" link is clicked', function () {
        this.initComponent();
        this.view.find(DIRSYNC_ROW).first().find(MENU_BUTTON).click();
        this.$scope.$apply();
        this.view.find(DIRSYNC_ROW).first().find(MENU_ITEMS).first().click();
        this.$scope.$apply();

        const domainName = this.fixture.dirsyncRow.domains[0].domainName;
        expect(this.MultiDirSyncSettingService.deactivateDomain).toHaveBeenCalledWith(domainName);
        expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
      });

      it('"Deactivate <connector>" link is clicked', function () {
        this.initComponent();
        this.view.find(DIRSYNC_ROW).first().find(MENU_BUTTON).click();
        this.$scope.$apply();
        this.view.find(DIRSYNC_ROW).first().find(MENU_ITEMS).last().click();
        this.$scope.$apply();

        const connectorName = this.fixture.dirsyncRow.connectors[1].name;
        expect(this.MultiDirSyncSettingService.deleteConnector).toHaveBeenCalledWith(connectorName);
        expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
      });
    });
  });

  describe('Negative Tests -', function () {
    it('should load with expected defaults when the domains API returns error', function () {
      this.MultiDirSyncSettingService.getDomains.and.returnValue(this.$q.reject({}));
      this.initComponent();

      expect(this.view).not.toContainElement(DIRSYNC_ROW);
      expect(this.view.find(SECTION_DESCRIPTION_LINK).html()).toEqual(TURN_ON_DIRSYNC_TEXT);
      expect(this.view).toContainElement(DISABLED_STATE_INDICATOR);
      expect(this.view.find(DISABLED_STATE_TEXT).html()).toEqual(DISABLED_TEXT);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith({}, DOMAIN_ERROR);
    });

    describe('should call error notification when MultiDirSyncSettingService returns in error when', function () {
      beforeEach(function () {
        this.MultiDirSyncSettingService.deleteConnector.and.returnValue(this.$q.reject({}));
        this.MultiDirSyncSettingService.deactivateDomain.and.returnValue(this.$q.reject({}));
        this.initComponent();
      });

      it('the "Turn Off All" link is clicked', function () {
        this.initComponent();
        this.view.find(SECTION_DESCRIPTION_LINK).click();
        this.$scope.$apply();
        this.$scope.$apply();

        expect(this.MultiDirSyncSettingService.deactivateDomain).toHaveBeenCalledWith(undefined);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith({}, DELETE_ALL_ERROR, {
          domainName: undefined,
        });
      });

      it('"Turn Off <domain>" link is clicked', function () {
        this.initComponent();
        this.view.find(DIRSYNC_ROW).first().find(MENU_BUTTON).click();
        this.$scope.$apply();
        this.view.find(DIRSYNC_ROW).first().find(MENU_ITEMS).first().click();
        this.$scope.$apply();

        const domainName = this.fixture.dirsyncRow.domains[0].domainName;
        expect(this.MultiDirSyncSettingService.deactivateDomain).toHaveBeenCalledWith(domainName);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith({}, DELETE_DOMAIN_ERROR, {
          domainName: domainName,
        });
      });

      it('"Deactivate <connector>" link is clicked', function () {
        this.initComponent();
        this.view.find(DIRSYNC_ROW).first().find(MENU_BUTTON).click();
        this.$scope.$apply();
        this.view.find(DIRSYNC_ROW).first().find(MENU_ITEMS).last().click();
        this.$scope.$apply();

        const connectorName = this.fixture.dirsyncRow.connectors[1].name;
        expect(this.MultiDirSyncSettingService.deleteConnector).toHaveBeenCalledWith(connectorName);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith({}, DELETE_CONNECTOR_ERROR, {
          connectorName: connectorName,
        });
      });
    });
  });
});
