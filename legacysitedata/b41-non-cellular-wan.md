# Blog: Non Cellular Network based Wide Area Networks

**URL:** https://ambisecure.ambimat.com/non-cellular-network-based-wide-area-networks-1/
**Date:** April 16, 2020
**Author:** Ambisecure Ambimat
**Category:** General
**Tags:** LoRA, LoRaWAN, SigFox, IoT, Security, AmbiIoTSecurity

---

## Introduction
A follow-up to a previous article introducing LPWANs. The two most popular Non-Cellular WANs are discussed: Sigfox and LoRa/LoRaWAN.

## Sigfox

Sigfox is a French company founded in 2009 that builds wireless networks for low-power objects like electricity meters and smartwatches. The company uses proprietary technology operating on ISM radio bands (868 MHz in Europe, 902 MHz in US). It employs "ultra narrowband" technology requiring minimal energy as a "Low-power Wide-area network (LPWAN)."

Key characteristics:
- One-hop star topology
- Wide-reaching signal passes through solid objects
- Supports up to 140 uplink messages daily (12 Bytes payload each)
- Supports up to 4 downlink messages daily (8 Bytes payload each)
- Partners include Texas Instruments, Silicon Labs, and ON Semiconductor

## LoRa and LoRaWAN

The LoRa Alliance is an open, non-profit association with approximately 400 member companies worldwide. Founding members include IBM, MicroChip, Cisco, Semtech, and various telecom operators.

> "LoRa is the physical layer: the chip. LoRaWAN is the MAC layer: the software put on the chip, to enable networking."

Main characteristics of LoRaWAN:
- Long range (>5 km urban, >10 km suburban, >80 km VLOS)
- Long battery life (>10 years)
- Low cost (<$5/module)
- Low data rate (0.3 bps – 50 kbp, typically ~10 kB/day)
- Secure (depends on implementation)
- Operates in unlicensed spectrum
- Localisation support
- Bidirectional

LoRa distributes information across different frequency channels and data rates using encoded packets, reducing message collisions and increasing gateway capacity.

## Use cases

- **Metering:** Gas/water/electricity monitoring (1-5 messages daily, >10 years battery)
- **Smart parking:** Vehicle arrival/departure notifications
- **Smart bin:** Full trash can alerts
- **Smart lighting:** Streetlight control
- **Environment monitoring:** Temperature, pollution, humidity, radiation tracking
- **Asset management:** Status and location checking, relay/lock/light control
- **Healthcare:** Activity/fall detection, personal alarms, surveillance
- **Tracking:** Goods, vehicles, animals

## Conclusion

Sigfox availability is geographically limited; LoRa allows users to establish independent networks. LoRa offers true bidirectionality, making it preferable for command-and-control applications like electric grid monitoring. Sigfox suits applications sending small, infrequent data bursts like alarms and meters.

Both technologies were originally designed for European regulatory bands (865-868 MHz) and face optimization challenges for FCC compliance in the U.S.

## References
- https://engineering.eckovation.com/sigfox-vs-lora-one-prefer-iot-device/
- https://www.iotforall.com/iot-connectivity-comparison-lora-sigfox-rpma-lpwan-technologies/
- http://jensd.be/755/network/lorawan-simply-explained
