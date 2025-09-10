import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Baby, Weight, Ruler, TrendingUp, Utensils, Sparkles, Info, BarChartBig, Award, Download, Users, Bell, MessageCircle, Trash2, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../context/AuthContext'
import { doc, updateDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'

// --- Helpers and Mocks ---

const defaultFoodImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519864601747-22a4f8f5a804?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1523987355523-c7c2bfc5c1b9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1505250463726-c7d151ad1773?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1464306076886-debede19d6c5?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=80"
]

const recipeList = [
  {
    name: "Cheesy Veggie Quesadilla",
    imgs: [defaultFoodImages[0], defaultFoodImages[1], defaultFoodImages[2]],
    description: "Whole wheat quesadilla with beans, veggies, and cheese.",
    nutrition: "Protein, fiber, calcium.",
    kidAppeal: "Cheesy and crunchy!",
    details: [
      { nutrient: "Protein", info: "Beans, cheese" },
      { nutrient: "Fiber", info: "Bell peppers, tortilla" },
      { nutrient: "Calcium", info: "Cheese" }
    ],
    steps: [
      "Spread beans and veggies on tortilla.",
      "Add cheese, fold and grill.",
      "Cut into slices and serve."
    ]
  },
  {
    name: "Banana Oat Pancakes",
    imgs: [defaultFoodImages[3], defaultFoodImages[4], defaultFoodImages[1]],
    description: "Banana, oats, and egg pancakes for a power breakfast.",
    nutrition: "Potassium, fiber, protein.",
    kidAppeal: "Fluffy and naturally sweet!",
    details: [
      { nutrient: "Potassium", info: "Banana" },
      { nutrient: "Fiber", info: "Oats" },
      { nutrient: "Protein", info: "Egg" }
    ],
    steps: [
      "Mash bananas, mix with oats and egg.",
      "Pour on skillet and cook until golden.",
      "Serve with fruit."
    ]
  },
  {
    name: "Rainbow Salad Bowl",
    imgs: [defaultFoodImages[6], defaultFoodImages[2], defaultFoodImages[0]],
    description: "Colorful salad with carrots, cucumber, corn, and tomatoes.",
    nutrition: "Vitamins A & C, fiber.",
    kidAppeal: "Fun to arrange and eat!",
    details: [
      { nutrient: "Vitamin A", info: "Carrots" },
      { nutrient: "Vitamin C", info: "Tomatoes" },
      { nutrient: "Fiber", info: "Cucumber, corn" }
    ],
    steps: [
      "Chop all veggies.",
      "Toss with lemon and salt.",
      "Arrange by color and serve."
    ]
  }
]

// --- Utility Functions ---

function calculateBMI(weight, height) {
  if (!weight || !height) return null
  const h = parseFloat(height) / 100
  return h ? (parseFloat(weight) / (h * h)).toFixed(1) : null
}

async function mockGeminiAIBMI(bmi, age, gender) {
  if (!bmi) return "BMI data unavailable."
  const val = parseFloat(bmi)
  if (age < 2) return "BMI not recommended for children under 2."
  if (val < 14) return "Underweight for age group."
  if (val < 18) return "Healthy weight for age group."
  if (val < 21) return "Slightly overweight for age group."
  return "Overweight for age group."
}

async function mockGeminiAIMealReport(mealType, items) {
  if (!items) return "No meal items logged."
  if (mealType === "breakfast") {
    return "Good start! Consider adding fruit for vitamins. Protein is important for breakfast."
  }
  if (mealType === "lunch") {
    return "Great! Ensure there's a balance of veggies, grains, and protein. Limit fried food."
  }
  if (mealType === "dinner") {
    return "Dinner looks balanced. Avoid heavy carbs close to bedtime."
  }
  if (items.toLowerCase().includes("chips") || items.toLowerCase().includes("fry")) {
    return "Try to limit fried or processed foods. Add more vegetables or fruits."
  }
  return "Meal looks balanced! Keep offering variety."
}

