// What a skilled nursing facility (SNF) needs from a hospital discharge summary.
//
// source "study": the 9 information types that Directors of Nursing most often reported as
//   missing, from Adler-Milstein J, Raphael K, O'Malley TA, Cross DA. Information Sharing
//   Practices Between US Hospitals and Skilled Nursing Facilities to Support Care Transitions.
//   JAMA Netw Open. 2021;4(1):e2033980 (471 hospital-SNF pairs). `missing` is the share of pairs
//   that typically did NOT receive it. Exact for the first six (from the text); the last three
//   are read from Figure 2B and shown as "about".
// source "practice": standard transition-of-care content (CMS discharge planning rule,
//   42 CFR 482.43, requires sending the information needed for post-discharge care).
//
// `find` is a list of patterns; the item counts as present if any matches.
// `skipMedLines`: ignore matches on medication lines (a PRN "for agitation" is not a behavioral status).
// `ask` is the callback question to the hospital when it is missing.
const CHECKLIST = [
  // ----- study items -----
  { id: "behavior", group: "Study: most often missing", label: "Behavioral status", source: "study", missing: 67.7, exact: true, skipMedLines: true,
    find: [/behavio(u)?r(al)?\s*(status|symptoms|issues|concerns|health|management|plan)/i, /\b(agitat|aggress|wander|sundown|exit[- ]seek|combative|resists care|redirect)/i, /\bno (behavio(u)?ral|behavior) (issues|concerns)/i],
    ask: "Any behaviors we should plan for (agitation, wandering, resisting care, sundowning)? What worked to manage them, and were any PRN or restraint orders used?" },
  { id: "social", group: "Study: most often missing", label: "Social status (lives with, caregiver, decision-maker)", source: "study", missing: 65.7, exact: true,
    find: [/\b(lives (alone|with)|social (history|status|situation)|caregiver|family support|health care proxy|healthcare proxy|\bhcp\b|power of attorney|\bpoa\b|next of kin|emergency contact|decision[- ]maker)/i],
    ask: "Who does the patient live with, who is the main caregiver or health care proxy, and how do we reach them?" },
  { id: "afterhours", group: "Study: most often missing", label: "Hospital contact for after-hours questions", source: "study", missing: 53.9, exact: true,
    find: [/after[- ]hours|24\/7|on[- ]call|nights? and weekends|page (the )?(hospitalist|on-call)|transfer (center|line)|nursing (station|unit) (phone|number|line)/i],
    ask: "Who should our nurses call after hours or on weekends with questions about this discharge? Please give a direct number." },
  { id: "mental", group: "Study: most often missing", label: "Mental status / cognition", source: "study", missing: 44.1, exact: true,
    find: [/mental status|\bcognit|\boriented\b|\ba&ox?\d|\baox\d|\bdementia\b|\bdelirium\b|\bconfus|\bmoca\b|\bslums\b|\bmmse\b|baseline (mental|cognition)/i],
    ask: "What is the patient's current mental status compared with their baseline? Any delirium during the stay, and is it resolved?" },
  { id: "immun", group: "Study: most often missing", label: "Immunization history", source: "study", missing: 40.7, exact: true,
    find: [/immuni[sz]ation|vaccin|influenza|flu shot|pneumococcal|pcv\d+|ppsv|tdap|covid-19 (vaccine|booster)|shingrix|zoster/i],
    ask: "Which vaccines were given during the stay or are documented (influenza, pneumococcal, COVID-19, Tdap)?" },
  { id: "function", group: "Study: most often missing", label: "Functional status / level of independence", source: "study", missing: 35.8, exact: true,
    find: [/functional (status|level|baseline)|\badls?\b|activities of daily living|ambulat|transfers? (with|requires|independent)|assist(ance)? (x|with)|walker|wheelchair|weight[- ]bearing|\bpt\/ot\b|physical therapy|independent (with|in)|gait/i],
    ask: "What is the patient's current function: transfers, walking, ADLs, weight-bearing status, and the equipment they need?" },
  { id: "pending", group: "Study: most often missing", label: "Pending test results (and who follows them)", source: "study", missing: 30, exact: false,
    find: [/pending (results?|tests?|labs?|studies|cultures?)|results? pending|\bpending\b|no (tests?|results?) (are )?pending|awaiting (results?|final|pathology)/i],
    ask: "Are any results still pending (cultures, pathology, imaging reads)? Who will follow them up and tell us?" },
  { id: "provider", group: "Study: most often missing", label: "Discharging physician contact", source: "study", missing: 24, exact: false,
    find: [/(discharging|attending) (physician|provider|doctor|hospitalist)[^\n]{0,60}(\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}|pager|phone|ext)/i, /dr\.? [a-z]+[^\n]{0,40}(\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4})/i],
    ask: "Please send the discharging physician's name and a direct number or pager." },
  { id: "code", group: "Study: most often missing", label: "Code status / advance care plan", source: "study", missing: 21, exact: false,
    find: [/code status|full code|\bdnr\b|\bdni\b|do not (resuscitate|intubate)|\bmolst\b|\bpolst\b|advance (directive|care plan)|comfort (care|measures)|goals of care/i],
    ask: "What is the code status, and is there a signed MOLST/POLST or advance directive we can have a copy of?" },
  // ----- standard practice items -----
  { id: "reason", group: "Clinical basics", label: "Reason for admission / diagnoses", source: "practice",
    find: [/reason for (admission|hospitali[sz]ation)|admitting diagnosis|principal diagnosis|discharge diagnos|chief complaint|admitted (for|with)|presented with/i],
    ask: "What was the main reason for admission and the final diagnoses?" },
  { id: "course", group: "Clinical basics", label: "Hospital course", source: "practice",
    find: [/^\s*(hospital )?course( of stay)?:/im, /hospital course|course of (illness|stay)|summary of (stay|hospitali[sz]ation)|during (the|this) (stay|admission|hospitali[sz]ation)/i],
    ask: "Could you send a brief summary of the hospital course?" },
  { id: "meds", group: "Clinical basics", label: "Discharge medication list", source: "practice",
    find: [/discharge medications?|medication list|medications? (on|at) discharge|home medications?|\bmeds\b|\bmg\b/i],
    ask: "Please send the complete discharge medication list with doses, routes and frequencies." },
  { id: "medchanges", group: "Clinical basics", label: "Medication changes (new / stopped / changed)", source: "practice",
    find: [/\b(new|started|stopped|discontinued|held|hold|changed|increased|decreased|resume|continue)\b[^\n]{0,40}\b(mg|medication|dose)/i, /\((new|continued?|changed|increased|decreased|stopped|held|replaces)\b/i, /medication (changes|reconciliation)/i],
    ask: "Which medications were started, stopped or changed during the stay, and why?" },
  { id: "lastdose", group: "Clinical basics", label: "Time of last doses given", source: "practice",
    find: [/last (dose|given|administered)|time of last|given at \d|last (insulin|antibiotic|anticoagulant|opioid) dose/i],
    ask: "When were the last doses given (especially antibiotics, insulin, anticoagulants and pain medication), so we don't double or miss a dose?" },
  { id: "allergies", group: "Clinical basics", label: "Allergies", source: "practice",
    find: [/allerg|\bnkda\b|no known (drug )?allergies/i],
    ask: "Please confirm allergies and reactions (or no known drug allergies)." },
  { id: "diet", group: "Care needs", label: "Diet and swallowing", source: "practice",
    find: [/\bdiet\b|npo|swallow|dysphag|thickened|puree|mechanical soft|tube feed|\bpeg\b|nectar|honey[- ]thick|\bslp\b|speech (therapy|language)/i],
    ask: "What diet and liquid consistency is ordered? Any swallow evaluation results?" },
  { id: "skin", group: "Care needs", label: "Skin and wounds", source: "practice",
    find: [/\bwound|pressure (injury|ulcer)|\bskin (intact|integrity|assessment)|incision|dressing|stage [1-4i]+|braden/i],
    ask: "Any wounds, pressure injuries or incisions? Please send location, stage and dressing orders." },
  { id: "devices", group: "Care needs", label: "Lines, drains and devices", source: "practice",
    find: [/\bpicc\b|foley|catheter|\bdrain\b|central line|\biv\b|oxygen|\bo2\b|nasal cannula|cpap|bipap|trach|ostomy|no (lines|devices)/i],
    ask: "Is the patient going with any lines, catheters, drains or oxygen? Please include care orders and removal dates." },
  { id: "infection", group: "Care needs", label: "Infection / isolation status", source: "practice",
    find: [/isolation|precautions|\bmrsa\b|\bvre\b|c\.? ?diff|clostridi|\besbl\b|\bcre\b|covid(-19)? (test|status|negative|positive)|\bmdro\b/i],
    ask: "Is the patient on any isolation precautions, or colonised with MRSA, VRE, C. diff or another MDRO?" },
  { id: "followup", group: "After discharge", label: "Follow-up appointments", source: "practice",
    find: [/follow[- ]?up|appointment|\bf\/u\b|see (dr|cardiology|ortho|neurology|pcp)|outpatient (clinic|visit)/i],
    ask: "Which follow-up appointments are scheduled or needed, with whom and when?" },
  { id: "labs", group: "After discharge", label: "Labs or monitoring after discharge", source: "practice",
    find: [/(recheck|repeat|check|monitor)[^\n]{0,30}(labs?|inr|bmp|cbc|potassium|creatinine|glucose|weights?)|daily weights?|fingerstick|finger[- ]stick|accucheck|glucose checks?/i],
    ask: "Which labs or monitoring should we do after arrival, and when?" },
  { id: "pcp", group: "After discharge", label: "Primary care / outpatient physician", source: "practice",
    find: [/\bpcp\b|primary care|outpatient (physician|provider|doctor)/i],
    ask: "Who is the patient's primary care physician, and has a copy been sent to them?" },
];

