# SOZO resource organization proposal

Review date: November 5, 2026. **Proposal only: no files were moved or deleted.**

## Inventory findings

The reproducible local inventory covers `attached_assets/` and the website's `public/` tree. It does not inspect account storage, Google Drive folders, hidden image metadata, QR payloads inside screenshots or every historical archive.

| Location | Files | Approximate size | Finding |
| --- | --- | --- | --- |
| Source uploads | 82 | 56.7 MB | Mostly working screenshots, three text notes/logs, two poster images and the original book PDF. Not an organized public resource library. |
| Website public files | 62 | 9.3 MB | Runtime images plus sitemap, robots and routing files. Keep operational files separate from marketing resources. |
| Exact duplicate groups across those two locations | 0 | — | Compared full-file SHA-256, not filenames. Resized, cropped or visually similar files are not detected as exact duplicates. |
| Files with clearly identified QR filenames | 0 | — | No standalone QR-code asset identified by filename. This does not prove that no poster/screenshot contains a QR code. |

Generated evidence:
- `generated-artifacts/owner-review/resource-inventory.csv`: every inventoried path, byte size, SHA-256 and visibility classification.
- `generated-artifacts/owner-review/local-qa.json`: counts, duplicate groups and website link/image findings.

## Specific candidates for organization

| Existing item | Proposed handling |
| --- | --- |
| `attached_assets/The_Perfect_Day_-_Doc_of_Detox_1793828798034.pdf` | Preserve as the original book master, with author/edition recorded. Continue serving the SOZO-approved hosted Drive link; do not copy the 45 MB PDF into the web build. |
| `attached_assets/Sozo_Freedom_Token_Poster_1793826316322.png` | Mark superseded pricing reference. Its 10/20/35-credit prices no longer match the newly approved public packages. Do not publish or reuse as current advertising. |
| `attached_assets/Sozo_Wellness_Pathways_Poster_16x20_preview_1793826316323.jpg` | Retain as pathway-source artwork, but its old pricing footer needs replacement/approval before public reuse. Do not assume a “preview” image is print-ready. |
| `attached_assets/image_1793896748746.png` | Restricted internal price-sheet source. Keep outside public resources. Only the explicitly approved package facts belong in the public catalog; no image, membership offers or handwritten holiday special should be published. |
| Other `attached_assets/image_*.png` screenshots | Working evidence, not customer-facing marketing. Review for contact details/account information before any sharing or archival transfer. Keep originals until approved cleanup. |
| `zipFile.zip` at workspace root (approximately 9.1 MB) | Older handoff archive with copies of source/configuration and old handoff documents. Candidate for dated restricted archive storage, not a new/current launch bundle. Listed only; not extracted, modified, moved or deleted. |
| `public/images/clinic/`, `team/`, `partners/`, `research/` | Existing useful runtime categories; preserve URLs and references. These are not duplicate resources merely because an older ZIP also contains copies. |
| `public/images/clinic/cardio-medbed-lifestyle.webp` and Cardio MedBed article images | Keep working runtime URLs. Link them from a future resource register as web derivatives, not as assumed original print/clinical source masters. |

## Proposed SOZO-owned resource library

Use a restricted SOZO-owned shared document library for masters and staff materials, separate from the website's public files:

```text
SOZO Resources/
  00-Resource-Register/
  01-QR-Codes/
    Approved/
    Retired/
  02-Books/
    Original-Masters/
    Approved-Sharing-Links/
    Cover-Art/
  03-Posters/
    Working/
    Approved-Web/
    Approved-Print/
    Superseded/
  04-Marketing-Materials/
    Campaigns/
    Email/
    Social/
  05-Program-Resources/
    Freedom-Packages/
    Pain-Package/
    Wellness-Pathways/
  06-Cardio-MedBed-Resources/
    Approved-Patient-Resources/
    Research/
    Web-Images/
    Source-Masters/
  90-Internal-Only/
    Staff-Pricing/
    Workflow-Notes/
  99-Archive/
    Superseded/
    Handoff-Archives/
```

“Approved” folders are publication candidates, not automatically public folders. Internal materials must never be copied wholesale into the website's `public/` directory. Large future assets should use approved durable file hosting rather than Git or generated build output.

## Register and naming rules

For each approved resource record: title, category, file/link, owner, version/date, intended audience, approval status, copyright/permission, related program, public destination, and review/retirement date. Keep recipient data and account credentials out of the register.

Suggested names: `sozo-freedom-packages-YYYY-MM-DD-approved-web.png` and `sozo-perfect-day-edition-15-cover.jpg`. A filename alone is not evidence of approval.

For QR codes, also record the decoded destination, associated poster/campaign, print size/version and device-scan result. Use stable approved customer destinations, never a temporary development Preview URL. Confirm the final domain before producing print assets; do not change DNS as part of resource organization.

## Approval and cleanup sequence

1. Owner approves folder structure, access permissions and who maintains the register.
2. Staff identify the actual QR masters and supply any missing Cardio MedBed, poster or program originals.
3. Confirm which posters need revised prices and which may be retired; preserve original sources.
4. Compare hashes before copying, then separately inspect visually similar variants. Do not delete “duplicates” just because names look alike.
5. Move only approved masters/archives; preserve working website asset URLs or update every reference together.
6. Test approved hosted links and QR scans on phones before releasing or reprinting materials.

This task delivers the inventory and proposal. Executing the reorganization, revising poster artwork and producing new QR codes require separate approval.
