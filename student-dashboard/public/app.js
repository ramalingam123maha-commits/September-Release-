const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  if (!r.ok) { $('#msg').textContent = (await r.json()).error; throw 0; }
  $('#msg').textContent = ''; return r.status === 204 ? null : r.json();
}
async function load() {
  const [s, c, rep] = await Promise.all([api('GET', '/api/students'), api('GET', '/api/courses'), api('GET', '/api/reports/performance')]);
  $('#st').innerHTML = '<tr><th>Name</th><th>Email</th><th>Avg</th><th></th></tr>' + s.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${x.average ?? '-'}</td><td><button data-del="${x.id}">Delete</button></td></tr>`).join('');
  $('#ct').innerHTML = '<tr><th>Code</th><th>Title</th><th>Enrolled</th></tr>' + c.map(x => `<tr><td>${esc(x.code)}</td><td>${esc(x.title)}</td><td>${x.enrolled}/${x.capacity}</td></tr>`).join('');
  const so = s.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join(''), co = c.map(x => `<option value="${x.id}">${esc(x.code)}</option>`).join('');
  for (const i of ['#es', '#gs']) $(i).innerHTML = so; for (const i of ['#ec', '#gc']) $(i).innerHTML = co;
  $('#rp').innerHTML = `<p>Students: ${rep.totalStudents} | Courses: ${rep.totalCourses} | Overall average: ${rep.overallAverage ?? '-'}</p><p>At risk (&lt;60): ${rep.atRisk.map(esc).join(', ') || 'none'}</p>`;
}
const form = (sel, method, url) => $(sel).addEventListener('submit', async e => { e.preventDefault(); try { await api(method, url, Object.fromEntries(new FormData(e.target))); e.target.reset(); load(); } catch {} });
form('#sf', 'POST', '/api/students'); form('#cf', 'POST', '/api/courses'); form('#ef', 'POST', '/api/enrollments'); form('#gf', 'POST', '/api/grades');
$('#st').addEventListener('click', async e => { if (e.target.dataset.del) { await api('DELETE', '/api/students/' + e.target.dataset.del); load(); } });
load();
