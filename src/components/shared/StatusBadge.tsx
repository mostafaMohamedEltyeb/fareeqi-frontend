const styles: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  PAID: 'bg-green-100 text-green-700 border-green-200',
  REFUNDED: 'bg-blue-100 text-blue-700 border-blue-200',
  AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
  RESERVED: 'bg-gray-100 text-gray-600 border-gray-200',
  DISABLED: 'bg-orange-100 text-orange-700 border-orange-200',
  INITIATED: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = styles[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}
