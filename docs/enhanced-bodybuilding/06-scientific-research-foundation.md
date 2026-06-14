# Scientific Research Foundation — Enhanced Cycle & Protocol Feature

Source: PubMed / PMC literature searches conducted 2026-06-14.
Purpose: Evidence base for designing AAS/peptide cycle management features in the peptide tracker app.

**CRITICAL NOTE:** Where the science diverges from coach advice in `01-coach-video-transcript.md`, those divergences are explicitly flagged with ⚠️. This document must be treated as a corrective layer — do not build features that encode factually unsupported claims.

---

## Topic 1 — Cycle Duration & Architecture

### Key Papers

**PMC10273855** — "Anabolic-Androgenic Steroid Use Patterns among Recreational Athletes" (2023)
- Community-based survey of real-world AAS use
- Reported cycle lengths: median ~12 weeks; long cycles (>16 weeks) associated with greater HPTA suppression and longer recovery
- Key finding: majority of users run 8-16 week cycles; 20-24 week cycles are atypically long even in recreational bodybuilding

**PMC10316820** — "Androgen Abuse among Recreational Athletes" (2023)
- Documents standard cycle structures; most clinical trial interventions use 6-12 week protocols
- Notes: longer cycle duration = greater cumulative androgen exposure = greater suppression burden

### Scientific Assessment

- Clinical RCTs almost universally study 6-12 week cycles; 16-24 week cycles have no robust controlled-trial safety data
- **⚠️ Coach's 20-24 week "push" is longer than any well-studied cycle in the literature.** Longer cycles increase the probability of persistent hypogonadism post-cessation (see Topic 6).
- The "phases within a cycle" architecture (escalating dose over multiple phases) is not specifically studied in RCTs but aligns with titration principles — gradual dose increase reduces adverse event burden.

---

## Topic 2 — Dose-Response & Androgen Load

### Key Papers

**Bhasin et al. 1996 NEJM (PMID: 8637535)** — "The Effects of Supraphysiologic Doses of Testosterone on Muscle Size and Strength in Normal Men"
- Gold-standard dose-response RCT; n=43, 10 weeks, 600mg/week testosterone enanthate
- Results: +6.1kg FFM vs placebo; strength gains in both exercise and no-exercise groups
- Established: supraphysiological testosterone alone (no exercise) increases muscle mass and strength

**PMID: 35603787** — "Response to supraphysiological testosterone is predicted by a distinct androgen receptor cistrome" (2022)
- Genetic/epigenetic variation in AR binding sites predicts individual response magnitude
- Key finding: individual response to supraphysiological testosterone varies enormously (supports the "individual variation" emphasis from all four source documents)

**PMID: 15472231** — "Androgen receptor upregulation with androgen treatment in satellite cells" (2004)
- AR density in satellite cells INCREASES with androgen exposure — not downregulation
- Provides mechanistic basis for "more androgen = more AR = more anabolic signaling" observed by Mike Israetel in `02-mike-israetel-peter-attia-anabolics.md`
- However: functional asymptote still occurs (diminishing returns above individual threshold)

### Scientific Assessment

- The dose-response relationship is real and well-established.
- AR upregulation (not downregulation) with androgen exposure is supported.
- **⚠️ The plateau/saturation point is individual — no validated method exists to predict individual AR saturation threshold from bloodwork or genetics yet.** Features should display dose as a logged variable, not attempt to predict optimal dose.

---

## Topic 3 — Compound Pharmacology

### Key Papers

**PMID: 27535042** — "Novel Uses of Nandrolone and Oxandrolone" (2016)
- Detailed pharmacology review of nandrolone (Deca/NPP) and oxandrolone (Anavar)
- Nandrolone: uniquely 5-alpha reduces to dihydronandrolone in skin/scalp (near-zero androgenic activity) while retaining full anabolic activity in muscle
- Oxandrolone: highly tissue-selective, minimal HPTA suppression at therapeutic doses, safe in women/pediatric use cases

**PMC4837307** — "Beyond Testosterone Cypionate: Evidence Behind the Use of Nandrolone in Male Health and Wellness" (2016)
- Nandrolone's anabolic:androgenic ratio superiority over testosterone
- Confirms nandrolone's unique 5AR metabolite pathway in scalp tissue
- Documents joint lubrication benefits (intramuscular hydration from estrogenic metabolites)

**Standard pharmacology references for AAS covered in `04-history-of-steroids-attia-derek.md`:**

