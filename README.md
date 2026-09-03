

## Connect Google Sheets

1. Upload outputs/eusun-han-lab/Eusun-Han-Lab-content-template.xlsx to Google
   Drive and open it as a Google Sheet.
2. In Google Sheets, choose **File → Share → Publish to web** and publish the
   entire document. Keep edit access restricted to the lab team.
3. Copy the ID between /d/ and /edit in the Sheet URL.
4. Put it in .env.local:

   ~~~dotenv
   GOOGLE_SHEET_ID=your_sheet_id_here
   ~~~

5. Restart npm run dev. Further Sheet edits appear after refreshing a page.

The tab names and header names must stay unchanged. Rows with visible=FALSE
are hidden; blank or TRUE rows are shown. Use a real date in the News month
column and format it as mmm yyyy. Images must use publicly accessible http://
or https:// URLs.

## Content tabs

| Tab | Row-one headers |
| --- | --- |
| Settings | key, value |
| News | month, content, link_label, link_url, visible |
| Professor | name, secondary_name, photo_url, title, affiliation, email, personal_url, cv_url, scholar_url, bio, visible |
| ProfessorDetails | section, display_order, content, subtext, link_label, link_url, visible |
| Students | group, display_order, name, secondary_name, photo_url, status, affiliation, email, personal_url, cv_url, scholar_url, research_topics, visible |
| Alumni | display_order, name, secondary_name, photo_url, degree, period, current_position, personal_url, visible |
| Research | display_order, title, summary, details, image_url, image_alt, link_label, link_url, visible |
| Publications | category, year, display_order, venue, title, authors, paper_url, project_url, code_url, video_url, visible |

Long text is plain text. Put each paragraph on a new line; HTML and Markdown are
intentionally not rendered.

The Students group column accepts any text. Group sections appear in the order
their names first occur in the sheet; display_order sorts members within each
group.

Publication category sections also appear in the order their names first occur
in the sheet. Publications within a category are sorted by year and then by
display_order.

## Deploy to Vercel

1. Push this project to a Git repository and import it from the Vercel dashboard.
2. Keep the automatically detected **Next.js** framework preset and default
   build settings.
3. Add `GOOGLE_SHEET_ID` under **Project Settings → Environment Variables** for
   Production and Preview.
4. Deploy. After changing an environment variable, redeploy the project.

The Google Sheet must be published to the web. The server reads it with
`cache: no-store`, so published content updates appear on page refresh without
rebuilding the site.

## Checks

~~~bash
npm run build
node --test tests/*.test.mjs
~~~

Vercel deployment and custom-domain assignment are performed from the Vercel
dashboard and are not run automatically by this repository.
