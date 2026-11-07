// Isolated synthetic records for tests and browser acceptance; never a default data source.
export function syntheticFinanceData() {
  return {
    period: '2026-03', asOf: '2026-03-10', assetSnapshotDate: '2026-03-10', assetAsOf: '2026-03-10', assetValuationStatus: 'user_reported',
    summary: { incomeTotal: 100, expenseTotal: 25, availableCash: 0, totalAssets: 20, fundTotal: 20, depositTotal: 0, receivablesTotal: 0, runwayMonths: null, liabilities: null, liabilitiesStatus: 'unknown', totalNetAssets: null },
    incomeRecordStatus: 'recorded',
    accounts: [{ name: 'Synthetic account', category: 'cash', amount: 0, color: '#10B981', note: 'Isolated fixture' }],
    receivables: [{ title: 'Synthetic receivable', amount: 0, status: '待核对', desc: 'Isolated fixture' }],
    healthScores: [{ dimension: 'Synthetic health', score: 70, status: 'synthetic', detail: 'Isolated fixture' }],
    actionItems: [{ title: 'Synthetic action', priority: '普通', content: 'Isolated fixture' }],
    historicalComparison: [{ month: '2026-01', income: 0, expense: 0, savings: 0 }],
    monthlySummaries: [
      { period: '2026-02', through: '2026-02-28', income: 80, expense: 20, incomeRecordStatus: 'recorded', coverage: 'partial', source: 'synthetic', note: 'Isolated fixture' },
      { period: '2026-03', through: '2026-03-10', income: 100, expense: 25, incomeRecordStatus: 'recorded', coverage: 'partial', source: 'synthetic', note: 'Isolated fixture' }
    ],
    incomeDetails: [{ date: '2026-03-02', amount: 100, source: 'Synthetic income', kind: 'salary', account: 'Synthetic account', desc: 'Isolated fixture' }],
    transactions: {
      items: [
        { id: 'synthetic-a', date: '2026-03-02', weekday: '一', amount: 20, category: 'Synthetic category', kind: 'routine', account: 'Synthetic account', note: 'Isolated fixture', color: '#10B981' },
        { id: 'synthetic-b', date: '2026-03-10', weekday: '二', amount: 5, category: 'Synthetic category', kind: 'routine', account: 'Synthetic account', note: 'Isolated fixture', color: '#10B981' }
      ],
      byDay: [
        { day: 1, recordStatus: 'confirmed_zero', total: 0, routine: 0, capital: 0 },
        { day: 2, recordStatus: 'recorded', total: 20, routine: 20, capital: 0 },
        { day: 3, recordStatus: 'unrecorded', total: null, routine: null, capital: null },
        { day: 10, recordStatus: 'recorded', total: 5, routine: 5, capital: 0 }
      ]
    },
    periodDatasets: {}
  };
}
