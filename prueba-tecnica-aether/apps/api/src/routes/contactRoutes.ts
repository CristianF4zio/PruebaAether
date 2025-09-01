import { Router } from 'express';
import { startSession } from 'mongoose';
import Contact from '../models/contact';
import Operation from '../models/operation';

const router = Router();

/** API REST para gestión de contactos y sus operaciones financieras.
 
 * Endpoints:
 * 1. GET /api/contacts  – listar todos
 * 2. POST /api/contacts – crear contacto
 * 3. PATCH /api/contacts/:id – editar solo nombre
 * 4. GET /api/contacts/:id – perfil completo
 * 5. POST /api/contacts/:id/operations - crédito/débito (transacción atómica)
 * 6. GET /api/contacts/:id/operations – historial
 * 7. GET /api/contacts/:id/export – exportar CSV con filtro de fechas

 */

// 1. GET /api/contacts  – listar todos
router.get('/', async (_req, res) => {
  try {
    // Obtiene todos los contactos ordenados por fecha de creación (más recientes primero)
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
});

// 2. POST /api/contacts – crear contacto
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Verifica si el email ya existe
    const existingContact = await Contact.findOne({ email });
    if (existingContact) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crea el contacto con balance inicial en 0
    const contact = await Contact.create({ email, name, balance: 0 });
    res.status(201).json(contact);
  } catch (error: any) {
    // Maneja duplicados de email por índice único
    if (error.code === 11000) {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear contacto' });
    }
  }
});

// 3. PATCH /api/contacts/:id – editar solo nombre
router.patch('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    // Actualiza solo el nombre y devuelve el contacto actualizado
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contacto' });
  }
});

// 4. GET /api/contacts/:id – perfil completo
router.get('/:id', async (req, res) => {
  try {
    // Busca contacto por ID
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener contacto' });
  }
});

// 5. POST /api/contacts/:id/operations – crédito/débito (transacción atómica)
router.post('/:id/operations', async (req, res) => {
  const { type, amount } = req.body;

  // Validación: solo permite credit/debit
  if (type !== 'credit' && type !== 'debit') {
    return res.status(400).json({ error: 'Tipo de operación inválido. Use "credit" o "debit"' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  const session = await startSession();
  session.startTransaction();

  try {
    // Busca el contacto en la sesión de transacción
    const contact = await Contact.findById(req.params.id).session(session);
    if (!contact) throw new Error('Contacto no encontrado');

    // Cálculo del nuevo balance
    const numericAmount = parseFloat(amount);
    const change = type === 'credit' ? numericAmount : -numericAmount;
    const newBalance = contact.balance + change;

    if (newBalance < 0) throw new Error('Fondos insuficientes para realizar el retiro');

    // Registra la operación vinculada al contacto
    const [op] = await Operation.create(
      [{
        contact: contact._id,
        type,
        amount: numericAmount,
        balanceAfter: newBalance
      }],
      { session }
    );

    // Actualiza balance del contacto
    contact.balance = newBalance;
    await contact.save({ session });

    // Confirma la transacción
    await session.commitTransaction();
    res.json(op);
  } catch (err: any) {
    // Revierte si algo falla
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// 6. GET /api/contacts/:id/operations – historial
router.get('/:id/operations', async (req, res) => {
  try {
    // Verifica que el contacto exista
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado' });

    // Devuelve operaciones ordenadas de más recientes a más antiguas
    const ops = await Operation.find({ contact: req.params.id }).sort({ createdAt: -1 });
    res.json(ops);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de operaciones' });
  }
});

// 7. GET /api/contacts/:id/export – exportar CSV con filtro de fechas
router.get('/:id/export', async (req, res) => {
  try {
    const { start, end } = req.query;

    // Verifica que el contacto exista
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado' });

    // Filtro dinámico
    const filter: any = { contact: req.params.id };

    // Filtro por fecha de inicio
    if (start && start !== 'undefined' && start !== '') {
      const startDate = new Date(start as string);
      if (isNaN(startDate.getTime())) return res.status(400).json({ error: 'Fecha de inicio inválida' });
      filter.createdAt = { ...filter.createdAt, $gte: startDate };
    }

    // Filtro por fecha de fin
    if (end && end !== 'undefined' && end !== '') {
      const endDate = new Date(end as string);
      if (isNaN(endDate.getTime())) return res.status(400).json({ error: 'Fecha de fin inválida' });
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }

    // Obtiene las operaciones filtradas
    const ops = await Operation.find(filter).sort({ createdAt: -1 });

    // Interfaz para tipar CSV
    interface CSVOperation {
      createdAt: Date;
      type: string;
      amount: number;
      balanceAfter: number;
    }

    // Convierte a CSV con formato amigable
    const { Parser } = await import('json2csv');
    const csv = new Parser({
      fields: [
        {
          label: 'Fecha y Hora',
          value: (row: CSVOperation) => new Date(row.createdAt).toLocaleString()
        },
        {
          label: 'Tipo',
          value: (row: CSVOperation) => row.type === 'credit' ? 'Ingreso' : 'Retiro'
        },
        {
          label: 'Monto',
          value: (row: CSVOperation) => row.type === 'credit'
            ? `+$${Math.abs(row.amount).toFixed(2)}`
            : `-$${Math.abs(row.amount).toFixed(2)}`
        },
        {
          label: 'Balance Posterior',
          value: (row: CSVOperation) => `$${row.balanceAfter.toFixed(2)}`
        }
      ]
    }).parse(ops);

    // Nombre del archivo dinámico
    const filename = `operaciones_${contact.name}_${start || 'inicio'}_${end || 'actual'}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Error al exportar operaciones' });
  }
});

export { router as contactRoutes };
