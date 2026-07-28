import { TrendingUp, Clock, Bot, CheckCircle } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      value: '80%',
      label: 'Автоматизация обращений',
      description: 'Вопросов решаются ИИ-ассистентом без участия операторов',
    },
    {
      icon: Clock,
      value: '< 3 сек',
      label: 'Скорость ответа',
      description: 'Мгновенные консультации 24 часа 7 дней в неделю',
    },
    {
      icon: Bot,
      value: '5 минут',
      label: 'Время установки',
      description: 'Добавьте 1 строку JavaScript-кода на ваш сайт',
    },
    {
      icon: CheckCircle,
      value: '99.9%',
      label: 'Точность по базе знаний',
      description: 'ИИ отвечает строго по загруженным регламентам и FAQ',
    },
  ];

  return (
    <section id="metrics" className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-bold text-blue-600 tracking-widest">Наши показатели</h2>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Результаты внедрения ИИ-Консультанта
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-1">{item.label}</div>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