| Compound | Aromatizes | 5AR pathway | Key property |
|----------|-----------|-------------|--------------|
| Testosterone | Yes → E2 | → DHT (androgenic) | Foundation compound |
| Nandrolone | Yes (weakly) → estrone | → Dihydronandrolone (non-androgenic) | Hair-safe; joint support |
| Primobolan (Metenolone) | No | DHT derivative, no problematic metabolites | Dry lean gains; ratio management |
| Masteron (Drostanolone) | No | DHT derivative; antagonizes aromatase | Pre-contest; pseudo-AI effect |
| Anavar (Oxandrolone) | No | DHT derivative | Women-safe; tissue selective |
| Trenbolone | No | Progestogenic; strong AR agonist | Super anabolic; severe side effects |
| Dianabol (DBol) | Yes → E2 | — | Water retention; joint cushion |
| Boldenone (EQ) | Yes (mildly) | — | Mild; originally equine |

### Scientific Assessment

- The compound property table above is well-supported in the literature.
- **⚠️ The "anabolic:androgenic ratio" from rodent studies does not translate linearly to human clinical outcomes.** Ratios are useful heuristics but must not be presented as precise human efficacy/safety metrics.

---

## Topic 4 — Bloodwork Monitoring

### Key Papers

**PMC12397887** — "Cardiovascular Biomarkers in Anabolic Androgenic Steroid Users" (2025)
- Coronary calcification (CAC) significantly elevated in AAS users vs non-users; associated with >5 years cumulative AAS use
- Confirms lipids (LDL/HDL), hematocrit, and CBC as mandatory monitoring biomarkers
- Recommendation: baseline prior to cycle start; mid-cycle at peak exposure; post-cycle for recovery assessment

**PMC12467473** — "Anabolic Androgenic Steroid-Induced Cardiomyopathy: A Narrative Review" (2025)
- AAS-induced cardiomyopathy is dose and duration dependent
- Left ventricular hypertrophy (LVH) observed even in young AAS users; partially reversible on cessation
- Supports frequent cardiac risk monitoring (blood pressure, lipids, ECG if available)

**PMC11466264** — "Hematocrit Management in Men on Testosterone Therapy" (2024)
- Endocrine Society recommendation: withhold testosterone if Hct >54%
- Phlebotomy (therapeutic blood donation) for testosterone-induced erythrocytosis: evidence is weak; randomized trial data lacking
- Hct rise: injectable testosterone can raise Hct by up to 5-6 percentage points above baseline
- Key finding: high Hct + Valsalva (heavy lifting) = elevated hemorrhagic/embolic stroke risk

### Recommended Bloodwork Panel (evidence-based)

| Marker | Timing | Threshold of concern |
|--------|--------|---------------------|
| Hemoglobin / Hematocrit | Baseline, mid-cycle, post | Hct >54% = withhold |
| LDL / HDL | Baseline, mid-cycle, post | LDL >190 or HDL <30 = action |
| ALT / GGT (liver) | Baseline, mid-cycle, post | >3× ULN = stop orals |
| Testosterone (total/free) | Baseline, post-PCT | Recovery assessment |
| Estradiol (E2) | Mid-cycle | Guided by symptoms + individual |
| LH / FSH | Baseline, post-PCT | Suppression confirmation / recovery |
| PSA | Baseline, annually | Prostate screening |
| Glucose / HbA1c | Baseline, mid-cycle | AAS impairs insulin sensitivity |
| Creatinine / eGFR | Baseline, mid-cycle | Kidney function screen |
| IGF-1 | Mid-cycle (if GH used) | GH/IGF-1 axis assessment |

### Scientific Assessment

- This monitoring schedule matches the coach's log (`05-personal-protocol-log.md`) and all four reference documents.
- **⚠️ Coach and source docs do NOT mention cardiac imaging (echocardiography).** Long-term AAS users should ideally have echocardiographic assessment per PMC12467473. Feature could flag this recommendation for cycles >12 weeks.

---

## Topic 5 — Aromatization & Estrogen Management

### Key Papers

**PMID: 34090245** — "Aromatase Inhibitor Use in Men on Testosterone Therapy" (2021)
- Anastrozole 0.5mg 3×/week commonly used clinically for E2 >60 pg/mL on TRT
- Notes: AIs effective at reducing E2 but carry metabolic and bone density costs
- Even at TRT doses (not supraphysiological), AI use is considered when symptomatic

