// Five synthetic discharge summaries, written for testing. All patients, clinicians, numbers
// and hospitals are invented. Each one leaves out information on purpose (listed in `planted`).
const SAMPLES = [
  {
    title: "Hip fracture after surgery (nearly complete)",
    planted: ["social"],
    text: `RIVERBEND MEDICAL CENTER - DISCHARGE SUMMARY (SYNTHETIC)
Patient: Demo Patient 1, 82F   Admit 11/02/2026   Discharge 11/07/2026
Discharging physician: Dr. Rao, hospitalist, pager (555) 210-4400. After-hours questions: hospitalist on-call line (555) 210-4000.

Reason for admission: Fall at home with left femoral neck fracture.
Discharge diagnoses: Left femoral neck fracture s/p hemiarthroplasty 11/03; acute blood loss anemia; hypertension.
Hospital course: Underwent left hip hemiarthroplasty on 11/03 without complication. Hgb nadir 8.4, no transfusion. Pain controlled on acetaminophen and low-dose oxycodone. PT started POD1.
Code status: Full code. MOLST completed, copy attached.
Mental status: Alert and oriented x3, at cognitive baseline per daughter. No delirium.
Behavioral status: No behavioral concerns during stay.
Functional status: Transfers with walker and assist x1; ambulates 40 ft with rolling walker. Weight-bearing as tolerated left leg. Needs assist with lower-body dressing.
Allergies: Penicillin (rash).
Diet: Regular, thin liquids.
Skin: Left hip incision clean and dry, staples in place; dressing change every 2 days. Remove staples 11/17.
Lines/devices: None. Foley removed 11/05.
Isolation: None. MRSA nares negative.
Immunizations: Influenza vaccine given 11/06/2026. Pneumococcal (PCV20) documented 2024.
Discharge medications:
- Acetaminophen 650 mg every 6 hours (new)
- Oxycodone 2.5 mg every 6 hours as needed for severe pain (new). Signed controlled-substance prescription sent to facility pharmacy 11/07.
- Enoxaparin 40 mg daily for DVT prophylaxis, continue until 12/01/2026 (new)
- Amlodipine 5 mg daily (continue)
Last doses given: enoxaparin 09:00 11/07, oxycodone 06:00 11/07.
Pending results: none.
Follow-up: Orthopedics, Dr. Lin, in 2 weeks. PCP Dr. Grant in 1-2 weeks.
Labs after discharge: Check CBC 11/10.`,
  },
  {
    title: "Heart failure (several gaps)",
    planted: ["behavior", "code", "afterhours", "immun", "lastdose"],
    text: `HARBOR GENERAL HOSPITAL - DISCHARGE SUMMARY (SYNTHETIC)
Patient: Demo Patient 2, 76M   Admitted 10/28/2026  Discharged 11/04/2026
Attending: Dr. Okafor

Admitted with shortness of breath and leg swelling. Discharge diagnosis: Acute on chronic systolic heart failure (EF 30%), CKD stage 3, type 2 diabetes.
Hospital course: Diuresed with IV furosemide, net -6 L. Transitioned to oral torsemide. Creatinine peaked 1.9, now 1.6.
Lives with wife, who is his health care proxy; daughter nearby helps with appointments.
Mental status: Alert, oriented, at baseline.
Function: Independent with ADLs, walks with cane, short of breath after 50 ft.
Allergies: NKDA.
Diet: 2 g sodium, 1.5 L fluid restriction, carbohydrate-controlled.
No wounds. No lines. Not on isolation.
Medications:
- Torsemide 40 mg daily (new, replaces furosemide)
- Metoprolol succinate 50 mg daily (increased from 25 mg)
- Sacubitril/valsartan 24/26 mg twice daily (new)
- Insulin glargine 18 units at bedtime; correction scale with meals, fingerstick before meals and at bedtime
- Atorvastatin 40 mg daily (continue)
Follow-up: Cardiology heart failure clinic in 7 days. PCP in 2 weeks.
Monitoring: Daily weights; call provider if gain more than 2 lb in a day. Repeat BMP in 3 days.
Pending: none.`,
  },
  {
    title: "Pneumonia with dementia (antibiotic and culture gaps)",
    planted: ["pending-followup", "abx-stop", "afterhours", "provider"],
    text: `SUNSET VALLEY HOSPITAL - DISCHARGE SUMMARY (SYNTHETIC)
Patient: Demo Patient 3, 88F   Admit 11/10/2026   Discharge 11/14/2026

Reason for admission: Fever and cough; right lower lobe pneumonia.
Hospital course: Treated with IV ceftriaxone, transitioned to oral cefpodoxime. Oxygen weaned to room air 11/13. Sputum culture pending at discharge.
Code status: DNR/DNI, MOLST on file.
Mental status: Moderate Alzheimer dementia; oriented to self only (baseline per son). Had hypoactive delirium on admission, now resolved.
Behavior: Sundowning in the evening; redirects well with music and family photos. No antipsychotics used.
Social: Long-term resident returning to facility; son is health care proxy.
Function: Assist x1 for transfers, wheelchair for distance, feeds self after setup.
Allergies: Sulfa (hives).
Diet: Mechanical soft with thin liquids per SLP evaluation.
Skin: Stage 2 pressure injury sacrum, foam dressing, change every 3 days.
Isolation: Droplet precautions discontinued 11/12; COVID-19 test negative.
Immunizations: Influenza 10/2026; COVID-19 booster 09/2026.
Medications:
- Cefpodoxime 200 mg twice daily (new)
- Donepezil 10 mg at bedtime (continue)
- Acetaminophen 650 mg every 6 hours as needed
Last dose given: cefpodoxime 08:00 11/14.
Follow-up: Facility physician to see within 72 hours. PCP Dr. Shah.`,
  },
  {
    title: "Stroke (function, diet and vaccine gaps)",
    planted: ["function", "diet", "immun", "social"],
    text: `NORTHSIDE REGIONAL - DISCHARGE SUMMARY (SYNTHETIC)
Patient: Demo Patient 4, 71M   Admit 11/05/2026   Discharge 11/12/2026
Discharging physician: Dr. Feld, neurology, (555) 330-7100. Nights and weekends: call the hospital transfer center (555) 330-7000.

Admitted with acute left MCA ischemic stroke; right-sided weakness and expressive aphasia. Not a thrombolysis candidate.
Hospital course: MRI confirmed left MCA infarct. Started dual antiplatelet therapy. Atrial fibrillation found on telemetry; apixaban to start day 7.
Code status: Full code.
Mental status: Alert, expressive aphasia, follows one-step commands.
Behavior: Frustrated with communication; no aggression.
Allergies: No known drug allergies.
Lines: PICC removed. No Foley.
Isolation: none.
Medications:
- Apixaban 5 mg twice daily, started 11/12 for atrial fibrillation, long-term (new)
- Atorvastatin 80 mg daily (new)
- Lisinopril 10 mg daily (continue)
Aspirin and clopidogrel stopped when apixaban started.
Last doses: apixaban 09:00 11/12.
Pending results: Echocardiogram final read pending; neurology will call the facility with result.
Follow-up: Stroke clinic in 4 weeks; PCP Dr. Mendez in 2 weeks.`,
  },
  {
    title: "Urinary infection with delirium (worst case)",
    planted: ["opioid-script", "afterhours", "behavior", "code", "immun", "skin", "social", "followup"],
    text: `METRO CITY HOSPITAL - DISCHARGE NOTE (SYNTHETIC)
Patient: Demo Patient 5, 84M   11/08/2026 to 11/13/2026

Admitted for confusion and fever; E. coli urinary tract infection with delirium.
Course: IV antibiotics, then oral. Delirium improving. Fell once on the unit, no injury.
Mental status: confused at times at night.
Meds:
- Ciprofloxacin 500 mg twice daily
- Oxycodone 5 mg every 4 hours as needed for back pain
- Quetiapine 25 mg at bedtime as needed for agitation (new)
- Tamsulosin 0.4 mg daily
Allergies: none known.
Diet: regular.
Foley catheter in place for retention.
Transfers with assist x2.`,
  },
];
