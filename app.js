// Discharge Gap Checker: paste a hospital discharge summary, see what a nursing home needs but
// didn't get, and get the callback questions. Pattern rules only; runs entirely in the browser.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function snippet(text, m) {
  const a = Math.max(0, m.index - 50), b = Math.min(text.length, m.index + m[0].length + 70);
  return (a ? "…" : "") + text.slice(a, b).replace(/\s+/g, " ").trim() + (b < text.length ? "…" : "");
}

function analyse(text) {
  // medication lines (a dose like "25 mg") blanked out, keeping offsets, for items with skipMedLines
  const noMeds = text.replace(/^.*\b\d+(\.\d+)?\s*(mg|mcg|g|units?|ml)\b.*$/gim, (l) => " ".repeat(l.length));
  const items = CHECKLIST.map((it) => {
    let hit = null;
    for (const rx of it.find) { const m = (it.skipMedLines ? noMeds : text).match(rx); if (m) { hit = m; break; } }
    return { ...it, present: !!hit, evidence: hit ? snippet(text, hit) : "" };
  });
  const flags = [];
  // skip trigger words that are negated just before ("no oxycodone", "not on antibiotics")
  const negated = (m) => /\b(no|not on|not taking|without|denies|never on)\s+(\w+\s+){0,2}$/i.test(text.slice(Math.max(0, m.index - 40), m.index));
  for (const s of SAFETY) {
    const m = [...text.matchAll(new RegExp(s.when.source, s.when.flags + "g"))].find((x) => !negated(x));
    if (m && !s.need.test(text)) flags.push({ ...s, evidence: snippet(text, m) });
  }
  // pending results without anyone named to follow them up
  const pend = text.match(/(pending|awaiting)[^\n]{0,80}/i);
  if (pend && !/no (tests?|results?|studies) (are )?pending|pending( results?)?:\s*none/i.test(text) &&
      !/(will (call|notify|follow|contact)|to follow up|responsible for follow|follow(ing)? up (on|the) (result|culture)|notify (the )?facility)/i.test(text)) {
    flags.push({ id: "pending-owner", finding: "A result is still pending, but no one is named to follow it up or tell the facility.",
      ask: "Who will follow up the pending result, and how will we be told?", evidence: snippet(text, pend) });
  }
  return { items, flags };
}

function render() {
  const text = $("#summary").value;
  if (!text.trim()) { $("#results").hidden = true; return; }
  const { items, flags } = analyse(text);
  const study = items.filter((i) => i.source === "study"), miss = items.filter((i) => !i.present);
  const studyFound = study.filter((i) => i.present).length;
  $("#results").hidden = false;
  $("#score").innerHTML = `
    <div class="kpi ${studyFound < 6 ? "bad" : studyFound < 9 ? "mid" : "good"}"><strong>${studyFound}/9</strong><span>of the items nursing homes most often don't get</span></div>
    <div class="kpi"><strong>${items.length - miss.length}/${items.length}</strong><span>checklist items found</span></div>
    <div class="kpi ${flags.length ? "bad" : "good"}"><strong>${flags.length}</strong><span>safety flags</span></div>
    <div class="kpi"><strong>${miss.length + flags.length}</strong><span>questions for the hospital</span></div>`;

  $("#flags").innerHTML = flags.length ? flags.map((f) => `<div class="flag"><b>${esc(f.finding)}</b><div class="ev">${esc(f.evidence)}</div></div>`).join("")
    : `<p class="ok">No safety flags (opioid prescription, antibiotic stop date, anticoagulant plan, insulin orders, pending-result owner).</p>`;

  const groups = [...new Set(CHECKLIST.map((i) => i.group))];
  $("#checklist").innerHTML = groups.map((g) => `<h3>${esc(g)}</h3><ul>${items.filter((i) => i.group === g).map((i) => `
    <li class="${i.present ? "yes" : "no"}"><span class="mark" aria-hidden="true">${i.present ? "✓" : "✕"}</span>
      <div><b>${esc(i.label)}</b>${i.source === "study" ? ` <span class="stat" title="Share of hospital-SNF pairs that typically did not receive this (JAMA Netw Open 2021)">missing in ${i.exact ? "" : "about "}${i.missing}% of hospital–SNF pairs</span>` : ""}
      <div class="ev">${i.present ? esc(i.evidence) : "<em>Not found.</em> " + esc(i.ask)}</div></div></li>`).join("")}</ul>`).join("");

  const qs = [...flags.map((f) => f.ask), ...miss.sort((a, b) => (b.missing || 0) - (a.missing || 0)).map((i) => i.ask)];
  const pt = (text.match(/patient:\s*([^\n]{0,40})/i) || [])[1]?.split(/\s{2,}/)[0] || "[patient]";
  $("#call").value = qs.length
    ? `Callback to the discharging hospital re: ${pt}\nCalled: ____ (date/time)   Spoke with: ____\n\n${qs.map((q, n) => `${n + 1}. ${q}\n   Answer: ____`).join("\n")}`
    : "Nothing missing from the checklist. Confirm the medication list on arrival as usual.";
}

function init() {
  $("#samples").innerHTML = SAMPLES.map((s, i) => `<button class="ghost" data-i="${i}">${esc(s.title)}</button>`).join("");
  $("#samples").onclick = (e) => { const i = e.target.dataset.i; if (i == null) return; $("#summary").value = SAMPLES[i].text; render(); $("#results").scrollIntoView({ behavior: "smooth" }); };
  $("#check").onclick = () => { render(); $("#results").scrollIntoView({ behavior: "smooth" }); };
  $("#summary").oninput = () => { clearTimeout(window._t); window._t = setTimeout(render, 400); };
  $("#copy").onclick = async () => { try { await navigator.clipboard.writeText($("#call").value); $("#copy").textContent = "Copied"; setTimeout(() => ($("#copy").textContent = "Copy questions"), 1500); } catch { $("#call").select(); } };
  $("#print").onclick = () => window.print();
}

init();