**PMC4870856** — "Aromatase Inhibition Reduces Insulin Sensitivity in Older Men" (2016 Endocrinology)
- Key finding: aromatase inhibition with letrozole reduces insulin sensitivity
- Provides direct mechanistic evidence that AIs harm metabolic health
- **Supports the "safer use" model's ratio-based estrogen management vs AI use**

**PMID: 11397860** — "Testosterone Feedback on the HPG Axis Requires Aromatization" (2001)
- Estrogen (not just testosterone) is the primary driver of HPG negative feedback in men
- Low estrogen → HPG axis dysregulation even with adequate testosterone
- Key principle: estrogen is not a pure enemy — it is required for HPG feedback, bone density, cardiovascular health, neuroprotection, and anabolism in the presence of androgens

### Scientific Assessment

- The "safer use model" (ratio management instead of AIs) is well-supported by the evidence.
- **⚠️ However, some individuals with E2 >80-100 pg/mL on supraphysiological doses may require short-term AI use** — completely avoiding AIs is a reasonable heuristic but not universally correct. Feature should log E2 values and surface guidelines based on magnitude, not a blanket "never use AI" rule.
- Estrogen's synergistic role in anabolism (as discussed in `02-mike-israetel-peter-attia-anabolics.md`) is scientifically confirmed.

---

## Topic 6 — HPTA Recovery, Off-Ramp & PCT

### Key Papers

**PMC10640727** — "Post-Cycle Therapy Survey: 470 Male AAS Users" (2023)
- PCT users had significantly reduced withdrawal symptoms vs no-PCT users
- PCT users had higher endogenous testosterone at 3 months post-cessation
- Most common PCT: clomiphene (Clomid) ± tamoxifen; hCG used by ~30%

**PMC10555369** — "PCT Associated with Increased Probability of Hormonal Normalization" (2023)
- PCT use associated with increased probability of LH/FSH/testosterone normalization within 6 months
- Confirms PCT is beneficial for HPTA recovery — not merely anecdotal

**PMID: 41147237** — "Post-Cycle Therapy After Short-Term AAS Use" (2025)
- Short-term AAS (4-8 weeks) still causes significant HPTA suppression
- PCT with SERMs (tamoxifen/clomiphene) accelerates recovery
- Spermatogenesis recovery: hCG + FSH most effective

**PMC4988681** — "Persistent Hypogonadism in Former AAS Abusers" (2016)
- 27.2% of former AAS users had persistent hypogonadism (low T + symptoms) at study entry
- Duration of prior AAS use and total dose correlated with persistence
- Some individuals required lifelong TRT after cessation

**PMID: 24636400** — "AAS-Induced Hypogonadism: Diagnosis and Treatment" (2014, J Steroid Biochem Mol Biol)
- Clinical framework for diagnosing and managing post-AAS hypogonadism
- Recommends hCG + SERMs as first-line; taper rather than abrupt cessation

**PMID: 25904023** — "hCG-Based Combination PCT for Spermatogenesis Recovery" (2015)
- hCG + FSH combination: 95.9% success rate for spermatogenesis recovery in AAS-induced azoospermia
- Relevant for users concerned about fertility

### Scientific Assessment

- PCT evidence strongly supports its use for HPTA recovery.
- **⚠️ MAJOR DIVERGENCE FROM COACH'S ADVICE:** The coach in `01-coach-video-transcript.md` argues against PCT except for fertility. The literature (PMC10640727, PMC10555369, PMID: 41147237) clearly shows PCT reduces withdrawal symptoms and accelerates hormonal normalization. This is a clinically meaningful divergence — the feature should present evidence-based PCT guidelines, not echo the coach's anti-PCT position.
- **⚠️ 27.2% persistent hypogonadism rate (PMC4988681) is a critical safety data point** — this should be surfaced in the feature's "risk acknowledgment" section, especially for long cycles (>16 weeks) or high-dose protocols.

---

## Topic 7 — Psychological Effects & Mental Health

### Key Papers

**PMC8233285** — "Anabolic-Androgenic Steroids and Aggression: A Systematic Review" (2021)
- Meta-analysis of controlled experimental studies (not just self-report)
- AAS significantly increases self-reported and behavioral measures of aggression
- Effect is dose-dependent; supraphysiological doses produce larger effects
- Individual variation enormous (some users show minimal change)

**PMID: 1391285, PMID: 7830394, PMID: 12762541** — Classic aggression/mood studies (1990-2003)
- Established literature confirming mood and irritability changes on AAS
- "Roid rage" as a real but heterogeneous phenomenon — not universal

