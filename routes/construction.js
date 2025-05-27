const express = require('express');
const router = express.Router();
const Construction = require('../db/models/Construction');
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

// Validate fonksiyonu
const validateRecord = (record) => {
    const errors = [];

    if (record.type === 'valf') {
        if (typeof record.dwgNo !== 'string') errors.push('Invalid dwgNo');
        if (typeof record.systemName !== 'string') errors.push('Invalid systemName');
    } else if (record.type === 'elektrik') {
        if (typeof record.no !== 'string') errors.push('Invalid no');
        if (typeof record.cableNoOriginals !== 'string') errors.push('Invalid cableNoOriginals');
    } else if (record.type === 'spool') {
        if (typeof record.zone !== 'string') errors.push('Invalid zone');
        if (typeof record.systemno !== 'string') errors.push('Invalid systemno');
    } else {
        errors.push('Unknown type');
    }

    return errors;
};


router.post('/spools', async (req, res) => {
    const { type, ...rest } = req.body;
  
    let newRecord;
    if (type === 'spool') {
      newRecord = {
        Type: type,
        L1: rest.zone,
        L2: rest.systemno,
        L3: rest.systemname,
        L4: rest.isometrino,
        L6: rest.rev,
        L5: rest.spoolno,
        L50: rest.date,
        L7: rest.weight,
        L8: rest.surface,
        L21: rest.totalspool,
        L22: rest.production,
        L23: rest.assembly,
        L24: rest.test_delivery,
        L9: rest.installation_company,
        L10: rest.manufanctuning_company,
      };
    }
  else if (type === 'valf') {
    newRecord ={
        Type: type,
        L21: rest.dwgno,             // DWG NO
        L2: rest.systemname,        // System Name
        L3: rest.rev,               // REV
        L22: rest.valvenumber,       // VALF NO
        L5: rest.item,              // ITEM
        L6: rest.dn,                // DN
        L23: rest.pn,                // PN
        L8: rest.type_valve,              // TYPE
        L9: rest.conn,              // CONN
        L24: rest.total,            // TOPLAM
        L25: rest.delivery,         // TESLIM
        L26: rest.actuatorDelivery, // Actuator Teslim
        L27: rest.valveInstallation,// VALF MONTAJ
        L28: rest.actuatorInstallation, // AKTUATOR MONTAJ
        L11: rest.companyName,      // Firma Adı
        L10: rest.notes,            // Notlar
      };
  } else {
      return res.status(400).json(Response.errorResponse("Invalid type"));
    }
  
    try {
      const savedConstruction = await Construction.create(newRecord);
      res.status(201).json(Response.successResponse(savedConstruction));
    } catch (error) {
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
  });
  

  router.put('/spools/:id', async (req, res) => {
    const { id } = req.params;
    const { type, ...rest } = req.body;
  
    let updatedRecord;
    if (type === 'spool') {
      updatedRecord = {
        Type: type,
        L1: rest.zone,
        L2: rest.systemno,
        L3: rest.systemname,
        L4: rest.isometrino,
        L6: rest.rev,
        L5: rest.spoolno,
        L50: rest.date,
        L7: rest.weight,
        L8: rest.surface,
        L21: rest.totalspool,
        L22: rest.production,
        L23: rest.assembly,
        L24: rest.test_delivery,
        L9: rest.installation_company,
        L10: rest.manufanctuning_company,
      };
    } 
    else if (type === 'valf') {
        updatedRecord = {
            Type: type,
            L21: rest.dwgno,             // DWG NO
            L2: rest.systemname,        // System Name
            L3: rest.rev,               // REV
            L22: rest.valvenumber,       // VALF NO
            L5: rest.item,              // ITEM
            L6: rest.dn,                // DN
            L23: rest.pn,                // PN
            L8: rest.type_valve,              // TYPE
            L9: rest.conn,              // CONN
            L24: rest.total,            // TOPLAM
            L25: rest.delivery,         // TESLIM
            L26: rest.actuatorDelivery, // Actuator Teslim
            L27: rest.valveInstallation,// VALF MONTAJ
            L28: rest.actuatorInstallation, // AKTUATOR MONTAJ
            L11: rest.companyName,      // Firma Adı
            L10: rest.notes,            // Notlar
          };
      }
      else {
      return res.status(400).json(Response.errorResponse("Invalid type"));
    }
  
    try {
      const updatedConstruction = await Construction.findByIdAndUpdate(id, updatedRecord, { new: true });
      res.json(Response.successResponse(updatedConstruction));
    } catch (error) {
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
  });
// GET isteği: type parametresine göre yanıtı şekillendir
router.get('/data', async (req, res) => {
    const type = req.query.type;

    try {
        let fields = '';
        if (type === 'spool') {
            fields = '_id L1 L2 L3 L4 L5 L6 L50 L7 L8 L21 L22 L23 L24 L9 L10';
        } else if (type === 'valf') {
            fields = '_id L2 L3 L21 L5 L6 L23 L8 L9 L24 L25 L26 L27 L28 L11 L10 ';

        } else if (type === 'elektrik') {
            fields = '_id L16 L17 L18 L19 L20 L21 L22 L23 L24 L25 L26 L27 L28 L29 L30 L1 L2 L3 L4 L5';
        }

        const data = await Construction.find({ Type: type }, fields);

        const responseData = data.map(item => {
            if (type === 'spool') {
                return {
                    id: item._id, 
                    zone: item.L1,
                    systemno: item.L2,
                    systemname: item.L3,
                    isometrino: item.L4,
                    spoolno: item.L6,
                    rev: item.L5,
                    date: item.L50,
                    weight: item.L7,
                    surface: item.L8,
                    totalspool: item.L21,
                    production: item.L22,
                    assembly: item.L23,
                    test_delivery: item.L24,
                    installation_company: item.L9,
                    manufanctuning_company: item.L10
                };
            } else if (type === 'valf') {
                return {
                    id: item._id,
                    dwgno: item.L21,                // DWG NO
                    systemname: item.L2,            // System Name
                    rev: item.L3,                   // REV
                    valvenumber: item.L22,          // VALF NO
                    item: item.L5,                  // ITEM
                    dn: item.L6,                    // DN
                    pn: item.L23,                   // PN
                    type_valve: item.L8,                  // TYPE
                    conn: item.L9,                  // CONN
                    total: item.L24,                // TOPLAM
                    delivery: item.L25,             // TESLIM
                    actuatorDelivery: item.L26,     // Actuator Teslim
                    valveInstallation: item.L27,    // VALF MONTAJ
                    actuatorInstallation: item.L28, // AKTUATOR MONTAJ
                    companyName: item.L11,          // Firma Adı
                    notes: item.L10,                // Notlar
                  };
                  
              } else if (type === 'elektrik') {
                return {
                    id: item._id, 
                    no: item.L16,
                    cableNoOriginals: item.L17,
                    cableNoElkon: item.L18,
                    sfi: item.L19,
                    fromCompartment: item.L20,
                    fromEquipment: item.L21,
                    toCompartment: item.L22,
                    toEquipment: item.L23,
                    equipmentPower: item.L24,
                    cableSupplier: item.L25,
                    rox: item.L26,
                    module: item.L27,
                    trackingNumber: item.L28,
                    estimatedLength: item.L29,
                    pulledLength: item.L30,
                    controlled: item.L1,
                    drawing: item.L2,
                    revNo: item.L3,
                    date: item.L4,
                    note: item.L5
                };
            }
        });

        res.json(Response.successResponse(responseData));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post('/data', async (req, res) => {
    const records = Array.isArray(req.body) ? req.body : [req.body];

    console.log("reqbod",req.body)
    const newRecords = records.map(record => {
        const { type, ...rest } = record;

        if (type === 'valf') {
            return {
                Type: type,
                L21: rest.dwgno,             // DWG NO
                L2: rest.systemname,        // System Name
                L3: rest.rev,               // REV
                L22: rest.valvenumber,       // VALF NO
                L5: rest.item,              // ITEM
                L6: rest.dn,                // DN
                L23: rest.pn,                // PN
                L8: rest.type_valve,              // TYPE
                L9: rest.conn,              // CONN
                L24: rest.total,            // TOPLAM
                L25: rest.delivery,         // TESLIM
                L26: rest.actuatorDelivery, // Actuator Teslim
                L27: rest.valveInstallation,// VALF MONTAJ
                L28: rest.actuatorInstallation, // AKTUATOR MONTAJ
                L11: rest.companyName,      // Firma Adı
                L10: rest.notes,            // Notlar
              };
              
            
        } else if (type === 'elektrik') {
            return {
                Type: type,
                L16: rest.no,
                L17: rest.cableNoOriginals,
                L18: rest.cableNoElkon,
                L19: rest.sfi,
                L20: rest.fromCompartment,
                L21: rest.fromEquipment,
                L22: rest.toCompartment,
                L23: rest.toEquipment,
                L24: rest.equipmentPower,
                L25: rest.cableSupplier,
                L26: rest.rox,
                L27: rest.module,
                L28: rest.trackingNumber,
                L29: rest.estimatedLength,
                L30: rest.pulledLength,
                L1: rest.controlled,
                L2: rest.drawing,
                L3: rest.revNo,
                L4: rest.date,
                L5: rest.note
            };
        } else if (type === 'spool') {
            return {
                Type: type,
                L1: rest.zone,
                L2: rest.systemno,
                L3: rest.systemname,
                L4: rest.isometrino,
                L5: rest.rev,
                L6: rest.spoolno,
                L50: rest.date,
                L7: rest.weight,
                L8: rest.surface,
                L21: rest.totalspool,
                L22: rest.production,
                L23: rest.assembly,
                L24: rest.test_delivery,
                L9: rest.installation_company,
                L10: rest.manufanctuning_company
            };
        } else {
            throw new Error('Unknown type');
        }
    });

    try {
        const savedConstructions = await Construction.insertMany(newRecords);
        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse(savedConstructions));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});



router.put('/data/:id', async (req, res) => {
    const { id } = req.params;
    const { type, ...rest } = req.body;

    let updatedRecord;
    if (type === 'valf') {
        updatedRecord = {
            Type: type,
            L21: rest.dwgno,             // DWG NO
            L2: rest.systemname,        // System Name
            L3: rest.rev,               // REV
            L22: rest.valvenumber,       // VALF NO
            L5: rest.item,              // ITEM
            L6: rest.dn,                // DN
            L23: rest.pn,                // PN
            L8: rest.type_valve,              // TYPE
            L9: rest.conn,              // CONN
            L24: rest.total,            // TOPLAM
            L25: rest.delivery,         // TESLIM
            L26: rest.actuatorDelivery, // Actuator Teslim
            L27: rest.valveInstallation,// VALF MONTAJ
            L28: rest.actuatorInstallation, // AKTUATOR MONTAJ
            L11: rest.companyName,      // Firma Adı
            L10: rest.notes,            // Notlar
          };
    } else if (type === 'elektrik') {
        updatedRecord = {
            Type: type,
            L16: rest.no,
            L17: rest.cableNoOriginals,
            L18: rest.cableNoElkon,
            L19: rest.sfi,
            L20: rest.fromCompartment,
            L21: rest.fromEquipment,
            L22: rest.toCompartment,
            L23: rest.toEquipment,
            L24: rest.equipmentPower,
            L25: rest.cableSupplier,
            L26: rest.rox,
            L27: rest.module,
            L28: rest.trackingNumber,
            L29: rest.estimatedLength,
            L30: rest.pulledLength,
            L1: rest.controlled,
            L2: rest.drawing,
            L3: rest.revNo,
            L4: rest.date,
            L5: rest.note
        };
    } else if (type === 'spool') {
        updatedRecord = {
            Type: type,
            L1: rest.zone,
            L2: rest.systemno,
            L3: rest.systemname,
            L4: rest.isometrino,
            L5: rest.rev,
            L6: rest.spoolno,
            L50: rest.date,
            L7: rest.weight,
            L8: rest.surface,
            L21: rest.totalspool,
            L22: rest.production,
            L23: rest.assembly,
            L24: rest.test_delivery,
            L9: rest.installation_company,
            L10: rest.manufanctuning_company
        };
    }

    try {
        const updatedConstruction = await Construction.findByIdAndUpdate(id, updatedRecord, { new: true });
        res.json(Response.successResponse(updatedConstruction));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.delete('/data/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Construction.findByIdAndDelete(id);
        res.status(Enum.HTTP_CODES.NO_CONTENT).send();
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/import', async (req, res) => {
    const records = req.body;
    const validRecords = [];
    const invalidRecords = [];

    records.forEach(record => {
        const errors = validateRecord(record);
        if (errors.length > 0) {
            invalidRecords.push({ record, errors });
        } else {
            let newRecord;
            if (record.type === 'valf') {
                newRecord = 
                {
                    Type: 'valf',
                    L21: record.dwgno,              // DWG NO
                    L2: record.systemname,          // System Name
                    L3: record.rev,                 // REV
                    L22: record.valvenumber,        // VALF NO
                    L5: record.item,                // ITEM
                    L6: record.dn,                  // DN
                    L23: record.pn,                 // PN
                    L8: record.type_valve,                // TYPE
                    L9: record.conn,                // CONN
                    L24: record.total,              // TOPLAM
                    L25: record.delivery,           // TESLIM
                    L26: record.actuatorDelivery,   // Actuator Teslim
                    L27: record.valveInstallation,  // VALF MONTAJ
                    L28: record.actuatorInstallation, // AKTUATOR MONTAJ
                    L11: record.companyName,        // Firma Adı
                    L10: record.notes,              // Notlar
                  };
                  
            } else if (record.type === 'elektrik') {
                newRecord = {
                    Type: 'elektrik',
                    L16: record.no,
                    L17: record.cableNoOriginals,
                    L18: record.cableNoElkon,
                    L19: record.sfi,
                    L20: record.fromCompartment,
                    L21: record.fromEquipment,
                    L22: record.toCompartment,
                    L23: record.toEquipment,
                    L24: record.equipmentPower,
                    L25: record.cableSupplier,
                    L26: record.rox,
                    L27: record.module,
                    L28: record.trackingNumber,
                    L29: record.estimatedLength,
                    L30: record.pulledLength,
                    L1: record.controlled,
                    L2: record.drawing,
                    L3: record.revNo,
                    L4: record.date,
                    L5: record.note
                };
            } else if (record.type === 'spool') {
                newRecord = {
                    Type: 'spool',
                    L1: record.zone,
                    L2: record.systemno,
                    L3: record.systemname,
                    L4: record.isometrino,
                    L6: record.rev,
                    L5: record.spoolno,
                    L50: record.date,
                    L7: record.weight,
                    L8: record.surface,
                    L21: record.totalspool,
                    L22: record.production,
                    L23: record.assembly,
                    L24: record.test_delivery,
                    L9: record.installation_company,
                    L10: record.manufanctuning_company
                };
            }
            validRecords.push(newRecord);
        }
    });

    try {
        if (validRecords.length > 0) {
            await Construction.insertMany(validRecords);
        }
        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({
            message: 'Import completed',
            invalidRecords
        }));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
