# VIS_010 Evaluation Report

Date: 2026-08-11
Suite: `src/lib/opportunity-engine.test.ts`

## Coverage

The regression set contains 60 English and Spanish scenarios across:

- broad AI exploration;
- WhatsApp operations;
- support automation;
- knowledge assistants;
- document workflows;
- sales and CRM;
- data intelligence;
- custom products;
- partners;
- existing clients.

Separate control tests cover schema validation, auditable consent, the 100-point deterministic ceiling, high-risk human routing, bilingual service-route validity and treating prompt-injection text as untrusted content rather than an instruction.

## Current acceptance boundary

The deterministic classifier is a safe launch fallback, not a claim of natural-language coverage. It is intended to be transparent and conservative. Before model-assisted routing is enabled, an owner-approved threshold must be recorded for the same frozen evaluation set, expanded with real anonymised failure cases, and compared through traced runs.

The final score is always computed by application code. A future model may return structured evidence or an intent candidate, but it may not set the total, bypass risk routing, send follow-up, confirm a booking, publish pricing, create a proposal or make a delivery commitment.
