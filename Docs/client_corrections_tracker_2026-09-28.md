# Client website corrections tracker

Source: `CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`, received after the client reviewed the live site. The source file is preserved unchanged. Each row needs a local and live check in both languages before closure.

| ID | Client remark | Owner | Acceptance check |
| --- | --- | --- | --- |
| C01 | Remove DRC and Congo references wherever they occur | Marty / SoSo / Dell | No public EN/FR body, metadata, structured data, or live CMS content refers to DRC, Congo, or Congolese education. Historical migrations remain historical. |
| C02 | Homepage trust label: replace “Local publishing team” with “Educational content creators and service providers” | Marty / SoSo | Approved EN text and corresponding FR text appear live. |
| C03 | Homepage opening: “Expanding Minds” and “Enriching lives through knowledge” | Marty / Z / SoSo | Hero heading and supporting line use the client wording in EN and approved French wording in FR; existing CTA remains functional. |
| C04 | Who We Are: replace second paragraph with the Tsinga, Yaoundé and Central African market text | Marty / SoSo | Supplied meaning appears on the homepage in EN and FR, without DRC claims. |
| C05 | Catalogue: separate National Book List titles and other developed titles | Z / SoSo / Dell | Both groups appear with accurate membership and localized headings. No title is represented as officially listed without evidence. |
| C06 | About: replace the second paragraph with the client’s proximity sentence | Marty / SoSo | EN/FR About content matches the approved meaning and has no Congolese education reference. |
| C07 | About: change “Why partners choose us” to “Why choose us”; remove “Local Judgement” | Marty / Z / SoSo | Link and heading match the request in both locales. |
| C08 | Core Identity: use “To enrich lives through knowledge” and the learning-materials statement | Marty / SoSo | Vision and mission fields reflect the agreed order in EN/FR. |
| C09 | Services at a glance: replace three-discipline framing with six services | Z / SoSo | Six offerings render and the old three-discipline claim is gone. |
| C10 | Services introduction: “Every Stage. Every Solution” and supplied lede; move the former opening under Publishing | Marty / Z / SoSo | New introduction and Publishing section render in EN/FR. |
| C11 | Six offerings: Publishing, Tertiary, Cambridge, Reference Books, LoHo coming soon, E-Marketing coming soon | Z / SoSo | All six show correct labels and availability; “coming soon” items do not promise unavailable actions. |
| C12 | Editing: replace service detail with supplied process, seven assessment points, and “Preserve the author's voice. Strengthen the publication.” | Marty / SoSo | Full copy and list render in EN/FR. |
| C13 | Translation: English/French in both directions, supplied service description and audience focus | Marty / SoSo | Full copy renders in EN/FR, without a word-for-word claim presented as the service approach. |
| C14 | Printing: remove the final paragraph beginning “Because production sits…” | SoSo / Dell | Paragraph is absent from local and live EN/FR pages. |
| C15 | Catalogue: show covers only for National Book List titles | Z / SoSo / Dell | Covers are visible only for titles with verified National Book List status; unverified titles have no public cover. |

## Release sequence

1. Marty prepares EN/FR copy and flags claim or wording ambiguity. Z defines the six-service and two-group catalogue presentation. Dell prepares the acceptance matrix.
2. SoSo implements code and CMS changes locally on `main`, preserving unrelated dirty files. The client source DOCX is not edited.
3. Dell verifies each row locally. SoSo releases the verified changes and updates published CMS data as needed. Dell repeats the matrix on the live EN/FR site.
4. Yv closes the board tasks after local and live evidence is recorded. Any unresolved client-dependent item remains open and is named explicitly.

## Client decisions requested

- Which exact titles are on Cameroon’s National Book List? Until verified, the safe rule is to withhold booklist classification and covers for unconfirmed titles.
- Is LoHo an “E-learning product” or an “Elementary product”? The source uses both.
- Is the Core Identity order Vision then Mission, or Mission then Vision?

## Book List evidence found

The [Ministry of Basic Education’s official 2025–2026 list](https://www.minedub.cm/wp-content/uploads/2025/04/MANUELS-SCOLAIRE-2025-2026.pdf) includes **Workbook of English, Class 5** by LONGHORN. This confirms a historical listing for one current catalogue title, but the client still needs to confirm which titles should be presented as listed for the current site. The list does not establish the status of the other three current catalogue titles, and a 2025–2026 listing alone is not treated as proof of current-year status.

## Live geography baseline

Anonymous HTML reads on 2026-09-28 still contain `DRC`, `RDC`, `Congo`, or `Congolese` on every sampled route. Match counts in page source (including metadata): EN home 3, About 3, Services 1, Catalogue 7, Why 2, Contact 1; FR home 3, About 3, Services 1, Catalogue 7, Why 2, Contact 1. Dell should repeat this read after release and expand it to the remaining routes and catalogue details. Counts alone do not prove copy quality; inspect context for each match.
