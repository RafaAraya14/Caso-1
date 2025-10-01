import React, { useState } from 'react';

import { ThemeToggle } from '../ui/ThemeToggle';

interface SubscriptionPlansProps {
  onBackToSearch: () => void;
  onLogout?: () => void;
  currentPlan?: 'free' | 'premium';
  onPlanChange?: (plan: 'free' | 'premium') => void;
}

interface Plan {
  id: 'free' | 'premium';
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  color: string;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onBackToSearch,
  onLogout,
  currentPlan = 'free',
  onPlanChange,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'free' | 'premium' | null>(null);

  const getButtonStyle = (color: string) => {
    return color === 'indigo'
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
      : 'bg-slate-600 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed';
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Plan Gratuito',
      price: '₡0',
      period: '/mes',
      features: [
        '10 sesiones de coaching por mes',
        'Chat básico con coaches',
        'Acceso a recursos gratuitos',
        'Duración: 20 minutos por sesión',
        'Soporte por email',
      ],
      buttonText: currentPlan === 'free' ? 'Plan Actual' : 'Cambiar a Gratuito',
      color: 'slate',
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '₡15,000',
      period: '/mes',
      features: [
        'Sesiones ilimitadas de coaching',
        'Chat prioritario 24/7',
        'Duración: 20 minutos por sesión',
        'Acceso a todos los coaches certificados',
        'Recursos premium y materiales exclusivos',
        'Grabación de sesiones',
        'Soporte prioritario',
        'Análisis de progreso personalizado',
      ],
      buttonText: currentPlan === 'premium' ? 'Plan Actual' : 'Actualizar a Premium',
      isPopular: true,
      color: 'indigo',
    },
  ];

  const handlePlanSelect = async (planId: 'free' | 'premium') => {
    if (planId === currentPlan) {
      return;
    }

    // Si es upgrade a Premium, mostrar modal de confirmación
    if (planId === 'premium') {
      setPendingPlan(planId);
      setShowConfirmModal(true);
      return;
    }

    // Para downgrade a Free, proceder directamente
    setIsProcessing(true);
    setSelectedPlan(planId);

    // Simular procesamiento del cambio de plan
    setTimeout(() => {
      setIsProcessing(false);
      onPlanChange?.(planId);
      const planName = (planId as string) === 'premium' ? 'Premium' : 'Gratuito';
      console.log(`¡Plan cambiado a ${planName} exitosamente!`);
    }, 2000);
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingPlan) {
      return;
    }

    setShowConfirmModal(false);
    setIsProcessing(true);
    setSelectedPlan(pendingPlan);

    // Simular procesamiento del upgrade
    setTimeout(() => {
      setIsProcessing(false);
      setPendingPlan(null);
      onPlanChange?.(pendingPlan);
      console.log('¡Bienvenido a Premium! Tu plan ha sido actualizado exitosamente.');
    }, 2000);
  };

  const handleCancelUpgrade = () => {
    setShowConfirmModal(false);
    setPendingPlan(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans gradient-bg">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToSearch}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-arrow-left text-lg" />
              </button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Planes de Suscripción
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <i className="fas fa-sign-out-alt text-lg" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Accede a coaching profesional con nuestros planes flexibles. Comienza gratis o
            desbloquea todas las funciones con Premium.
          </p>
        </div>

        {/* Current Plan Indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
            <i className="fas fa-check-circle mr-2" />
            Plan actual: {currentPlan === 'premium' ? 'Premium' : 'Gratuito'}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.isPopular
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                  : 'ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-xl text-slate-500 dark:text-slate-400 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={currentPlan === plan.id || isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 cursor-not-allowed'
                      : getButtonStyle(plan.color)
                  }`}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2" />
                      Procesando...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-slate-600 dark:text-slate-400">
            <i className="fas fa-shield-alt text-green-500 mr-2" />
            Garantía de devolución de 30 días
          </div>
        </div>
      </div>

      {/* Modal de Confirmación Premium */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-crown text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                ¿Actualizar a Premium?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Estás a punto de actualizar tu plan a Premium por ₡15,000/mes
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                Con Premium obtienes:
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-3 flex-shrink-0" />
                  Sesiones ilimitadas de coaching
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-3 flex-shrink-0" />
                  Chat prioritario 24/7
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-3 flex-shrink-0" />
                  Acceso a todos los coaches certificados
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-3 flex-shrink-0" />
                  Grabación de sesiones y recursos premium
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelUpgrade}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                <i className="fas fa-crown mr-2" />
                Confirmar Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
