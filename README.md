## aura

aura is a platform for elite writers realize their creativity with intentional readers.

### why?

why not? i wanted to build it

### how to run it

```yarn```
```yarn dev```

### terminologies to use

use the following alternatives instead:

- writer => author
- reader => patron
- comments => critiques
- likes => appreciations

### features

features are drawn from community feedback (writers and patrons on reddit) and split by priority.

#### principles

these aren't features, they're the stance every feature has to respect:

- **free at the core** — reading, writing, critiquing and discovery are never paywalled. no paying to promote. cosmetics can be paid.
- **no ads.**
- **human-made** — the platform is not built on or run by generative ai, and ai-generated works are disclosed, never promoted.
- **clear, stable policies** — content policy and terms are short, readable, easy to find, and enforced consistently. decide what aura allows on day one and don't drift.
- **lightweight** — fast on old devices, no overheating, nothing breaks across os/browser updates.
- **authors over metrics** — discovery should reward quality and give new authors a fair shot, not just amplify whatever is already most viewed.

#### p0 — must have (launch)

- **tagging system** — genre, sub-genre, tropes and content warnings on every work. powers search, recommendations and filtering. *(in progress)*
- **mandatory content ratings & warnings** — works tagged by rating (general / teen / mature / explicit) and warnings (violence, sexual content, dark themes, "dead dove"). mis-tagged works can be reported.
- **mature content toggle** — explicit works are hidden by default; patrons opt in to see them. keeps mature content from flooding general listings without censoring authors.
- **ai disclosure tag** — authors must declare ai-assisted or ai-generated text and covers.
- **home page discovery views** — fresh releases, most appreciated, most read, most critiqued. "most viewed" alone is not trending.
- **genre-scoped trending** — trending per genre group (contemporary romance, dark fiction, dark romance, paranormal/fantasy, crime/thriller/mystery, psychological, …) so one dominant genre can't bury the rest.
- **new author exposure** — a dedicated slot/shelf for debut and low-read works.
- **critiques & star ratings** — constructive feedback is the core loop between authors and patrons. *(exists)*
- **reading list** *(exists)*
- **reliable editor** — autosave, no draft expiry, no silent data loss. writing on aura must be safe.

#### p1 — should have (soon after launch)

- **bulk import** — import an entire library (docx, markdown, google docs, …) in one action, not one file at a time. most authors already have work ready to post.
- **bulk export** — export all works and drafts to common formats in one click. authors own their work.
- **weighted patron ratings** — the more a patron reads and critiques, the more weight their ratings carry.
- **community ai flagging** — trusted, high-activity patrons can flag a work as suspected ai and warn others; flags go to human review.
- **separate block and mute** — mute hides someone from you; block stops them interacting with you.
- **spellcheck that cooperates** — never override the browser/device spellcheck or its correction popup.
- **human support** — a real, reachable person for bugs and account issues, with visible follow-up.

#### p2 — nice to have

- **multi-drafts** — publish several versions of the same chapter as labelled drafts so patrons can see an author's process, and rewrites never mean losing old words.
- **inline annotations** — footnote-style tooltips on words/terms (glossary, lore, translations) that open a small info box instead of navigating away.
- **top patron recognition** — badges, early access and featured critiques for the most active patrons.
- **community-driven curation** — patron votes/approvals feed into featured lists (e.g. no ai-generated covers on featured shelves).
- **reader / author modes** — patrons get a clean reading-only interface; authors get the writing workspace on top.

#### p3 — later / exploring

- **patron tips** — small, optional tips to authors (like stream bits). never gating content.
- **optional paid works** — let authors choose to monetize specific works; free remains the default.
- **native mobile app** — web first. an app must deal with app store content rules, which conflict with mature content, so this needs a clear plan before it happens.

#### not doing

- social feed / timeline — keep the focus on works and critiques, not engagement farming.
- pay-to-promote or pay-to-read basic features.
