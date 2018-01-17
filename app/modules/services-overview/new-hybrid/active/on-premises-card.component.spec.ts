import moduleName from './index';

describe('on-premises resources card', () => {

  beforeEach(function () {
    this.initModules(moduleName);
  });

  it('should default to an inactive link if it receives no data', function () {
    this.compileComponent('on-premises-card');
    expect(this.view.find('div.active-card_section > div.active-card_action')[0].outerHTML).toContain('<div class="active-card_action" translate="servicesOverview.cards.clusterList.buttons.none"></div>');
  });

  it('should be inactive if there are not clusters and no trunks', function () {
    const clusters = [];
    const trunks = [];
    this.compileComponent('on-premises-card', {
      clusters: clusters,
      trunks: trunks,
    });
    expect(this.view.find('div.active-card_section > div.active-card_action')[0].outerHTML).toContain('<div class="active-card_action" translate="servicesOverview.cards.clusterList.buttons.none"></div>');
  });

  it('should be active if there are clusters, but no trunks', function () {
    const clusters = [
      { id: '1234' },
    ];
    const trunks = [];
    this.compileComponent('on-premises-card', {
      clusters: clusters,
      trunks: trunks,
    });
    expect(this.view.find('div.active-card_section > div.active-card_action')[0].outerHTML).toContain('<a ui-sref="cluster-list" translate="servicesOverview.cards.clusterList.buttons.view"></a>');
  });

  it('should be active if there are trunks, but no clusters', function () {
    const clusters = [];
    const trunks = [
      { id: '1234' },
    ];
    this.compileComponent('on-premises-card', {
      clusters: clusters,
      trunks: trunks,
    });
    expect(this.view.find('div.active-card_section > div.active-card_action')[0].outerHTML).toContain('<a ui-sref="cluster-list" translate="servicesOverview.cards.clusterList.buttons.view"></a>');
  });

  it('should be active if there are both clusters and trunks', function () {
    const clusters = [
      { id: '1234' },
    ];
    const trunks = [
      { id: '5678' },
    ];
    this.compileComponent('on-premises-card', {
      clusters: clusters,
      trunks: trunks,
    });
    expect(this.view.find('div.active-card_section > div.active-card_action')[0].outerHTML).toContain('<a ui-sref="cluster-list" translate="servicesOverview.cards.clusterList.buttons.view"></a>');
  });

});
