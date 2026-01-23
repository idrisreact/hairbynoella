import { db } from "@/lib/db";
import { bookings, services } from "@/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatPrice } from "@/lib/pricing";
import { DollarSign, TrendingUp, CreditCard, RotateCcw } from "lucide-react";

export default async function AdminRevenuePage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Revenue Dashboard</h2>
        <p className="text-gray-600 mt-1">Track your earnings and transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All time earnings</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(monthlyRevenue)}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {format(now, 'MMMM yyyy')} revenue
          </p>
        </div>

        {/* Paid Bookings */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {paidBookingsCount}
              </p>
            </div>
            <div className="bg-gold-100 rounded-full p-3">
              <CreditCard className="w-6 h-6 text-gold-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Successful payments</p>
        </div>

        {/* Total Refunds */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(totalRefunds)}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <RotateCcw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Amount refunded</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.serviceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {transaction.paymentStatus === 'refunded' && transaction.amountRefunded
                          ? formatPrice(transaction.amountRefunded)
                          : formatPrice(transaction.amountPaid || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          transaction.paymentStatus === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
