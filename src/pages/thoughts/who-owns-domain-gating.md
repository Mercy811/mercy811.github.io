---
layout: ../../layouts/Note.astro
title: Who should stop analytics from running on the wrong domain?
description: Copied browser snippets expose a boundary between customer configuration and platform responsibility.
date: September 2026
---

A browser analytics token is public by design. It ships to every visitor, so a copied snippet can send plausible-looking events from a site the customer does not own. The immediate symptom is polluted data. The more interesting question is architectural: **who should prevent it?**

One established answer is “the customer.” A Google Tag Manager rule can fire an analytics tag only when `Page Hostname` matches an approved domain. That is a sensible first line of defense, and it is close to how many browser analytics systems have historically allocated responsibility.

But it is not the whole industry story.

## Three places to enforce the boundary

The available controls fall into three layers:

1. **Customer-side gating.** GTM triggers or application code decline to initialize the SDK on an unexpected hostname.
2. **Vendor-side configuration.** The analytics product provides a project-level domain allowlist or filters unwanted hostnames.
3. **Customer-controlled collection.** A first-party proxy or edge worker validates and forwards requests to the vendor.

Google supports hostname conditions in GTM and hostname data filters in GA4. Fullstory provides centrally managed domain capture settings. Pendo supports server-host and domain include lists. Sentry rejects browser telemetry from disallowed origins. Mixpanel and Segment, by contrast, do not appear to document an equivalent first-class Browser SDK allowlist; their public client identifiers cannot act as secrets.

This means “customers should configure their tags correctly” is common practice, but “this is entirely a customer problem” is too broad.

## Same-domain is the wrong rule

An SDK cannot simply send events only to the same domain. Browser analytics intentionally sends from a customer site to a vendor collection endpoint. A real deployment may also span production domains, subdomains, staging environments, embedded webviews, and localhost.

The better abstraction is an **allowlist of page origins**, not a same-origin transport requirement.

A robust model would combine:

- a remotely configured hostname allowlist;
- a local SDK check to stop accidental execution early;
- ingestion enforcement using trustworthy request context where available;
- a customer-owned proxy for stricter validation;
- alerts when a new or unusually high-volume page domain appears; and
- no billable consumption for rejected traffic.

Client-side checks are useful guardrails, not authentication. A determined sender can modify the SDK or call a public ingestion API directly. Server-side enforcement is stronger, though browser headers still do not prove the origin of every possible request.

## The product principle

The best boundary is defense in depth. Customers should control where their tag fires, and analytics platforms should make the safe configuration easy, visible, and centrally enforceable.

The broader lesson extends beyond domain gating: when many customers must independently rediscover and implement the same defensive rule, that repeated work is evidence of a missing product primitive.

### Further reading

- [Google Tag Manager triggers](https://support.google.com/tagmanager/answer/7679316?hl=en)
- [GA4 data filters](https://support.google.com/analytics/answer/13296761?hl=en)
- [Fullstory domain capture controls](https://help.fullstory.com/hc/en-us/articles/360020827533-Can-I-disable-data-capture-for-a-specific-domain)
- [Pendo include and exclude lists](https://support.pendo.io/hc/en-us/articles/360032209171-Exclude-and-include-lists)
- [Sentry event outcomes](https://docs.sentry.io/product/stats/)
- [Amplitude domain proxy](https://www.amplitude.com/docs/analytics/domain-proxy)
