# Instructor Guide

This document provides guidance for running a live event using the `hpc-summer-school-leaderboard` and the companion student repository.

## Overview
- **Recommended duration**: 3–4 hours.
- **Recommended team size**: 4 students.
- **Target students**: Undergraduate or early-stage HPC/AI learners.

## Recommended Pre-labs
Before the main event, students should be comfortable with:
- Basic Slurm usage.
- Containers and LLM serving overview.
- Running and understanding the starter workflow walkthrough.

## Before Event Checklist
- [ ] Prepare Slurm/GPU environment or configure mock/offline mode.
- [ ] Deploy the leaderboard system (see [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)).
- [ ] Generate fresh team IDs and random tokens.
- [ ] Choose the question sets (public, private, or custom).
- [ ] Share the [student repository](https://github.com/hpcc-hcmut/hpc-school-mini-hackathon) with participants.
- [ ] Test one baseline submission end-to-end to ensure the scoring backend and leaderboard are functioning correctly.

## During Event
- **Distribute Credentials**: Hand out team IDs and tokens securely.
- **Initial Verification**: Ask students to run a mock or baseline submission first to confirm their setup is working.
- **Mentorship**: Encourage teams to iterate on prompts, routing, batching, context selection, and verifier behavior to improve their scores.
- **Moderation**: Use the admin tools on the leaderboard frontend to hide test submissions or broken runs.

## After Event
- **Review**: Go over the top submissions with the class.
- **Discussion**: Discuss evidence quality, grounding, and compare different agentic workflow designs.
- **Archiving**: Archive only anonymized results. Do not keep raw student data or unanonymized leaderboard exports.
