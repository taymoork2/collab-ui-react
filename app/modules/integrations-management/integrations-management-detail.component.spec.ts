import moduleName from './index';
import { IntegrationsManagementDetail } from './integrations-management-detail.component';
import { IApplicationUsage } from './integrations-management.types';

type Test = atlas.test.IComponentTest<IntegrationsManagementDetail,
  {
    components: {},
  }>;

describe('Component: integrationsManagementList:', () => {

  const applicationUsage =  _.cloneDeep(getJSONFixture('integrations/integrations-list.json')[0]) as IApplicationUsage;

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
    );
  });

  function initComponent(this: Test) {
    this.compileComponent('integrationsManagementDetail', {
      integration: applicationUsage,
    });
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should display the grid and populate the records without filter or sort upon init', function (this: Test) {
      const sections = this.view.find('cs-sp-section');
      expect(sections.length).toBe(6);
      expect(sections.eq(0).find('.feature-name')).toHaveText(applicationUsage.appId);
      expect(sections.eq(1).find('.feature-name')).toHaveText(applicationUsage.appClientId);
      expect(sections.eq(2).find('.feature-name')).toHaveText(applicationUsage.appPrivacyUrl);
      expect(sections.eq(3).find('.feature-name')).toHaveText(applicationUsage.appSupportUrl);
      expect(sections.eq(4).find('.feature-name')).toHaveText(applicationUsage.appCompanyUrl);
      expect(sections.eq(5).find('.feature-name')).toHaveText(`${applicationUsage.appContactName} ${applicationUsage.appContactEmail}`);
    });
  });
});