function downloadCSV(data, filename) {
  if (!data || !data.length) return
  const csvRows = []
  const headers = Object.keys(data[0])
  csvRows.push(headers.join(','))
  for (const row of data) {
    const values = headers.map(h => `"${row[h] ?? ''}"`)
    csvRows.push(values.join(','))
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function getBadges(child) {
  const badges = []
  if (child.nutritionData && child.nutritionData.length >= 10) {
    badges.push({ icon: <Award className="w-4 h-4 inline" />, name: "Meal Master" })
  }
  if (child.growthData && child.growthData.length >= 5) {
    badges.push({ icon: <Award className="w-4 h-4 inline" />, name: "Growth Tracker" })
  }
  return badges
}

// --- Progress Report PDF Helper ---
function generateReportHTML(child, type = "weekly") {
  const now = new Date()
  const periodStart = new Date(now)
  if (type === "weekly") periodStart.setDate(now.getDate() - 7)
  else periodStart.setMonth(now.getMonth() - 1)

  const meals = (child.nutritionData || []).filter(m =>
    new Date(m.date) >= periodStart
  )
  const growth = (child.growthData || []).filter(g =>
    new Date(g.date || 0) >= periodStart
  )

  let html = `
    <h1>Progress Report: ${child.name}</h1>
    <h2>${type === "weekly" ? "Weekly" : "Monthly"} Summary (${periodStart.toLocaleDateString()} - ${now.toLocaleDateString()})</h2>
    <hr/>
    <h3>Basic Info</h3>
    <ul>
      <li><b>Name:</b> ${child.name}</li>
      <li><b>Age:</b> ${child.age || "N/A"}</li>
      <li><b>Gender:</b> ${child.gender || "N/A"}</li>
      <li><b>Latest Weight:</b> ${child.weight || "N/A"} kg</li>
      <li><b>Latest Height:</b> ${child.height || "N/A"} cm</li>
    </ul>
    <h3>Meal Logs (${meals.length})</h3>
    <ul>
      ${meals.length ? meals.map(m => `<li><b>${m.mealType || m.type || "Meal"}</b> - ${m.items} (${new Date(m.date).toLocaleString()})<br/><i>${m.aiReport || ""}</i></li>`).join("") : "<li>No meals logged.</li>"}
    </ul>
    <h3>Growth Logs (${growth.length})</h3>
    <ul>
      ${growth.length ? growth.map(g => `<li>${new Date(g.date).toLocaleDateString()}: ${g.weight} kg, ${g.height} cm</li>`).join("") : "<li>No growth logs.</li>"}
    </ul>
    <h3>Badges</h3>
    <ul>
      ${getBadges(child).length ? getBadges(child).map(b => `<li>${b.name}</li>`).join("") : "<li>No badges yet.</li>"}
    </ul>
  `
  return html
}

function downloadPDF(child, type = "weekly") {
  const html = generateReportHTML(child, type)
  const win = window.open('', '_blank')
  win.document.write(`
    <html>
      <head>
        <title>${child.name} ${type} Progress Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2em; color: #222; }
          h1, h2 { color: #059669; }
          ul { margin-left: 1em; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          setTimeout(function() { window.print(); }, 500);
        </script>
      </body>
    </html>
  `)
  win.document.close()
}

// --- Chart ---
function GrowthChart({ child }) {
  if (!child.growthData || child.growthData.length < 2)
    return <div className="text-xs text-gray-400 pt-2">Add more growth entries to see the chart.</div>
  const labels = child.growthData.map(g => g.date ? new Date(g.date).toLocaleDateString() : 'Unknown')
  return (
    <div className="bg-gray-900 rounded-lg mt-2 py-3 px-2">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Weight (kg)',
              data: child.growthData.map(g => parseFloat(g.weight)),
              borderColor: 'rgba(16,185,129,1)',
              backgroundColor: 'rgba(16,185,129,0.2)',
              tension: 0.3,
              yAxisID: 'y'
            },
            {
              label: 'Height (cm)',
              data: child.growthData.map(g => parseFloat(g.height)),
              borderColor: 'rgba(59,130,246,1)',
              backgroundColor: 'rgba(59,130,246,0.2)',
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: 'white', font: { size: 13 } } }
          },
          scales: {
            x: { ticks: { color: 'white' } },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              ticks: { color: '#22d3ee' },
              grid: { color: '#334155' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#4f46e5' }
            }
          }
        }}
        height={180}
      />
    </div>
  )
}

// --- PhotoJournal ---
function PhotoJournal({ photos }) {
  if (!photos || !photos.length) return null
  return (
    <div className="flex flex-row gap-2 mt-2">
      {photos.map((url, idx) => (
        <img key={idx} src={url} alt="Meal" className="w-14 h-14 rounded object-cover border border-emerald-800" />
      ))}
    </div>
  )
}