**PMC11005876** — "AAS Linked to Depression and Anxiety in Male Bodybuilders" (2024)
- Cross-sectional: AAS users have higher rates of depression and anxiety vs non-users
- Withdrawal phase particularly high risk for depression (due to E2 crash and low endogenous T)
- Muscle dysmorphia (reverse body dysmorphic disorder) strongly associated with AAS use

### Scientific Assessment

- Psychological effects are real, dose-dependent, and individual.
- **⚠️ The coach and source documents do not adequately address the depression risk during the off-phase / post-cycle period.** A cycle management feature should include a "post-cycle mood monitoring" prompt and flag that psychological symptoms 2-8 weeks post-cessation are clinically common.
- Body dysmorphia is underrecognized — if building a protocol feature, include a disclaimer/screening note.

---

## Topic 8 — SARMs (Selective Androgen Receptor Modulators)

### Key Papers

**PMC6039107** — "SARMs as Function-Promoting Anabolic Therapies" (2018, Journal of Cachexia)
- LGD-4033 (Ligandrol): 21-day RCT in healthy men — dose-proportional lean mass gains; dose-dependent suppression of LH/FSH/endogenous testosterone; suppression normalized within 5 weeks of cessation (shorter than traditional AAS)
- Ostarine (Enobosarm): Phase III POWER1/POWER2 trials in cancer cachexia; statistically significant lean mass preservation; not FDA approved
- SARMs: more proportionally tissue-selective than AAS but lower anabolic ceiling

**PMC9647117** — "SARMs as Emerging Liver Toxins" (2022, Pharmacology & Therapeutics)
- Multiple case reports of DILI (drug-induced liver injury) from SARMs, including LGD-4033 and ostarine
- Severity: ranges from transaminase elevation to acute liver failure requiring transplant
- Mechanism: likely direct hepatotoxicity, not 17-alpha alkylation (similar to oral AAS but different pathway)

**PMC12510846** — "SARMs: A Critical Appraisal" (2025)
- Current regulatory status: no SARMs are FDA approved for non-research use
- All available SARMs are from underground labs or research chemical suppliers — no quality guarantee
- At high doses: tissue selectivity diminishes, adverse effects approach traditional AAS

**NCBI Bookshelf NBK619971** — LiverTox: SARMs entry
- Documents accumulating case series of SARM-associated hepatotoxicity
- Clinical monitoring: liver enzymes (ALT/AST) essential during SARM use

### Scientific Assessment

- SARMs have real anabolic effects at moderate doses but carry underappreciated liver toxicity risk and are not FDA approved.
- **⚠️ The "cleaner than steroids" narrative around SARMs is misleading** — liver injury cases are documented and the long-term safety profile is unknown. Feature should present SARMs with explicit unknowns rather than presenting them as a "safer" alternative.
- HPTA suppression does occur with SARMs; shorter recovery than AAS but still requires monitoring.

---

## Topic 9 — Body Composition Outcomes

### Key Papers

**PMID: 29994823** — "Physical Effects of AAS in Exercising Adults: Meta-Analysis" (2018, British Journal of Sports Medicine)
- 21 RCTs included; pooled SMD for strength = 0.27 (95% CI 0.07-0.47)
- Significant lean mass increases across compounds and dose ranges
- Confirms AAS efficacy for strength and hypertrophy in resistance-trained adults

**PMC4160183** — "Long-Term AAS Effects on Skeletal Muscle: Fiber Hypertrophy and Satellite Cells" (2014)
- Former AAS users have significantly higher muscle fiber cross-sectional area and myonuclei count vs non-users, even years after cessation
- "Muscle memory" mechanistic basis: myonuclear accretion from AAS use is long-lasting
- Key finding: these permanent myonuclear gains allow faster re-building if training resumes — the "advantage" persists

**PMID: 8574271** — "Oxandrolone vs Testosterone Enanthate in Body Composition" (1995)
- Oxandrolone (Anavar) reduced abdominal fat more than testosterone enanthate dose-for-dose
- Anavar's fat redistribution effect is specific and tissue-selective

### Scientific Assessment

- AAS efficacy for body composition is strongly supported.
- **⚠️ The myonuclear retention finding (PMC4160183) has anti-doping and ethical implications** — gains from AAS cycles partly persist long after cessation. Features should avoid framing cycles as "temporary" interventions if users are planning to compete in natural sports.

---

