import { db } from "@/lib/db";
import { bookings, services } from "@/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { format, startOfMonth } from "date-fns";
import { formatPrice } from "@/lib/pricing";
import { DollarSign, TrendingUp, CreditCard, RotateCcw } from "lucide-react";

export default async function AdminRevenuePage() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  // Total revenue (all time)
  const totalRevenueResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
    })
    .from(bookings)
    .where(eq(bookings.paymentStatus, 'succeeded'));
  const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

  // Monthly revenue (current month)
  const monthlyRevenueResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.paymentStatus, 'succeeded'),
        gte(bookings.paymentDate, monthStart)
      )
    );
  const monthlyRevenue = Number(monthlyRevenueResult[0]?.total || 0);

  // Total paid bookings count
  const paidBookingsResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(bookings)
    .where(eq(bookings.paymentStatus, 'succeeded'));
  const paidBookingsCount = Number(paidBookingsResult[0]?.count || 0);

  // Total refunds
  const totalRefundsResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bookings.amountRefunded}), 0)`,
    })
    .from(bookings)
    .where(eq(bookings.paymentStatus, 'refunded'));
  const totalRefunds = Number(totalRefundsResult[0]?.total || 0);

  // Recent transactions (last 20)
  const recentTransactions = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      serviceName: services.name,
      amountPaid: bookings.amountPaid,
      amountRefunded: bookings.amountRefunded,
      paymentStatus: bookings.paymentStatus,
      paymentDate: bookings.paymentDate,
      refundDate: bookings.refundDate,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(sql`${bookings.paymentStatus} IN ('succeeded', 'refunded')`)
    .orderBy(sql`${bookings.paymentDate} DESC`)
    .limit(20);

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      subtitle: "All time earnings",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      label: "This Month",
      value: formatPrice(monthlyRevenue),
      subtitle: `${format(now, 'MMMM yyyy')} revenue`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Paid Bookings",
      value: paidBookingsCount.toString(),
      subtitle: "Successful payments",
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Total Refunds",
      value: formatPrice(totalRefunds),
      subtitle: "Amount refunded",
      icon: RotateCcw,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-gray-500 mt-1">Track your earnings and transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} rounded-lg p-2.5`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/80 sticky top-0 z-[1]">
              <tr className="border-b border-gray-100">
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No transactions yet</p>
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                          {transaction.customerName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900">
                        {transaction.serviceName}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.paymentStatus === 'refunded' && transaction.amountRefunded
                          ? formatPrice(transaction.amountRefunded)
                          : formatPrice(transaction.amountPaid || 0)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full
                        ${
                          transaction.paymentStatus === 'succeeded'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {transaction.paymentStatus === 'refunded' && transaction.refundDate
                        ? format(new Date(transaction.refundDate), 'MMM d, yyyy')
                        : transaction.paymentDate
                        ? format(new Date(transaction.paymentDate), 'MMM d, yyyy')
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
