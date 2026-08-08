import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Coffee, Home, Zap, Heart, Search, Filter } from 'lucide-react';
import api from '../api';



const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const resp = await api.get('/stats/summary/');
      setMonthlyBudget(parseFloat(resp.data.monthly_budget) || 0);
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/transactions/');
      setExpenses(response.data);
      setTotal(response.data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0));
    } catch (error) {
      console.error('Error fetching expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount) return;
    if (monthlyBudget === 0 && !newBudgetAmount) {
      alert("Please set your budget for this month!");
      return;
    }

    try {
      const payload = {
        title: newExpenseTitle,
        amount: parseFloat(newExpenseAmount),
      };
      if (monthlyBudget === 0 && newBudgetAmount) {
        payload.monthly_budget = parseFloat(newBudgetAmount);
      }

      const response = await api.post('/transactions/', payload);
      setExpenses([response.data, ...expenses]);
      const newTotal = total + parseFloat(response.data.amount);
      setTotal(newTotal);
      
      const activeBudget = monthlyBudget === 0 ? parseFloat(newBudgetAmount) : monthlyBudget;
      if (activeBudget === 0 && newBudgetAmount) {
        setMonthlyBudget(parseFloat(newBudgetAmount));
      }

      if (activeBudget > 0 && newTotal > activeBudget) {
        alert("Warning: Expenses are exceeding the budget!");
      } else {
        alert("Expense Added!");
      }
      
      setNewExpenseTitle('');
      setNewExpenseAmount('');
      setNewBudgetAmount('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add expense', error);
      alert(error.response?.data?.[0] || error.response?.data?.non_field_errors?.[0] || "Failed to add expense.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Track your spending and task-linked costs.</p>
        </div>
        <div className="flex bg-white shadow-sm border border-gray-100 rounded-2xl p-4 gap-6 items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`text-white w-12 h-12 flex items-center justify-center rounded-xl transition-colors shadow-lg ${showAddForm ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-900/10' : 'bg-primary hover:bg-gray-800 shadow-gray-900/10'}`}
          >
            <Plus className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </header>
      
      {/* Quick Add Form */}
      {showAddForm && (
        <motion.form 
          initial={{ opacity: 0, height: 0, mb: 0 }}
          animate={{ opacity: 1, height: 'auto', mb: 24 }}
          onSubmit={handleAddExpense}
          className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4"
        >
          <input 
            type="text" 
            placeholder="Expense title" 
            value={newExpenseTitle}
            onChange={e => setNewExpenseTitle(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-accent"
          />
          <input 
            type="number" 
            placeholder="Amount (e.g., 25.00)" 
            step="0.01"
            value={newExpenseAmount}
            onChange={e => setNewExpenseAmount(e.target.value)}
            className="w-full md:w-48 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-accent"
          />
          {monthlyBudget === 0 && (
            <input 
              type="number" 
              placeholder="Set Monthly Budget" 
              step="0.01"
              value={newBudgetAmount}
              onChange={e => setNewBudgetAmount(e.target.value)}
              className="w-full md:w-48 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-400 placeholder:-rose-400"
              required
            />
          )}
          <button type="submit" className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-600">
            Save
          </button>
        </motion.form>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 focus-within:ring-2 focus-within:ring-accent transition-all shadow-sm">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="flex-1 bg-transparent border-none outline-none font-medium text-gray-700"
          />
        </div>
        <button className="bg-white border text-gray-600 border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors font-medium shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-400">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-400">No expenses logged yet. Make sure tasks with prices are complete!</td></tr>
              ) : expenses.map((expense, idx) => {
                const Icon = Coffee;
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }} // Cap delay
                    key={expense.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-accent transition-colors truncate max-w-[200px] md:max-w-xs">{expense.title}</p>
                          {expense.linked_task && (
                            <p className="text-xs font-medium text-emerald-500 mt-0.5">Auto-generated via Task #{expense.linked_task}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium hidden sm:table-cell">
                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900 tabular-nums">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
