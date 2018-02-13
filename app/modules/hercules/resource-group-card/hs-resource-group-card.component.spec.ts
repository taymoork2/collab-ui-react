import hsResourceGroupCardModule from './index';

describe('Component: hsResourceGroupCard', function () {
  describe('Controller', function () {
    const groupMock = {
      clusters: [],
      id: '1',
      name: 'Bøler',
      numberOfUsers: 0,
      releaseChannel: 'stable',
    };

    beforeEach(function () {
      this.initModules(hsResourceGroupCardModule);
      this.injectDependencies(
        '$scope',
        '$translate',
      );
      this.$scope.groupMock = groupMock;
      this.compileComponent('hsResourceGroupCard', { resourceGroup: 'groupMock' });
      spyOn(this.$translate, 'instant').and.callThrough();
    });

    it('should bind to the correct group', function () {
      expect(this.controller.group.id).toEqual(groupMock.id);
    });

    it('getResourceGroupSettingsAriaLabel() should return expected aria-label', function () {
      const label = 'hercules.resourceGroupSettings.pageTitle';
      expect(this.controller.getResourceGroupSettingsAriaLabel()).toEqual(label);
      expect(this.$translate.instant).toHaveBeenCalledWith(label, { groupName: groupMock.name });
    });

    describe('hasZeroClusters()', function () {
      it('should be true if there are 0 clusters', function () {
        expect(this.controller.hasZeroClusters()).toEqual(true);
      });
    });

    describe('hasUsers()', function () {
      it('should be false if there are 0 users', function () {
        expect(this.controller.hasUsers()).toEqual(false);
      });
    });
  });
});
