"""
Scoring module for the HPC hackathon leaderboard.

Rubric:
  Correctness of analysis       40
  Evidence grounding            25
  Agentic workflow design       20
  HPC/resource efficiency       15
  Total                        100
"""

import json
import re
from pathlib import Path
from typing import Any

from .config import settings

# ---------------------------------------------------------------------------
# Load ground truth once at module level
# ---------------------------------------------------------------------------

_ground_truth: dict = {}
_repo_index: set[str] = set()


def _load_data():
    global _ground_truth, _repo_index
    gt_path = Path(settings.ground_truth_path)
    if gt_path.exists():
        with open(gt_path) as f:
            _ground_truth = json.load(f)
    ri_path = Path(settings.benchmark_repo_index_path)
    if ri_path.exists():
        with open(ri_path) as f:
            data = json.load(f)
            _repo_index = set(data.get("files", []))


_load_data()


def _norm(val: Any) -> str:
    """Normalise a value to lowercase string for comparison."""
    if isinstance(val, bool):
        return str(val).lower()
    if isinstance(val, str):
        return val.strip().lower()
    return str(val).lower()


# ---------------------------------------------------------------------------
# 1. Correctness — 40 points
# ---------------------------------------------------------------------------

def score_correctness(answer: dict, gt: dict) -> tuple[float, list[str]]:
    score = 0.0
    msgs: list[str] = []

    repo_sum = answer.get("repository_summary") or {}
    resource = answer.get("resource_recommendation") or {}
    bottleneck = answer.get("bottleneck_analysis") or {}

    # main_entrypoint — 5 pts
    if "main_entrypoint" in gt:
        val = _norm(repo_sum.get("main_entrypoint", ""))
        accepted = [_norm(a) for a in gt["main_entrypoint"]["accepted"]]
        pts = gt["main_entrypoint"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct main entrypoint (+{pts})")
        else:
            msgs.append(f"Incorrect main entrypoint (expected one of {accepted})")

    # framework — 5 pts
    if "framework" in gt:
        val = _norm(repo_sum.get("framework", ""))
        accepted = [_norm(a) for a in gt["framework"]["accepted"]]
        pts = gt["framework"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct framework (+{pts})")
        else:
            msgs.append(f"Incorrect framework (expected one of {accepted})")

    # workload_type — 3 pts
    if "workload_type" in gt:
        val = _norm(repo_sum.get("workload_type", ""))
        accepted = [_norm(a) for a in gt["workload_type"]["accepted"]]
        pts = gt["workload_type"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct workload type (+{pts})")
        else:
            msgs.append("Incorrect workload type")

    # model_family — 3 pts
    if "model_family" in gt:
        val = _norm(repo_sum.get("model_family", ""))
        accepted = [_norm(a) for a in gt["model_family"]["accepted"]]
        pts = gt["model_family"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct model family (+{pts})")
        else:
            msgs.append("Incorrect model family")

    # dataset_type — 3 pts
    if "dataset_type" in gt:
        val = _norm(repo_sum.get("dataset_type", ""))
        accepted = [_norm(a) for a in gt["dataset_type"]["accepted"]]
        pts = gt["dataset_type"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct dataset type (+{pts})")
        else:
            msgs.append("Incorrect dataset type")

    # uses_gpu — 2 pts
    if "uses_gpu" in gt:
        val = repo_sum.get("uses_gpu")
        pts = gt["uses_gpu"]["points"]
        if val is True:
            score += pts
            msgs.append(f"Correctly identified GPU usage (+{pts})")
        else:
            msgs.append("Did not identify GPU usage")

    # primary_bottleneck — 8 pts
    if "primary_bottleneck" in gt:
        val = _norm(bottleneck.get("primary_bottleneck", ""))
        accepted = [_norm(a) for a in gt["primary_bottleneck"]["accepted"]]
        pts = gt["primary_bottleneck"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct primary bottleneck (+{pts})")
        else:
            msgs.append(f"Incorrect primary bottleneck (expected one of {accepted})")

    # recommended_gpu_count — 5 pts
    if "recommended_gpu_count" in gt:
        val = resource.get("gpu_count")
        accepted = gt["recommended_gpu_count"]["accepted"]
        pts = gt["recommended_gpu_count"]["points"]
        if val in accepted:
            score += pts
            msgs.append(f"Correct GPU count recommendation (+{pts})")
        else:
            msgs.append(f"Incorrect GPU count (expected one of {accepted})")

    # recommended_cpus_per_task — 3 pts
    if "recommended_cpus_per_task" in gt:
        val = resource.get("cpus_per_task")
        lo = gt["recommended_cpus_per_task"]["min"]
        hi = gt["recommended_cpus_per_task"]["max"]
        pts = gt["recommended_cpus_per_task"]["points"]
        if val is not None and lo <= val <= hi:
            score += pts
            msgs.append(f"Correct CPUs per task ({val}) (+{pts})")
        else:
            msgs.append(f"CPUs per task out of expected range [{lo},{hi}]")

    # time_limit — 2 pts (parse HH:MM:SS → minutes)
    if "recommended_time_limit_minutes" in gt:
        tl = resource.get("time_limit", "")
        total_min = _parse_time_limit_minutes(tl)
        lo = gt["recommended_time_limit_minutes"]["min"]
        hi = gt["recommended_time_limit_minutes"]["max"]
        pts = gt["recommended_time_limit_minutes"]["points"]
        if total_min is not None and lo <= total_min <= hi:
            score += pts
            msgs.append(f"Reasonable time limit (+{pts})")
        else:
            msgs.append("Time limit outside expected range")

    return round(score, 2), msgs


def _parse_time_limit_minutes(tl: str) -> float | None:
    """Parse HH:MM:SS or MM:SS → total minutes."""
    if not tl:
        return None
    parts = tl.strip().split(":")
    try:
        if len(parts) == 3:
            return int(parts[0]) * 60 + int(parts[1]) + int(parts[2]) / 60
        if len(parts) == 2:
            return int(parts[0]) + int(parts[1]) / 60
    except ValueError:
        pass
    return None


# ---------------------------------------------------------------------------
# 2. Evidence grounding — 25 points
# ---------------------------------------------------------------------------

def score_evidence(answer: dict, gt: dict, repo_index: set[str]) -> tuple[float, list[str]]:
    score = 0.0
    msgs: list[str] = []

    evidence_list: list[dict] = answer.get("evidence") or []
    cited_files = {e.get("source_file", "") for e in evidence_list if e.get("source_file")}

    # Required evidence files — up to 7 pts
    required: list[str] = gt.get("required_evidence_files", [])
    if required:
        per_file_pts = 7.0 / len(required)
        for req_file in required:
            if req_file in cited_files:
                score += per_file_pts
                msgs.append(f"Evidence cites required file: {req_file}")
            else:
                msgs.append(f"Missing evidence for: {req_file}")
        score = min(score, 7.0)

    # Valid source files (exist in repo index) — up to 6 pts
    if repo_index:
        valid_citations = [f for f in cited_files if f in repo_index]
        invalid_citations = [f for f in cited_files if f not in repo_index]
        if cited_files:
            validity_ratio = len(valid_citations) / len(cited_files)
            file_pts = round(6.0 * validity_ratio, 2)
            score += file_pts
            if file_pts > 0:
                msgs.append(f"Valid source file citations: {len(valid_citations)}/{len(cited_files)} (+{file_pts})")
            if invalid_citations:
                msgs.append(f"Hallucinated/invalid files cited: {invalid_citations}")
        else:
            msgs.append("No evidence citations found")

    # Claim-evidence consistency (confidence field) — up to 5 pts
    high_conf = sum(1 for e in evidence_list if _norm(e.get("confidence", "")) == "high")
    if evidence_list:
        conf_ratio = min(high_conf / max(len(evidence_list), 1), 1.0)
        conf_pts = round(5.0 * conf_ratio, 2)
        score += conf_pts
        msgs.append(f"High-confidence evidence items: {high_conf}/{len(evidence_list)} (+{conf_pts})")
    else:
        msgs.append("No evidence items found")

    # No forbidden claims — up to 5 pts
    forbidden: list[str] = gt.get("forbidden_claims", [])
    raw_text = json.dumps(answer).lower()
    found_forbidden = [f for f in forbidden if f.lower() in raw_text]
    if not found_forbidden:
        score += 5.0
        msgs.append("No forbidden claims found (+5)")
    else:
        msgs.append(f"Forbidden claims found: {found_forbidden}")

    # artifact_type diversity — up to 2 pts
    artifact_types = {e.get("artifact_type") for e in evidence_list if e.get("artifact_type")}
    if len(artifact_types) >= 2:
        score += 2.0
        msgs.append("Diverse artifact types cited (+2)")
    else:
        msgs.append("Limited artifact type diversity")

    return round(min(score, 25.0), 2), msgs


# ---------------------------------------------------------------------------
# 3. Agentic workflow design — 20 points
# ---------------------------------------------------------------------------

def score_workflow(metadata: dict, trace: dict) -> tuple[float, list[str]]:
    score = 0.0
    msgs: list[str] = []
    max_score = 20.0

    workflow_mode = (metadata.get("workflow_mode") or "").lower()
    num_agents = metadata.get("num_agents") or 0
    models_used = metadata.get("models_used") or []
    model_roles = metadata.get("model_roles") or []
    has_aggregator = metadata.get("has_aggregator", False)
    has_verifier = metadata.get("has_verifier", False)
    llm_calls = metadata.get("llm_calls") or 0

    parallel_groups = (trace.get("parallel_groups") or []) if trace else []
    verification = (trace.get("verification") or {}) if trace else {}
    verification_ran = verification.get("ran", False)

    # Decomposition — 5 pts
    if num_agents >= 4:
        score += 5.0
        msgs.append("Meaningful agent decomposition (>=4 agents) (+5)")
    elif num_agents >= 2:
        score += 2.5
        msgs.append("Partial decomposition (2-3 agents) (+2.5)")
    else:
        msgs.append("Insufficient agent decomposition")

    # Parallel sub-agents — 5 pts
    if workflow_mode == "parallel" and len(parallel_groups) >= 1:
        # Check at least one group has >=2 agents
        has_real_parallel = any(
            len(g.get("agents") or []) >= 2 for g in parallel_groups
        )
        if has_real_parallel:
            score += 5.0
            msgs.append("Genuine parallelism demonstrated (+5)")
        else:
            score += 2.0
            msgs.append("Parallel mode set but groups have <2 agents (+2)")
    elif workflow_mode == "parallel":
        score += 2.0
        msgs.append("Parallel mode set (+2)")
    else:
        msgs.append("Sequential workflow mode (no parallel bonus)")
        max_score = min(max_score, 12.0)

    # Multi-model routing — 3 pts
    if len(models_used) >= 2 and model_roles:
        score += 3.0
        msgs.append("Multi-model routing with roles (+3)")
    elif len(models_used) >= 2:
        score += 1.5
        msgs.append("Multiple models used, no roles defined (+1.5)")
        max_score = min(max_score, 17.0)
    else:
        msgs.append("Single model used (no model routing)")
        max_score = min(max_score, 17.0)

    # Aggregator — 3 pts
    if has_aggregator:
        score += 3.0
        msgs.append("Aggregator agent present (+3)")
    else:
        msgs.append("No aggregator agent")
        max_score = min(max_score, 17.0)

    # Verifier — 4 pts
    if has_verifier or verification_ran:
        score += 4.0
        msgs.append("Verifier/consistency check present (+4)")
    else:
        msgs.append("No verifier")
        max_score = min(max_score, 16.0)

    # Overuse penalties
    if llm_calls > 60:
        max_score = min(max_score, 14.0)
        msgs.append("LLM call count > 60 (capped at 14)")
    if num_agents > 12:
        max_score = min(max_score, 14.0)
        msgs.append("Agent count > 12 (capped at 14)")

    final = round(min(score, max_score), 2)
    return final, msgs


# ---------------------------------------------------------------------------
# 4. HPC/resource efficiency — 15 points
# ---------------------------------------------------------------------------

def score_efficiency(metadata: dict) -> tuple[float, list[str]]:
    score = 0.0
    msgs: list[str] = []

    runtime = metadata.get("runtime_sec")
    llm_calls = metadata.get("llm_calls")
    input_tokens = metadata.get("estimated_input_tokens") or 0
    output_tokens = metadata.get("estimated_output_tokens") or 0
    total_tokens = input_tokens + output_tokens
    models_used = metadata.get("models_used") or []
    model_roles = metadata.get("model_roles") or []

    # Runtime — max 5 pts
    if runtime is not None:
        if runtime <= 300:
            score += 5.0
            msgs.append("Excellent runtime (<=300s) (+5)")
        elif runtime <= 600:
            score += 3.0
            msgs.append("Good runtime (<=600s) (+3)")
        elif runtime <= 900:
            score += 1.0
            msgs.append("Acceptable runtime (<=900s) (+1)")
        else:
            msgs.append(f"Runtime too long ({runtime:.0f}s)")
    else:
        msgs.append("No runtime reported")

    # LLM calls — max 4 pts
    if llm_calls is not None:
        if llm_calls <= 20:
            score += 4.0
            msgs.append(f"Efficient LLM calls ({llm_calls}) (+4)")
        elif llm_calls <= 40:
            score += 2.0
            msgs.append(f"Moderate LLM calls ({llm_calls}) (+2)")
        elif llm_calls <= 60:
            score += 1.0
            msgs.append(f"High LLM calls ({llm_calls}) (+1)")
        else:
            msgs.append(f"Excessive LLM calls ({llm_calls})")
    else:
        msgs.append("No LLM call count reported")

    # Token usage — max 3 pts
    if total_tokens > 0:
        if total_tokens <= 50_000:
            score += 3.0
            msgs.append(f"Low token usage ({total_tokens:,}) (+3)")
        elif total_tokens <= 100_000:
            score += 2.0
            msgs.append(f"Moderate token usage ({total_tokens:,}) (+2)")
        elif total_tokens <= 150_000:
            score += 1.0
            msgs.append(f"High token usage ({total_tokens:,}) (+1)")
        else:
            msgs.append(f"Very high token usage ({total_tokens:,})")
    else:
        msgs.append("No token usage reported")

    # Model choice — max 3 pts
    if len(models_used) >= 2 and model_roles:
        score += 3.0
        msgs.append("Clear small/medium model routing (+3)")
    elif len(models_used) >= 2:
        score += 2.0
        msgs.append("Multiple models, weak routing (+2)")
    elif len(models_used) == 1:
        score += 1.0
        msgs.append("Single model used (+1)")
    else:
        msgs.append("No model metadata")

    return round(min(score, 15.0), 2), msgs


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def score_submission(submission: dict) -> tuple[dict, list[str]]:
    """Score a full submission dict. Returns (breakdown_dict, all_messages)."""
    answer = submission.get("answer") or {}
    metadata = submission.get("workflow_metadata") or {}
    trace = submission.get("trace_summary") or {}

    c_score, c_msgs = score_correctness(answer, _ground_truth)
    e_score, e_msgs = score_evidence(answer, _ground_truth, _repo_index)
    w_score, w_msgs = score_workflow(metadata, trace)
    ef_score, ef_msgs = score_efficiency(metadata)

    total = round(c_score + e_score + w_score + ef_score, 2)

    breakdown = {
        "correctness": c_score,
        "evidence": e_score,
        "workflow": w_score,
        "efficiency": ef_score,
        "total": total,
    }

    all_msgs = c_msgs + e_msgs + w_msgs + ef_msgs
    return breakdown, all_msgs
