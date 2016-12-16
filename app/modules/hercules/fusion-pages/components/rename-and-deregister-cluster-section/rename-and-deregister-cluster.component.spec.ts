import renameAndDeregisterClusterSection from './index';

describe('Component: RenameAndDeregisterClusterSection', () => {

    beforeEach(function () {
        this.initModules(renameAndDeregisterClusterSection);
        this.injectDependencies(
            'FusionClusterService',
            'Notification'
        );
    });

    afterEach(function () {
        if (this.view) {
            this.view.remove();
        }
    });

    it ('should contain a rename section if the showRenameSection attribute is true', function() {
        this.compileComponent('renameAndDeregisterClusterSection', {
            showRenameSection: true,
        });
        expect(this.view).toContainElement('#renameSection');
    });

    it ('should NOT contain a rename section if the showRenameSection attribute is not set', function() {
        this.compileComponent('renameAndDeregisterClusterSection');
        expect(this.view).not.toContainElement('#renameSection');
    });

});
