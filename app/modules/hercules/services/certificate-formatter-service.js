(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('CertificateFormatterService', CertificateFormatterService);

  /* @ngInject */
  function CertificateFormatterService() {

    var service = {
      formatCerts: formatCerts
    };

    return service;

    function formatCerts(certificates) {

      if (!_.isArray(certificates)) {
        return [];
      }

      return _.map(certificates, function (certificate) {

        var formattedCertificate = [];
        var certificateAsArray = _.get(certificate, 'decoded.subjectDN', '').split(/,(?:\s)(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        var certificatesAsMap = _.chain(certificateAsArray)
          .map(function (s) {
            return s.split('=');
          })
          .reduce(function (map, kv) {
            map[kv[0]] = (kv[1] || '').replace(/^"|"$/g, '');
            return map;
          }, {})
          .value();

        formattedCertificate.emailAddress = certificatesAsMap.EMAILADDRESS || 'N/A';
        formattedCertificate.commonName = certificatesAsMap.CN || 'N/A';
        formattedCertificate.organizationalUnit = certificatesAsMap.OU || 'N/A';
        formattedCertificate.organization = certificatesAsMap.O || 'N/A';
        formattedCertificate.locality = certificatesAsMap.L || 'N/A';
        formattedCertificate.stateAndProvince = certificatesAsMap.ST || 'N/A';
        formattedCertificate.country = certificatesAsMap.C || 'N/A';

        formattedCertificate.certId = certificate.certId || 'N/A';
        formattedCertificate.created = _.get(certificate, 'decoded.notBefore', 'N/A');
        formattedCertificate.expires = _.get(certificate, 'decoded.notAfter', 'N/A');

        return formattedCertificate;
      });

    }
  }

}());
