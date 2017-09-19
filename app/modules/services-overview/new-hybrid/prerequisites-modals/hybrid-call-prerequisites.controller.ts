export class HybridCallPrerequisitesController {

  public expresswayTabHeading: string = 'Expressway-C Connector Host (0/6)';

  /* @ngInject */
  constructor(
  ) {
  }

  public expresswayData = (options) => {
    const numberChecked = options.numberChecked;
    const totalNumber = options.totalNumber;
    this.expresswayTabHeading = `Expressway-C Connector Host (${numberChecked}/${totalNumber})`;
  }

}

angular
  .module('Hercules')
  .controller('HybridCallPrerequisitesController', HybridCallPrerequisitesController);
