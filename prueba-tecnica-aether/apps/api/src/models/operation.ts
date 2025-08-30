import mongoose, { Schema, Document } from 'mongoose';

export interface IOperation extends Document {
  contact: mongoose.Types.ObjectId;
  type: 'credit' | 'debit'; // ✅ Cambiado de 'add' | 'subtract' a 'credit' | 'debit'
  amount: number;
  balanceAfter: number;
  createdAt: Date;
}

const OperationSchema: Schema = new Schema({
  contact: { 
    type: Schema.Types.ObjectId, 
    ref: 'Contact', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['credit', 'debit'], // ✅ Cambiado de ['add', 'subtract'] a ['credit', 'debit']
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice para mejorar el rendimiento de las consultas
OperationSchema.index({ contact: 1, createdAt: -1 });

export default mongoose.model<IOperation>('Operation', OperationSchema);