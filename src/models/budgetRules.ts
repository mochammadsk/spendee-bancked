import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBudgetRule extends Document {
  userId: Types.ObjectId | string;
  incomeSourceId?: Types.ObjectId | string;
  categoryId?: Types.ObjectId | string;
  percentage: number;
}

const budgetRuleSchema = new Schema<IBudgetRule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    incomeSourceId: {
      type: Schema.Types.ObjectId,
      ref: 'IncomeSource',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    percentage: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBudgetRule>('BudgetRule', budgetRuleSchema);
