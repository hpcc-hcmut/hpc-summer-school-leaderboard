# Scoring Guide

This release documents the behavior in `backend/app/scoring.py`.

## Final score

The scorer first calculates the legacy categories, then rebalances them and adds
question-level QA:

```text
final = QA (40)
      + correctness × 25/40
      + evidence × 15/25
      + workflow × 12/20
      + efficiency × 8/15
      - runtime penalty
```

The result is floored at zero. `legacy_score` (the unrebalanced 40/25/20/15 sum),
`qa_score`, `final_score`, and per-question `qa_details` are retained for audit.

## QA component (40 points)

Points are divided equally across the configured QA ground-truth questions. For
each question, 70% is awarded when the normalized submitted answer contains the
expected answer or an accepted alternative; 30% is awarded when at least one
submitted evidence path matches a required evidence file.

## Legacy components before rebalancing

- Correctness (40): repository summary, bottleneck, and resource recommendation.
- Evidence (25): required and valid files, confidence, forbidden-claim check, and
  artifact-type diversity.
- Workflow (20): decomposition, demonstrated parallel groups, model routing,
  aggregator, verifier, and caps for excessive agents/calls.
- Efficiency (15): runtime, LLM calls, token estimates, and model routing.

## Runtime rule

Efficiency receives its five runtime points only at 300 seconds or less. The
final score also receives a separate penalty: 15 points above 300 through 600
seconds, 25 points above 600 through 900 seconds, and 35 points above 900 seconds.

Instructors who change scoring must update the implementation and this guide
together before distributing the assignment.
