const _wx = {
  f: { fa: 4.5, cs: 4.5, hr: 3.5, it: 3.5, analytics: 3.8, lpo: 2.8, generic: 3.0 },
  i: { bpo: 4.5, it_services: 3.5, banking: 3.5, insurance: 3.8, consulting: 2.8, ecom: 3.0, mfg: 2.5 },
  a: { none: 1.5, pilot: 2.5, scaling: 3.5, replacing: 5.0 },
  d: { none: 1.3, low: 1.0, high: 0.7 },
  csw: { none: 28, pilot: 20, scaling: 13, replacing: 6 }
};

function calc(input) {
  const S = {
    industry: input.seg === 'it' ? 'it_services' : 'bpo',
    dep: 'low',
    salary: 100000,
    mechAtoms: [{}, {}, {}],
    logicAtoms: [{}, {}],
    ...input
  };
  const fw = _wx.f[S.fn] || 3.0;
  const iw = _wx.i[S.industry] || 3.0;
  const aw = _wx.a[S.ai] || 2.5;
  const eAdj = S.exp > 12 ? -0.5 : S.exp < 3 ? 0.5 : 0;
  const cAdj = S.yrs > 15 ? 0.8 : S.yrs > 10 ? 0.4 : 0;
  const mgrAdj = S.complacencyRatio ? ((S.complacencyRatio - 40) / 100) : 0;
  let atomAdj = 0;
  if (S.mechAtoms.length + S.logicAtoms.length > 2) {
    const mechRatio = S.mechAtoms.length / (S.mechAtoms.length + S.logicAtoms.length);
    atomAdj = (mechRatio - 0.6) * 2;
  }
  let risk = ((aw + fw + iw) / 3) * 1.65 + eAdj + cAdj + atomAdj + (S.seg === 'manager' ? (mgrAdj || 0) : 0);
  risk = Math.max(1, Math.min(10, risk));
  const lq = Math.max(1, Math.min(10, 11 - risk + (S.exp > 10 ? 1 : 0)));
  const dM = _wx.d[S.dep] || 1.0;
  let csw = Math.round((_wx.csw[S.ai] || 16) * dM);
  if (S.exp > 12) csw = Math.round(csw * 1.2);
  if (S.yrs > 15) csw = Math.round(csw * 0.85);
  const drift = Math.round((S.salary || 100000) * 0.008 * (risk / 5));
  const safety = Math.max(1, Math.min(10, 11 - (risk * 0.6) - (csw < 12 ? 1.5 : 0) - (S.ai === 'replacing' ? 1 : 0) - (S.dep === 'high' ? 1 : 0)));
  return { risk: +risk.toFixed(1), lq: +lq.toFixed(1), csw, drift, safety: +safety.toFixed(1) };
}

const cases = [
  { name: 'BPO F&A replacing', input: { seg: 'bpo', fn: 'fa', ai: 'replacing', exp: 5, yrs: 3 }, risk: [7, 10], safety: [1, 4] },
  { name: 'Manager analytics pilot', input: { seg: 'manager', fn: 'analytics', ai: 'pilot', exp: 15, yrs: 12, complacencyRatio: 65 }, risk: [4.5, 7] },
  { name: 'Fresher CS no AI', input: { seg: 'fresher', fn: 'cs', ai: 'none', exp: 1, yrs: 1 }, risk: [5, 8] }
];

for (const test of cases) {
  const score = calc(test.input);
  for (const key of ['risk', 'lq', 'safety']) {
    if (score[key] < 1 || score[key] > 10) throw new Error(`${test.name}: ${key} out of range: ${score[key]}`);
  }
  if (score.csw < 0) throw new Error(`${test.name}: CSW out of range: ${score.csw}`);
  if (test.risk && (score.risk < test.risk[0] || score.risk > test.risk[1])) {
    throw new Error(`${test.name}: risk ${score.risk} outside expected ${test.risk.join('-')}`);
  }
  if (test.safety && (score.safety < test.safety[0] || score.safety > test.safety[1])) {
    throw new Error(`${test.name}: safety ${score.safety} outside expected ${test.safety.join('-')}`);
  }
  console.log(`${test.name}:`, score);
}

console.log('Scoring checks passed.');
