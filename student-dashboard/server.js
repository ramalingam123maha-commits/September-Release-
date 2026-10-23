const http = require('http'), fs = require('fs'), path = require('path');
const DB = path.join(__dirname, 'data.json');
let db = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : { students: [], courses: [], enrollments: [], grades: [], seq: 1 };
const save = () => fs.writeFileSync(DB, JSON.stringify(db, null, 2));
const id = () => db.seq++;
const send = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
const gpa = sid => { const g = db.grades.filter(x => x.studentId === sid); return g.length ? +(g.reduce((a, b) => a + b.score, 0) / g.length).toFixed(2) : null; };
const need = (o, ...f) => f.filter(k => o[k] === undefined || o[k] === '');

function route(method, url, b) {
  let m;
  if (method === 'GET' && url === '/api/students') return [200, db.students.map(s => ({ ...s, average: gpa(s.id) }))];
  if (method === 'POST' && url === '/api/students') {
    const miss = need(b, 'name', 'email'); if (miss.length) return [400, { error: 'Missing ' + miss }];
    if (db.students.some(s => s.email === b.email)) return [409, { error: 'Email already registered' }];
    const s = { id: id(), name: String(b.name), email: String(b.email), createdAt: new Date().toISOString() }; db.students.push(s); save(); return [201, s];
  }
  if ((m = url.match(/^\/api\/students\/(\d+)$/)) && method === 'DELETE') {
    const sid = +m[1]; db.students = db.students.filter(s => s.id !== sid);
    db.enrollments = db.enrollments.filter(e => e.studentId !== sid); db.grades = db.grades.filter(g => g.studentId !== sid); save(); return [204, null];
  }
  if (method === 'GET' && url === '/api/courses') return [200, db.courses.map(c => ({ ...c, enrolled: db.enrollments.filter(e => e.courseId === c.id).length }))];
  if (method === 'POST' && url === '/api/courses') {
    const miss = need(b, 'code', 'title'); if (miss.length) return [400, { error: 'Missing ' + miss }];
    const c = { id: id(), code: String(b.code), title: String(b.title), capacity: Math.max(1, +b.capacity || 30) }; db.courses.push(c); save(); return [201, c];
  }
  if (method === 'GET' && url === '/api/enrollments') return [200, db.enrollments];
  if (method === 'POST' && url === '/api/enrollments') {
    const studentId = +b.studentId, courseId = +b.courseId;
    const c = db.courses.find(c => c.id === courseId);
    if (!c || !db.students.some(s => s.id === studentId)) return [404, { error: 'Student or course not found' }];
    if (db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId)) return [409, { error: 'Already enrolled' }];
    if (db.enrollments.filter(e => e.courseId === courseId).length >= c.capacity) return [409, { error: 'Course full' }];
    const e = { id: id(), studentId, courseId }; db.enrollments.push(e); save(); return [201, e];
  }
  if ((m = url.match(/^\/api\/enrollments\/(\d+)$/)) && method === 'DELETE') { db.enrollments = db.enrollments.filter(e => e.id !== +m[1]); save(); return [204, null]; }
  if (method === 'POST' && url === '/api/grades') {
    const studentId = +b.studentId, courseId = +b.courseId, score = +b.score;
    if (!db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId)) return [404, { error: 'Not enrolled' }];
    if (!(score >= 0 && score <= 100)) return [400, { error: 'Score must be 0-100' }];
    db.grades = db.grades.filter(g => !(g.studentId === studentId && g.courseId === courseId));
    const g = { id: id(), studentId, courseId, score }; db.grades.push(g); save(); return [201, g];
  }
  if (method === 'GET' && url === '/api/reports/performance') {
    const students = db.students.map(s => ({ id: s.id, name: s.name, average: gpa(s.id), courses: db.enrollments.filter(e => e.studentId === s.id).map(e => ({ course: (db.courses.find(c => c.id === e.courseId) || {}).code, score: (db.grades.find(g => g.studentId === s.id && g.courseId === e.courseId) || {}).score ?? null })) }));
    const avgs = students.map(s => s.average).filter(a => a !== null);
    return [200, { totalStudents: db.students.length, totalCourses: db.courses.length, overallAverage: avgs.length ? +(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2) : null, atRisk: students.filter(s => s.average !== null && s.average < 60).map(s => s.name), students }];
  }
  if (method === 'GET' && url === '/api/reports/performance.csv') {
    const rows = ['name,average,course,score']; for (const s of route('GET', '/api/reports/performance')[1].students) for (const c of s.courses) rows.push([JSON.stringify(s.name), s.average ?? '', c.course, c.score ?? ''].join(','));
    return [200, rows.join('\n'), 'text/csv'];
  }
  return [404, { error: 'Not found' }];
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (!url.startsWith('/api/')) {
    const f = path.join(__dirname, 'public', url === '/' ? 'index.html' : path.normalize(url).replace(/^(\.\.[\/\\])+/, ''));
    if (!f.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] || 'text/plain' }); return fs.createReadStream(f).pipe(res);
  }
  let raw = ''; req.on('data', d => { raw += d; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => {
    let b = {}; try { if (raw) b = JSON.parse(raw); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
    const [code, body, type] = route(req.method, url, b);
    if (type) { res.writeHead(code, { 'Content-Type': type }); return res.end(body); }
    if (body === null) { res.writeHead(code); return res.end(); }
    send(res, code, body);
  });
});
module.exports = { server, reset: () => { db = { students: [], courses: [], enrollments: [], grades: [], seq: 1 }; } };
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log('Student dashboard running'));
