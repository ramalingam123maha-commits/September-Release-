const assert = require('assert'), { server, reset } = require('./server');
server.listen(0, async () => {
  const base = 'http://localhost:' + server.address().port;
  const call = async (m, u, b) => { const r = await fetch(base + u, { method: m, body: b && JSON.stringify(b) }); return [r.status, r.status === 204 ? null : await r.json().catch(() => null)]; };
  reset();
  const [, s] = await call('POST', '/api/students', { name: 'Ann', email: 'a@x.com' });
  assert.equal((await call('POST', '/api/students', { name: 'B', email: 'a@x.com' }))[0], 409);
  const [, c] = await call('POST', '/api/courses', { code: 'M1', title: 'Math', capacity: 1 });
  assert.equal((await call('POST', '/api/enrollments', { studentId: s.id, courseId: c.id }))[0], 201);
  assert.equal((await call('POST', '/api/enrollments', { studentId: s.id, courseId: c.id }))[0], 409);
  assert.equal((await call('POST', '/api/grades', { studentId: s.id, courseId: c.id, score: 50 }))[0], 201);
  const [, r] = await call('GET', '/api/reports/performance');
  assert.equal(r.overallAverage, 50); assert.deepEqual(r.atRisk, ['Ann']);
  console.log('all tests passed'); server.close();
});
