import fs from 'fs';
async function test() {
  const m = await import('pdf-parse');
  console.log('Keys:', Object.keys(m));
  console.log('m.default typeof:', typeof m.default);
  console.log('m.default keys:', m.default ? Object.keys(m.default) : null);
}
test();
