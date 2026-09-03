---
layout: ../../layouts/Note.astro
title: Analytics is less about events than state transitions
description: Why reliable analytics starts with lifecycle and state, not a tracking call.
date: September 2026
---

Most analytics examples begin with a call: `track("something happened")`. In production, the harder question is rarely how to make that call. It is deciding when “something” became true—and whether the system will still be alive when we finally know.

Engaged dwell time is a useful example. The value is incomplete while a page is open. It becomes final when the visitor leaves, but departure is exactly when the browser starts tearing the page down. If the model depends on one final client request, the most valuable transition is also the least reliable one.

## Move the responsibility

The engaged-dwell POC treats the browser as a source of fresh state rather than the authority that closes the record. While the page is active, it sends a heartbeat containing the latest snapshot. A delayed service replaces the previous snapshot and moves its expiry forward.

When heartbeats stop, time—not an unload handler—performs the final transition. The service flushes the last known snapshot into ingestion. Nothing special has to succeed during teardown.

That reframing generalizes:

- Identify the state whose final value matters.
- Decide which transition makes that value final.
- Ask whether the component observing the transition can reliably report it.
- If not, move finalization to a component that survives the transition.

## Events are evidence

This is why I increasingly think of analytics events as evidence emitted by a state machine. The schema is important, but lifecycle ownership is what makes the data trustworthy.

The practical benefit is not only fewer dropped events. A state-based model makes retries, deduplication, replacement, and timeout behavior explicit. Those are the details that turn plausible numbers into defensible ones.

[Open the engaged dwell POC →](https://mercy811.github.io/amplitude-engaged-dwell-poc/)
