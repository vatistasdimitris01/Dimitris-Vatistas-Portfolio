

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { SunIcon, MoonIcon, CommandIcon, XIcon, InstagramIcon, StarIcon } from './components/Icons';
import { marked } from 'marked';

// --- HELPERS ---
const slugify = (text: string) =>
    text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');


// --- DATA TYPES ---
const name = "Dimitris Vatistas";
const role = "Web Developer & Web Designer";
const bio = "I'm Dimitris Vatistas, a developer and designer passionate about crafting digital products that balance aesthetics with functionality. My work spans the full creative and technical process — from wireframing in Figma and prototyping in Framer, to building production-ready applications in React and Next.js.";

type Project = {
    id: string;
    created_at: string;
    title: string;
    url: string;
    is_featured: boolean;
    slug: string;
    content?: string;
    goals_challenges?: string;
    outcome?: string;
    tech_stack?: string[];
};

type BlogPost = {
    id: string;
    created_at: string;
    title: string;
    summary: string;
    slug: string;
    url?: string;
    image_url?: string;
    content?: string;
    is_featured: boolean;
};

type Theme = 'light' | 'dark' | 'system';

type SiteLayoutSection = {
    id: number;
    section_id: string;
    sort_order: number;
    content: any; // JSONB content
};


const socialLinks = [
    { name: "X", url: "https://x.com/vatistasdim", icon: XIcon },
    { name: "Instagram", url: "https://www.instagram.com/vatistasdimitris/", icon: InstagramIcon },
];

const workExperience = [
    { role: "Founder & CEO", company: "QRoyal", period: "2023 - Present" },
    { role: "Developer", company: "AI Beauty", period: "2022 - 2023" },
    { role: "Developer", company: "AI Age Verification", period: "2022" },
];


// --- PREMADE SECTIONS LIBRARY ---
const HeroCentered: React.FC<{ content: any }> = ({ content }) => (
    <div className="text-center py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">{content?.headline || "Headline"}</h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">{content?.subtext || "Subtext describing the hero section."}</p>
        <a href={content?.cta_link || "#"} className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {content?.cta_text || "Call to Action"}
        </a>
    </div>
);

const HeroSplit: React.FC<{ content: any }> = ({ content }) => (
    <div className="flex flex-col md:flex-row items-center gap-12 py-20">
        <div className="md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{content?.headline || "Headline"}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{content?.subtext || "Subtext for the split hero section."}</p>
            <a href={content?.cta_link || "#"} className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {content?.cta_text || "CTA"}
            </a>
        </div>
        <div className="md:w-1/2">
            <img src={content?.image_url || "https://placehold.co/600x400"} alt="Placeholder" className="rounded-lg shadow-lg w-full h-auto" />
        </div>
    </div>
);

const FeaturesGrid: React.FC<{ content: any }> = ({ content }) => (
    <Section title={content?.title || "Features"}>
        <div className="grid md:grid-cols-3 gap-8">
            {(content?.features || [{}, {}, {}]).map((feature: any, i: number) => (
                <div key={i} className="text-center">
                    <div className="text-blue-500 mb-3 mx-auto w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-zinc-800 rounded-full">{feature.icon || '★'}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.name || "Feature Name"}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{feature.description || "Feature description goes here."}</p>
                </div>
            ))}
        </div>
    </Section>
);

const TestimonialsCards: React.FC<{ content: any }> = ({ content }) => (
    <Section title={content?.title || "Testimonials"}>
        <div className="grid md:grid-cols-2 gap-6">
            {(content?.testimonials || [{}, {}]).map((testimonial: any, i: number) => (
                <div key={i} className="bg-gray-50/50 dark:bg-zinc-900/80 p-6 border border-gray-100/80 dark:border-zinc-800 rounded-lg">
                    <p className="italic mb-4">"{testimonial.quote || "This is a fantastic testimonial."}"</p>
                    <p className="font-semibold">{testimonial.name || "Client Name"}</p>
                    <p className="text-sm text-gray-500">{testimonial.company || "Company Inc."}</p>
                </div>
            ))}
        </div>
    </Section>
);

const AboutTextImage: React.FC<{ content: any }> = ({ content }) => (
    <Section title={content?.title || "About Me"}>
        <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <img src={content?.image_url || "https://placehold.co/500x500"} alt="About" className="rounded-lg shadow-md w-full h-auto" />
            </div>
            <div className="md:w-1/2 space-y-4">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{content?.paragraph1 || "First paragraph of about section."}</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{content?.paragraph2 || "Second paragraph of about section."}</p>
            </div>
        </div>
    </Section>
);

const PricingTiered: React.FC<{ content: any }> = ({ content }) => (
    <Section title={content?.title || "Pricing"}>
        <div className="grid md:grid-cols-3 gap-6 text-center">
            {(content?.tiers || [{}, {popular: true}, {}]).map((tier: any, i: number) => (
                <div key={i} className={`p-8 border rounded-lg ${tier.popular ? 'border-blue-500' : 'dark:border-zinc-800'}`}>
                    <h3 className="text-xl font-bold mb-2">{tier.name || "Tier Name"}</h3>
                    <p className="text-4xl font-bold mb-4">${tier.price || (i+1)*29}</p>
                    <p className="text-sm text-gray-500 mb-6">{tier.period || "/month"}</p>
                    <ul className="space-y-3 mb-8">
                        {(tier.features || ["Feature 1", "Feature 2", "Feature 3"]).map((f: string, j: number) => <li key={j}>{f}</li>)}
                    </ul>
                    <a href={tier.cta_link || '#'} className={`px-6 py-2 font-semibold rounded-lg ${tier.popular ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800'}`}>
                        {tier.cta_text || "Get Started"}
                    </a>
                </div>
            ))}
        </div>
    </Section>
);

