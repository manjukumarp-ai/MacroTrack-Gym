/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Beef, 
  Wheat, 
  Droplets, 
  Loader2, 
  ChevronRight,
  Dumbbell,
  History,
  PieChart as PieChartIcon,
  Sun,
  Moon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { estimateMacros, MacroData } from './services/geminiService';
import { cn } from './lib/utils';

interface MealEntry extends MacroData {
  id: string;
  timestamp: number;
}

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b'];

export default function App() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [mealName, setMealName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const totals = useMemo(() => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [meals]);

  const chartData = [
    { name: 'Protein', value: totals.protein * 4, color: '#ef4444' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#10b981' },
    { name: 'Fats', value: totals.fats * 9, color: '#f59e0b' },
  ];

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName || !quantity) return;

    setIsLoading(true);
    setError(null);
    try {
      const macros = await estimateMacros(mealName, quantity);
      const newMeal: MealEntry = {
        ...macros,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setMeals(prev => [newMeal, ...prev]);
      setMealName('');
      setQuantity('');
    } catch (err) {
      setError('Failed to estimate macros. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-2 rounded-lg">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MacroTrack <span className="text-brand-500">Gym</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <span className="hidden sm:inline">Welcome back, Athlete</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input and List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Input Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Plus className="w-5 h-5 text-brand-500" />
              Add New Meal
            </h2>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Meal Name</label>
                  <input 
                    type="text" 
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g. Grilled Chicken Breast"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quantity</label>
                  <input 
                    type="text" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 200g or 2 pieces"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-slate-600"
                  />
                </div>
              </div>
              <button 
                disabled={isLoading || !mealName || !quantity}
                className="w-full bg-slate-900 dark:bg-brand-500 hover:bg-slate-800 dark:hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-brand-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Calculate Macros
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </section>

          {/* Meals List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                <History className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                Recent Meals
              </h2>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{meals.length} Entries</span>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {meals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors duration-300"
                  >
                    <p className="text-slate-400 dark:text-slate-500 font-medium">No meals tracked yet today.</p>
                  </motion.div>
                ) : (
                  meals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">{meal.mealName}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">{meal.quantity}</span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Flame className="w-3 h-3 text-orange-500" /> {meal.calories} kcal
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Beef className="w-3 h-3 text-red-500" /> {meal.protein}g P
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Wheat className="w-3 h-3 text-emerald-500" /> {meal.carbs}g C
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Droplets className="w-3 h-3 text-amber-500" /> {meal.fats}g F
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeMeal(meal.id)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Column: Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Summary Cards */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Calories</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.calories}</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Total kcal</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-brand-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Macros</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.protein + totals.carbs + totals.fats}g</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Combined weight</p>
            </div>
          </section>

          {/* Chart Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 dark:text-white">
              <PieChartIcon className="w-5 h-5 text-brand-500" />
              Macro Distribution
            </h2>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    itemStyle={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {chartData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.name}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name === 'Protein' ? totals.protein : item.name === 'Carbs' ? totals.carbs : totals.fats}g
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bar Chart for Calories per Meal */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 dark:text-white">
              <BarChart className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Caloric Impact
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meals.slice(0, 5).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis 
                    dataKey="mealName" 
                    hide 
                  />
                  <YAxis hide />
                  <RechartsTooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  />
                  <Bar dataKey="calories" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-4">Last 5 meals caloric comparison</p>
          </section>

        </div>
      </main>
    </div>
  );
}
