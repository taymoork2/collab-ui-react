import pstnContactInfo from './pstnContactInfo';
import pstnProviders from './pstnProviders';
import pstnSelector from './pstnSelector';
import pstnSwivelNumbers from './pstnSwivelNumbers';
import pstnTermsOfService from './pstnTermsOfService';
import pstnService from './pstn.service';
import pstnModel from './pstn.model';
import terminusService from './terminus.service';
import esaDisclaimer from './esaDisclaimer';

export * from './pstn.const';
export * from './pstn.model';
export * from './pstn.service';
export * from './terminus.service';

export default angular
  .module('huron.pstn', [
    pstnContactInfo,
    pstnProviders,
    pstnSelector,
    pstnSwivelNumbers,
    pstnTermsOfService,
    pstnModel,
    pstnService,
    terminusService,
    esaDisclaimer,
  ]).name;