const TeamCards: React.FC<{ content: any }> = ({ content }) => (
     <Section title={content?.title || "Our Team"}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {(content?.members || [{},{},{},{}]).map((member: any, i: number) => (
                 <div key={i} className="text-center">
                     <img src={member.image_url || `https://placehold.co/200x200`} className="rounded-full w-24 h-24 mx-auto mb-4" alt={member.name} />
                     <h4 className="font-semibold">{member.name || "Team Member"}</h4>
                     <p className="text-sm text-gray-500">{member.role || "Role"}</p>
                 </div>
             ))}
        </div>
    </Section>
);

const FooterWithLinks: React.FC<{ content: any }> = ({ content }) => (
    <div className="py-12 border-t dark:border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {(content?.columns || [{},{},{},{}]).map((col: any, i: number) => (
                <div key={i}>
                    <h4 className="font-semibold mb-3">{col.title || "Column"}</h4>
                    <ul className="space-y-2">
                        {(col.links || [{text: 'Link 1', href: '#'}]).map((link: any, j: number) => (
                           <li key={j}><a href={link.href} className="text-gray-500 hover:text-gray-900">{link.text}</a></li>
                        ))}
                    </ul>
                </div>
             ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-12">&copy; {new Date().getFullYear()} {content?.copyright || "Your Company"}</p>
    </div>
);

const FooterNewsletter: React.FC<{ content: any }> = ({ content }) => (
    <div className="py-12 text-center border-t dark:border-zinc-800">
        <h3 className="text-xl font-bold mb-2">{content?.title || "Join our Newsletter"}</h3>
        <p className="text-gray-500 mb-6">{content?.subtitle || "Stay up to date with our latest news."}</p>
        <form className="max-w-sm mx-auto flex gap-2">
            <input type="email" placeholder="Enter your email" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
            <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Subscribe</button>
        </form>
         <p className="text-center text-sm text-gray-400 mt-12">&copy; {new Date().getFullYear()} {content?.copyright || "Your Company"}</p>
    </div>
);


// --- UI COMPONENTS ---
const Header: React.FC<{ name: string; role: string; bio: string }> = ({ name, role, bio }) => (
    <header className="space-y-4">
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{role}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">{bio}</p>
    </header>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {children}
    </section>
);

const RecentProjects: React.FC<{ projects: Project[] }> = ({ projects }) => (
    <Section title="Recent Projects">
        <div className="space-y-6">
            {projects.length > 0 ? projects.map((project) => (
                <a 
                    href={`/#/project/${project.slug}`} 
                    key={project.id} 
                    className="group block p-6 bg-gray-50/50 dark:bg-zinc-900/80 border border-gray-100/80 dark:border-zinc-800 rounded-lg hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                                {project.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{project.content?.substring(0, 100)}...</p>
                        </div>
                         <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                             <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">Live</span>
                        </div>
                    </div>
                </a>
            )) : <p className="text-gray-500 dark:text-gray-400">No featured projects to display yet. Star a project in the admin panel to feature it here.</p>}
        </div>
    </Section>
);

const WorkExperience: React.FC<{ experiences: typeof workExperience }> = ({ experiences }) => (
    <Section title="Work Experience">
        <div className="space-y-4">
            {experiences.map((exp, index) => (
                <div key={index} className="bg-gray-50/50 dark:bg-zinc-900/80 p-6 border border-gray-100/80 dark:border-zinc-800 rounded-lg flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{exp.role}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{exp.company}</p>
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm whitespace-nowrap pt-1">{exp.period}</p>
                </div>
            ))}
        </div>
    </Section>
);

const Blog: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
    <Section title="Blog">
        <div className="space-y-6">
             {posts.length > 0 ? posts.map((post) => (
                <a href={`/#/blog/${post.slug}`} key={post.id} className="block group">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">{post.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{post.summary}</p>
                </a>
            )) : <p className="text-gray-500 dark:text-gray-400">No blog posts to display yet.</p>}
        </div>
    </Section>
);

const Connect: React.FC<{ links: typeof socialLinks }> = ({ links }) => (
    <Section title="Connect">
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
                Feel free to contact me at <a href="mailto:vatistasdim.ae@icloud.com" className="font-medium underline hover:text-black dark:hover:text-white">vatistasdim.ae@icloud.com</a>
            </p>
            <div className="flex flex-wrap gap-4">
                {links.map((link) => (
                    <a 
                        href={link.url} 
                        key={link.name} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label={link.name}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <link.icon className="w-6 h-6" />
                    </a>
                ))}
            </div>
        </div>
    </Section>
);

