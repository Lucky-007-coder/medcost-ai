import React, { useState, useEffect } from 'react';
import { getMetrics, getAnalytics } from '../../services/api';
import ModelPerformanceOverview from './ModelPerformanceOverview';
import ActualVsPredictedPlot from './ActualVsPredictedPlot';
import ResidualDiagnostics from './ResidualDiagnostics';
import CostTrendsChart from './CostTrendsChart';
import CorrelationHeatmap from './CorrelationHeatmap';
import VifChart from './VifChart';
import CoefficientChart from './CoefficientChart';
import MethodologySection from './MethodologySection';
import { RefreshCw, AlertCircle } from 'lucide-react';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const modelAR2 = metrics?.model_a?.metrics_test?.r2 ? metrics.model_a.metrics_test.r2 * 100 : 4.54;
  const modelBR2 = metrics?.model_b?.metrics_test?.r2 ? metrics.model_b.metrics_test.r2 * 100 : 16.90;

  const animatedModelAR2 = useAnimatedCounter(modelAR2, { duration: 1000, decimals: 2, suffix: '%' });
  const animatedModelBR2 = useAnimatedCounter(modelBR2, { duration: 1200, decimals: 2, suffix: '%' });
  const animatedDatasetCount = useAnimatedCounter(100000, { duration: 1200, decimals: 0, formatLocale: true });

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, analyticsData] = await Promise.all([
        getMetrics(forceRefresh),
        getAnalytics(forceRefresh)
      ]);
      setMetrics(metricsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(err.response?.data?.error || err.message || 'Unable to connect to Flask analytics API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !metrics && !analytics) {
    return (
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-[#FBFBFA] min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E5E7EB] rounded-lg w-1/3"></div>
          <div className="h-4 bg-[#E5E7EB] rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white/80 rounded-2xl animate-pulse border border-[#E5E7EB]"></div>
          ))}
        </div>
        <div className="h-96 bg-white/70 rounded-2xl animate-pulse border border-[#E5E7EB]"></div>
      </div>
    );
  }

  if (error && !metrics && !analytics) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center bg-[#FBFBFA] min-h-screen">
        <div className="p-8 bg-white border border-rose-200 rounded-3xl shadow-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-[#111827]">
            Analytics Server Unavailable
          </h3>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#112D22] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-[#FBFBFA] dark:bg-[#000000] min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Academic Page Header */}
        <div className="space-y-6 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#1B4332] dark:text-[#52B788] text-xs font-mono font-medium tracking-wider uppercase mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]"></span>
                <span>Section 5 • Academic Research & Empirical Validation</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#111827] dark:text-[#FFFFFF] tracking-tight">
                Model Evaluation & Empirical Analytics
              </h1>
              <p className="text-[#4B5563] dark:text-[#9CA3AF] text-base sm:text-lg mt-2 max-w-3xl leading-relaxed">
                Full-spectrum ordinary least squares diagnostic suite evaluated on 100,000 policyholder records from the Mohan Krishna Thalla Kaggle dataset.
              </p>
            </div>

            <button
              onClick={() => fetchData(true)}
              title="Refresh dataset summary and metrics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] bg-white dark:bg-[#080B09] hover:bg-[#E6EFEA] dark:hover:bg-[#161D19] text-xs sm:text-sm font-medium transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#9CA3AF]" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Dataset Highlights Pill Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card">
              <span className="text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider block font-semibold">Dataset Population</span>
              <span className="font-numeric text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] block mt-1">{animatedDatasetCount}</span>
              <span className="text-xs text-[#1B4332] dark:text-[#52B788] block mt-1 font-medium">0 nulls in modeled regressors</span>
            </div>

            <div className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card">
              <span className="text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider block font-semibold">Deterministic Partition</span>
              <span className="font-numeric text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] block mt-1">80k / 20k</span>
              <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF] block mt-1">80/20 train-test (seed=42)</span>
            </div>

            <div className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card">
              <span className="text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider block font-semibold">Model A (Core 6) R²</span>
              <span className="font-numeric text-2xl sm:text-3xl font-bold text-[#1B4332] dark:text-[#52B788] block mt-1">
                {animatedModelAR2}
              </span>
              <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF] block mt-1">
                MAE: <span className="font-numeric font-medium">${metrics?.model_a?.metrics_test?.mae?.toFixed(0)}</span>
              </span>
            </div>

            <div className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card bg-gradient-to-br from-white to-[#E6EFEA]/30 dark:from-[#0F1412] dark:to-[#080B09]">
              <span className="text-[11px] font-mono text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block font-bold">Model B (Clinical 14) R²</span>
              <span className="font-numeric text-2xl sm:text-3xl font-bold text-[#1B4332] dark:text-[#52B788] block mt-1">
                {animatedModelBR2}
              </span>
              <span className="text-xs text-[#1B4332] dark:text-[#52B788] block mt-1 font-medium">
                +12.35% abs (<span className="font-numeric font-bold">+271.8%</span> relative)
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Model Comparison (Metrics Table & Cards) */}
        <section id="metrics-overview" className="space-y-4">
          <ModelPerformanceOverview metadata={metrics} />
        </section>

        {/* Section 2: Visual Diagnostics (Actual vs Predicted & Residuals) */}
        <section id="diagnostics-plots" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ActualVsPredictedPlot analyticsData={analytics} metadata={metrics} />
          <ResidualDiagnostics analyticsData={analytics} metadata={metrics} />
        </section>

        {/* Section 3: Actuarial Cost Trends & Relative Cohort Burden (Full Width for Generous Breathing Room) */}
        <section id="cost-trends" className="w-full">
          <CostTrendsChart analyticsData={analytics} />
        </section>

        {/* Section 4: Correlation Matrix & Multicollinearity (VIF) */}
        <section id="correlations-and-vif" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CorrelationHeatmap analyticsData={analytics} />
          <VifChart metadata={metrics} />
        </section>

        {/* Section 5: Standardized OLS Regression Coefficients (Full Width) */}
        <section id="coefficients" className="w-full">
          <CoefficientChart metadata={metrics} />
        </section>

        {/* Section 6: Academic Methodology, Closed-Form Derivation, and Gauss-Markov Audit */}
        <section id="methodology">
          <MethodologySection />
        </section>

      </div>
    </div>
  );
}
