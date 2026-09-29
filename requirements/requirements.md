# Smart Energy GB — prototype requirements (V1)

Source: ClerksWell phase 1 review of smartenergygb.org and five comparator sites (28 Sep 2026).
Idea numbers (#nn) refer to the Opportunities page. These are ClerksWell proposals, not
client requirements; Smart Energy GB has not yet reviewed them.

## Global
- R01 A prototype navigator replaces the site header; a previous/next pager replaces the footer.
- R02 Every template works at 320px, 768px and 1024px+.
- R03 All interactive components are keyboard operable and dismissible with Escape (WCAG 2.2 AA target) (#43).
- R04 Shared facts (suppliers, price cap, figures, answers) come from one data source (#13, #20, #30).

## Prototype 1 — Get a smart meter (ideas #1–#7)
- R10 Home / small business switch changes the supplier list and wording (#7).
- R11 The journey is shown as three numbered steps on one page (#3).
- R12 Supplier finder matches misspellings; former suppliers go straight to the supplier that now looks after their customers (#1).
- R13 Choosing a supplier shows a handover card: what to have ready, continue, remind me later (#2).
- R14 Step 2 explains duration, cost and asking for extra help (#3).
- R15 Get-ready checklist that people can copy (#5).
- R16 "Remind me later" email with consent and validation (#6).
- R17 "Which meter do I have?" picture checker with a next step for each meter type (#4).

## Prototype 2 — Is my smart meter working? (ideas #8–#12)
- R20 A guided checker of two or three questions replaces the long troubleshooting page (#8).
- R21 Answers can be changed via the answer trail; "Start again" resets (#8).
- R22 Routes cover the 4G switch up and link to its campaign page (#9).
- R23 RTS meters are described in the present tense, with what to do now (#10).
- R24 A timeline of the first weeks after installation (#11).
- R25 Display help by model (#12).

## Prototype 3 — Energy prices (ideas #13–#16)
- R30 Price cap figures come from one record; "current" and "upcoming" switch on the change date (#13).
- R31 When the next cap isn't announced, the page says so (#13).
- R32 Peak times clock with weekday / weekend and appliance advice (#15).
- R33 Bill estimator with three starting points and two sliders, using the price record (#14).
- R34 Flexibility schemes shown with a review date (#16).

## Prototype 4 — Homepage and campaign template (ideas #9, #20, #37–#39)
- R40 Supplier finder in the hero, linking into prototype 1 (#38).
- R41 Three task doors: get one, got one, something's wrong (#38).
- R42 The current campaign leads, chosen by editors (#9, #37).
- R43 National figures from the DESNZ quarterly statistics, dated (#20).
- R44 A question box that searches the answers (#29).
- R45 Price cap teaser from the price record (#13).
- R46 Owners' stories with their situation (#21).
- R47 Buttons say where they go (#39).
- R48 Campaign landing template: film, one message, one question, steps, FAQs, press link (#37, #9).

## Prototype 5 — Find an answer (ideas #19, #29, #30, #36)
- R50 Site search with suggestions as you type (#29).
- R51 Results show the answer itself; topic chips filter or browse (#29, #30).
- R52 One answer source reused across pages (#30).
- R53 Myths and facts from the same answers (#19).
- R54 "Did this help?" feedback on every answer (#29).

## V3 — from the ClerksWell 2027 roadmap proposal
Source: "ClerksWell x Smart Energy GB 2027 Roadmap Proposal" (project file, 29 Sep 2026). Deck idea in brackets.

### Prototype 1 — Installation journey (Improving installation journey)
- R18 The page is organised as before you book, on the day and after installation, with a tickable checklist per stage, a progress count and a step-by-step view of the day. Supplier agnostic. `?mode=business` opens the business view.

### Prototype 4 — Guided assistant and personalisation (Guided assistant; Project 4 Personalisation)
- R64 A non-AI guided assistant of five questions (meter, home, payment, main concern, age group), on the homepage and from a "Help me find" button on every page.
- R65 Fixed routing from answers to up to four next steps.
- R66 Answers are remembered for the visit; the homepage shows "Picked for you" and moves the most relevant door first.
- R67 Every key interaction pushes a named GA4 event to the dataLayer; an event log shows them when Notes are on (Project 2 Analytics review).

### Prototype 5 — Personalised AI search (Personalised AI search)
- R55 Questions asked in people's own words get a suggested answer built only from Smart Energy GB's answers, with sources and follow-up questions. Simple intent matching stands in for a semantic search service.
- R56 Each myth asks "Did this change your mind?" and records the response (Project 4: tracking on mythbusting).

### Prototype 6 — Real stories (Real user case studies)
- R60 A stories hub filterable by renter, homeowner, older and younger; `?persona=` links in.
- R61 One story template: the worry, what happened, what changed, facts, film, matching answer, and cuts for social and email.
- R62 Short quotes from the live site, tagged where the quote supports it.
- R63 "Share your story" form with consent.

### Prototype 7 — Estimated bills explained (Education through interaction)
- R70 Scenario picker (cold winter, working from home, new baby, moving house) with two sliders.
- R71 Running totals chart of paid versus used, with hover detail, a table view and the catch-up bill, using the shared price record.
- R72 The same months with a smart meter, and a route to get one.

### Not prototyped
- Project 1 Ember implementation, Project 3 CMS AI enhancement (PDF to page, AI metadata, SEO and GA4 reporting agents): back-office or delivery work, outside the public site.
