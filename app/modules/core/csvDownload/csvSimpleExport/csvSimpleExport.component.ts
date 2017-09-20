
/**
 * CsvSimpleExport displays a download icon that, when pressed, exectutes
 * a csv export and download. Supports accesibility.
 */

class CsvSimpleExportController implements ng.IComponentController {
  public filename: string;
  public exportTooltip: string;
  public exportingTooltip: string;
  public tooltipPlacement: string;
  public onExport: any;
  public activeTooltip: string;
  public exporting = false;
  public exportedData: any;

  /* @ngInject */
  constructor(
    public $element: ng.IRootElementService,
    public $timeout: ng.ITimeoutService,
  ) {
  }

  public $onInit() {
    this.activeTooltip = this.exportTooltip;
    this.exporting = false;
  }

  public beginExport() {
    if (!this.exporting) {
      this.exporting = true;
      this.activeTooltip = this.exportingTooltip;
      this.$timeout(() => {
        const ngCsvElement = this.$element.find('.download-element');
        ngCsvElement.click();
      });
    }
  }

  public doExport() {
    return this.onExport({})
      .finally(() => {
        this.activeTooltip = this.exportTooltip;
        this.exporting = false;
      });
  }
}

export class CsvSimpleExportComponent implements ng.IComponentOptions {
  public template = require('modules/core/csvDownload/csvSimpleExport/csvSimpleExport.component.html');
  public controller = CsvSimpleExportController;
  public bindings = {
    onExport: '&',              // called when user clicks the export icon
    filename: '@',              // name of the file to use when saving
    exportTooltip: '@',         // tootip to show when not exporting
    exportingTooltip: '@',      // tootip to show WHILE exporting
    tooltipPlacement: '@',      // where to place the tooltip
  };
}