## Topic 10 — Injection Frequency & Pharmacokinetics

### Key Papers

**PMC5915615** — "Population PK/PD Modeling of Testosterone Cypionate" (2018)
- Population PK model derived from clinical trial data
- Testosterone cypionate median half-life: 4.05 days (post-hoc analysis; standard pharmacology texts state 8 days — the truth is individual-variable)
- Weekly injections maintain stable serum levels for most men; more frequent injections (2×/week) reduce peak-to-trough swings

**PMC7561367** — "Short-Acting Testosterone: More Physiologic?" (2020)
- Daily subcutaneous testosterone propionate/cypionate mimics diurnal variation better than once-weekly injections
- Morning peaks closer to natural circadian rhythm
- Trade-off: daily injections vs. convenience; compliance burden real

**PMC9925408** — "Long vs. Short-Acting Testosterone: Clinical Comparison" (2022)
- Undecanoate (very long-acting, 12-week interval): lowest peak-to-trough swing; preferred for TRT stability
- For cycle management: shorter esters (propionate, NPP) preferred when wanting quick washout/ability to adjust rapidly
- Ester length choice should match goal: stability preference → longer ester; dose flexibility → shorter ester

### Scientific Assessment

- Daily injections provide more hormonal stability but have higher compliance burden.
- **⚠️ Half-life values in popular culture (e.g., "testosterone cypionate = 8-day half-life") are often over-simplified.** The actual pharmacokinetic half-life in real individuals varies meaningfully (PMC5915615 reports median 4.05 days). Feature should use range-based PK estimates, not single fixed values.
- Ester choice determines washout time — this is critical for designing "when is it safe to do bloodwork post-cycle" calculators.

---

## Summary: Science vs. Coach Advice — Critical Divergences

| Topic | Coach's Claim | Evidence Verdict |
|-------|--------------|-----------------|
| Cycle length | 20-24 weeks optimal | ⚠️ No RCT safety data for >16 weeks; longer = higher persistent hypogonadism risk |
| PCT | Not needed unless fertility concern | ⚠️ WRONG — PCT significantly improves HPTA recovery and reduces withdrawal (PMC10640727, PMC10555369) |
| AI avoidance | Avoid AIs, use ratio management | ✅ CORRECT — well-supported (PMC4870856 confirms AIs reduce insulin sensitivity) |
| Bloodwork | Baseline + mid-cycle + post | ✅ CORRECT — aligns with Endocrine Society guidelines |
| Dose titration / slow start | Start low, escalate | ✅ CORRECT — consistent with individual variation evidence |
| AR upregulation (not down) | More = more AR | ✅ CORRECT — PMID: 15472231 confirms AR upregulation |
| Phlebotomy for high Hct | Implied standard practice | ⚠️ WEAK evidence — PMC11466264 notes phlebotomy for testosterone-induced erythrocytosis lacks RCT support |
| SARMs as "cleaner" option | Not explicitly stated | ⚠️ CAUTION — liver toxicity risk documented; long-term safety unknown |
| Myonuclear retention | Gains persist | ✅ CORRECT — PMC4160183 confirms long-lasting myonuclear accretion |
| Psychological effects | Mentioned but de-emphasized | ⚠️ UNDERWEIGHTED — depression risk post-cycle (PMC11005876) and muscle dysmorphia are clinically significant |

---

## Feature Design Constraints Derived from This Research

1. **Display evidence level** — for any recommendation in the cycle planner, surface whether it's "well-supported (RCT)", "observational", or "expert opinion/practice".
2. **PCT cannot be optional to flag** — always surface PCT evidence when a cycle off-ramp is logged.
3. **27.2% persistent hypogonadism statistic** — must appear in any risk disclosure for long cycles (>12 weeks).
4. **Bloodwork reminders are mandatory** — not optional; tie to cycle phase (baseline, mid, post).
5. **Half-lives for dose timing** — use range values (e.g., cypionate 4-8 days) not single fixed values.
6. **Estrogen management** — recommend ratio management first; flag AI use with metabolic risk note.
7. **SARM disclaimer** — not FDA approved, hepatotoxicity risk, no long-term safety data.
8. **Cardiac risk** — flag echocardiography recommendation for cycles >12 weeks or cumulative >2 years total AAS use.
9. **Psychological monitoring** — include post-cycle mood check prompts (2-8 weeks post-cessation highest risk window).
10. **Individual variation** — no optimal dose or protocol can be prescribed; all recommendations are starting points only.
