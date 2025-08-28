import { Router } from 'express';
import { startSession } from 'mongoose';
import Contact from '../models/contact';
import Operation from '../models/operation';

const router = Router();

// 1. GET /api/contacts  – listar todos
router.get('/', async (_req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// 2. POST /api/contacts – crear contacto
router.post('/', async (req, res) => {
  const { email, name } = req.body;
  const contact = await Contact.create({ email, name, balance: 0 });
  res.status(201).json(contact);
});

// 3. PATCH /api/contacts/:id – editar solo nombre
router.patch('/:id', async (req, res) => {
  const { name } = req.body;
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  res.json(contact);
});

// 4. GET /api/contacts/:id – perfil completo
router.get('/:id', async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).send('Contacto no encontrado');
  res.json(contact);
});

// 5. POST /api/contacts/:id/operations – crédito/débito (transacción atómica)
router.post('/:id/operations', async (req, res) => {
  const { type, amount } = req.body;
  const session = await startSession();
  session.startTransaction();
  try {
    const contact = await Contact.findById(req.params.id).session(session);
    if (!contact) throw new Error('Contacto no encontrado');

    const change = type === 'credit' ? amount : -amount;
    const newBalance = contact.balance + change;
    if (newBalance < 0) throw new Error('Fondos insuficientes');

    const [op] = await Operation.create(
      [{ contact: contact._id, type, amount, balanceAfter: newBalance }],
      { session }
    );

    contact.balance = newBalance;
    await contact.save({ session });

    await session.commitTransaction();
    res.json(op);
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// 6. GET /api/contacts/:id/operations – historial
router.get('/:id/operations', async (req, res) => {
  const ops = await Operation.find({ contact: req.params.id })
    .sort({ createdAt: -1 });
  res.json(ops);
});

// 7. GET /api/contacts/:id/export – exportar CSV con filtro de fechas
router.get('/:id/export', async (req, res) => {
  const { start, end } = req.query;
  const filter: any = { contact: req.params.id };

  if (start !== 'undefined' && start !== '') filter.createdAt = { ...filter.createdAt, $gte: new Date(start as string) };
  if (end   !== 'undefined' && end   !== '') filter.createdAt = { ...filter.createdAt, $lte: new Date(end   as string) };

  const ops = await Operation.find(filter).sort({ createdAt: -1 });
  const { Parser } = await import('json2csv');
  const csv = new Parser({ fields: ['createdAt', 'type', 'amount', 'balanceAfter'] }).parse(ops);

  const contact = await Contact.findById(req.params.id);
  const filename = `${contact?.name || 'contact'}_${start || 'inicio'}_${end || 'now'}.csv`;

  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  res.send(csv);
});

// Exportar como exportación nombrada
export { router as contactRoutes };