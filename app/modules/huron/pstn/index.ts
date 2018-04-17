import pstnContactInfo from './pstnContactInfo';
import pstnProviders from './pstnProviders';
import pstnSwivelNumbers from './pstnSwivelNumbers';
import pstnTermsOfService from './pstnTermsOfService';
import pstnService from './pstn.service';
import pstnModel from './pstn.model';
import terminusService from './terminus.service';
import esaDisclaimer from './esaDisclaimer';
import pstnNumberSearchModule from './pstnNumberSearch';
import pstnAreaServiceModule from './pstnAreaService';
import pstnAddressServiceModule from './shared/pstn-address';
import pstnReviewModule from './pstn-review';

export * from './pstn.const';
export * from './pstn.model';
export * from './pstn.service';
export * from './terminus.service';
export * from './pstnProviders';
export * from './pstnAreaService';
export * from './pstnWizard';
export * from './shared/pstn-address';

export default angular
  .module('huron.pstn', [
    pstnContactInfo,
    pstnProviders,
    pstnSwivelNumbers,
    pstnTermsOfService,
    pstnModel,
    pstnService,
    terminusService,
    esaDisclaimer,
    pstnNumberSearchModule,
    pstnAreaServiceModule,
    pstnAddressServiceModule,
    pstnReviewModule,
  ]).name;
