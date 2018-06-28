import testModule from '../index';

describe('DirsyncRow Component', function () {
  // status types
  const DISABLED = 'disabled';
  const PRIMARY = 'primary';
  const SUCCESS = 'success';

  // html locators
  const CONNECTOR_NAMES = '.columns.medium-8 text-tooltip span';
  const CONNECTOR_STATUS = '.columns.medium-8 cs-statusindicator';
  const DOMAIN_NAME = '.columns.medium-8 p';
  const MENU_BUTTON = '#actionsButton';
  const MENU_ITEMS = '.dropdown-menu li';
  const STATUS = '.columns.medium-4 cs-statusindicator';

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies();

    this.fixture = getJSONFixture('core/json/settings/multiDirsync.json');
    this.dirsyncConnectors = _.cloneDeep(this.fixture.dirsyncConnectors);

    this.$scope.dirsync = _.cloneDeep(this.fixture.dirsyncRow);
    this.$scope.deactivateConnectorFn = jasmine.createSpy('deactivateConnectorFn');
  });

  function initComponent() {
    this.compileComponent('dirsyncRow', {
      dirsync: 'dirsync',
      deleteDomainFn: _.noop,
      deactivateConnectorFn: 'deactivateConnectorFn(connector)',
    });
  }

  describe('dirsyncRow should initialize with expected settings', function () {
    it('when all connectors are in service', function () {
      initComponent.call(this);
      expect(this.controller.connectors).toEqual(this.dirsyncConnectors);
      expect(this.controller.domainName).toEqual(this.$scope.dirsync.domains[0].domainName);
    });

    it('when some connectors are in service', function () {
      this.$scope.dirsync.connectors[0].isInService = false;
      this.dirsyncConnectors[0].isInService = false;
      this.dirsyncConnectors[0].status = DISABLED;

      initComponent.call(this);
      expect(this.controller.connectors).toEqual(this.dirsyncConnectors);
    });

    it('when no connectors are in service', function () {
      this.$scope.dirsync.connectors[0].isInService = false;
      this.$scope.dirsync.connectors[1].isInService = false;
      this.dirsyncConnectors[0].isInService = false;
      this.dirsyncConnectors[0].status = DISABLED;
      this.dirsyncConnectors[1].isInService = false;
      this.dirsyncConnectors[1].status = DISABLED;

      initComponent.call(this);
      expect(this.controller.connectors).toEqual(this.dirsyncConnectors);
    });
  });

  describe('Component HTML', function () {
    beforeEach(function () {
      initComponent.call(this);
    });

    it('should display all connectors and have three items in the dropdown menu', function () {
      expect(this.view.find(DOMAIN_NAME).html()).toEqual(this.$scope.dirsync.domains[0].domainName);
      expect(this.view.find(CONNECTOR_NAMES).first().html()).toEqual(` ${this.dirsyncConnectors[0].name} `);
      expect(this.view.find(CONNECTOR_NAMES).last().html()).toEqual(` ${this.dirsyncConnectors[1].name} `);
      expect(this.view.find(CONNECTOR_STATUS).first()).toContainElement(`.${PRIMARY}`);
      expect(this.view.find(CONNECTOR_STATUS).last()).toContainElement(`.${PRIMARY}`);

      expect(this.view.find(STATUS)).toContainElement(`.${SUCCESS}`);
      this.view.find(MENU_BUTTON).click();
      this.$scope.$apply();
      const menu_items: JQuery = this.view.find(MENU_ITEMS);
      menu_items.each((index: number, element: Element) => {
        if (index === 0) {
          expect(element.innerHTML).toContain('globalSettings.multiDirsync.turnOff');
        } else {
          expect(element.innerHTML).toContain('globalSettings.multiDirsync.deactivate');
        }
      });
    });

    it('should call the expected functions from the dropdown menu', function () {
      spyOn(this.controller, 'deleteDomainFn');

      this.view.find(MENU_BUTTON).click();
      this.$scope.$apply();
      let menu_items: JQuery = this.view.find(MENU_ITEMS);
      menu_items.first().click();
      this.$scope.$apply();
      expect(this.controller.deleteDomainFn).toHaveBeenCalledTimes(1);
      expect(this.$scope.deactivateConnectorFn).toHaveBeenCalledTimes(0);

      this.view.find(MENU_BUTTON).click();
      this.$scope.$apply();
      menu_items = this.view.find(MENU_ITEMS);
      menu_items.get(1).click();
      this.$scope.$apply();
      expect(this.controller.deleteDomainFn).toHaveBeenCalledTimes(1);
      expect(this.$scope.deactivateConnectorFn).toHaveBeenCalledTimes(1);

      this.view.find(MENU_BUTTON).click();
      this.$scope.$apply();
      menu_items = this.view.find(MENU_ITEMS);
      menu_items.last().click();
      this.$scope.$apply();
      expect(this.controller.deleteDomainFn).toHaveBeenCalledTimes(1);
      expect(this.$scope.deactivateConnectorFn).toHaveBeenCalledTimes(2);
    });
  });
});
