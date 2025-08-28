import mongoose, { Schema, Document } from 'mongoose';

export interface IOperation extends Document {
  contact: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
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
    enum: ['credit', 'debit'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<IOperation>('Operation', OperationSchema);