const Footer: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => (
    <footer className="max-w-3xl mx-auto px-6 py-8 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
            <p>&copy; 2025 Vatistas. <a href="/#/admin" className="hover:text-gray-900 dark:hover:text-gray-300">Admin</a></p>
            <div className="flex items-center gap-4">
                <button onClick={() => setTheme('light')} aria-label="Switch to light theme" className={`transition-colors ${theme === 'light' ? 'text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    <SunIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setTheme('dark')} aria-label="Switch to dark theme" className={`transition-colors ${theme === 'dark' ? 'text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    <MoonIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setTheme('system')} aria-label="Switch to system theme" className={`transition-colors ${theme === 'system' ? 'text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    <CommandIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </footer>
);


// --- PAGES & CONFIG ---

const ALL_SECTIONS: Record<string, {name: string, component: React.FC<any>, editable: boolean, defaultContent?: any }> = {
    'header': { name: 'Header', component: Header, editable: false },
    'recent_projects': { name: 'Recent Projects', component: RecentProjects, editable: false },
    'work_experience': { name: 'Work Experience', component: WorkExperience, editable: false },
    'blog': { name: 'Blog', component: Blog, editable: false },
    'connect': { name: 'Connect', component: Connect, editable: false },
    // New editable sections
    'hero_centered': { name: 'Hero (Centered)', component: HeroCentered, editable: true, defaultContent: { headline: 'Centered Hero Headline', subtext: 'A compelling subtext goes here.', cta_text: 'Get Started', cta_link: '#' } },
    'hero_split': { name: 'Hero (Split)', component: HeroSplit, editable: true, defaultContent: { headline: 'Split Hero Headline', subtext: 'A compelling subtext.', cta_text: 'Learn More', cta_link: '#', image_url: 'https://placehold.co/600x400' } },
    'features_grid': { name: 'Features Grid', component: FeaturesGrid, editable: true, defaultContent: { title: 'Our Features', features: [{icon: '✨', name: 'Feature One', description: 'Description one.'}, {icon: '🚀', name: 'Feature Two', description: 'Description two.'}, {icon: '💡', name: 'Feature Three', description: 'Description three.'}] } },
    'about_text_image': { name: 'About (Text & Image)', component: AboutTextImage, editable: true, defaultContent: { title: 'About Us', image_url: 'https://placehold.co/500x500', paragraph1: 'Lorem ipsum dolor sit amet.', paragraph2: 'Consectetur adipiscing elit.' } },
    'testimonials_cards': { name: 'Testimonials', component: TestimonialsCards, editable: true, defaultContent: { title: 'What Our Clients Say', testimonials: [{quote: 'Amazing work!', name: 'Jane Doe', company: 'Acme Inc.'}, {quote: 'Highly recommended.', name: 'John Smith', company: 'Beta Corp.'}] } },
    'team_cards': { name: 'Team Cards', component: TeamCards, editable: true, defaultContent: { title: 'Our Team', members: [{name: 'Person 1', role: 'CEO', image_url: 'https://placehold.co/200x200'}, {name: 'Person 2', role: 'CTO', image_url: 'https://placehold.co/200x200'}] } },
    'pricing_tiered': { name: 'Pricing Table', component: PricingTiered, editable: true, defaultContent: { title: 'Our Plans', tiers: [{name: 'Basic', price: 29, period: '/mo', features: ['Feature A', 'Feature B'], cta_text: 'Choose Plan'}, {name: 'Pro', price: 99, period: '/mo', features: ['Feature A', 'Feature B', 'Feature C'], cta_text: 'Choose Plan', popular: true}] } },
    'footer_links': { name: 'Footer (with Links)', component: FooterWithLinks, editable: true, defaultContent: { copyright: 'Your Company Name', columns: [{title: 'Product', links: [{text: 'Pricing', href: '#'}, {text: 'Features', href: '#'}] }] } },
    'footer_newsletter': { name: 'Footer (Newsletter)', component: FooterNewsletter, editable: true, defaultContent: { title: 'Join Our Newsletter', subtitle: 'Get the latest updates.', copyright: 'Your Company Name' } },
};

const HomePage: React.FC<{ layout: SiteLayoutSection[], posts: BlogPost[], projects: Project[] }> = ({ layout, posts, projects }) => {
    const componentProps = {
        'header': { name, role, bio },
        'recent_projects': { projects: projects.filter(p => p.is_featured) },
        'work_experience': { experiences: workExperience },
        'blog': { posts },
        'connect': { links: socialLinks },
    };
    
    return (
        <main className="max-w-3xl mx-auto px-6 py-20 md:py-28">
            <div className="space-y-20">
                {layout.map(section => {
                    const sectionConfig = ALL_SECTIONS[section.section_id];
                    if (!sectionConfig) return null;
                    
                    const props = sectionConfig.editable 
                        ? { content: section.content } 
                        : componentProps[section.section_id as keyof typeof componentProps];

                    return <sectionConfig.component key={section.id} {...props} />;
                })}
            </div>
        </main>
    );
};

const PageLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">{children}</main>
);

const PageHeader: React.FC<{title: string}> = ({ title }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy URL');

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy URL'), 2000);
        });
    };

    return (
        <header className="mb-12">
            <div className="flex justify-between items-start">
                <a href="/#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Dimitris Vatistas
                </a>
                <button 
                    onClick={handleCopyUrl} 
                    className="hidden md:inline-block bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    {copyButtonText}
                </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mt-6">
                {title}
            </h1>
        </header>
    );
};

