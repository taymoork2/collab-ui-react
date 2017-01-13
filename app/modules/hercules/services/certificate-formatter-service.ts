interface ICertificate {
  url: string;
  certId: string;
  orgId: string;
  decoded: {
    url: string;
    subjectDN: string;
    issuerDN: string;
    notAfter: string;
    notBefore: string;
    serialNumber: number;
    version: number;
    sigAlgName: string;
    sigAlgOID: string;
    signature: string;
  };
  certBytes: string;
}

interface IformattedCertificate {
  emailAddress: string;
  commonName: string;
  organizationalUnit: string;
  organization: string;
  locality: string;
  stateAndProvince: string;
  country: string;
  certId: string;
  created: string;
  expires: string;
}

interface IcertificatesAsMap {
  EMAILADDRESS: string;
  CN: string;
  OU: string;
  O: string;
  L: string;
  ST: string;
  C: string;
}

export class CertificateFormatterService {

  /* @ngInject */
  public formatCerts(certificates): IformattedCertificate[] {

    if (!_.isArray(certificates)) {
       return [];
    }

    return _.map(certificates, (certificate: ICertificate) => {
      let certificateAsArray = _.get(certificate, 'decoded.subjectDN', '').split(/,(?:\s)(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      let certificatesAsMap: IcertificatesAsMap = _.chain(certificateAsArray)
        .map( (s) => {
          const result = s.split('=');
          result[1] = _.replace(result[1], /^"|"$/g, '');
          return result;
        })
        .fromPairs()
        .value();
      const formattedCertificate: IformattedCertificate = {
        emailAddress: certificatesAsMap.EMAILADDRESS || 'N/A',
        commonName: certificatesAsMap.CN || 'N/A',
        organizationalUnit: certificatesAsMap.OU || 'N/A',
        organization: certificatesAsMap.O || 'N/A',
        locality: certificatesAsMap.L || 'N/A',
        stateAndProvince: certificatesAsMap.ST || 'N/A',
        country: certificatesAsMap.C || 'N/A',
        certId: certificate.certId || 'N/A',
        created: _.get(certificate, 'decoded.notBefore', 'N/A'),
        expires: _.get(certificate, 'decoded.notAfter', 'N/A'),
      };
      return formattedCertificate;
    });
  }
}

angular
  .module('Hercules')
  .service('CertificateFormatterService', CertificateFormatterService);
