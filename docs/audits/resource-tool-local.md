# Resource-tool verification — local (/Users/neelshah/Documents/git_repo/ambisecure-site)

Generated: 2026-06-03T10:34:10Z

- Tools passed: **76/76**
- Algorithm assertions: **101/101**
- Tools with golden/algorithm tests: **19**
- Critical failures: **0** · Warnings: **57**

Browser layer: Browser layer not requested (--browser). Algorithm tests run against the deployed JS in a Node VM (no DOM); structural checks cover render markers.

| Tool | 200 | canon | noindex✗ | SOON✗ | UI | content | algo | result |
|------|----|------|---------|------|----|--------|------|--------|
| aaguid-lookup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| APDU Builder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3/3 | PASS |
| apdu-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| apdu-script-validator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| apdu-status-dict | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| ascii-hex | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| asn1-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| asn1-tree-explorer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| atr-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| ats-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| attestation-decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| authdata-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| Base32 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 7/7 | PASS |
| base64 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| base64-cert | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| base64url | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| ber-length | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| Binary Calculator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 10/10 | PASS |
| Byte-offset Calculator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | PASS |
| CBOR Parser (←cbor-parser) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 8/8 | PASS |
| cert-chain | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| cert-fingerprint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| challenge-viewer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| Checksum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | PASS |
| clientdata-decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| cmac-length | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| cose-key | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| CRC Calculator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 11/11 | PASS |
| credential-id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| csr-decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| desfire-access-rights | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| desfire-file-settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| desfire-key-settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| desfire-status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| ECC Curve Reference | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2/2 | PASS |
| emv-tag-dict | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| endian | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| eUICC EID Decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 5/5 | PASS |
| fido-mds-explorer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| gp-status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| hex-bytes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| ICCID Decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 5/5 | PASS |
| ieee-1609-2-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| IMSI Decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3/3 | PASS |
| iso14443-frame | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| iso14443-ref | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| iso7816-cla | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| iso7816-ref | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| CAP File Inspector (←cap-file-inspector) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| json-bin-builder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| JSON Formatter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 7/7 | PASS |
| JSON Validator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 7/7 | PASS |
| key-diversification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| length-field | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| LRC Calculator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | PASS |
| ndef-decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| passkey-flow-viz | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| pem-der | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| pfx-inspector | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| rp-id-validator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| RSA Key Formats | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3/3 | PASS |
| SCP03 Helper | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1/1 | PASS |
| scp03-walkthrough | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| secure-messaging-viz | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| sequence-diagram-generator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| SHA Hash Generator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 4/4 | PASS |
| sw-lookup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| tlv-parser | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| tlv-tree-viz | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| tmac-visualizer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| uid-analyzer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| URL Encoder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 5/5 | PASS |
| utf8 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| v2x-cert-chain-validator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| x509-viewer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | PASS |
| XML Formatter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2/2 | PASS |
