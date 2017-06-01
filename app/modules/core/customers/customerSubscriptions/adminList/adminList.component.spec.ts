import moduleName from './index';

describe('Component: AdminListComponent', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.fixtures = {
      shortList: [{
        email: 'fake-email-1@example.com',
        displayName: 'fake-display-name-1',
      }, {
        email: 'fake-email-2@example.com',
        displayName: 'fake-display-name-2',
      }],
      longList: [{
        email: 'fake-email-1@example.com',
        displayName: 'fake-display-name-1',
      }, {
        email: 'fake-email-2@example.com',
        displayName: 'fake-display-name-2',
      }, {
        email: 'fake-email-3@example.com',
        displayName: 'fake-display-name-3',
      }, {
        email: 'fake-email-4@example.com',
        displayName: 'fake-display-name-4',
      }],
    };
  });

  describe('primary behaviors:', function () {
    describe('when "members" is shorter than display limit:', function () {
      beforeEach(function () {
        this.compileComponent('crAdminList', {
          members: 'fixtures.shortList',
          title: 'fake-title',
        });
      });

      it('should have a list title', function () {
        expect(this.view.find('.list-title').text()).toBe('fake-title');
      });

      it('should render all items if "members" is not longer than the display limit', function () {
        expect(this.view.find('.admin-list-item').length).toBe(2);
      });

      it('should not show the toggle link if "members" is not longer than the display limit', function () {
        // short list has 2 members, default display limit is 3
        expect(this.view.find('.toggle-link').hasClass('ng-hide')).toBe(true);
      });
    });

    describe('when "members" is longer than display limit:', function () {
      beforeEach(function () {
        this.compileComponent('crAdminList', {
          members: 'fixtures.longList',
        });
      });

      it('should render "members" only up to display limit', function () {
        // long list has 4 members, default display limit is 3
        expect(this.view.find('.admin-list-item').length).toBe(3);
      });

      it('should show the toggle link if "members" is longer than the display limit', function () {
        expect(this.view.find('.toggle-link').hasClass('ng-hide')).toBe(false);
      });

      it('should render all members when the toggle link is toggled once, and the display limit of members when toggled twice', function () {
        this.view.find('.toggle-link a[ng-show="!$ctrl.isExpanded"]').click();
        expect(this.view.find('.admin-list-item').length).toBe(4);

        this.view.find('.toggle-link a[ng-show="$ctrl.isExpanded"]').click();
        expect(this.view.find('.admin-list-item').length).toBe(3);
      });
    });
  });

  describe('helpers:', function () {
    describe('showToggleLink():', function () {
      it('should return false if "members" is shorter than display limit (default: 3)', function () {
        this.compileComponent('crAdminList', {
          members: 'fixtures.shortList',
        });
        expect(this.controller.showToggleLink()).toBe(false);
      });

      it('should return true if "members" is longer than display limit', function () {
        this.compileComponent('crAdminList', {
          members: 'fixtures.longList',
        });
        expect(this.controller.showToggleLink()).toBe(true);
      });
    });

    describe('showDisplayName():', function () {
      beforeEach(function () {
        this.compileComponent('crAdminList');
      });

      it('should return false "admin.displayName" is false-y', function () {
        expect(this.controller.showDisplayName({
          email: 'fake-email-1@example.com',
          displayName: '',
        })).toBe(false);

        expect(this.controller.showDisplayName({
          email: 'fake-email-1@example.com',
          displayName: null,
        })).toBe(false);

        expect(this.controller.showDisplayName({
          email: 'fake-email-1@example.com',
          displayName: undefined,
        })).toBe(false);
      });

      it('should return false "admin.displayName" is the same value as "admin.email"', function () {
        expect(this.controller.showDisplayName({
          email: 'fake-email-1@example.com',
          displayName: 'fake-email-1@example.com',
        })).toBe(false);
      });

      it('should return true if "admin.displayName" is truthy and a different value from "admin.email"', function () {
        expect(this.controller.showDisplayName({
          email: 'fake-email-1@example.com',
          displayName: 'foo',
        })).toBe(true);
      });
    });

    describe('toggleList():', function () {
      it('should reverse the value of "isExpanded"', function () {
        this.compileComponent('crAdminList');
        expect(this.controller.isExpanded).toBe(false);
        this.controller.toggleList();
        expect(this.controller.isExpanded).toBe(true);
        this.controller.toggleList();
        expect(this.controller.isExpanded).toBe(false);
      });

      it('should toggle "displayLimit" to either the full "members" length, or the default display limit', function () {
        this.compileComponent('crAdminList', {
          members: 'fixtures.longList',
        });

        expect(this.controller.displayLimit).toBe(3);
        this.controller.toggleList();
        expect(this.controller.displayLimit).toBe(4);
        this.controller.toggleList();
        expect(this.controller.displayLimit).toBe(3);
      });
    });
  });
});
