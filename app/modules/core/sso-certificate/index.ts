import ssoCertificateCheckModuleName from './sso-certificate-check';
import ssoCertificateTypeModuleName from './sso-certificate-type';
import ssoCertificateDownloadMetadataModuleName from './sso-certificate-download-metadata';
import ssoCertificateTestModuleName from './sso-certificate-test';
import ssoCertificateSharedModuleName from './shared';

export default angular.module('core.sso-certificate', [
  ssoCertificateCheckModuleName,
  ssoCertificateTypeModuleName,
  ssoCertificateDownloadMetadataModuleName,
  ssoCertificateTestModuleName,
  ssoCertificateSharedModuleName,
])
  .name;
