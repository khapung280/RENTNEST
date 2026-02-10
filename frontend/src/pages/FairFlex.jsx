import { useState } from 'react'
import { Calculator, TrendingDown, TrendingUp, Minus, Info, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

const FairFlex = () => {
  const [baseRent, setBaseRent] = useState('')
  const [duration, setDuration] = useState('3')

  // Calculate adjustment percentage based on duration
  const getAdjustment = (months) => {
    if (months >= 1 && months <= 2) return 10
    if (months >= 3 && months <= 5) return 0
    if (months >= 6 && months <= 12) return -10
    return 0
  }

  // Calculate final price
  const calculatePrice = (rent, months) => {
    const base = parseFloat(rent) || 0
    const adj = getAdjustment(months)
    return base * (1 + adj / 100)
  }

  // Calculate savings
  const calculateSavings = (rent, months) => {
    const base = parseFloat(rent) || 0
    const adj = getAdjustment(months)
    if (adj < 0) {
      return Math.abs(base * (adj / 100) * months)
    }
    return 0
  }

  const baseRentNum = parseFloat(baseRent) || 0
  const durationNum = parseInt(duration) || 3
  const adjustment = getAdjustment(durationNum)
  const finalPrice = calculatePrice(baseRentNum, durationNum)
  const monthlySavings = adjustment < 0 ? Math.abs(baseRentNum * (adjustment / 100)) : 0
  const totalSavings = calculateSavings(baseRentNum, durationNum)

  // Comparison data
  const comparisons = [
    { months: 1, title: '1 Month', icon: <TrendingUp className="w-5 h-5" /> },
    { months: 3, title: '3 Months', icon: <Minus className="w-5 h-5" /> },
    { months: 6, title: '6 Months', icon: <TrendingDown className="w-5 h-5" /> },
    { months: 12, title: '12 Months', icon: <TrendingDown className="w-5 h-5" /> },
  ]

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '1-2 Months',
      description: '+10% adjustment',
      subtitle: 'Short-term premium',
      color: 'text-red-600 bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      icon: <Minus className="w-6 h-6" />,
      title: '3-5 Months',
      description: '0% adjustment',
      subtitle: 'Standard rate',
      color: 'text-gray-600 bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: '6-12 Months',
      description: '-10% adjustment',
      subtitle: 'Long-term discount',
      color: 'text-green-600 bg-green-50',
      borderColor: 'border-green-200'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            FairFlex Rent Calculator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Calculate fair rent prices and discover savings based on your rental duration. 
            Longer stays mean better deals!
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Calculate Your Rent</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Base Rent Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Base Monthly Rent (NPR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                  placeholder="e.g., 25000"
                  min="0"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-medium transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">NPR</span>
              </div>
            </div>

            {/* Duration Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rental Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-medium transition-all appearance-none bg-white cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month} {month === 1 ? 'Month' : 'Months'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Display */}
          {baseRentNum > 0 && (
            <div className={`mt-8 p-6 md:p-8 rounded-xl border-2 ${
              adjustment < 0 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                : adjustment > 0
                ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-700">Monthly Rent:</span>
                    {adjustment < 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    NPR {finalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Base: NPR {baseRentNum.toLocaleString()}</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      adjustment > 0 ? 'text-red-600' : adjustment < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {adjustment > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          +{adjustment}%
                        </>
                      ) : adjustment < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          {adjustment}%
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4" />
                          {adjustment}%
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                {adjustment < 0 && totalSavings > 0 && (
                  <div className="md:text-right">
                    <div className="text-sm font-semibold text-green-700 mb-1">Total Savings</div>
                    <div className="text-3xl md:text-4xl font-bold text-green-600">
                      NPR {totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      NPR {monthlySavings.toLocaleString()} saved per month
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How FairFlex Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How FairFlex Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 ${feature.borderColor} ${feature.color.split(' ')[1]} transition-all hover:shadow-md`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color.split(' ')[1]} rounded-lg mb-4`}>
                  <div className={feature.color.split(' ')[0]}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-2xl font-bold mb-2">{feature.description}</p>
                <p className="text-sm text-gray-600">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Section */}
        {baseRentNum > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Compare Different Durations
              </h2>
              <p className="text-gray-600">See how your rent changes with different stay periods</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisons.map((comp) => {
                const compAdj = getAdjustment(comp.months)
                const compPrice = calculatePrice(baseRentNum, comp.months)
                const compSavings = compAdj < 0 ? Math.abs(baseRentNum * (compAdj / 100) * comp.months) : 0
                const isSelected = parseInt(duration) === comp.months
                
                return (
                  <div
                    key={comp.months}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 shadow-lg scale-105'
                        : compAdj < 0
                        ? 'bg-green-50 border-green-200 hover:border-green-300'
                        : compAdj > 0
                        ? 'bg-red-50 border-red-200 hover:border-red-300'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                      compAdj < 0 ? 'bg-green-100 text-green-600' : compAdj > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {comp.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{comp.title}</h3>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      NPR {compPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className={`text-sm font-semibold mb-2 ${
                      compAdj > 0 ? 'text-red-600' : compAdj < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {compAdj > 0 ? '+' : ''}{compAdj}%
                    </div>
                    {compSavings > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Total Savings</div>
                        <div className="text-lg font-bold text-green-600">
                          NPR {compSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    )}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-indigo-200">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                          <span>Selected</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-8 md:p-10 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Why Choose FairFlex?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Save More</h3>
              <p className="text-indigo-100 text-sm">Get up to 10% discount on longer stays</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Transparent Pricing</h3>
              <p className="text-indigo-100 text-sm">No hidden fees, clear calculations</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Fair for Everyone</h3>
              <p className="text-indigo-100 text-sm">Balanced pricing for owners and renters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FairFlex
