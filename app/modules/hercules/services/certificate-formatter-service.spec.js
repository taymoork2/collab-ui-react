'use strict';

describe('Service: CertificateFormatterService', function () {
  var CertificateFormatterService;

  beforeEach(module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_CertificateFormatterService_) {
    CertificateFormatterService = _CertificateFormatterService_;
  }

  describe('formatCerts()', function () {

    it('should parse a valid certificate list', function () {
      var formatted = CertificateFormatterService.formatCerts(getValidCertData());
      expect(formatted.length).toBe(3);
      var first = formatted[0];
      expect(first.emailAddress).toBe('swede@example.com');
      expect(first.commonName).toBe('snusfabrikken.swedishcompany.se');
      expect(first.organizationalUnit).toBe('Gothenburg Snus Factory');
      expect(first.organization).toBe('Swedish Snus AB');
      expect(first.stateAndProvince).toBe('Vastra Gotaland');
      expect(first.country).toBe('SE');
      expect(first.certId).toBe('f066eeec-0b3a-2f7b-4c20-b67a7a82ea5e');
      expect(first.created).toBe('2016-04-20T13:18:00.000Z');
      expect(first.expires).toBe('2290-02-02T13:18:00.000Z');
    });

    it('should provide values as N/A when they are not there', function () {
      var formatted = CertificateFormatterService.formatCerts([{}]);
      var first = formatted[0];
      expect(first.emailAddress).toBe('N/A');
      expect(first.commonName).toBe('N/A');
      expect(first.organizationalUnit).toBe('N/A');
      expect(first.organization).toBe('N/A');
      expect(first.stateAndProvince).toBe('N/A');
      expect(first.country).toBe('N/A');
      expect(first.certId).toBe('N/A');
      expect(first.created).toBe('N/A');
      expect(first.expires).toBe('N/A');
    });

    it('should handle values containing a comma', function () {
      var formatted = CertificateFormatterService.formatCerts([{
        decoded: {
          subjectDN: 'O="Cisco Systems, Inc."'
        }
      }]);
      expect(formatted[0].organization).toBe('Cisco Systems, Inc.');
    });

    it('should handle erroneous input', function () {
      var formatted = CertificateFormatterService.formatCerts('500: internal server error');
      expect(formatted.length).toBe(0);
    });

  });

  function getValidCertData() {
    return [{
      "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/f066eeec-0b3a-2f7b-4c20-b67a7a82ea5e",
      "certId": "f066eeec-0b3a-2f7b-4c20-b67a7a82ea5e",
      "orgId": "f02a1c1c-56ef-4b53-b4da-51683feb0aa9",
      "decoded": {
        "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/f066eeec-0b3a-2f7b-4c20-b67a7a82ea5e/decoded",
        "subjectDN": "EMAILADDRESS=swede@example.com, CN=snusfabrikken.swedishcompany.se, OU=Gothenburg Snus Factory, O=Swedish Snus AB, L=Gothenburg, ST=Vastra Gotaland, C=SE",
        "issuerDN": "EMAILADDRESS=swede@example.com, CN=snusfabrikken.swedishcompany.se, OU=Gothenburg Snus Factory, O=Swedish Snus AB, L=Gothenburg, ST=Vastra Gotaland, C=SE",
        "notAfter": "2290-02-02T13:18:00.000Z",
        "notBefore": "2016-04-20T13:18:00.000Z",
        "serialNumber": 13100923433804097073,
        "version": 3,
        "sigAlgName": "SHA1withRSA",
        "sigAlgOID": "1.2.840.113549.1.1.5",
        "signature": "M43rfDJxuroxeEFFxFaCn3bkUcpb+Xgn6EHRe0bd7rUEgfellchXPAU7ZX98RmSdUk2PtPKmmRXjdvc6xqm645Bf+c9LsEMGXLyaGWNK6eb6L0bXDSyV9cz31niOdf80KFM4z6v4RDRtd5URxWvBRIzTPcZGo9Xdmb5H86RaSdAxKgZ3gljTsqXEFGJYHoI2lCqWUio6gXP7Okrm/17Bm1T+abzC2GyAOKaqsreTDdwJeJoy6717WIQDSOr6hNj2z1rLUMiDBh4+crGPrac1WM2N3N8yKHbhjzhHt+5yHgkg7CXQPyGa1BDpRNexihXoDBS11uLXl//EJkfrCTGzRg=="
      },
      "certBytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZQakNDQkNhZ0F3SUJBZ0lKQUxYUDFIT05lK1l4TUEwR0NTcUdTSWIzRFFFQkJRVUFNSUhFTVFzd0NRWUQKVlFRR0V3SlRSVEVZTUJZR0ExVUVDQk1QVm1GemRISmhJRWR2ZEdGc1lXNWtNUk13RVFZRFZRUUhFd3BIYjNSbwpaVzVpZFhKbk1SZ3dGZ1lEVlFRS0V3OVRkMlZrYVhOb0lGTnVkWE1nUVVJeElEQWVCZ05WQkFzVEYwZHZkR2hsCmJtSjFjbWNnVTI1MWN5QkdZV04wYjNKNU1TZ3dKZ1lEVlFRREV4OXpiblZ6Wm1GaWNtbHJhMlZ1TG5OM1pXUnAKYzJoamIyMXdZVzU1TG5ObE1TQXdIZ1lKS29aSWh2Y05BUWtCRmhGemQyVmtaVUJsZUdGdGNHeGxMbU52YlRBZwpGdzB4TmpBME1qQXhNekU0TURCYUdBOHlNamt3TURJd01qRXpNVGd3TUZvd2djUXhDekFKQmdOVkJBWVRBbE5GCk1SZ3dGZ1lEVlFRSUV3OVdZWE4wY21FZ1IyOTBZV3hoYm1ReEV6QVJCZ05WQkFjVENrZHZkR2hsYm1KMWNtY3gKR0RBV0JnTlZCQW9URDFOM1pXUnBjMmdnVTI1MWN5QkJRakVnTUI0R0ExVUVDeE1YUjI5MGFHVnVZblZ5WnlCVApiblZ6SUVaaFkzUnZjbmt4S0RBbUJnTlZCQU1USDNOdWRYTm1ZV0p5YVd0clpXNHVjM2RsWkdsemFHTnZiWEJoCmJua3VjMlV4SURBZUJna3Foa2lHOXcwQkNRRVdFWE4zWldSbFFHVjRZVzF3YkdVdVkyOXRNSUlCSWpBTkJna3EKaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF1WndnTlZWWDdFZWtzd1A1MEpSbWJPbHlYYW81clpsRgpuYjNMTFp3N1h2V3JROUN0Q0FMU3UwYmlJeUFRVzBCQWN2eFRrSHV1RVltNXdJa0hYOUNuMkpUTzdXUVk1d0g5CnFEWjVwUlpDV29neEpNREhDNVhlZC90Wng0NjE5cm5SaGthSUpzL1ZVKzdBV0ZDMTlXamFLZTNTYzU4K2hNMkEKOGpqcitueWs1VXNOWTloY2c2Q1BMUXBsRCt4clpRNFRnNHNZMERKaGpPbVJISFA4Rmp0ZnZVbk1pZUQvSXpuSgpTTUE0Znh1VlFrR0lUVWM3cjJiek1QckcrZEtzQXZzUUpCbkVERVdTUzRRS0tyL0ZMQ1JCN1YzVFhsYmc0SmhiCjVaSTZEMWFBanBpZzFpQzVFRjJ1TDREdENEQTlNY2N2cXBWd2pSc3EvMVp5NkNwaGhLNldId0lEQVFBQm80SUIKTFRDQ0FTa3dIUVlEVlIwT0JCWUVGSVk4L1Y1MnRGLzNUVTQvdkJzREtVU2tLOWhyTUlINUJnTlZIU01FZ2ZFdwpnZTZBRklZOC9WNTJ0Ri8zVFU0L3ZCc0RLVVNrSzlocm9ZSEtwSUhITUlIRU1Rc3dDUVlEVlFRR0V3SlRSVEVZCk1CWUdBMVVFQ0JNUFZtRnpkSEpoSUVkdmRHRnNZVzVrTVJNd0VRWURWUVFIRXdwSGIzUm9aVzVpZFhKbk1SZ3cKRmdZRFZRUUtFdzlUZDJWa2FYTm9JRk51ZFhNZ1FVSXhJREFlQmdOVkJBc1RGMGR2ZEdobGJtSjFjbWNnVTI1MQpjeUJHWVdOMGIzSjVNU2d3SmdZRFZRUURFeDl6Ym5WelptRmljbWxyYTJWdUxuTjNaV1JwYzJoamIyMXdZVzU1CkxuTmxNU0F3SGdZSktvWklodmNOQVFrQkZoRnpkMlZrWlVCbGVHRnRjR3hsTG1OdmJZSUpBTFhQMUhPTmUrWXgKTUF3R0ExVWRFd1FGTUFNQkFmOHdEUVlKS29aSWh2Y05BUUVGQlFBRGdnRUJBRE9ONjN3eWNicTZNWGhCUmNSVwpncDkyNUZIS1cvbDRKK2hCMFh0RzNlNjFCSUgzcFpYSVZ6d0ZPMlYvZkVaa25WSk5qN1R5cHBrVjQzYjNPc2FwCnV1T1FYL25QUzdCREJseThtaGxqU3VubStpOUcxdzBzbGZYTTk5WjRqblgvTkNoVE9NK3IrRVEwYlhlVkVjVnIKd1VTTTB6M0dScVBWM1ptK1IvT2tXa25RTVNvR2Q0SlkwN0tseEJSaVdCNkNOcFFxbGxJcU9vRnorenBLNXY5ZQp3WnRVL21tOHd0aHNnRGltcXJLM2t3M2NDWGlhTXV1OWUxaUVBMGpxK29UWTlzOWF5MURJZ3dZZVBuS3hqNjJuCk5Wak5qZHpmTWloMjRZODRSN2Z1Y2g0SklPd2wwRDhobXRRUTZVVFhzWW9WNkF3VXRkYmkxNWYveENaSDZ3a3gKczBZPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
    }, {
      "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/22b4bb44-1ae3-a354-f51b-f9673bf919d6",
      "certId": "22b4bb44-1ae3-a354-f51b-f9673bf919d6",
      "orgId": "f02a1c1c-56ef-4b53-b4da-51683feb0aa9",
      "decoded": {
        "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/22b4bb44-1ae3-a354-f51b-f9673bf919d6/decoded",
        "subjectDN": "EMAILADDRESS=test@example.org, CN=test.example.org, OU=CCTG, O=\"Cisco Systems, Inc.\", L=Lysaker, ST=Akershus, C=NO",
        "issuerDN": "EMAILADDRESS=test@example.org, CN=test.example.org, OU=CCTG, O=\"Cisco Systems, Inc.\", L=Lysaker, ST=Akershus, C=NO",
        "notAfter": "2026-03-13T12:30:28.000Z",
        "notBefore": "2016-03-15T12:30:28.000Z",
        "serialNumber": 12471105876949069092,
        "version": 1,
        "sigAlgName": "SHA1withRSA",
        "sigAlgOID": "1.2.840.113549.1.1.5",
        "signature": "V2edU28gXIllwXdoQXEYLzHvH4WwkbshgSeJbrpJeqJBC1nxJeStb5pTXCl72isZLljyIutE4q1QGyupMHJ44H/u60WmKsFa9cEa+ZdAX8VVP3VVoOcwfGR39iQlpp9P11EFyVt+XIiFLnrKPu68Kw5rJM5LqmsaGMUpag61nmI="
      },
      "certBytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNyekNDQWhnQ0NRQ3RFa1M0WjlYdEpEQU5CZ2txaGtpRzl3MEJBUVVGQURDQm16RUxNQWtHQTFVRUJoTUMKVGs4eEVUQVBCZ05WQkFnVENFRnJaWEp6YUhWek1SQXdEZ1lEVlFRSEV3ZE1lWE5oYTJWeU1Sd3dHZ1lEVlFRSwpFeE5EYVhOamJ5QlRlWE4wWlcxekxDQkpibU11TVEwd0N3WURWUVFMRXdSRFExUkhNUmt3RndZRFZRUURFeEIwClpYTjBMbVY0WVcxd2JHVXViM0puTVI4d0hRWUpLb1pJaHZjTkFRa0JGaEIwWlhOMFFHVjRZVzF3YkdVdWIzSm4KTUI0WERURTJNRE14TlRFeU16QXlPRm9YRFRJMk1ETXhNekV5TXpBeU9Gb3dnWnN4Q3pBSkJnTlZCQVlUQWs1UApNUkV3RHdZRFZRUUlFd2hCYTJWeWMyaDFjekVRTUE0R0ExVUVCeE1IVEhsellXdGxjakVjTUJvR0ExVUVDaE1UClEybHpZMjhnVTNsemRHVnRjeXdnU1c1akxqRU5NQXNHQTFVRUN4TUVRME5VUnpFWk1CY0dBMVVFQXhNUWRHVnoKZEM1bGVHRnRjR3hsTG05eVp6RWZNQjBHQ1NxR1NJYjNEUUVKQVJZUWRHVnpkRUJsZUdGdGNHeGxMbTl5WnpDQgpuekFOQmdrcWhraUc5dzBCQVFFRkFBT0JqUUF3Z1lrQ2dZRUExUElOWVZiVHJJOURTbzU0clI3WThEYlNsWFFECjhvY045M0wyeWg1WGlvbWVsRUdnS2pja3lFTi9vQXhOZDNxYVorS2o3c0NxV2ZJMHF5NitYamlYUXIzOVp3ZDEKNDh1YkQ5NW9jN3dLSnlhcisxR2hUWkFMcTY2SGp6Ly9KcGFPR1dmaGZRc2dIQ0t3SS9MeFJGNG5HdS9HR1loZQp4bEV6UlI4UWQxR2x5NmNDQXdFQUFUQU5CZ2txaGtpRzl3MEJBUVVGQUFPQmdRQlhaNTFUYnlCY2lXWEJkMmhCCmNSZ3ZNZThmaGJDUnV5R0JKNGx1dWtsNm9rRUxXZkVsNUsxdm1sTmNLWHZhS3hrdVdQSWk2MFRpclZBYks2a3cKY25qZ2YrN3JSYVlxd1ZyMXdScjVsMEJmeFZVL2RWV2c1ekI4WkhmMkpDV21uMC9YVVFYSlczNWNpSVV1ZXNvKwo3cndyRG1za3prdXFheG9ZeFNscURyV2VZZz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
    }, {
      "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/7cc571f1-841c-d673-f564-80427c054726",
      "certId": "7cc571f1-841c-d673-f564-80427c054726",
      "orgId": "f02a1c1c-56ef-4b53-b4da-51683feb0aa9",
      "decoded": {
        "url": "http://certs.cfinta1.wbx2.com/certificate/api/v1/certificates/7cc571f1-841c-d673-f564-80427c054726/decoded",
        "subjectDN": "EMAILADDRESS=admin@funkmaster.us, CN=funk.funkmaster.us, OU=Funk Technology Group, O=Funk Enterprises, L=\"Funky City, with comma\", ST=Arizona, C=US",
        "issuerDN": "EMAILADDRESS=admin@funkmaster.us, CN=funk.funkmaster.us, OU=Funk Technology Group, O=Funk Enterprises, L=\"Funky City, with comma\", ST=Arizona, C=US",
        "notAfter": "2290-02-02T13:20:55.000Z",
        "notBefore": "2016-04-20T13:20:55.000Z",
        "serialNumber": 15596171209197144573,
        "version": 3,
        "sigAlgName": "SHA1withRSA",
        "sigAlgOID": "1.2.840.113549.1.1.5",
        "signature": "kMJiY2LDXbbT0nuPSroq6jCnEimR6LWKQd9yQ+C7XSti81D6RkrdX/lWiPHBnJCNzGnTSM+7HSZzNR5Ky1C8XOUqUIdvlnirGDqcTSsDWovLmcbJpYMJ6MMdSPQ83TWvH9lynrs5IKmTptB/CE99r4F/zNiZo0mBffpKsyMGJXV8Hvc3Vw4fNoD5+Y8XMzgs3aSDDmnSScoPX2qSuV1cQnn2Of/ZdFNHjvGtNhiP3YrDNkiKBGzgmOvFuHjuQbLiLD9OIhV/+hvKueTcxhkolP+XqXeao24s6GsxqCpsJS0zzgvq0MHhcH7KmLIQKelzXm324njMmCGDUF8oYHymPA=="
      },
      "certBytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZKakNDQkE2Z0F3SUJBZ0lKQU5od3V4VXNYc245TUEwR0NTcUdTSWIzRFFFQkJRVUFNSUc4TVFzd0NRWUQKVlFRR0V3SlZVekVRTUE0R0ExVUVDQk1IUVhKcGVtOXVZVEVmTUIwR0ExVUVCeE1XUm5WdWEza2dRMmwwZVN3ZwpkMmwwYUNCamIyMXRZVEVaTUJjR0ExVUVDaE1RUm5WdWF5QkZiblJsY25CeWFYTmxjekVlTUJ3R0ExVUVDeE1WClJuVnVheUJVWldOb2JtOXNiMmQ1SUVkeWIzVndNUnN3R1FZRFZRUURFeEptZFc1ckxtWjFibXR0WVhOMFpYSXUKZFhNeElqQWdCZ2txaGtpRzl3MEJDUUVXRTJGa2JXbHVRR1oxYm10dFlYTjBaWEl1ZFhNd0lCY05NVFl3TkRJdwpNVE15TURVMVdoZ1BNakk1TURBeU1ESXhNekl3TlRWYU1JRzhNUXN3Q1FZRFZRUUdFd0pWVXpFUU1BNEdBMVVFCkNCTUhRWEpwZW05dVlURWZNQjBHQTFVRUJ4TVdSblZ1YTNrZ1EybDBlU3dnZDJsMGFDQmpiMjF0WVRFWk1CY0cKQTFVRUNoTVFSblZ1YXlCRmJuUmxjbkJ5YVhObGN6RWVNQndHQTFVRUN4TVZSblZ1YXlCVVpXTm9ibTlzYjJkNQpJRWR5YjNWd01Sc3dHUVlEVlFRREV4Sm1kVzVyTG1aMWJtdHRZWE4wWlhJdWRYTXhJakFnQmdrcWhraUc5dzBCCkNRRVdFMkZrYldsdVFHWjFibXR0WVhOMFpYSXVkWE13Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXcKZ2dFS0FvSUJBUUM4bG0zZk1FVWFIdTNOcnZjUllXMlFmOWRLa0xXZmJEOEVpc2JGcDl2cUVBTmY5elFyVE9nYQpyRUhLQ3ZJTUNGYnR6UmJlK0pPWjB2cVhsMGE1TTJwRGZwT3loYVkwQlF0Mlg1angzeWN4T1dRSlRtRndkNldJCldPU2czTUFuSEtVd1BZcjN2S0NEaVQ1Zmd6cTJvMFc4aHRXT2VyUXBIMlYzcU1iMk0vOTdlbXloaFk5bitNb0EKb1RKNWtBRU9vK1JIdDg5RlFOQ1FPZ0VhZ3pwQktzL1RBYmlWcVdjNTVDU1hUVm9JbHVRdjRyUmo1VTlUK1lyNQpPMWFtVWpDNWNkRDJCa2ptc1pNTG5JVzJSNnBzZ255UTQvMzVlb0lORU4zQXAzL1ExWFpNVkZ1ZWNBSzJ0bXFhCnRieVlVbm9CenJ1RTJIQXM0SEVTem9ocXVXSDkrdVNUQWdNQkFBR2pnZ0VsTUlJQklUQWRCZ05WSFE0RUZnUVUKTjBhSDYwSzMrQmxLMTVPOEpxL211K2Ribnd3d2dmRUdBMVVkSXdTQjZUQ0I1b0FVTjBhSDYwSzMrQmxLMTVPOApKcS9tdStkYm53eWhnY0trZ2I4d2did3hDekFKQmdOVkJBWVRBbFZUTVJBd0RnWURWUVFJRXdkQmNtbDZiMjVoCk1SOHdIUVlEVlFRSEV4WkdkVzVyZVNCRGFYUjVMQ0IzYVhSb0lHTnZiVzFoTVJrd0Z3WURWUVFLRXhCR2RXNXIKSUVWdWRHVnljSEpwYzJWek1SNHdIQVlEVlFRTEV4VkdkVzVySUZSbFkyaHViMnh2WjNrZ1IzSnZkWEF4R3pBWgpCZ05WQkFNVEVtWjFibXN1Wm5WdWEyMWhjM1JsY2k1MWN6RWlNQ0FHQ1NxR1NJYjNEUUVKQVJZVFlXUnRhVzVBClpuVnVhMjFoYzNSbGNpNTFjNElKQU5od3V4VXNYc245TUF3R0ExVWRFd1FGTUFNQkFmOHdEUVlKS29aSWh2Y04KQVFFRkJRQURnZ0VCQUpEQ1ltTml3MTIyMDlKN2owcTZLdW93cHhJcGtlaTFpa0hmY2tQZ3UxMHJZdk5RK2taSwozVi81Vm9qeHdaeVFqY3hwMDBqUHV4MG1jelVlU3N0UXZGemxLbENIYjVaNHF4ZzZuRTByQTFxTHk1bkd5YVdECkNlakRIVWowUE4wMXJ4L1pjcDY3T1NDcGs2YlFmd2hQZmErQmY4elltYU5KZ1gzNlNyTWpCaVYxZkI3M04xY08KSHphQStmbVBGek00TE4ya2d3NXAwa25LRDE5cWtybGRYRUo1OWpuLzJYUlRSNDd4clRZWWo5Mkt3elpJaWdScwo0SmpyeGJoNDdrR3k0aXcvVGlJVmYvb2J5cm5rM01ZWktKVC9sNmwzbXFOdUxPaHJNYWdxYkNVdE04NEw2dERCCjRYQit5cGl5RUNucGMxNXQ5dUo0ekpnaGcxQmZLR0I4cGp3PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
    }];
  }
});
