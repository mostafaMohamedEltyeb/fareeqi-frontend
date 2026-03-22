import type { LucideIcon } from 'lucide-react';

interface Props { title: string; value: number; icon: LucideIcon; color: 'green'|'orange'|'red'|'blue'|'gray'|'purple'; }

const colorMap: Record<string, string> = {
  green: 'border-green-100', orange: 'border-orange-100', red: 'border-red-100',
  blue: 'border-blue-100', gray: 'border-gray-200', purple: 'border-purple-100',
};
const iconBg: Record<string, string> = {
  green: 'bg-green-100 text-green-600', orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600', blue: 'bg-blue-100 text-blue-600',
  gray: 'bg-gray-100 text-gray-600', purple: 'bg-purple-100 text-purple-600',
};

export default function StatCard({ title, value, icon: Icon, color }: Props) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${colorMap[color]}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
