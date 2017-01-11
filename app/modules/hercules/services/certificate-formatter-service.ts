export class CertificateFormatterService {

  /* @ngInject */
  public formatCerts(certificates): any[] {

    if (!_.isArray(certificates)) {
       return [];
     }

    return _.map(certificates, (certificate: {
       url?: string,
      certId?: string,
      orgId?: string,
      decoded: {
         url?: string,
        subjectDN?: string,
        issuerDN?: string,
        notAfter?: string,
        notBefore?: string,
        serialNumber?: number,
        version: number,
        sigAlgName: string,
        sigAlgOID: string,
        signature: string,
      }
      certBytes: string,
    }) => {

      let formattedCertificate: {
        emailAddress?: string,
        commonName?: string,
        organizationalUnit?: string ,
        organization?: string,
        locality?: string,
        stateAndProvince?: string,
        country?: string,
        certId?: string,
        created?: string,
        expires?: string,
      } = [];

      let certificateAsArray = _.get(certificate, 'decoded.subjectDN', '').split(/,(?:\s)(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      let certificatesAsMap: {
        EMAILADDRESS?: string,
        CN?: string,
        OU?: string,
        O?: string,
        L?: string,
        ST?: string,
        C?: string,
      } = _.chain(certificateAsArray)
        .map( (s) => {
          return s.split('=');
        })
        .reduce((map, kv) => {
          map[kv[0]] = _.replace(kv[1], /^"|"$/g, '');
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

angular
  .module('Hercules')
  .service('CertificateFormatterService', CertificateFormatterService);