const MarkdownContent: React.FC<{ content: string | undefined | null }> = ({ content }) => {
    const html = content ? marked.parse(content) as string : '';
    return (
        <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    );
};

const FurtherReadingNav: React.FC<{items: Array<{slug: string; title: string; id: string}>; type: 'blog' | 'project'}> = ({ items, type }) => (
     <nav className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-800 space-y-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Further Reading</h2>
        <div className="space-y-4">
            {items.map(p => (
                <a href={`/#/${type}/${p.slug}`} key={p.id} className="group block text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors">
                    <div className="flex justify-between items-center font-semibold">
                        <span>{p.title}</span>
                        <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>
                </a>
            ))}
        </div>
    </nav>
);

const ProjectPage: React.FC<{ project: Project; recommendedProjects: Project[] }> = ({ project, recommendedProjects }) => (
    <PageLayout>
        <PageHeader title={project.title} />
        <article className="space-y-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white -mb-8">{project.title}</h2>
            <MarkdownContent content={project.content} />

            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Goals & Challenges</h3>
                <MarkdownContent content={project.goals_challenges} />
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tech Stack</h3>
                <ul className="list-disc list-inside space-y-1">
                    {project.tech_stack?.map(tech => <li key={tech}>{tech}</li>)}
                </ul>
            </section>

             <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Outcome</h3>
                <MarkdownContent content={project.outcome} />
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 font-medium text-blue-600 hover:underline">
                    View Project &rarr;
                </a>
            </section>
        </article>
        <FurtherReadingNav items={recommendedProjects} type="project" />
    </PageLayout>
);

const BlogPostPage: React.FC<{ post: BlogPost; recommendedPosts: BlogPost[]; }> = ({ post, recommendedPosts }) => (
    <PageLayout>
        <PageHeader title={post.title} />
        <article className="space-y-8">
            {post.image_url && (
                <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-auto rounded-lg object-cover aspect-video border border-gray-100 dark:border-zinc-800"
                />
            )}
            {post.content ? (
              <MarkdownContent content={post.content} />
            ) : (
              <p className="text-gray-500">This post is currently being written. Check back soon!</p>
            )}
        </article>
        <FurtherReadingNav items={recommendedPosts} type="blog" />
    </PageLayout>
);

const LoginPage: React.FC<{ onLogin: (success: boolean) => void }> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a simple, insecure login. For a real app, use Supabase Auth.
        if (password === 'batman') { 
            onLogin(true);
        } else {
            setError('Incorrect password.');
            setPassword('');
            onLogin(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
            <div className="max-w-sm w-full mx-auto px-6">
                <div className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border dark:border-zinc-800">
                    <h1 className="text-2xl font-bold text-center dark:text-white">Admin Login</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-center"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Login</button>
                    </form>
                </div>
            </div>
        </main>
    );
};

