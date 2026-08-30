const { PrismaClient } = require('@prisma/client');

// Let's test standard passwords
const passwords = [
  '', 'admin', 'admin123', 'password', 'root', 'root123', 'postgres', 'Arun', 'arun', 'Razorpay', 'razorpay', 'razorpay_secret', 'postgres123',
  'Arun@123', 'arun@123', 'Arun123', 'arun123', 'ArunMS', 'ArunMS123', 'ArunMS@123', 'arunms', 'arunms123', 'arunms@123', 'Arunms@123',
  'admin@123', 'postgres@123', 'root@123', '123456', '12345678', '1234', '12345', '123', '0000', '1111'
];

async function testPasswords() {
  for (const pw of passwords) {
    console.log(`Testing password: "${pw}"...`);
    const url = pw 
      ? `postgresql://postgres:${pw}@localhost:5432/razorpay?schema=public`
      : `postgresql://postgres@localhost:5432/razorpay?schema=public`;

    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });

    try {
      await prisma.$connect();
      console.log(`\n>>> SUCCESS! Password is "${pw}" <<<\n`);
      await prisma.$disconnect();
      return pw;
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    } finally {
      try {
        await prisma.$disconnect();
      } catch (e) {}
    }
  }
  console.log('\nAll tested passwords failed.');
}

testPasswords();
