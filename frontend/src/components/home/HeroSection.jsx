import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Calculator, BarChart3, 
  ShieldCheck, Database, CheckCircle2, Activity 
} from 'lucide-react';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

export default function HeroSection({ onExploreClick }) {
  const animatedSimulatedCost = useAnimatedCounter(4128.40, { duration: 1400, decimals: 2, prefix: '$' });
  const animatedRecordCount = useAnimatedCounter(100000, { duration: 1600, decimals: 0, formatLocale: true });
  const animatedModelAR2 = useAnimatedCounter(4.54, { duration: 1200, decimals: 2, suffix: '%' });
  const animatedModelBR2 = useAnimatedCounter(16.90, { duration: 1500, decimals: 2, suffix: '%' });

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[#FBFBFA] dark:bg-[#000000] transition-colors duration-200">
      
      {/* Subtle architectural grid pattern & Mint Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] dark:bg-[radial-gradient(#1F2622_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#52B788]/20 via-[#E6EFEA]/40 dark:via-[#52B788]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-[#52B788]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Project Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Small Academic Project Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6EFEA] dark:bg-[#080B09] border border-[#CBE0D4] dark:border-[#1F2622] shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
              <span className="text-xs font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider font-numeric">
                B.Tech Major Project • Actuarial Healthcare ML
              </span>
            </motion.div>

            {/* Large Editorial Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-normal text-[#111827] dark:text-[#FFFFFF] leading-[1.1] tracking-tight">
                Predicting Medical Insurance Costs with{' '}
                <span className="italic font-serif text-[#1B4332] dark:text-[#52B788] font-medium">
                  Linear Regression
                </span>.
              </h1>
              
              <p className="text-base sm:text-lg lg:text-[19px] text-[#4B5563] dark:text-[#9CA3AF] font-normal leading-relaxed max-w-2xl font-sans">
                A transparent healthcare actuarial platform evaluated on <strong className="font-numeric text-[#111827] dark:text-[#FFFFFF] font-semibold">100,000</strong> policyholder records. 
                Explicitly decomposes annual medical charges into interpretable unit dollar contributions without black-box neural networks.
              </p>
            </motion.div>

            {/* Dual CTAs & Secondary Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => onExploreClick('estimator')}
                className="inline-flex items-center space-x-3 px-7 py-4 rounded-xl bg-[#1B4332] dark:bg-[#52B788] hover:bg-[#112D22] dark:hover:bg-[#40916C] text-white dark:text-[#000000] font-medium text-base transition-all shadow-card hover:shadow-elevated group cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-[#E6EFEA] dark:text-[#000000]" />
                <span>Explore Cost Estimator</span>
                <ArrowRight className="w-4 h-4 text-[#E6EFEA] dark:text-[#000000] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onExploreClick('analytics')}
                className="inline-flex items-center space-x-2.5 px-6 py-4 rounded-xl bg-white dark:bg-[#080B09] hover:bg-[#E6EFEA]/60 dark:hover:bg-[#161D19] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] font-medium text-base transition-all shadow-xs cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 text-[#1B4332] dark:text-[#52B788]" />
                <span>Explore Model Analytics</span>
              </button>
            </motion.div>

            {/* Short Explanation of Linear Regression Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-4 rounded-2xl bg-[#E6EFEA]/50 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] max-w-2xl flex items-start space-x-3.5 text-xs text-[#4B5563] dark:text-[#9CA3AF]"
            >
              <Activity className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans block text-sm">
                  Why Ordinary Least Squares (OLS) in Rate-Filing?
                </span>
                <p className="leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                  Unlike opaque ensemble models, OLS guarantees an exact closed-form global optimum: <span className="font-mono text-[#1B4332] dark:text-[#52B788] font-bold">β̂ = (XᵀX)⁻¹ Xᵀy</span>. 
                  Every predicted dollar is mathematically attributable to the baseline intercept plus individual factor products.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Layered Healthcare Analytics Visual (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Visual Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E5E7EB] dark:border-[#1F2622] shadow-elevated bg-white dark:bg-[#0F1412]">
              
              {/* Genuine Healthcare Visual Header */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#112D22]">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80" 
                  alt="Clinical healthcare consultation and actuarial data review"
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112D22] via-[#112D22]/40 to-transparent" />
                
                {/* Header Badge on image */}
                <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#112D22]/80 backdrop-blur-sm border border-[#52B788]/30 text-white text-xs font-numeric font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Clinical Intake Simulation</span>
                </div>
              </div>

              {/* Layered Live Prediction Card */}
              <div className="p-6 space-y-5 bg-white dark:bg-[#0F1412] relative">
                
                {/* Simulated Patient Info */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
                  <div>
                    <h3 className="text-base font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans">
                      Patient Intake Profile
                    </h3>
                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      Age 42 • BMI 28.2 • 1 Dependent • North Region
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622] font-numeric">
                    Model B Profile
                  </span>
                </div>

                {/* Predicted Annual Cost Hero Value with Animated Counter */}
                <div className="p-4 rounded-2xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] block font-medium">
                      Estimated Annual Cost
                    </span>
                    <div className="font-numeric text-3xl sm:text-4xl font-bold text-[#1B4332] dark:text-[#52B788] mt-0.5">
                      {animatedSimulatedCost}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] block font-mono">Confidence Level</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] dark:text-[#52B788] bg-white dark:bg-[#0F1412] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#1F2622]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" /> R² = 16.90%
                    </span>
                  </div>
                </div>

                {/* Sample Feature Contribution Bars */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4B5563] dark:text-[#9CA3AF]">β₀ Base Intercept</span>
                    <span className="font-semibold text-[#111827] dark:text-[#FFFFFF] font-numeric">+$48.23</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4B5563] dark:text-[#9CA3AF]">Age (42 yrs × $18.58)</span>
                    <span className="font-semibold text-[#1B4332] dark:text-[#52B788] font-numeric">+$780.36</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4B5563] dark:text-[#9CA3AF]">1 Inpatient Hosp (+$1,928.25)</span>
                    <span className="font-semibold text-[#1B4332] dark:text-[#52B788] font-numeric">+$1,928.25</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#4B5563] dark:text-[#9CA3AF]">1 Chronic Condition</span>
                    <span className="font-semibold text-[#1B4332] dark:text-[#52B788] font-numeric">+$926.66</span>
                  </div>
                </div>

                {/* Accuracy & Integrity Footer */}
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
                  <span className="font-mono">Unrounded Tolerance: ≤ 10⁻⁶</span>
                  <span className="text-[#1B4332] dark:text-[#52B788] font-semibold">100k Verified Rows</span>
                </div>

              </div>

            </div>

            {/* Floating Decorative Badge */}
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-[#0F1412] p-3.5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card hidden sm:flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFEA] dark:bg-[#080B09] flex items-center justify-center text-[#1B4332] dark:text-[#52B788]">
                <Database className="w-5 h-5 text-[#1B4332] dark:text-[#52B788]" />
              </div>
              <div className="text-left">
                <div className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">100,000 Records</div>
                <div className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">0 Modeled Missing Values</div>
              </div>
            </div>

          </motion.div>

        </div>

        {/* Image 2 Inspired Social Proof & Trust Strip */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]/80 dark:border-[#1F2622] flex flex-col sm:flex-row sm:items-center justify-center gap-4 text-center sm:text-left max-w-4xl mx-auto font-sans">
          <div className="flex -space-x-2.5 justify-center flex-shrink-0">
            <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#000000] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Actuary" />
            <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#000000] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Clinician" />
            <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#000000] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Underwriter" />
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#000000] bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] text-[11px] font-bold font-numeric">
              100k
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
            We evaluate healthcare risk across <strong className="text-[#111827] dark:text-[#FFFFFF]">100,000 policyholders</strong> and 45+ clinical variables, delivering <strong className="text-[#1B4332] dark:text-[#52B788]">100% mathematically verified linear decompositions</strong> with zero black-box bias.
          </p>
        </div>

        {/* Highlight Metrics Bar */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card">
          
          <div className="border-r border-[#E5E7EB] dark:border-[#1F2622] pr-4 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-numeric">
              Dataset Population
            </span>
            <div className="mt-1 font-numeric text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF] tracking-tight">
              {animatedRecordCount}
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Kaggle benchmark • 54 raw columns
            </p>
          </div>

          <div className="border-r border-[#E5E7EB] dark:border-[#1F2622] pr-4 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-numeric">
              Model A (Core 6)
            </span>
            <div className="mt-1 font-numeric text-3xl sm:text-4xl font-bold text-[#1B4332] dark:text-[#52B788] tracking-tight">
              R² = {animatedModelAR2}
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Demographic baseline • MAE: $1,934
            </p>
          </div>

          <div className="border-r border-[#E5E7EB] dark:border-[#1F2622] pr-4 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-numeric">
              Model B (Clinical 14)
            </span>
            <div className="mt-1 font-numeric text-3xl sm:text-4xl font-bold text-[#1B4332] dark:text-[#52B788] tracking-tight">
              R² = {animatedModelBR2}
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Clinical intake • +271.8% Relative Lift
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-numeric">
              Multicollinearity
            </span>
            <div className="mt-1 font-numeric text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF] tracking-tight">
              VIF &lt; 2.5
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Zero singular matrices • Safe OLS
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