// --- AIRecipeCarousel ---
function AIRecipeCarousel({ recipe, onImgClick }) {
  const [imgIdx, setImgIdx] = useState(0)
  const total = recipe.imgs.length
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group cursor-pointer" style={{ minWidth: 220, maxWidth: 220 }}>
        <img
          src={recipe.imgs[imgIdx]}
          alt={recipe.name}
          className="rounded-lg w-full h-36 object-cover border-emerald-700 border"
          onClick={() => onImgClick(recipe)}
        />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 bg-black/80 text-emerald-200 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition">
          {recipe.nutrition}
        </div>
        {total > 1 && (
          <>
            <button aria-label="Previous Image" onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + total) % total) }} className="absolute left-1 top-1/2 -translate-y-1/2 bg-emerald-700/50 text-white rounded-full p-1">{"<"}</button>
            <button aria-label="Next Image" onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % total) }} className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-700/50 text-white rounded-full p-1">{">"}</button>
          </>
        )}
        <div className="absolute right-2 top-2 text-xs px-2 py-1 bg-emerald-700/70 rounded text-white">{imgIdx + 1}/{total}</div>
      </div>
    </div>
  )
}

// --- ChildHealthCard ---
function ChildHealthCard({ child }) {
  const [bmi, setBMI] = useState(null)
  const [bmiAdvice, setBMIAdvice] = useState(null)
  useEffect(() => {
    const bmiVal = calculateBMI(child.weight, child.height)
    setBMI(bmiVal)
    mockGeminiAIBMI(bmiVal, child.age, child.gender).then(setBMIAdvice)
  }, [child.weight, child.height, child.age, child.gender])
  return (
    <Card className="bg-gray-800/60 border-gray-700 mt-3">
      <CardContent className="p-3 flex items-center gap-3">
        <BarChartBig className="w-8 h-8 text-emerald-400" />
        <div>
          <div className="text-white font-semibold">BMI: {bmi || '--'}</div>
          <div className="text-emerald-300 text-xs">{bmiAdvice}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- DeleteChildModal ---
function DeleteChildModal({ child, onCancel, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-red-700 rounded-xl p-8 w-full max-w-sm">
        <h3 className="text-xl text-red-400 font-bold mb-4 flex items-center gap-2"><Trash2 />Delete Child Profile</h3>
        <p className="text-white mb-3">Are you sure you want to delete <b>{child.name}</b> and all their records? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={onDelete} className="flex-1 bg-red-600 text-white hover:bg-red-700">Delete</Button>
        </div>
      </motion.div>
    </div>
  )
}

// --- AddChildModal ---
function AddChildModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', weight: '', height: '', birthDate: '' })
  const handleSubmit = (e) => { e.preventDefault(); onAdd(formData) }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Add Child Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Age</label>
              <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required>
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Weight (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Height (cm)</label>
              <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Birth Date</label>
            <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-gray-600 text-gray-300">Cancel</Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">Add Child</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// --- ChildAvatar ---
function ChildAvatar({ avatar }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden border-2 border-emerald-500 shadow">
      {avatar ? (
        <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <Baby className="w-5 h-5 text-white" />
      )}
    </div>
  )
}

// --- LogMealModal ---
function LogMealModal({ childId, onClose, onLog }) {
  const [meal, setMeal] = useState({ type: '', time: '', nutritionScore: '', mealType: '', items: '' })
  const [aiReport, setAIReport] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!meal.type || !meal.time || !meal.nutritionScore || !meal.mealType || !meal.items) return
    setLoadingAI(true)
    const report = await mockGeminiAIMealReport(meal.mealType, meal.items)
    setAIReport(report)
    setLoadingAI(false)
    onLog(childId, { ...meal, aiReport: report, date: new Date().toISOString() })
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Log Meal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Meal Name</label>
            <input type="text" value={meal.type} onChange={e => setMeal({ ...meal, type: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Time</label>
            <input type="time" value={meal.time} onChange={e => setMeal({ ...meal, time: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Nutrition Score (1-10)</label>
            <input type="number" min="1" max="10" value={meal.nutritionScore} onChange={e => setMeal({ ...meal, nutritionScore: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Meal Type</label>
            <select value={meal.mealType} onChange={e => setMeal({ ...meal, mealType: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">Select</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Meal Items (comma separated)</label>
            <input type="text" value={meal.items} onChange={e => setMeal({ ...meal, items: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="e.g. roti, dal, sabzi, salad" />
          </div>
          {aiReport && (
            <div className="p-3 bg-emerald-900/70 rounded-lg text-emerald-200 text-sm border border-emerald-700 mt-2">
              <strong>AI Meal Report:</strong> {aiReport}
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-gray-600 text-gray-300">Cancel</Button>
            <Button type="submit" disabled={loadingAI} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {loadingAI ? 'Analyzing...' : 'Log'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// --- LogGrowthModal ---
function LogGrowthModal({ childId, onClose, onLog }) {
  const [growth, setGrowth] = useState({ weight: '', height: '', date: '' })
  const handleSubmit = (e) => { e.preventDefault(); if (!growth.weight || !growth.height) return; onLog(childId, { ...growth, date: growth.date || new Date().toISOString() }) }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Log Growth</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Weight (kg)</label>
            <input type="number" step="0.1" value={growth.weight} onChange={e => setGrowth({ ...growth, weight: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Height (cm)</label>
            <input type="number" value={growth.height} onChange={e => setGrowth({ ...growth, height: e.target.value })} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Date</label>
            <input type="date" value={growth.date} onChange={e => setGrowth({ ...growth, date: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-gray-600 text-gray-300">Cancel</Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Log</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// --- AIRecipeCardModal ---
function AIRecipeCardModal({ recipe, onClose, onAskAI }) {
  const [imgIdx, setImgIdx] = useState(0)
  const total = recipe.imgs.length
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-900/90 rounded-xl p-8 w-full max-w-lg overflow-y-auto shadow-xl border border-emerald-700">
        <div className="flex gap-3 items-center mb-3">
          <div className="relative group">
            <img src={recipe.imgs[imgIdx]} alt={recipe.name} className="w-32 h-32 rounded-lg object-cover border border-emerald-700" />
            {total > 1 && (
              <>
                <button aria-label="Previous Image" onClick={() => setImgIdx((imgIdx - 1 + total) % total)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-emerald-700/50 text-white rounded-full p-1">{"<"}</button>
                <button aria-label="Next Image" onClick={() => setImgIdx((imgIdx + 1) % total)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-700/50 text-white rounded-full p-1">{">"}</button>
              </>
            )}
            <div className="absolute right-2 top-2 text-xs px-2 py-1 bg-emerald-700/70 rounded text-white">{imgIdx + 1}/{total}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white mb-1">{recipe.name}</div>
            <div className="text-emerald-200 mb-1">{recipe.description}</div>
            <div className="text-emerald-400 text-sm mb-1">{recipe.nutrition}</div>
            <div className="text-teal-300 text-xs italic">{recipe.kidAppeal}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-emerald-300 mb-2">Nutritional Highlights:</div>
          <ul className="space-y-2">
            {recipe.details.map((d, i) => (
              <li key={i} className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span className="text-white">{d.nutrient}</span>
                <span className="text-emerald-200 ml-1 text-xs">{d.info}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-emerald-300 mb-2">Steps:</div>
          <ol className="list-decimal pl-5 space-y-1 text-emerald-100">
            {recipe.steps.map((step, i) => (<li key={i}>{step}</li>))}
          </ol>
        </div>
        <div className="flex gap-2 mt-8">
          <Button variant="primary" className="flex-1" onClick={onAskAI}>
            <Sparkles className="w-4 h-4 mr-2" /> Ask AI for Suggestions
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  )
}

// --- AIHelpModal ---
function AIHelpModal({ recipe, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-950/95 rounded-xl p-8 w-full max-w-md shadow-xl border border-emerald-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg text-white font-bold">AI Nutrition Assistant</h3>
        </div>
        <div className="text-emerald-100 mb-4">
          <div><span className="font-semibold">Recipe:</span> {recipe.name}</div>
          <div className="mt-2">
            <span className="font-semibold">AI Suggestions:</span>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Try adding a portion of fruit on the side for extra vitamins.</li>
              <li>If your child doesn't like {recipe.details[0].info}, swap with carrots or sweet potato.</li>
              <li>Pair with a glass of milk for calcium boost.</li>
              <li>Get kids involved in assembling ingredients for more fun!</li>
            </ul>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={onClose}>Close</Button>
      </motion.div>
    </div>
  )
}

// ----------- Main Dashboard -----------
export default function ParentDashboard() {
  const { user, userProfile } = useAuth()
  const [children, setChildren] = useState([])
  const [showAddChild, setShowAddChild] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showLogMeal, setShowLogMeal] = useState(null)
  const [showLogGrowth, setShowLogGrowth] = useState(null)
  const [recipes] = useState(recipeList)
  const [aiRecipeIdx, setAIRecipeIdx] = useState(Math.floor(Math.random() * recipes.length))
  const [showAIRecipeCard, setShowAIRecipeCard] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [showReminders, setShowReminders] = useState(false)
  const [deleteChildId, setDeleteChildId] = useState(null)

  useEffect(() => {
    if (!user) return
    const initializeUserDocument = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName || '',
            createdAt: new Date().toISOString(),
            children: [],
            preferences: { theme: 'dark', language: 'en', notifications: true }
          })
        }
      } catch (error) { console.error('❌ Error initializing user document:', error) }
    }
    initializeUserDocument()
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data()
        setChildren(userData.children || [])
      }
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const calculateStats = () => {
    const today = new Date().toDateString()
    const mealsToday = children.reduce((total, child) => {
      if (!child.nutritionData) return total
      return total + child.nutritionData.filter(meal =>
        new Date(meal.date).toDateString() === today
      ).length
    }, 0)

    const avgNutritionScore = children.length > 0 ?
      children.reduce((total, child) => {
        const mealsCount = child.nutritionData?.length || 0
        const daysActive = Math.max(1, Math.ceil(mealsCount / 3))
        const score = Math.min(100, (mealsCount / (daysActive * 3)) * 100)
        return total + score
      }, 0) / children.length : 0

    const growthTrend = children.length > 0 ?
      children.every(child => child.weight && child.height) ? 'Good' : 'Incomplete'
      : 'No Data'

    return {
      mealsToday,
      avgNutritionScore: Math.round(avgNutritionScore),
      growthTrend
    }
  }

  const addChild = async (childData) => {
    if (!user) {
      alert("User not authenticated. Please login.");
      return;
    }
    if (!childData.name || !childData.age || !childData.gender) {
      alert("Please fill all required fields.");
      return;
    }
    const newChild = {
      id: Date.now().toString(),
      ...childData,
      createdAt: new Date().toISOString(),
      nutritionData: [],
      growthData: [],
      mealPhotos: []
    }
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      let updatedChildren = []
      if (userDoc.exists()) {
        const data = userDoc.data();
        updatedChildren = data.children ? [...data.children, newChild] : [newChild]
        await updateDoc(userDocRef, { children: updatedChildren })
      } else {
        updatedChildren = [newChild]
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || '',
          createdAt: new Date().toISOString(),
          children: updatedChildren,
          preferences: { theme: 'dark', language: 'en', notifications: true }
        })
      }
      setShowAddChild(false)
    } catch (error) {
      console.error('❌ Error adding child:', error)
      alert(`Error adding child: ${error.message}`)
    }
  }

  const logMealForChild = async (childId, mealData) => {
    const updatedChildren = children.map(child =>
      child.id === childId
        ? { ...child, nutritionData: [...(child.nutritionData || []), mealData] }
        : child
    )
    const userDocRef = doc(db, 'users', user.uid)
    await updateDoc(userDocRef, { children: updatedChildren })
    setShowLogMeal(null)
  }

  const logGrowthForChild = async (childId, growthData) => {
    const updatedChildren = children.map(child =>
      child.id === childId
        ? {
            ...child,
            growthData: [...(child.growthData || []), growthData],
            weight: growthData.weight,
            height: growthData.height
          }
        : child
    )
    const userDocRef = doc(db, 'users', user.uid)
    await updateDoc(userDocRef, { children: updatedChildren })
    setShowLogGrowth(null)
  }

  const deleteChild = async (childId) => {
    const updatedChildren = children.filter((c) => c.id !== childId)
    const userDocRef = doc(db, 'users', user.uid)
    await updateDoc(userDocRef, { children: updatedChildren })
    setDeleteChildId(null)
  }

  const nextAIRecipe = () => setAIRecipeIdx((i) => (i + 1) % recipes.length)
  const prevAIRecipe = () => setAIRecipeIdx((i) => (i - 1 + recipes.length) % recipes.length)
  const openAIRecipeCard = (recipe) => {
    setActiveRecipe(recipe)
    setShowAIRecipeCard(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header and stats */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userProfile?.name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">Track your children's nutrition and growth</p>
          <div className="mt-2 flex flex-row gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm inline-block">
              👨‍👩‍👧‍👦 Parent Dashboard
            </span>
            <Button size="xs" variant="ghost" onClick={() => setShowExport(true)} title="Export Data"><Download className="w-4 h-4" />Export</Button>
            <Button size="xs" variant="ghost" onClick={() => setShowCommunity(true)} title="Parent Community"><Users className="w-4 h-4" />Community</Button>
            <Button size="xs" variant="ghost" onClick={() => setShowReminders(true)} title="Reminders"><Bell className="w-4 h-4" />Reminders</Button>
            <span className="px-3 py-1 ml-2 bg-gray-950/70 border border-gray-800 rounded-full text-emerald-200 text-xs">
              <TrendingUp className="w-4 h-4 inline mb-0.5" /> {children.length ? `${children.length} children` : "No children"}
            </span>
            <span className="px-3 py-1 bg-gray-950/70 border border-gray-800 rounded-full text-emerald-200 text-xs">
              <Utensils className="w-4 h-4 inline mb-0.5" /> {stats.mealsToday} meals today
            </span>
            <span className="px-3 py-1 bg-gray-950/70 border border-gray-800 rounded-full text-emerald-200 text-xs">
              <Award className="w-4 h-4 inline mb-0.5" /> Avg nutrition score: {stats.avgNutritionScore}
            </span>
            <span className="px-3 py-1 bg-gray-950/70 border border-gray-800 rounded-full text-emerald-200 text-xs">
              {stats.growthTrend === "Good" ? "Growth on track" : stats.growthTrend === "Incomplete" ? "Growth data incomplete" : "No growth data"}
            </span>
          </div>
        </motion.div>
        {/* AI Recipe Carousel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-gradient-to-br from-emerald-800/70 to-teal-900/80 border-emerald-600 shadow-xl backdrop-blur-lg cursor-pointer hover:bg-emerald-800 transition-all">
            <CardHeader className="flex items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">AI Recipe Carousel</CardTitle>
                  <CardDescription className="text-emerald-200">Balanced & fun meals for kids!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <AIRecipeCarousel recipe={recipes[aiRecipeIdx]} onImgClick={openAIRecipeCard} />
                <div className="flex flex-col flex-1 min-w-[170px]">
                  <div className="font-bold text-lg text-white">{recipes[aiRecipeIdx].name}</div>
                  <div className="text-emerald-100">{recipes[aiRecipeIdx].description}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => openAIRecipeCard(recipes[aiRecipeIdx])}
                  >
                    View Recipe
                  </Button>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={prevAIRecipe}>Prev Recipe</Button>
                    <Button variant="primary" size="sm" onClick={nextAIRecipe}>Next Recipe</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
          {children.map((child, index) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800/60 border-gray-700 backdrop-blur-lg hover:bg-gray-800/80 shadow-lg transition-all cursor-pointer relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" title="Delete Child" onClick={e => { e.stopPropagation(); setDeleteChildId(child.id) }}>
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                </Button>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <ChildAvatar avatar={child.avatar} />
                    <div>
                      <CardTitle className="text-white text-lg">{child.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {child.age ? `${child.age} years old` : "Age not set"} • {child.gender || "Gender not set"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Weight className="w-4 h-4" />
                      <span>{child.weight || 'Not set'} kg</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Ruler className="w-4 h-4" />
                      <span>{child.height || 'Not set'} cm</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {child.nutritionData?.length > 0 ?
                        `${child.nutritionData.length} meals logged` :
                        'No meals yet'
                      }
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLogMeal(child.id)} title="Log a meal for this child">Log Meal</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowLogGrowth(child.id)} title="Log growth for this child">Log Growth</Button>
                  </div>
                  <div className="mt-1">
                    {getBadges(child).map(badge => (
                      <span key={badge.name} className="inline-flex items-center bg-emerald-800/70 text-emerald-200 rounded-full px-2 py-0.5 mr-2 text-xs">{badge.icon} {badge.name}</span>
                    ))}
                  </div>
                  <ChildHealthCard child={child} />
                  {child.growthData && child.growthData.length > 1 && (
                    <GrowthChart child={child} />
                  )}
                  {child.nutritionData && child.nutritionData.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-100 text-xs">
                      <strong>Last Meal Report:</strong> {child.nutritionData[child.nutritionData.length-1].aiReport}
                    </div>
                  )}
                  {child.mealPhotos && <PhotoJournal photos={child.mealPhotos} />}
                  {/* --- Progress Report Buttons --- */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(child, "weekly")}
                      title="Download Weekly Progress Report"
                    >
                      <FileText className="w-4 h-4 mr-1" />Weekly PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(child, "monthly")}
                      title="Download Monthly Progress Report"
                    >
                      <FileText className="w-4 h-4 mr-1" />Monthly PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: children.length * 0.1 }}>
            <Card
              className="bg-gray-800/30 border-gray-600 border-dashed backdrop-blur-lg hover:bg-gray-800/50 transition-all cursor-pointer h-full flex items-center justify-center min-h-[200px]"
              onClick={() => setShowAddChild(true)}
            >
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Add Child</h3>
                  <p className="text-gray-400 text-sm">Start tracking nutrition</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        {/* Export Modal */}
        {showExport && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-emerald-800">
              <h3 className="text-lg text-white font-bold mb-2">Export Data</h3>
              <p className="text-emerald-200 text-sm mb-4">Download your child's logs as CSV for doctors, school, or family records.</p>
              <div className="space-y-2">
                {children.map(child => (
                  <Button key={child.id} variant="outline" className="w-full" onClick={() => {
                    if (child.nutritionData && child.nutritionData.length > 0) downloadCSV(child.nutritionData, `${child.name}_meals.csv`)
                    if (child.growthData && child.growthData.length > 0) downloadCSV(child.growthData, `${child.name}_growth.csv`)
                  }}>Download {child.name}'s Data</Button>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={() => setShowExport(false)}>Close</Button>
            </motion.div>
          </div>
        )}

        {/* Community Modal */}
        {showCommunity && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-emerald-800">
              <h3 className="text-lg text-white font-bold mb-2"><Users className="w-5 h-5 inline" /> Parent Community</h3>
              <p className="text-emerald-200 text-sm mb-4">Share recipes, tips, or join discussions with other parents.</p>
              <div className="bg-gray-800 rounded p-3 mb-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 inline" /> <span className="text-emerald-200">"We love the banana oat pancakes! Any ideas for healthy school snacks?"</span> <span className="text-gray-500">- Maya</span>
              </div>
              <div className="bg-gray-800 rounded p-3 mb-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 inline" /> <span className="text-emerald-200">"How do you handle picky eaters?"</span> <span className="text-gray-500">- Rahul</span>
              </div>
              <Button className="w-full mt-4" onClick={() => setShowCommunity(false)}>Close</Button>
            </motion.div>
          </div>
        )}

        {/* Reminders Modal */}
        {showReminders && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-emerald-800">
              <h3 className="text-lg text-white font-bold mb-2"><Bell className="w-5 h-5 inline" /> Reminders</h3>
              <p className="text-emerald-200 text-sm mb-4">Set meal, water, or medicine reminders here (feature coming soon!)</p>
              <Button className="w-full mt-4" onClick={() => setShowReminders(false)}>Close</Button>
            </motion.div>
          </div>
        )}

        {/* Modals */}
        {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} onAdd={addChild} />}
        {showLogMeal && <LogMealModal childId={showLogMeal} onClose={() => setShowLogMeal(null)} onLog={logMealForChild} />}
        {showLogGrowth && <LogGrowthModal childId={showLogGrowth} onClose={() => setShowLogGrowth(null)} onLog={logGrowthForChild} />}
        {showAIRecipeCard && activeRecipe && (
          <AIRecipeCardModal
            recipe={activeRecipe}
            onClose={() => setShowAIRecipeCard(false)}
            onAskAI={() => setShowAIHelp(true)}
          />
        )}
        {showAIHelp && (
          <AIHelpModal
            recipe={activeRecipe}
            onClose={() => setShowAIHelp(false)}
          />
        )}
        <AnimatePresence>
        {deleteChildId && (
          <DeleteChildModal
            child={children.find(c => c.id === deleteChildId)}
            onCancel={() => setDeleteChildId(null)}
            onDelete={() => deleteChild(deleteChildId)}
          />
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}