const { Schema, model } = require('mongoose');

const budgetRuleSchema = new Schema(
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

module.exports = model('BudgetRule', budgetRuleSchema);
