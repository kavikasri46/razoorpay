import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old records
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.recurringPayment.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const userPassword = await bcrypt.hash('user123', saltRounds);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Aditya Sharma',
      email: 'admin@razorpay.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul@razorpay.com',
      password: userPassword,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  console.log('Users created:');
  console.log(`- Admin: ${adminUser.email} (password: admin123)`);
  console.log(`- User: ${regularUser.email} (password: user123)`);

  // 2. Transactions for Rahul
  const transactionsData = [
    // Income
    {
      amount: 95000,
      type: 'INCOME',
      category: 'Salary',
      description: 'Monthly Salary - Acme Corp Tech Services',
      paymentMethod: 'BANK_TRANSFER',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    },
    {
      amount: 25000,
      type: 'INCOME',
      category: 'Freelance',
      description: 'UI/UX Design Contract - RazorPay Landing Page',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    // Expenses (Food)
    {
      amount: 450,
      type: 'EXPENSE',
      category: 'Food',
      description: 'Swiggy - Lunch Order',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      amount: 850,
      type: 'EXPENSE',
      category: 'Food',
      description: 'Zomato - Weekend Dinner with Friends',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 350,
      type: 'EXPENSE',
      category: 'Food',
      description: 'Swiggy - Breakfast Dosa',
      paymentMethod: 'WALLET',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 1200,
      type: 'EXPENSE',
      category: 'Food',
      description: 'Zomato - Family Pizza Night',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    // Expenses (Travel)
    {
      amount: 420,
      type: 'EXPENSE',
      category: 'Travel',
      description: 'Uber - Commute to Office',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 180,
      type: 'EXPENSE',
      category: 'Travel',
      description: 'Uber Auto - Metro Connect',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    // Utilities
    {
      amount: 3200,
      type: 'EXPENSE',
      category: 'Utilities',
      description: 'BESCOM - Electricity Bill',
      paymentMethod: 'BANK_TRANSFER',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 999,
      type: 'EXPENSE',
      category: 'Utilities',
      description: 'ACT Fibernet - Monthly Internet Broadband',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    // Subscriptions
    {
      amount: 649,
      type: 'EXPENSE',
      category: 'Subscriptions',
      description: 'Netflix India - Premium 4K Plan',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 179,
      type: 'EXPENSE',
      category: 'Subscriptions',
      description: 'Spotify Premium - Individual plan',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    },
    // Housing / Rent
    {
      amount: 20000,
      type: 'EXPENSE',
      category: 'Housing',
      description: 'Monthly Apartment Rent Payment',
      paymentMethod: 'BANK_TRANSFER',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    },
    // Shopping (normal & suspicious)
    {
      amount: 4500,
      type: 'EXPENSE',
      category: 'Shopping',
      description: 'Amazon India - Wireless Earbuds',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 8200,
      type: 'EXPENSE',
      category: 'Shopping',
      description: 'Flipkart - Ergonomic Office Chair',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 35000,
      type: 'EXPENSE',
      category: 'Shopping',
      description: 'Flipkart - Apple Watch Series 9 (Suspicious Anomaly)',
      paymentMethod: 'CREDIT_CARD',
      status: 'FLAGGED',
      riskLevel: 'HIGH',
      transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      amount: 4200,
      type: 'EXPENSE',
      category: 'Shopping',
      description: 'Zara - Autumn Jacket',
      paymentMethod: 'DEBIT_CARD',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      transactionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: {
        ...tx,
        userId: regularUser.id,
      },
    });
  }

  // 3. Budgets
  const budgetsData = [
    { category: 'Food', amount: 15000, spent: 2850 },
    { category: 'Travel', amount: 5000, spent: 600 },
    { category: 'Utilities', amount: 6000, spent: 4199 },
    { category: 'Subscriptions', amount: 2000, spent: 828 },
    { category: 'Housing', amount: 25000, spent: 20000 },
    { category: 'Shopping', amount: 15000, spent: 51900 }, // Over budget!
  ];

  for (const bg of budgetsData) {
    await prisma.budget.create({
      data: {
        ...bg,
        userId: regularUser.id,
        period: 'MONTHLY',
      },
    });
  }

  // 4. Recurring Payments
  const recurringData = [
    {
      name: 'Apartment Rent',
      amount: 20000,
      frequency: 'MONTHLY',
      nextPaymentDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
      status: 'ACTIVE',
    },
    {
      name: 'Netflix Subscription',
      amount: 649,
      frequency: 'MONTHLY',
      nextPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
    {
      name: 'Spotify Premium',
      amount: 179,
      frequency: 'MONTHLY',
      nextPaymentDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
    {
      name: 'ACT Broadband',
      amount: 999,
      frequency: 'MONTHLY',
      nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  ];

  for (const rc of recurringData) {
    await prisma.recurringPayment.create({
      data: {
        ...rc,
        userId: regularUser.id,
      },
    });
  }

  // 5. AI Insights
  const insightsData = [
    {
      type: 'SPENDING',
      title: 'Shopping Expenses Spike',
      content: 'Your shopping expenses on Amazon and Flipkart increased by 35% this week due to your office chair and Apple Watch purchase. Budget limit exceeded by ₹36,900.',
      severity: 'CRITICAL',
    },
    {
      type: 'BUDGET',
      title: 'Food Budget Alert',
      content: 'You have spent ₹2,850 of your ₹15,000 Food budget. You are in the healthy zone with 19% utilized, keeping you on track for the month.',
      severity: 'INFO',
    },
    {
      type: 'SAVINGS',
      title: 'Savings Potential Identified',
      content: 'Reducing your food delivery (Zomato/Swiggy) count by 4 meals could save around ₹2,000, raising your monthly savings rate by 2.1%.',
      severity: 'WARNING',
    },
    {
      type: 'SUBSCRIPTION',
      title: 'Active Subscription Count',
      content: 'You have 3 active subscriptions (Netflix, Spotify, ACT Fibernet) totaling ₹1,827 per month. Consider auditing unused recurring payments.',
      severity: 'INFO',
    },
  ];

  for (const ins of insightsData) {
    await prisma.aIInsight.create({
      data: {
        ...ins,
        userId: regularUser.id,
      },
    });
  }

  // 6. Notifications
  const notificationsData = [
    {
      title: 'Budget Alert: Shopping Exceeded',
      message: 'You have exceeded your monthly Shopping budget limit of ₹15,000 (spent: ₹51,900).',
      type: 'BUDGET_WARNING',
      read: false,
    },
    {
      title: 'Suspicious Anomaly Flagged',
      message: 'A transaction of ₹35,000 at Flipkart was marked as HIGH RISK due to high transaction amount.',
      type: 'SUSPICIOUS_TX',
      read: false,
    },
    {
      title: 'Upcoming Subscription Payment',
      message: 'Payment of ₹179 for Spotify Premium is due in 8 days.',
      type: 'PAYMENT_REMINDER',
      read: false,
    },
    {
      title: 'System Welcome',
      message: 'Welcome to RazorPay! Your intelligent payment analytics dashboard is ready.',
      type: 'SYSTEM',
      read: true,
    },
  ];

  for (const nt of notificationsData) {
    await prisma.notification.create({
      data: {
        ...nt,
        userId: regularUser.id,
      },
    });
  }

  // 7. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: regularUser.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: regularUser.id,
      metadata: { ip: '192.168.1.1', device: 'Chrome / Windows' },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: regularUser.id,
      action: 'TRANSACTION_CREATE',
      entity: 'TRANSACTION',
      entityId: 'dummy-tx-id',
      metadata: { amount: 35000, merchant: 'Flipkart' },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'ADMIN_ACCESS',
      entity: 'ADMIN',
      entityId: adminUser.id,
      metadata: { action: 'VIEW_AUDIT_LOGS' },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
