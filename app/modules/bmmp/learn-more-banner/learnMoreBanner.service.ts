interface IBmmpLocations {
  reports: any;
  overview: any;
}

export class LearnMoreBannerService {
  /* @ngInject */
  constructor() { }

  public readonly REPORTS_LOCATION: string = 'reports';
  public readonly OVERVIEW_LOCATION: string = 'overview';
  public readonly CLOSE_ELEMENTS: IBmmpLocations = {
    reports: '.reports-bmmp-banner .cisco-bmmp-marketing-closeable-widget .colR',
    overview: '.overview-bmmp-banner .cisco-bmmp-marketing-closeable-widget .colR',
  };
  public readonly LINK_ELEMENTS: IBmmpLocations = {
    reports: '.reports-bmmp-banner .cisco-bmmp-marketing-closeable-widget .colL a',
    overview: '.overview-bmmp-banner .cisco-bmmp-marketing-closeable-widget .colL a',
  };

  // close element is visible
  public isElementVisible(location: string, element?: JQuery): boolean {
    if (element) {
      return element.is(':visible');
    } else {
      return angular.element(this.CLOSE_ELEMENTS[location]).is(':visible');
    }
  }
}
