require('dotenv').config();
const Pipeline = require('./models/Pipeline');

async function test() {
  try {
    const p = await Pipeline.create(1, 'https://github.com/test/test.git', 'build');
    console.log('Pipeline created successfully:', p);
    process.exit(0);
  } catch (err) {
    console.error('Pipeline creation failed:', err);
    process.exit(1);
  }
}

test();
