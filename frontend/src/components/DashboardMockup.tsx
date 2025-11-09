"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { name: 'Jan', revenue: 120000 },
  { name: 'Feb', revenue: 145000 },
  { name: 'Mar', revenue: 160000 },
  { name: 'Apr', revenue: 180000 },
  { name: 'May', revenue: 200000 },
];

const productionData = [
  { name: 'Week 1', efficiency: 88 },
  { name: 'Week 2', efficiency: 91 },
  { name: 'Week 3', efficiency: 93 },
  { name: 'Week 4', efficiency: 94 },
];

const crmData = [
  { name: 'Leads', value: 120 },
  { name: 'Opportunities', value: 80 },
  { name: 'Closed', value: 50 },
];

export default function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="max-w-7xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header bar */}
      <div className="bg-gray-100 dark:bg-gray-800 h-10 flex items-center px-4">
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-8 grid lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Revenue Growth</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={revenueData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Production Efficiency</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={productionData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#10B981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">CRM Overview</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={crmData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#6B7280"/>
                <YAxis type="category" dataKey="name" stroke="#6B7280"/>
                <Tooltip/>
                <Bar dataKey="value" fill="#FBBF24" radius={[6,6,6,6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI & Insights Section */}
        <div className="flex flex-col gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">AI Insights</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Predictive analytics for demand, production bottlenecks, and margins optimization.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Sustainability & ESG</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track emissions, ESG KPIs, sustainability reports, and compliance audits.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Tasks & Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Internal chat, video calls, Kanban boards, Google/Outlook integrations, and reminders.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
