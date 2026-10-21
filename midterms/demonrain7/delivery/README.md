AI-use disclosure: Codex prepared this delivery template and documentation on October 21, 2026; course installation is complete; hosted execution is recorded separately.

# Course delivery staging

This directory contains the prepared course-workflow template for the October 21 midterm hand-in rules. It is not a course submission and is not active CI here.

Copy `midterm-demonrain7.yml` to the course repository's `.github/workflows/` only after placing the complete permitted project under `midterms/demonrain7/`. The course diff must contain only that folder and this single workflow. Keep dependency manifests, ignore rules and configuration inside the student folder.

Follow [the completion plan](../docs/MIDTERM_PLAN.md) and [submission checklist](../docs/SUBMISSION.md). Audit original-resource permissions, private evidence, paths and package scripts before public export. Preserve the existing course checkout's unrelated uncommitted work by using an isolated checkout.

The template reuses the existing deterministic native, browser and player checks with a project-specific working directory. It makes no live model requests and uses no secrets. A local structural check does not establish that this workflow has run in the course repository; record actual course CI results after the PR exists.

The source is now in the isolated course branch `demonrain7/midterm` and the
root workflow is installed. This copy remains a template; the old nested
`.github/workflows/checkpoint.yml` is retained development history and does not
run as a second course workflow. Continue submission work on the course branch.
