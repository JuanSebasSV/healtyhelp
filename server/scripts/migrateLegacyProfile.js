require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const calcularEdad = (bd) => {
  if (!bd) return null;
  const hoy = new Date();
  const nac = new Date(bd);
  let e = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) e--;
  return e;
};

async function migrarPerfilLegacy() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI no definida');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB conectado');

  let totalBirthDate = 0;
  let totalProfileComplete = 0;

  try {
    const sinFecha = await User.find({
      birthDate: { $exists: false },
      age: { $exists: true, $ne: null },
    }).lean();

    if (sinFecha.length > 0) {
      const ahora = new Date();
      for (const doc of sinFecha) {
        const edadLegacy = Number(doc.age);
        if (!edadLegacy || isNaN(edadLegacy) || edadLegacy < 1 || edadLegacy > 120) continue;

        const mes = Math.floor(Math.random() * 12);
        let anioNac = ahora.getFullYear() - edadLegacy;
        const diasMax = new Date(anioNac, mes + 1, 0).getDate();
        const dia = Math.floor(Math.random() * diasMax) + 1;
        const bdTest = new Date(anioNac, mes, dia);
        if (calcularEdad(bdTest) < edadLegacy) anioNac -= 1;
        const bd = new Date(anioNac, mes, dia);
        const edad = calcularEdad(bd);
        const update = { birthDate: bd };
        if (
          edad >= 18 && edad <= 120 &&
          doc.weight >= 40 && doc.weight <= 300 &&
          doc.height >= 50 && doc.height <= 210
        ) update.profileComplete = true;
        await User.updateOne({ _id: doc._id }, { $set: update });
        totalBirthDate++;
      }
      console.log(`[migración] birthDate asignada a ${sinFecha.length} cuenta(s) legacy`);
    }

    const sinCompletar = await User.find({
      birthDate: { $exists: true },
      profileComplete: { $ne: true },
    }).lean();

    for (const doc of sinCompletar) {
      const edad = calcularEdad(doc.birthDate);
      if (
        edad >= 18 && edad <= 120 &&
        doc.weight >= 40 && doc.weight <= 300 &&
        doc.height >= 50 && doc.height <= 210
      ) {
        await User.updateOne(
          { _id: doc._id },
          { $set: { profileComplete: true } },
        );
        totalProfileComplete++;
      }
    }
    if (totalProfileComplete > 0) {
      console.log(`[migración] profileComplete corregido en ${totalProfileComplete} cuenta(s)`);
    }
  } catch (err) {
    console.error('[migración] Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log(`✅ Migración finalizada. ${totalBirthDate} birthDate + ${totalProfileComplete} profileComplete`);
  }
}

migrarPerfilLegacy();