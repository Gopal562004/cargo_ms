import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive demo documents...');

  // 1. Create or update demo Admin user
  const adminPasswordHash = await bcrypt.hash('Admin@2004', 12);
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      username: 'admin',
      email: 'admin@dgrlogistics.com',
      passwordHash: adminPasswordHash,
      name: 'DGR Master Administrator',
      company: 'DGR GLOBAL LOGISTICS',
      department: 'Management',
      role: 'ADMIN',
      isActive: true,
      allowedServices: [
        'AIR_FREIGHT',
        'EDI_CARGO',
        'SEA_FREIGHT',
        'SALES_BILLING',
        'PURCHASE_BILLS',
        'BILLING_TEMPLATES',
        'CONTACTS_DIRECTORY',
        'TEMPLATES_MANAGEMENT',
        'MASTER_ADMIN',
      ],
    },
  });

  // Create Mayur operator account
  const mayurPasswordHash = await bcrypt.hash('Mayur@2004', 12);
  await prisma.user.upsert({
    where: { username: 'mayur52004' },
    update: {
      passwordHash: mayurPasswordHash,
      role: 'OPERATOR',
      isActive: true,
    },
    create: {
      username: 'mayur52004',
      email: 'mayur@dgrlogistics.com',
      passwordHash: mayurPasswordHash,
      name: 'Mayur Kadam',
      company: 'DGR GLOBAL LOGISTICS',
      department: 'Accounts & Billing',
      phone: '9028345261',
      role: 'OPERATOR',
      isActive: true,
      allowedServices: [
        'SALES_BILLING',
        'PURCHASE_BILLS',
        'BILLING_TEMPLATES',
        'CONTACTS_DIRECTORY',
      ],
    },
  });

  console.log(`👤 Master Admin Account: username=admin / email=admin@dgrlogistics.com (Password: Admin@2004)`);
  console.log(`👤 Operator Account: username=mayur52004 (Password: Mayur@2004)`);

  // Clean existing demo documents for fresh seed
  await prisma.package.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.document.deleteMany({ where: { createdById: user.id } });
  await prisma.contact.deleteMany({ where: { createdById: user.id } });

  // 2. Create Contacts
  const shipper1 = await prisma.contact.create({
    data: {
      type: 'SHIPPER',
      name: 'Acme Electronics Exports Pvt Ltd',
      company: 'Acme Global Group',
      address: '123 MIDC Industrial Complex, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      postalCode: '400093',
      phone: '+91 22 5555 0199',
      email: 'exports@acmeelectronics.com',
      createdById: user.id,
    },
  });

  const consignee1 = await prisma.contact.create({
    data: {
      type: 'CONSIGNEE',
      name: 'Emirates Tech Imports Trading LLC',
      company: 'Emirates Tech Group',
      address: 'Suite 402, Al Maktoum Cargo Village',
      city: 'Dubai',
      country: 'AE',
      postalCode: '00000',
      phone: '+971 4 333 8899',
      email: 'imports@emiratestech.ae',
      createdById: user.id,
    },
  });

  const shipper2 = await prisma.contact.create({
    data: {
      type: 'SHIPPER',
      name: 'Bharat Pharma Laboratories Ltd',
      company: 'Bharat Pharma Corp',
      address: 'Plot 45, GIDC Industrial Estate, Ankleshwar',
      city: 'Gujarat',
      country: 'IN',
      postalCode: '393002',
      phone: '+91 2646 220011',
      email: 'logistics@bharatpharma.com',
      createdById: user.id,
    },
  });

  const consignee2 = await prisma.contact.create({
    data: {
      type: 'CONSIGNEE',
      name: 'EuroMed Health GmbH',
      company: 'EuroMed Europe',
      address: 'Cargo City South, Building 534, Frankfurt Airport',
      city: 'Frankfurt',
      country: 'DE',
      postalCode: '60549',
      phone: '+49 69 690 12345',
      email: 'supplychain@euromed.de',
      createdById: user.id,
    },
  });

  console.log('📍 Created sample Contacts (Shippers & Consignees)');

  // 3. Create Sample Documents across categories

  // DOCUMENT 1: Master Air Waybill (MAWB)
  await prisma.document.create({
    data: {
      documentNumber: '176-12345675',
      documentType: 'MAWB',
      category: 'AIR_FREIGHT',
      status: 'ISSUED',
      title: 'Air Waybill - 176-12345675 (Mumbai to Dubai)',
      data: {
        awbPrefix: '176',
        awbSerial: '12345675',
        issuingCarrier: 'Emirates SkyCargo',
        agentName: 'Global Freight Forwarders Pvt Ltd',
        agentIATACode: '14-3 9999/0014',
        agentAccountNo: 'ACC-BOM-8844',
        shipperName: shipper1.name,
        shipperAddress: shipper1.address,
        shipperCity: shipper1.city,
        shipperCountry: shipper1.country,
        shipperPhone: shipper1.phone,
        shipperAccountNo: 'SHP-9001',
        consigneeName: consignee1.name,
        consigneeAddress: consignee1.address,
        consigneeCity: consignee1.city,
        consigneeCountry: consignee1.country,
        consigneePhone: consignee1.phone,
        consigneeAccountNo: 'CNS-4402',
        originAirport: 'BOM',
        destinationAirport: 'DXB',
        firstCarrier: 'EK',
        flightNumber: 'EK501',
        flightDate: '2026-08-10',
        totalPieces: 4,
        grossWeight: 450.00,
        weightUnit: 'KG',
        chargeableWeight: 480.00,
        rateClass: 'N',
        rateCharge: 2.50,
        weightCharge: 1200.00,
        taxAmount: 60.00,
        totalCharge: 1260.00,
        currency: 'USD',
        paymentTerms: 'PREPAID',
        declaredValueCarriage: 'NVD',
        declaredValueCustoms: 'NCV',
        commodityDescription: 'ELECTRONIC SPARE PARTS AND AUTOMATION SENSORS',
        specialHandlingCodes: 'SPX - SCREENED CARGO, PIL',
        customsInfo: 'CUSTOMS CLEARANCE AT BOM AIR CARGO COMPLEX',
        remarks: 'FRAGILE - HANDLE WITH CARE. KEEP DRY.',
      },
      createdById: user.id,
      packages: {
        create: [
          { pieceNumber: 1, length: 100, width: 80, height: 60, dimensionUnit: 'CM', weight: 120.00, weightUnit: 'KG', description: 'Box 1: PLC Controllers' },
          { pieceNumber: 2, length: 100, width: 80, height: 60, dimensionUnit: 'CM', weight: 120.00, weightUnit: 'KG', description: 'Box 2: Sensor Assemblies' },
          { pieceNumber: 3, length: 100, width: 80, height: 60, dimensionUnit: 'CM', weight: 105.00, weightUnit: 'KG', description: 'Box 3: Power Modules' },
          { pieceNumber: 4, length: 100, width: 80, height: 60, dimensionUnit: 'CM', weight: 105.00, weightUnit: 'KG', description: 'Box 4: Cable Kits' },
        ],
      },
      statusHistory: {
        create: [
          { status: 'DRAFT', note: 'Draft created by operator', changedBy: user.id },
          { status: 'VALIDATED', note: 'All mandatory IATA fields validated', changedBy: user.id },
          { status: 'ISSUED', note: 'AWB Issued by Emirates SkyCargo', changedBy: user.id },
        ],
      },
    },
  });

  // DOCUMENT 2: House Air Waybill (HAWB)
  await prisma.document.create({
    data: {
      documentNumber: 'HWB-BOM-987654',
      documentType: 'HAWB',
      category: 'AIR_FREIGHT',
      status: 'BOOKED',
      title: 'House AWB - HWB-BOM-987654 (Console BOM-FRA)',
      data: {
        hawbNumber: 'HWB-BOM-987654',
        masterAwbNumber: '098-44556677',
        issuingCarrier: 'Lufthansa Cargo AG',
        agentName: 'Global Freight Forwarders Pvt Ltd',
        agentIATACode: '14-3 9999/0014',
        shipperName: shipper2.name,
        shipperAddress: shipper2.address,
        shipperCity: shipper2.city,
        shipperCountry: shipper2.country,
        shipperPhone: shipper2.phone,
        consigneeName: consignee2.name,
        consigneeAddress: consignee2.address,
        consigneeCity: consignee2.city,
        consigneeCountry: consignee2.country,
        consigneePhone: consignee2.phone,
        originAirport: 'BOM',
        destinationAirport: 'FRA',
        firstCarrier: 'LH',
        flightNumber: 'LH757',
        flightDate: '2026-08-12',
        totalPieces: 2,
        grossWeight: 180.00,
        weightUnit: 'KG',
        chargeableWeight: 180.00,
        rateClass: 'Q',
        rateCharge: 4.20,
        weightCharge: 756.00,
        totalCharge: 756.00,
        currency: 'EUR',
        paymentTerms: 'PREPAID',
        commodityDescription: 'PHARMACEUTICAL INGREDIENTS - TEMP CONTROLLED (15C TO 25C)',
        specialHandlingCodes: 'CRT, PER, COL',
        remarks: 'TEMPERATURE MONITORED SHIPMENT. DO NOT FREEZE.',
      },
      createdById: user.id,
      packages: {
        create: [
          { pieceNumber: 1, length: 80, width: 60, height: 50, dimensionUnit: 'CM', weight: 90.00, weightUnit: 'KG', description: 'Thermal Shipper Box 1' },
          { pieceNumber: 2, length: 80, width: 60, height: 50, dimensionUnit: 'CM', weight: 90.00, weightUnit: 'KG', description: 'Thermal Shipper Box 2' },
        ],
      },
      statusHistory: {
        create: [
          { status: 'DRAFT', note: 'HAWB draft created', changedBy: user.id },
          { status: 'BOOKED', note: 'Space booked on LH757', changedBy: user.id },
        ],
      },
    },
  });

  // DOCUMENT 3: Dangerous Goods Declaration (DGD) - UN 1549 Antimony Compound (Exact Reference)
  await prisma.document.create({
    data: {
      documentNumber: 'DGD-176-65075415',
      documentType: 'DGD',
      category: 'AIR_FREIGHT',
      status: 'VALIDATED',
      title: 'Shippers Declaration for Dangerous Goods - UN 1549 Antimony Compound',
      data: {
        awbNumber: '176-6507 5415',
        carrierName: 'EMIRATES',
        shipperName: 'AADISH IMPEX PVT LTD.',
        shipperAddress: 'GNP SOLITAIRE INDUSTRIAL ESTATE,UNIT NO : 12\nFIRST FLOOR MIDC,DOMBIVLI - 421203,\nMAHARASHTRA INDIA',
        consigneeName: 'PROXA PAARL',
        consigneeAddress: 'NO 1 ZANDWYK PARK OLD PAARL ROAD, SOUTH AFRICA.',
        aircraftType: 'CAO',
        originAirport: 'MUMBAI',
        destinationAirport: 'CAPE TOWN',
        unNumber: 'UN\n1549',
        properShippingName: 'Antimony compound, inorganic,\nsolid, n.o.s. (potassium\nhexahydroxoantimonate(V))',
        hazardClass: '6.1',
        subsidiaryRisk: '',
        packingGroup: 'III',
        quantity: '01 Fibreboard Box\nx 0.1 kg',
        packingInstructions: '670',
        authorization: '',
        additionalInfo: 'KIND ATTN : MR. RISHIKESH GAWDE- 24-HOURS EMERGENCY CONTACT TELEPHONE NUMBER: +91-9702163540',
        signatoryName: 'MR. SUGEN (DGR EXECUTIVE)',
        signatoryPlaceDate: 'MUMBAI /31.07.2026',
      },
      createdById: user.id,
      statusHistory: {
        create: [
          { status: 'DRAFT', note: 'DGD Form prepared', changedBy: user.id },
          { status: 'VALIDATED', note: 'Certified by Licensed DG Specialist', changedBy: user.id },
        ],
      },
    },
  });

  // DOCUMENT 3B: Dangerous Goods Declaration (DGD) - UN 3480 Lithium Ion Batteries
  await prisma.document.create({
    data: {
      documentNumber: 'DGD-2026-0099',
      documentType: 'DGD',
      category: 'AIR_FREIGHT',
      status: 'ISSUED',
      title: 'Shippers Declaration for Dangerous Goods - UN 3480 Lithium Batteries',
      data: {
        awbNumber: '176-88990011',
        shipperName: shipper1.name,
        shipperAddress: shipper1.address,
        consigneeName: consignee1.name,
        consigneeAddress: consignee1.address,
        aircraftType: 'CAO',
        originAirport: 'BOM',
        destinationAirport: 'DXB',
        unNumber: 'UN 3480',
        properShippingName: 'LITHIUM ION BATTERIES',
        hazardClass: '9',
        subsidiaryRisk: '',
        packingGroup: 'II',
        quantity: '2 Fibreboard boxes x 12.5 kg G',
        packingInstructions: '965 Section IA',
        authorization: 'Special Provision A88 / A99',
        additionalInfo: 'CARGO AIRCRAFT ONLY. State of Charge (SoC) does not exceed 30%. Emergency Contact: +91 22 5555 0199',
      },
      createdById: user.id,
      statusHistory: {
        create: [
          { status: 'DRAFT', note: 'DGD Form created', changedBy: user.id },
          { status: 'ISSUED', note: 'Approved for Carriage on CAO', changedBy: user.id },
        ],
      },
    },
  });

  // DOCUMENT 4: Electronic Air Waybill (FWB eAWB)
  await prisma.document.create({
    data: {
      documentNumber: 'FWB-176-99001122',
      documentType: 'FWB',
      category: 'EDI',
      status: 'ISSUED',
      title: 'FWB Electronic Air Waybill (eAWB Msg)',
      data: {
        awbPrefix: '176',
        awbSerial: '99001122',
        issuingCarrier: 'Emirates SkyCargo',
        shipperName: shipper1.name,
        shipperAddress: shipper1.address,
        shipperCity: shipper1.city,
        shipperCountry: shipper1.country,
        consigneeName: consignee1.name,
        consigneeAddress: consignee1.address,
        consigneeCity: consignee1.city,
        consigneeCountry: consignee1.country,
        originAirport: 'BOM',
        destinationAirport: 'DXB',
        flightNumber: 'EK501',
        flightDate: '2026-08-15',
        totalPieces: 10,
        grossWeight: 650.00,
        chargeableWeight: 650.00,
        commodityDescription: 'HIGH PRECISION INDUSTRIAL TOOLS',
        specialHandlingCodes: 'EAW, SPX',
        currency: 'USD',
        paymentTerms: 'PREPAID',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 5: Ocean Bill of Lading (BILL_OF_LADING)
  await prisma.document.create({
    data: {
      documentNumber: 'MAEU987654321',
      documentType: 'BILL_OF_LADING',
      category: 'SEA_FREIGHT',
      status: 'ISSUED',
      title: 'Ocean Bill of Lading - MAEU987654321 (Nhava Sheva to Jebel Ali)',
      data: {
        bolNumber: 'MAEU987654321',
        bolType: 'ORIGINAL',
        carrierName: 'Maersk Line A/S',
        bookingNumber: 'BKG-MAE-8877',
        shipperName: shipper1.name,
        shipperAddress: shipper1.address,
        shipperCity: shipper1.city,
        shipperCountry: shipper1.country,
        consigneeName: consignee1.name,
        consigneeAddress: consignee1.address,
        consigneeCity: consignee1.city,
        consigneeCountry: consignee1.country,
        vesselName: 'MAERSK SENTOSA',
        voyageNumber: '2608W',
        portOfLoading: 'Jawaharlal Nehru Port (INNSA)',
        portOfDischarge: 'Jebel Ali Port (AEJEA)',
        placeOfReceipt: 'CFS Nhava Sheva',
        placeOfDelivery: 'Jebel Ali Free Zone',
        totalPieces: 1,
        grossWeight: 14200.00,
        measurement: 28.50,
        containerNumber: 'MSKU8877665',
        sealNumber: 'EMC-009988',
        goodsDescription: '1x40\' High Cube FCL Container containing Auto Machinery & Components',
        freightPayable: 'PREPAID',
        currency: 'USD',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 6: SOLAS VGM Declaration
  await prisma.document.create({
    data: {
      documentNumber: 'VGM-MSKU-8877665',
      documentType: 'SOLAS_VGM',
      category: 'SEA_FREIGHT',
      status: 'VALIDATED',
      title: 'SOLAS VGM Declaration - MSKU8877665',
      data: {
        containerNumber: 'MSKU8877665',
        sealNumber: 'EMC-009988',
        bolNumber: 'MAEU987654321',
        verifiedGrossMass: 18450.00,
        weighingMethod: 'SM1',
        weighingDate: '2026-08-01',
        shipperName: shipper1.name,
        authorizedPerson: 'Rajesh Sharma (Logistics Manager)',
        remarks: 'Weighed on Calibrated Weighbridge WB-04 (Cert No. 998811)',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 7: Proforma Invoice
  await prisma.document.create({
    data: {
      documentNumber: 'INV-2026-088',
      documentType: 'PROFORMA_INVOICE',
      category: 'OTHER',
      status: 'ISSUED',
      title: 'Proforma Invoice - INV-2026-088',
      data: {
        invoiceNumber: 'INV-2026-088',
        invoiceType: 'COMMERCIAL',
        invoiceDate: '2026-08-01',
        dueDate: '2026-08-31',
        currency: 'USD',
        incoterm: 'CIF',
        paymentTerms: '30 Days Net Credit',
        shipperName: shipper1.name,
        shipperAddress: shipper1.address,
        consigneeName: consignee1.name,
        consigneeAddress: consignee1.address,
        subtotal: 45000.00,
        taxRate: 5.0,
        taxAmount: 2250.00,
        discount: 1000.00,
        totalAmount: 46250.00,
        remarks: 'Bank Transfer to CitiBank Dubai. IBAN: AE090330000012345678',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 8: Booking Request
  await prisma.document.create({
    data: {
      documentNumber: 'BKG-2026-9900',
      documentType: 'BOOKING',
      category: 'OTHER',
      status: 'BOOKED',
      title: 'Air Booking Request - BOM to DXB',
      data: {
        bookingNumber: 'BKG-2026-9900',
        bookingType: 'CONFIRMATION',
        carrierName: 'Qatar Airways Cargo',
        vesselOrFlight: 'QR881 / QR100',
        origin: 'BOM',
        destination: 'DXB',
        departureDate: '2026-08-14',
        arrivalDate: '2026-08-14',
        totalPieces: 5,
        grossWeight: 600.00,
        volume: 3.50,
        commodityDescription: 'COMPUTER NETWORKING HARDWARE',
        specialInstructions: 'MUST BE FLYING VIA DOHA CARGO HUB',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 9: Certificate of Origin (COO)
  await prisma.document.create({
    data: {
      documentNumber: 'COO-IN-2026-44',
      documentType: 'CERTIFICATE_OF_ORIGIN',
      category: 'OTHER',
      status: 'VALIDATED',
      title: 'Certificate of Origin - India Export',
      data: {
        certificateNumber: 'COO-IN-2026-44',
        certificateType: 'STANDARD',
        exporterName: shipper1.name,
        importerName: consignee1.name,
        countryOfOrigin: 'IN',
        countryOfDestination: 'AE',
        goodsDescription: 'INDIAN MANUFACTURED ELECTRONIC LOGIC BOARDS AND SENSORS',
        hsCode: '8537.10.90',
        grossWeight: 450.00,
        invoiceNumber: 'INV-2026-088',
        remarks: 'Attested by Bombay Chamber of Commerce & Industry',
      },
      createdById: user.id,
    },
  });

  // DOCUMENT 10: Warehouse Receipt
  await prisma.document.create({
    data: {
      documentNumber: 'WHR-BOM-0012',
      documentType: 'WAREHOUSE_RECEIPT',
      category: 'OTHER',
      status: 'DRAFT',
      title: 'Warehouse Receipt - WHR-BOM-0012',
      data: {
        receiptNumber: 'WHR-BOM-0012',
        warehouseName: 'LogiPark Freezone Warehouse 4B',
        receivedDate: '2026-08-01',
        depositorName: shipper1.name,
        goodsDescription: '4 Pallets Containing Automation Hardware',
        totalPieces: 4,
        grossWeight: 450.00,
        storageConditions: 'Ambient Indoor Dry Storage (Bays 12-14)',
        remarks: 'All 4 pallets received intact with security straps unbroken',
      },
      createdById: user.id,
    },
  });

  console.log('📄 Created 10 realistic demo documents with complete data payload!');
  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