// --- ADMIN PAGE & COMPONENTS ---
type ModalType = 'create-project' | 'edit-project' | 'create-blog' | 'edit-blog' | 'edit-section' | null;
type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'is_featured' | 'tech_stack'> & { tech_stack: string };
type BlogFormData = Omit<BlogPost, 'id' | 'created_at' | 'slug' | 'is_featured'>;

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const AdminCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm ${className}`}>
        <div className="p-4 border-b dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const AdminPage: React.FC<{
    posts: BlogPost[]; refreshPosts: () => void;
    projects: Project[]; refreshProjects: () => void;
}> = ({ posts, refreshPosts, projects, refreshProjects }) => {
    
    // --- State ---
    const [blogFormData, setBlogFormData] = useState<BlogFormData>({ title: '', summary: '', url: '', image_url: '', content: '' });
    const [projectFormData, setProjectFormData] = useState<ProjectFormData>({ title: '', url: '', slug: '', content: '', goals_challenges: '', outcome: '', tech_stack: '' });
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [jsonProjects, setJsonProjects] = useState('');
    const [jsonBlogs, setJsonBlogs] = useState('');
    const [importStatus, setImportStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [analytics, setAnalytics] = useState<{ total: number | null, daily: number[] }>({ total: null, daily: [] });
    const [copyProjectJsonText, setCopyProjectJsonText] = useState('Copy Example');
    const [copyBlogJsonText, setCopyBlogJsonText] = useState('Copy Example');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);

    // --- Effects ---
    useEffect(() => {
        const fetchAnalytics = async () => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('page_visits')
                .select('created_at')
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error fetching analytics:", error);
                setAnalytics({ total: null, daily: [] });
                return;
            }

            const { count: totalCount } = await supabase.from('page_visits').select('*', { count: 'exact', head: true });

            const dailyCounts = Array(7).fill(0);
            const today = new Date();
            today.setHours(0,0,0,0);

            data.forEach(visit => {
                const visitDate = new Date(visit.created_at);
                visitDate.setHours(0,0,0,0);
                const diffDays = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24));
                if (diffDays >= 0 && diffDays < 7) {
                    dailyCounts[6 - diffDays]++;
                }
            });

            setAnalytics({ total: totalCount, daily: dailyCounts });
        };
        fetchAnalytics();
    }, []);

    // --- Handlers ---
    const closeModal = () => {
        setActiveModal(null);
        setEditingPost(null);
        setEditingProject(null);
        setBlogFormData({ title: '', summary: '', url: '', image_url: '', content: '' });
        setProjectFormData({ title: '', url: '', slug: '', content: '', goals_challenges: '', outcome: '', tech_stack: '' });
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean, type: 'projects' | 'blogs') => {
        const { error } = await supabase.from(type).update({ is_featured: !currentStatus }).eq('id', id);
        if (error) console.error(`Error updating featured status for ${type}:`, error.message);
        else {
            if (type === 'projects') refreshProjects();
            else refreshPosts();
        }
    };
    
    const handleBlogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBlogFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...blogFormData,
            slug: editingPost ? editingPost.slug : slugify(blogFormData.title),
        };

        const { error } = editingPost
            ? await supabase.from('blogs').update(dataToSubmit).eq('id', editingPost.id)
            : await supabase.from('blogs').insert([dataToSubmit]);

        if (error) console.error("Error saving blog post:", error.message);
        else { refreshPosts(); closeModal(); }
    };

    const handleEditPost = (post: BlogPost) => {
        setEditingPost(post);
        setBlogFormData({ title: post.title, summary: post.summary, url: post.url || '', image_url: post.image_url || '', content: post.content || '' });
        setActiveModal('edit-blog');
    };
    
    const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.target.name === 'title') {
        setProjectFormData(prev => ({ ...prev, title: e.target.value, slug: slugify(e.target.value) }));
      } else {
        setProjectFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
      }
    };
    
    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { tech_stack, ...rest } = projectFormData;
        const dataToSubmit = {
            ...rest,
            tech_stack: tech_stack.split(',').map(s => s.trim()).filter(Boolean)
        };
        const { error } = editingProject
            ? await supabase.from('projects').update(dataToSubmit).eq('id', editingProject.id)
            : await supabase.from('projects').insert([dataToSubmit]);
        if (error) console.error("Error saving project:", error.message);
        else { refreshProjects(); closeModal(); }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setProjectFormData({ 
            title: project.title, 
            url: project.url, 
            slug: project.slug,
            content: project.content || '',
            goals_challenges: project.goals_challenges || '',
            outcome: project.outcome || '',
            tech_stack: (project.tech_stack || []).join(', '),
        });
        setActiveModal('edit-project');
    };

    const handleDeleteSelected = async (type: 'projects' | 'blogs') => {
        const selectedIds = type === 'projects' ? selectedProjects : selectedBlogs;
        if (selectedIds.length === 0 || !confirm(`Delete ${selectedIds.length} selected item(s)?`)) return;
        
        const { error } = await supabase.from(type).delete().in('id', selectedIds);
        if (error) console.error(`Error deleting ${type}:`, error.message);
        else {
            if (type === 'projects') { refreshProjects(); setSelectedProjects([]); } 
            else { refreshPosts(); setSelectedBlogs([]); }
        }
    };
    
    const toggleSelection = (id: string, type: 'projects' | 'blogs') => {
        const updater = type === 'projects' ? setSelectedProjects : setSelectedBlogs;
        updater(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const toggleSelectAll = (type: 'projects' | 'blogs') => {
        const source = type === 'projects' ? projects : posts;
        const selected = type === 'projects' ? selectedProjects : selectedBlogs;
        const updater = type === 'projects' ? setSelectedProjects : setSelectedBlogs;
        if (selected.length === source.length) {
            updater([]);
        } else {
            updater(source.map(item => item.id));
        }
    };

    const handleBulkImport = async (type: 'projects' | 'blogs') => {
        const jsonString = type === 'projects' ? jsonProjects : jsonBlogs;
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error("JSON must be an array of objects.");
            for (const item of data) {
                if (!item.title) throw new Error("Each item must have a title.");
                if (!item.slug) item.slug = slugify(item.title);
            }
            const { error } = await supabase.from(type).insert(data);
            if (error) throw error;
            setImportStatus({ type: 'success', message: `${data.length} ${type} imported successfully!` });
            if (type === 'projects') { refreshProjects(); setJsonProjects(''); } 
            else { refreshPosts(); setJsonBlogs(''); }
        } catch (e: any) {
            setImportStatus({ type: 'error', message: e.message || `Failed to import ${type}. Check JSON format.` });
        }
        setTimeout(() => setImportStatus(null), 5000);
    };

    const handleCopyExample = (type: 'projects' | 'blogs') => {
        let exampleJson = '';
        if (type === 'projects') {
            exampleJson = `[
  {
    "title": "GenGlow Skincare AI",
    "url": "https://genglow.example.com",
    "slug": "genglow-skincare-ai",
    "is_featured": true,
    "tech_stack": ["Next.js", "React", "TailwindCSS"],
    "content": "GenGlow is designed to revolutionize skincare by making routines intelligent, tailored, and accessible.",
    "goals_challenges": "The main challenge was ensuring recommendations felt both accurate and trustworthy. This required careful data handling and smart UX choices.",
    "outcome": "GenGlow makes skincare guidance accessible and personal. It highlighted the potential of combining AI-driven logic with clean UI design."
  }
]`.trim();
            setCopyProjectJsonText('Copied!');
            setTimeout(() => setCopyProjectJsonText('Copy Example'), 2000);
        } else {
             exampleJson = `[
  {
    "title": "My First Blog Post",
    "summary": "A short summary of what this post is about.",
    "slug": "my-first-blog-post",
    "is_featured": false,
    "content": "# Hello, World!\\n\\nThis is my first post written in **Markdown**.\\n\\n- It's easy\\n- It's fun"
  }
]`.trim();
            setCopyBlogJsonText('Copied!');
            setTimeout(() => setCopyBlogJsonText('Copy Example'), 2000);
        }
        navigator.clipboard.writeText(exampleJson);
    };

    const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className = "w-full h-16 stroke-blue-500" }) => {
        if (data.length < 2) return <div className="h-16 flex items-center justify-center text-sm text-gray-400">Not enough data</div>;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d - min) / ((max - min) || 1)) * 100;
            return `${x},${y}`;
        }).join(' ');
        return (
            <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline fill="none" strokeWidth="2" points={points} />
            </svg>
        );
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <header className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 p-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <h1 className="text-xl font-semibold dark:text-white">Admin Dashboard</h1>
                    <a href="/#" className="text-sm font-medium text-blue-600 hover:underline">← Back to Site</a>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AdminCard title="Web Analytics">
                        <div className="space-y-2">
                            <p className="text-3xl font-bold">{analytics.total ?? '...'}</p>
                            <p className="text-sm text-gray-500">Total Visits</p>
                        </div>
                        <Sparkline data={analytics.daily} />
                        <p className="text-xs text-center text-gray-400 mt-1">Last 7 days</p>
                    </AdminCard>
                    <AdminCard title="Quick Actions">
                        <div className="space-y-3">
                            <button onClick={() => setActiveModal('create-project')} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-md transition-colors">Create New Project</button>
                            <button onClick={() => setActiveModal('create-blog')} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-md transition-colors">Create New Blog Post</button>
                        </div>
                    </AdminCard>
                     <AdminCard title="Site Editor">
                         <div className="space-y-3">
                            <a href="/#/editor" className="block w-full text-left p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-md transition-colors">
                                Edit Homepage Layout
                            </a>
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">Add, remove, and reorder the sections on your main page.</p>
                         </div>
                    </AdminCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AdminCard title="Manage Projects">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <input type="checkbox" onChange={() => toggleSelectAll('projects')} checked={selectedProjects.length === projects.length && projects.length > 0} className="mr-2" />
                                <label className="text-sm">Select All</label>
                            </div>
                            <button onClick={() => handleDeleteSelected('projects')} disabled={selectedProjects.length === 0} className="text-sm font-medium text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline">Delete Selected</button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {projects.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                                    <div className="flex items-center truncate">
                                        <input type="checkbox" checked={selectedProjects.includes(p.id)} onChange={() => toggleSelection(p.id, 'projects')} className="mr-3" />
                                        <span className="truncate pr-4">{p.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'projects')}><StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} /></button>
                                        <button onClick={() => handleEditProject(p)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>

                    <AdminCard title="Manage Blog Posts">
                         <div className="flex justify-between items-center mb-3">
                            <div>
                                <input type="checkbox" onChange={() => toggleSelectAll('blogs')} checked={selectedBlogs.length === posts.length && posts.length > 0} className="mr-2" />
                                <label className="text-sm">Select All</label>
                            </div>
                            <button onClick={() => handleDeleteSelected('blogs')} disabled={selectedBlogs.length === 0} className="text-sm font-medium text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline">Delete Selected</button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {posts.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                                     <div className="flex items-center truncate">
                                        <input type="checkbox" checked={selectedBlogs.includes(p.id)} onChange={() => toggleSelection(p.id, 'blogs')} className="mr-3" />
                                        <span className="truncate pr-4">{p.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'blogs')}><StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} /></button>
                                        <button onClick={() => handleEditPost(p)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AdminCard title="Bulk Import Projects">
                        <textarea value={jsonProjects} onChange={(e) => setJsonProjects(e.target.value)} placeholder="Paste JSON array of projects here..." className="w-full h-40 p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 font-mono text-sm"></textarea>
                        <div className="flex justify-between items-center mt-2">
                            <button onClick={() => handleCopyExample('projects')} className="text-sm font-medium text-blue-600 hover:underline">{copyProjectJsonText}</button>
                            <button onClick={() => handleBulkImport('projects')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Import Projects</button>
                        </div>
                    </AdminCard>
                     <AdminCard title="Bulk Import Blog Posts">
                        <textarea value={jsonBlogs} onChange={(e) => setJsonBlogs(e.target.value)} placeholder="Paste JSON array of blog posts here..." className="w-full h-40 p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 font-mono text-sm"></textarea>
                         <div className="flex justify-between items-center mt-2">
                            <button onClick={() => handleCopyExample('blogs')} className="text-sm font-medium text-blue-600 hover:underline">{copyBlogJsonText}</button>
                            <button onClick={() => handleBulkImport('blogs')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Import Posts</button>
                        </div>
                    </AdminCard>
                </div>
                 {importStatus && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${importStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {importStatus.message}
                    </div>
                )}
            </main>

            <Modal isOpen={activeModal === 'create-project' || activeModal === 'edit-project'} onClose={closeModal} title={editingProject ? 'Edit Project' : 'Create Project'}>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <input name="title" value={projectFormData.title} onChange={handleProjectChange} placeholder="Project Title" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="slug" value={projectFormData.slug} onChange={handleProjectChange} placeholder="URL Slug (auto-generated)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="url" value={projectFormData.url} onChange={handleProjectChange} placeholder="Live Project URL (https://...)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="tech_stack" value={projectFormData.tech_stack} onChange={handleProjectChange} placeholder="Tech Stack (comma-separated)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
                    <textarea name="content" value={projectFormData.content} onChange={handleProjectChange} placeholder="Main Content (Markdown supported)..." className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-24"></textarea>
                    <textarea name="goals_challenges" value={projectFormData.goals_challenges} onChange={handleProjectChange} placeholder="Goals & Challenges (Markdown supported)..." className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-24"></textarea>
                    <textarea name="outcome" value={projectFormData.outcome} onChange={handleProjectChange} placeholder="Outcome (Markdown supported)..." className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-24"></textarea>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Save Project</button>
                </form>
            </Modal>
            
            <Modal isOpen={activeModal === 'create-blog' || activeModal === 'edit-blog'} onClose={closeModal} title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}>
                <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <input name="title" value={blogFormData.title} onChange={handleBlogChange} placeholder="Blog Post Title" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="summary" value={blogFormData.summary} onChange={handleBlogChange} placeholder="Summary" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="url" value={blogFormData.url || ''} onChange={handleBlogChange} placeholder="External URL (optional)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
                    <input name="image_url" value={blogFormData.image_url || ''} onChange={handleBlogChange} placeholder="Image URL (optional)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
                    <textarea name="content" value={blogFormData.content || ''} onChange={handleBlogChange} placeholder="Content (Markdown supported)..." className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-48"></textarea>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Save Post</button>
                </form>
            </Modal>
        </div>
    );
};

const ContentEditModal: React.FC<{
    section: SiteLayoutSection;
    onClose: () => void;
    onContentChange: (newContent: any) => void;
}> = ({ section, onClose, onContentChange }) => {
    const sectionConfig = ALL_SECTIONS[section.section_id];
    const [formData, setFormData] = useState(section.content || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        onContentChange(newFormData);
    };
    
    // A simple form generator based on field names
    const renderField = (key: string, value: any) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (typeof value === 'string') {
            if (value.length > 80 || key.includes('text') || key.includes('paragraph')) {
                return (
                    <div key={key}>
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <textarea name={key} value={value} onChange={handleChange} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-24" />
                    </div>
                );
            }
            return (
                <div key={key}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input name={key} value={value} onChange={handleChange} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
                </div>
            );
        }
        return null;
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={`Editing: ${sectionConfig.name}`}>
            <div className="space-y-4">
                {Object.entries(formData).map(([key, value]) => renderField(key, value))}
                {/* Note: Editing nested objects like features/testimonials is not supported by this simple form */}
                <button onClick={onClose} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Done</button>
            </div>
        </Modal>
    );
};


const SiteEditorPage: React.FC<{
    initialLayout: SiteLayoutSection[];
    posts: BlogPost[]; 
    projects: Project[];
    onSave: (newLayout: SiteLayoutSection[]) => Promise<void>;
}> = ({ initialLayout, posts, projects, onSave }) => {
    const [layout, setLayout] = useState<SiteLayoutSection[]>(initialLayout);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [editingSection, setEditingSection] = useState<SiteLayoutSection | null>(null);

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...layout];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLayout.length) return;
        [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
        setLayout(newLayout);
    };

    const removeSection = (index: number) => {
        setLayout(prev => prev.filter((_, i) => i !== index));
    };

    const addSection = (sectionId: string) => {
        const sectionConfig = ALL_SECTIONS[sectionId];
        if (!sectionConfig) return;
        
        const newSection: SiteLayoutSection = {
            id: Date.now(),
            section_id: sectionId,
            sort_order: layout.length,
            content: sectionConfig.defaultContent || {}
        };
        setLayout(prev => [...prev, newSection]);
    };

    const handleSaveLayout = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            await onSave(layout);
            setSaveStatus('success');
        } catch (error) {
            setSaveStatus('error');
            console.error("Failed to save layout:", error);
        }
        setIsSaving(false);
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleContentChange = (id: number, newContent: any) => {
        setLayout(prevLayout => prevLayout.map(sec => 
            sec.id === id ? { ...sec, content: newContent } : sec
        ));
    };

    const availableSections = Object.keys(ALL_SECTIONS).filter(id => {
        // Allow multiple footers, but not multiple of other types for simplicity
        if (id.startsWith('footer_')) return true;
        return !layout.some(s => s.section_id === id);
    });
    
    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-zinc-950">
            <header className="flex-shrink-0 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold dark:text-white">Site Editor</h1>
                    <p className="text-sm text-gray-500">Manage your homepage layout.</p>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/#/admin" className="text-sm font-medium text-blue-600 hover:underline">← Back to Admin</a>
                    <button
                        onClick={handleSaveLayout}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:bg-blue-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </header>
             {saveStatus && (
                <div className={`p-2 text-center text-sm ${saveStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {saveStatus === 'success' ? 'Layout saved successfully!' : 'Failed to save layout.'}
                </div>
             )}

            <div className="flex-grow flex overflow-hidden">
                {/* Left Panel - Controls */}
                <aside className="w-1/3 max-w-sm flex-shrink-0 bg-white dark:bg-zinc-900 p-4 overflow-y-auto border-r dark:border-zinc-800">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Active Sections</h2>
                    <div className="space-y-2">
                        {layout.map((section, index) => {
                            const sectionConfig = ALL_SECTIONS[section.section_id];
                            return (
                            <div key={section.id} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium dark:text-gray-200">{sectionConfig?.name || section.section_id}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="disabled:opacity-30">↑</button>
                                        <button onClick={() => moveSection(index, 'down')} disabled={index === layout.length - 1} className="disabled:opacity-30">↓</button>
                                        <button onClick={() => removeSection(index)} className="text-red-500">✕</button>
                                    </div>
                                </div>
                                {sectionConfig?.editable && (
                                     <button onClick={() => setEditingSection(section)} className="text-sm font-medium text-blue-600 hover:underline mt-2">Edit Content</button>
                                )}
                            </div>
                        )})}
                    </div>
                     <h2 className="text-lg font-semibold mt-6 mb-4 dark:text-white">Add a Section</h2>
                     <div className="space-y-2">
                        {availableSections.length > 0 ? (
                            availableSections.map(id => (
                                <button key={id} onClick={() => addSection(id)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-md transition-colors">
                                    + {ALL_SECTIONS[id]?.name}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">All available sections are in use.</p>
                        )}
                    </div>
                </aside>
                
                {/* Right Panel - Preview */}
                <main className="flex-grow overflow-y-auto bg-white dark:bg-zinc-950">
                   <HomePage layout={layout} posts={posts} projects={projects} />
                </main>
            </div>
            {editingSection && (
                <ContentEditModal 
                    section={editingSection} 
                    onClose={() => setEditingSection(null)} 
                    onContentChange={(newContent) => handleContentChange(editingSection.id, newContent)}
                />
            )}
        </div>
    );
};


// --- MAIN APP ---
const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [siteLayout, setSiteLayout] = useState<SiteLayoutSection[]>([]);
    const [currentRoute, setCurrentRoute] = useState<string>(window.location.hash || '#/');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPosts = useCallback(async () => {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching posts:", error);
        else setPosts(data || []);
    }, []);

    const refreshProjects = useCallback(async () => {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching projects:", error);
        else setProjects(data || []);
    }, []);
    
    const refreshLayout = useCallback(async () => {
        const { data, error } = await supabase.from('site_layout').select('*').order('sort_order', { ascending: true });
        if (error) console.error("Error fetching site layout:", error);
        else setSiteLayout(data || []);
    }, []);
    
    const handleSaveLayout = async (newLayout: SiteLayoutSection[]) => {
        const { error: deleteError } = await supabase.from('site_layout').delete().neq('id', -1);
        if (deleteError) throw deleteError;
        
        const layoutToInsert = newLayout.map((section, index) => ({
            section_id: section.section_id,
            sort_order: index,
            content: section.content
        }));
        
        const { error: insertError } = await supabase.from('site_layout').insert(layoutToInsert);
        if (insertError) throw insertError;
        
        await refreshLayout();
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
                setIsAuthenticated(true);
            }

            supabase.from('page_visits').insert({}).then(({error}) => {
                if (error) console.error("Error logging page visit:", error);
            });

            await Promise.all([refreshPosts(), refreshProjects(), refreshLayout()]);
            setIsLoading(false);
        };
        loadData();
    }, [refreshPosts, refreshProjects, refreshLayout]);

    useEffect(() => {
        const applyTheme = () => {
            const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', isDarkMode);
            localStorage.setItem('theme', theme);
        };
        applyTheme();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(window.location.hash || '#/');
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const handleLogin = (success: boolean) => {
        if (success) sessionStorage.setItem('isAdminAuthenticated', 'true');
        else sessionStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(success);
    };

    const renderPage = () => {
        if (isLoading) {
             return <div className="min-h-screen flex items-center justify-center"><p>Loading portfolio...</p></div>;
        }

        if (currentRoute.startsWith('#/project/')) {
            const slug = currentRoute.split('/project/')[1];
            const project = projects.find(p => p.slug === slug);
            if (project) {
                const recommendedProjects = projects.filter(p => p.slug !== slug).slice(0, 3);
                return <ProjectPage project={project} recommendedProjects={recommendedProjects} />;
            }
        }
        
        if (currentRoute.startsWith('#/blog/')) {
            const slug = currentRoute.split('/blog/')[1];
            const post = posts.find(p => p.slug === slug);
            if (post) {
                const recommendedPosts = posts.filter(p => p.slug !== slug).slice(0, 3);
                return <BlogPostPage post={post} recommendedPosts={recommendedPosts} />;
            }
        }
        
        if (currentRoute === '#/admin') {
            if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
            return <AdminPage posts={posts} refreshPosts={refreshPosts} projects={projects} refreshProjects={refreshProjects} />;
        }
        
        if (currentRoute === '#/editor') {
            if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
            return <SiteEditorPage initialLayout={siteLayout} posts={posts} projects={projects} onSave={handleSaveLayout} />;
        }

        return <HomePage layout={siteLayout} posts={posts} projects={projects} />;
    };
    
    return (
        <>
            {renderPage()}
            {!(currentRoute === '#/admin' && !isAuthenticated) && !(currentRoute === '#/editor') && <Footer theme={theme} setTheme={setTheme} />}
        </>
    );
};

export default App;
