"use client";

import { useEffect, useState } from "react";
import {
  Sun, Moon, Building2, Cpu, BarChart3, Users, Brain, MessageSquare,
  Calendar, Leaf, Shield, TrendingUp, Globe2
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Mock data para gráfico combinado
const dashboardData = [
  { month: "Jan", revenue: 120000, profit: 40000, clients: 30 },
  { month: "Feb", revenue: 145000, profit: 50000, clients: 35 },
  { month: "Mar", revenue: 160000, profit: 60000, clients: 45 },
  { month: "Apr", revenue: 180000, profit: 70000, clients: 50 },
  { month: "May", revenue: 200000, profit: 85000, clients: 60 },
];

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 30);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(interval);
      }
      setCount(Math.round(start));
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
}

export default function UltraTechPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [darkMode]);

  const coreFeatures = [
    { icon: Building2, title: "ERP", desc: "Save 20+ hours/week with AI-driven inventory & project management." },
    { icon: Cpu, title: "MRP", desc: "Optimize production planning with predictive AI insights." },
    { icon: BarChart3, title: "Finance", desc: "Automate cash flow, invoices, and multi-currency planning." },
    { icon: Users, title: "CRM", desc: "Convert leads faster and improve retention with smart automation." },
    { icon: Brain, title: "Analytics & AI", desc: "Predictive KPIs, simulations, and risk management." },
    { icon: MessageSquare, title: "Communication", desc: "Real-time chat, video calls, AI assistant integration." },
    { icon: Calendar, title: "Agenda", desc: "Tasks, Kanban, Scrum boards with AI scheduling." },
    { icon: Leaf, title: "Sustainability", desc: "Track ESG metrics & emission reports automatically." },
    { icon: Shield, title: "Compliance", desc: "Automate audits, contracts, and GDPR/LGPD compliance." },
    { icon: Cpu, title: "Automation", desc: "RPA, APIs, IoT, and workflow integrations." },
    { icon: TrendingUp, title: "Strategic", desc: "Set OKRs, Balanced Scorecards, and budgets efficiently." },
    { icon: Globe2, title: "Global", desc: "Multi-language, multi-currency, timezone & localization." },
  ];

  const testimonials = [
    { name: "Jane Doe", company: "TechCorp", quote: "OmniSuite reduced our operational time by 30% using AI insights." },
    { name: "John Smith", company: "Global Inc.", quote: "Real-time dashboards gave our executives instant clarity." },
    { name: "Alice Lee", company: "FinTech Solutions", quote: "All-in-one SaaS with powerful automation and sleek UX." },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

      {/* NAVIGATION */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">OmniSuite</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 border rounded-md border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
            Request Demo
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
          Control Your Business <span className="text-blue-600 dark:text-blue-400">In Real-Time</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mb-10">
          OmniSuite unites ERP, CRM, Finance, HR, AI automation, and global compliance in one platform — boosting efficiency, revenue, and decision-making speed.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="px-10 py-5 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition">
            Start Free Trial — No Card Required
          </motion.button>
          <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="px-10 py-5 text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-lg transition">
            Request Demo
          </motion.button>
        </div>
      </section>

      {/* DASHBOARD GRÁFICO */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Key Metrics</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">Revenue, Profit, and New Clients growth over months.</p>
        </div>
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dashboardData}>
              <XAxis dataKey="month" stroke={darkMode ? "#D1D5DB" : "#6B7280"} />
              <YAxis stroke={darkMode ? "#D1D5DB" : "#6B7280"} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#2563EB" name="Revenue" />
              <Bar dataKey="profit" fill="#10B981" name="Profit" />
              <Line type="monotone" dataKey="clients" stroke="#FBBF24" strokeWidth={3} name="Clients" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">All Modules in One Platform</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">From ERP to AI analytics, OmniSuite powers your entire business with cutting-edge technology.</p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {coreFeatures.map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition transform text-center">
              <feature.icon className="w-14 h-14 text-blue-500 mb-4 mx-auto"/>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              <p className="text-sm mt-2 text-blue-500 font-medium">Learn More →</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {testimonials.map((t, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.03 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition transform text-center">
                <p className="italic text-gray-700 dark:text-gray-300">"{t.quote}"</p>
                <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">{t.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.company}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Transform Your Business Today
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg mb-10 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          Start a free trial or request a demo to see how OmniSuite unites your operations, strategy, and analytics in real-time.
        </motion.p>
        <motion.button initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 100 }}
          className="px-10 py-5 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition">
          Start Free Trial
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} OmniSuite — Complete Business Management Platform.
      </footer>

    </main>
  );
}
