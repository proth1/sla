# Draft Email: Shane — OneTrust Integration Follow-Up

**Status**: Draft (pending review)
**Date**: 2026-03-06
**To**: Shane (Risk Management Lead)
**Re**: OneTrust integration follow-up from TPRM deep dive

---

Hi Shane,

Thanks again for the deep dive on Thursday — the walkthrough of the RAE and due diligence process was incredibly helpful, especially understanding how the 80-question risk assessment drives the inherent risk tier and determines the level of due diligence required. That risk-tiered routing is exactly the kind of logic we want to preserve and build on.

We've been thinking about how to connect the dots between the onboarding workflow we're designing and what your team is already doing in OneTrust. Rather than replacing anything, the goal would be to automate the handoffs — so when a request reaches the point where a risk assessment is needed, the right OneTrust assessment kicks off automatically, and when it's done, the results flow back into the process to drive the next step.

To figure out what's realistic, we have a few technical questions:

**OneTrust Access & Licensing**
- Do you know if API access is enabled on our OneTrust instance? That would shape whether we can programmatically create assessments and pull results back.
- Which modules are we licensed for — Assessment Automation, Third-Party Risk Management, or both? This determines the integration approach.

**Assessment Automation**
- When the RAE is completed and a risk tier is assigned, is that output available as structured data (e.g., a score or tier field we could query), or is it more of a manual interpretation from the questionnaire responses?
- For the 830-question vendor DD questionnaire — is there a way to get notified when a vendor completes it (webhook, email trigger), or would we need to poll for status?

**Contract Deviation Tracking**
- You mentioned contract deviations and control gaps are documented in OneTrust. Are those linked back to the original assessment, or tracked separately? Understanding that connection would help us design the right data flow for the contracting phase.

We also want to circle back on the shift-left idea you were enthusiastic about — giving business owners a lightweight way to self-assess risk upfront before the formal RAE. If we can pre-populate some of the RAE fields based on what they provide early on, that could help close the gap between your 14-day target and the 28-29 day reality.

Would be great to grab 30 minutes to talk through the technical side. We're happy to work around your schedule.

Thanks,
Paul