// Specific safety checks: [pattern that must match, pattern that should then also appear, finding, question]
const SAFETY = [
  { id: "opioid", when: /\b(oxycodone|hydrocodone|morphine|hydromorphone|fentanyl|methadone|tramadol|oxycontin|percocet|norco|dilaudid)\b/i,
    need: /(signed|hard|paper|controlled[- ]substance|c-?ii|schedule ii)[^\n]{0,30}(prescription|script|rx)|(prescription|script|rx)[^\n]{0,30}(sent|faxed|signed|attached)/i,
    finding: "An opioid is listed but no signed controlled-substance prescription is mentioned. The SNF pharmacy can't dispense it without one, which often means a missed pain dose on the first night.",
    ask: "Please send a signed controlled-substance prescription for the opioid, or tell us when it was sent to our pharmacy." },
  { id: "abx", when: /\b(cef\w+|ceftriaxone|cefepime|amoxicillin|augmentin|azithromycin|doxycycline|levofloxacin|ciprofloxacin|vancomycin|piperacillin|zosyn|meropenem|nitrofurantoin|bactrim|linezolid|metronidazole|clindamycin|antibiotics?)\b/i,
    need: /\b(stop date|stop on|end date|ends? on|through \d|until \d|until \w+ \d|for (a total of )?\d+ (more )?days|x ?\d+ days|last day|duration|complete (the )?course|total of \d+ days)\b/i,
    finding: "An antibiotic is listed without a stop date or duration.",
    ask: "What is the stop date (or total duration) for the antibiotic?" },
  { id: "anticoag", when: /\b(warfarin|coumadin|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|enoxaparin|lovenox|heparin)\b/i,
    need: /(inr|anti-?xa|goal|target|duration|until|stop|continue for|bridge|indication)/i,
    finding: "An anticoagulant is listed without an INR goal, duration or indication.",
    ask: "What is the anticoagulant's indication and planned duration (and INR goal and next check, if on warfarin)?" },
  { id: "insulin", when: /\binsulin|glargine|lantus|lispro|humalog|aspart|novolog|basaglar|sliding scale\b/i,
    need: /(sliding scale|correction (scale|dose)|fingerstick|finger[- ]stick|glucose (checks?|monitoring)|before meals|\bac\b|\bhs\b|units?)/i,
    finding: "Insulin is listed without doses or glucose monitoring instructions.",
    ask: "Please send the insulin doses and the glucose monitoring and correction-scale orders." },
];
