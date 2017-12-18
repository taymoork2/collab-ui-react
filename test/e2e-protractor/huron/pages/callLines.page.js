export class CallLinesPage {
  constructor() {
    this.callLines = element(by.css('a[href="/services/call-lines"]'));
    this.iconGoBack = element(by.css('i.icon.icon-arrow-back'));
    this.pageTitleCall = element(by.cssContainingText('h2.page-header__title', 'Call'));
    this.callLinesHRef = element(by.css('a[href="/services/call-lines"]'));
    this.callFeaturesHRef = element(by.css('a[href="/services/call-features"]'));
    this.callSettingsHRef = element(by.css('a[href="/services/call-settings"]'));
    this.orderHistory = element(by.css('span.order-history'));
    this.iconSearch = element(by.css('i.icon.icon-search'));
    this.internalExt = element(by.cssContainingText('.ui-grid-header-cell-label', 'Internal Extension'));
    this.phoneNumbers = element(by.cssContainingText('.ui-grid-header-cell-label', 'Phone Numbers'));
    this.assignedTo = element(by.cssContainingText('.ui-grid-header-cell-label', 'Assigned to'));
    this.actionsBtn = element(by.cssContainingText('.ui-grid-header-cell-label', 'Actions'));
    this.ascendingFirstEle = element.all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows')).get(0);
    this.firstDN = this.ascendingFirstEle.all(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns')).first();
    this.decendingFirstEle = element.all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows')).get(0);
    this.lastDN = this.decendingFirstEle.all(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns')).first();
    this.ascendingDn = '300';
    this.descendingDn = '399';
  }
};
