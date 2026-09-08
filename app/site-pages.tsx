import {
  formatMonth,
  loadAlumni,
  loadNews,
  loadProfessor,
  loadProfessorDetails,
  loadPublications,
  loadResearch,
  loadSettings,
  loadStudents,
} from "./lib/content";
import type { Publication, Student } from "./lib/types";
import {
  ExternalLink,
  FallbackImage,
  Multiline,
  SiteFrame,
} from "./site-components";

function EmptyState({ children }: { children: string }) {
  return <div className="empty-state">{children}</div>;
}

function PageHero({ title }: { title: string }) {
  return (
    <div className="container page-hero">
      <h1>{title}</h1>
    </div>
  );
}

function ProfileLinks({ email, personal, cv, scholar }: {
  email?: string;
  personal?: string;
  cv?: string;
  scholar?: string;
}) {
  return (
    <div className="link-row">
      {email ? <ExternalLink href={`mailto:${email}`}>Email</ExternalLink> : null}
      {personal ? <ExternalLink href={personal}>Personal page</ExternalLink> : null}
      {cv ? <ExternalLink href={cv}>CV</ExternalLink> : null}
      {scholar ? <ExternalLink href={scholar}>Google Scholar</ExternalLink> : null}
    </div>
  );
}

export async function HomePage() {
  const [settingsResult, newsResult] = await Promise.all([loadSettings(), loadNews()]);
  const settings = settingsResult.data;
  const news = newsResult.data;
  const demo = settingsResult.demo || newsResult.demo;

  return (
    <SiteFrame settings={settings} demo={demo} active="home">
      <section className="container">
        <div className={`hero ${settings.hero_image_url ? "" : "no-image"}`}>
          <div>
            <h1>{settings.lab_name}</h1>
            {settings.affiliation ? <p className="affiliation">{settings.affiliation}</p> : null}
            {settings.tagline ? <p className="tagline">{settings.tagline}</p> : null}
            <Multiline text={settings.introduction} />
          </div>
          {settings.hero_image_url ? (
            <div className="hero-media">
              <FallbackImage
                src={settings.hero_image_url}
                alt={`${settings.lab_name} representative image`}
                className="content-image"
              />
            </div>
          ) : null}
        </div>
      </section>
      <section className="section news-section">
        <div className="container">
          <div className="section-heading">
            <h2>News</h2>
          </div>
          {news.length ? (
            <div className="news-list">
              {news.map((item, index) => (
                <article className="news-item" key={`${item.month}-${index}`}>
                  <time className="news-date">{formatMonth(item.month)}</time>
                  <div className="news-content">
                    <p>{item.content}</p>
                    <ExternalLink href={item.link_url} className="text-link">
                      {item.link_label || "Learn more"} →
                    </ExternalLink>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState>No news has been added yet.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}

export async function ProfessorPage() {
  const [settingsResult, professorResult, detailsResult] = await Promise.all([
    loadSettings(),
    loadProfessor(),
    loadProfessorDetails(),
  ]);
  const professor = professorResult.data;
  const details = detailsResult.data;
  const sections = [...new Set(details.map((item) => item.section))];

  return (
    <SiteFrame
      settings={settingsResult.data}
      demo={settingsResult.demo || professorResult.demo || detailsResult.demo}
      active="members"
      memberPage="professor"
    >
      <section className="container profile-hero">
        <FallbackImage
          src={professor.photo_url}
          alt={`${professor.name} portrait`}
          className="profile-image"
        />
        <div className="profile-copy">
          <h1>{professor.name}</h1>
          {professor.secondary_name ? <p className="secondary-name">{professor.secondary_name}</p> : null}
          {professor.title ? <p className="role">{professor.title}</p> : null}
          {professor.affiliation ? <p className="affiliation">{professor.affiliation}</p> : null}
          {professor.bio ? <p className="profile-bio">{professor.bio}</p> : null}
          <ProfileLinks
            email={professor.email}
            personal={professor.personal_url}
            cv={professor.cv_url}
            scholar={professor.scholar_url}
          />
        </div>
      </section>
      <section className="section">
        <div className="container">
          {sections.length ? sections.map((section) => (
            <section className="detail-section" key={section}>
              <h2>{section}</h2>
              <ul className="detail-list">
                {details.filter((item) => item.section === section).map((item, index) => (
                  <li className="detail-item" key={`${item.content}-${index}`}>
                    <p>{item.content}</p>
                    {item.subtext ? <p className="subtext">{item.subtext}</p> : null}
                    <ExternalLink href={item.link_url} className="text-link">
                      {item.link_label || "View"} →
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </section>
          )) : <EmptyState>Professor details will be added soon.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <article className="member-card">
      <FallbackImage
        src={student.photo_url}
        alt={`${student.name} portrait`}
        className="member-image"
      />
      <h3>{student.name}</h3>
      {student.secondary_name ? <p className="member-meta">{student.secondary_name}</p> : null}
      {student.status ? <p className="role">{student.status}</p> : null}
      {student.affiliation ? <p className="member-meta">{student.affiliation}</p> : null}
      {student.research_topics ? <p className="member-meta">{student.research_topics}</p> : null}
      <ProfileLinks
        email={student.email}
        personal={student.personal_url}
        cv={student.cv_url}
        scholar={student.scholar_url}
      />
    </article>
  );
}

export async function StudentsPage() {
  const [settingsResult, studentsResult] = await Promise.all([loadSettings(), loadStudents()]);
  const students = studentsResult.data;
  const groups = [...new Set(students.map((student) => student.group))];

  return (
    <SiteFrame
      settings={settingsResult.data}
      demo={settingsResult.demo || studentsResult.demo}
      active="members"
      memberPage="students"
    >
      <PageHero title="Students" />
      <section className="section">
        <div className="container">
          {groups.length ? groups.map((group) => {
            const members = students.filter((student) => student.group === group);
            return (
              <section className="group-block" key={group}>
                <div className="group-title">
                  <h2>{group}</h2>
                  <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
                </div>
                <div className="member-grid">
                  {members.map((student, index) => <StudentCard key={`${student.name}-${index}`} student={student} />)}
                </div>
              </section>
            );
          }) : <EmptyState>Student profiles will be added soon.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}

export async function AlumniPage() {
  const [settingsResult, alumniResult] = await Promise.all([loadSettings(), loadAlumni()]);
  const alumni = alumniResult.data;
  return (
    <SiteFrame
      settings={settingsResult.data}
      demo={settingsResult.demo || alumniResult.demo}
      active="members"
      memberPage="alumni"
    >
      <PageHero title="Alumni" />
      <section className="section">
        <div className="container">
          {alumni.length ? (
            <div className="alumni-list">
              {alumni.map((person, index) => (
                <article className="alumni-card" key={`${person.name}-${index}`}>
                  <h3>{person.name}</h3>
                  {person.secondary_name ? <p className="member-meta">{person.secondary_name}</p> : null}
                  {[person.degree, person.period].filter(Boolean).length ? (
                    <p className="role">{[person.degree, person.period].filter(Boolean).join(" · ")}</p>
                  ) : null}
                  {person.current_position ? <p className="member-meta">Now: {person.current_position}</p> : null}
                  <div className="link-row">
                    <ExternalLink href={person.personal_url}>Personal page</ExternalLink>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState>Alumni profiles will be added soon.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}

export async function ResearchPage() {
  const [settingsResult, researchResult] = await Promise.all([loadSettings(), loadResearch()]);
  const settings = settingsResult.data;
  const research = researchResult.data;
  return (
    <SiteFrame settings={settings} demo={settingsResult.demo || researchResult.demo} active="research">
      <PageHero title="Research" />
      <section className="section">
        <div className="container research-list">
          {research.length ? research.map((item, index) => (
            <article className={`research-item ${item.image_url ? "" : "no-image"}`} key={`${item.title}-${index}`}>
              {item.image_url ? (
                <FallbackImage
                  src={item.image_url}
                  alt={item.image_alt || `${item.title} research`}
                  className="content-image"
                />
              ) : null}
              <div className="research-copy">
                <h2>{item.title}</h2>
                {item.summary ? <p className="summary">{item.summary}</p> : null}
                <Multiline text={item.details} />
                <ExternalLink href={item.link_url} className="text-link">
                  {item.link_label || "Learn more"} →
                </ExternalLink>
              </div>
            </article>
          )) : <EmptyState>Research areas will be added soon.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}

function PublicationLinks({ publication }: { publication: Publication }) {
  const links = [
    ["Paper", publication.paper_url],
    ["Project", publication.project_url],
    ["Code", publication.code_url],
    ["Video", publication.video_url],
  ];
  return (
    <div className="link-row">
      {links.map(([label, href]) => href ? <ExternalLink key={label} href={href}>{label}</ExternalLink> : null)}
    </div>
  );
}

export async function PublicationsPage() {
  const [settingsResult, publicationsResult] = await Promise.all([loadSettings(), loadPublications()]);
  const settings = settingsResult.data;
  const publications = publicationsResult.data;
  const categories = [...new Set(publications.map((publication) => publication.category))];

  return (
    <SiteFrame settings={settings} demo={settingsResult.demo || publicationsResult.demo} active="publications">
      <PageHero title="Publications" />
      <section className="section">
        <div className="container">
          {categories.length ? categories.map((category) => {
            const categoryItems = publications.filter((publication) => publication.category === category);
            const years = [...new Set(categoryItems.map((publication) => publication.year))];
            return (
              <section className="publication-category" key={category}>
                <h2>{category}</h2>
                {years.map((year) => (
                  <div className="publication-year" key={year}>
                    <h3>{year || "—"}</h3>
                    <ol className="publication-list">
                      {categoryItems.filter((publication) => publication.year === year).map((publication, index) => (
                        <li className="publication-item" key={`${publication.title}-${index}`}>
                          {publication.venue ? <span className="venue">{publication.venue}</span> : null}
                          <h3>{publication.title}</h3>
                          {publication.authors ? <p className="authors">{publication.authors}</p> : null}
                          <PublicationLinks publication={publication} />
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </section>
            );
          }) : <EmptyState>Publications will be added soon.</EmptyState>}
        </div>
      </section>
    </SiteFrame>
  );
}
