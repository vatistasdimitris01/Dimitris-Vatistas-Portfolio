
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { ExternalLinkIcon, SunIcon, MoonIcon, CommandIcon, XIcon, InstagramIcon, StarIcon } from './components/Icons';

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
    description: string;
    url: string;
    is_featured: boolean;
};

type BlogPost = {
    id: string;
    created_at: string;
    title: string;
    summary: string;
    slug: string;
    url: string;
    image_url: string;
    content: string;
    is_featured: boolean;
};

type Theme = 'light' | 'dark' | 'system';

const socialLinks = [
    { name: "X", url: "https://x.com/vatistasdim", icon: XIcon },
    { name: "Instagram", url: "https://www.instagram.com/vatistasdimitris/", icon: InstagramIcon },
];

const workExperience = [
    { role: "Founder & CEO", company: "QRoyal", period: "2023 - Present" },
    { role: "Developer", company: "AI Beauty", period: "2022 - 2023" },
    { role: "Developer", company: "AI Age Verification", period: "2022" },
];


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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.length > 0 ? projects.map((project) => (
                <a 
                    href={project.url} 
                    key={project.id} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex flex-col justify-between p-6 bg-gray-50/50 dark:bg-zinc-900/80 border border-gray-100/80 dark:border-zinc-800 rounded-lg hover:shadow-md transition-shadow"
                >
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                            {project.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                         <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">Live from GitHub</span>
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


// --- PAGES ---

const HomePage: React.FC<{ posts: BlogPost[], projects: Project[] }> = ({ posts, projects }) => (
    <>
        <main className="max-w-3xl mx-auto px-6 py-20 md:py-28">
            <div className="space-y-20">
                <Header name={name} role={role} bio={bio} />
                <RecentProjects projects={projects} />
                <WorkExperience experiences={workExperience} />
                <Blog posts={posts} />
                <Connect links={socialLinks} />
            </div>
        </main>
    </>
);

const BlogPostPage: React.FC<{ post: BlogPost }> = ({ post }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy URL');

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy URL'), 2000);
        });
    };

    return (
        <>
            <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
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
                        {post.title}
                    </h1>
                </header>

                <article className="space-y-8">
                    {post.image_url && (
                        <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-auto rounded-lg object-cover aspect-video border border-gray-100 dark:border-zinc-800"
                        />
                    )}
                    {post.content ? (
                      <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                    ) : (
                      <p className="text-gray-500">This post is currently being written. Check back soon!</p>
                    )}
                </article>

                 <div className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-800 space-y-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Further Reading</h2>
                    <ul className="space-y-4 list-disc list-inside text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-black dark:hover:text-white underline">The Future of Design Systems</a></li>
                        <li><a href="#" className="hover:text-black dark:hover:text-white underline">Ethical AI in Practice</a></li>
                    </ul>
                </div>
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Music for Inspiration</h2>
                     <p className="text-gray-600 dark:text-gray-400 mt-2">Need some tunes while working? Check out "Mellow" by Tycho—a perfect blend of creativity and rhythm.</p>
                </div>
            </main>
        </>
    );
};

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
const AdminPage: React.FC<{
    posts: BlogPost[];
    refreshPosts: () => void;
    projects: Project[];
    refreshProjects: () => void;
}> = ({ posts, refreshPosts, projects, refreshProjects }) => {
    
    // --- State ---
    const [blogFormData, setBlogFormData] = useState<Omit<BlogPost, 'id' | 'created_at' | 'slug' | 'is_featured'>>({ title: '', summary: '', url: '', image_url: '', content: '' });
    const [projectFormData, setProjectFormData] = useState<Omit<Project, 'id' | 'created_at' | 'is_featured'>>({ title: '', description: '', url: '' });
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [jsonProjects, setJsonProjects] = useState('');
    const [jsonBlogs, setJsonBlogs] = useState('');
    const [importStatus, setImportStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [analytics, setAnalytics] = useState<{ total: number | null, daily: number[] }>({ total: null, daily: [] });

    // --- Effects ---
    useEffect(() => {
        const fetchAnalytics = async () => {
            // Fetch total visits
            const { count, error: totalError } = await supabase.from('page_visits').select('*', { count: 'exact', head: true });
            
            // Fetch daily visits for the last 7 days
            const today = new Date();
            const last7Days = new Date(today);
            last7Days.setDate(today.getDate() - 7);
            const { data: dailyData, error: dailyError } = await supabase
                .from('page_visits')
                .select('created_at')
                .gte('created_at', last7Days.toISOString());

            if (totalError || dailyError) {
                console.error('Error fetching analytics:', totalError?.message || dailyError?.message);
            } else {
                const dailyCounts = Array(7).fill(0);
                dailyData?.forEach(visit => {
                    const visitDate = new Date(visit.created_at);
                    const diffDays = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24));
                    if (diffDays >= 0 && diffDays < 7) {
                        dailyCounts[6 - diffDays]++;
                    }
                });
                setAnalytics({ total: count, daily: dailyCounts });
            }
        };
        fetchAnalytics();
    }, []);

    // --- Handlers ---
    const handleToggleFeatured = async (id: string, currentStatus: boolean, type: 'projects' | 'blogs') => {
        const { error } = await supabase.from(type).update({ is_featured: !currentStatus }).eq('id', id);
        if (error) {
            console.error(`Error updating featured status for ${type}:`, error.message);
        } else {
            type === 'projects' ? refreshProjects() : refreshPosts();
        }
    };
    
    // Blog Handlers
    const handleBlogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBlogFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = { ...blogFormData, slug: slugify(blogFormData.title) };
        const { error } = editingPost
            ? await supabase.from('blogs').update(dataToSubmit).eq('id', editingPost.id)
            : await supabase.from('blogs').insert([dataToSubmit]);
        if (error) console.error("Error saving blog post:", error.message);
        else {
            setBlogFormData({ title: '', summary: '', url: '', image_url: '', content: '' });
            setEditingPost(null);
            refreshPosts();
        }
    };
    const handleEditPost = (post: BlogPost) => {
        setEditingPost(post);
        setBlogFormData({ title: post.title, summary: post.summary, url: post.url, image_url: post.image_url, content: post.content });
        document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth' });
    };
    const handleDeletePost = async (postId: string) => {
        if (confirm('Delete this post?')) {
            const { error } = await supabase.from('blogs').delete().eq('id', postId);
            if (error) console.error("Error deleting post:", error.message);
            else refreshPosts();
        }
    };

    // Project Handlers
    const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = editingProject
            ? await supabase.from('projects').update(projectFormData).eq('id', editingProject.id)
            : await supabase.from('projects').insert([projectFormData]);
        if (error) console.error("Error saving project:", error.message);
        else {
            setProjectFormData({ title: '', description: '', url: '' });
            setEditingProject(null);
            refreshProjects();
        }
    };
    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setProjectFormData({ title: project.title, description: project.description, url: project.url });
        document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
    };
    const handleDeleteProject = async (projectId: string) => {
        if (confirm('Delete this project?')) {
            const { error } = await supabase.from('projects').delete().eq('id', projectId);
            if (error) console.error("Error deleting project:", error.message);
            else refreshProjects();
        }
    };
    
    // Bulk Import Handler
    const handleBulkImport = async (type: 'projects' | 'blogs') => {
        const jsonString = type === 'projects' ? jsonProjects : jsonBlogs;
        setImportStatus(null);
        let data;
        try {
            data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error('JSON must be an array.');
        } catch (e: any) {
            setImportStatus({ type: 'error', message: `Invalid JSON: ${e.message}` });
            return;
        }

        if (type === 'blogs') {
             data = data.map(item => ({ ...item, slug: slugify(item.title) }));
        }
        
        const { error } = await supabase.from(type).insert(data);
        if (error) {
            setImportStatus({ type: 'error', message: `Supabase Error: ${error.message}` });
        } else {
            setImportStatus({ type: 'success', message: `Successfully imported ${data.length} ${type}.` });
            if (type === 'projects') { setJsonProjects(''); refreshProjects(); } 
            else { setJsonBlogs(''); refreshPosts(); }
        }
    };
    
    // --- Render Components ---
    const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
        <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200/50 dark:border-zinc-800 p-6 ${className}`}>{children}</div>
    );
    
    const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
        if (!data || data.length < 2) return <div className="h-16 flex items-center justify-center text-sm text-gray-400">Not enough data</div>;
        const width = 150;
        const height = 40;
        const max = Math.max(...data) || 1;
        const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');
        const path = `M${points.split(' ')[0]} L${points}`;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
                 <defs>
                    <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <path d={`${path} V${height} L0,${height} Z`} fill="url(#sparkline-gradient)" />
            </svg>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <a href="/#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 inline-block">
                    &larr; Back to Portfolio
                </a>
                <h1 className="text-3xl font-bold dark:text-white mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Visits</h3>
                        <p className="text-4xl font-bold dark:text-white mt-2">{analytics.total ?? '...'}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Last 7 Days</p>
                        <Sparkline data={analytics.daily} />
                    </Card>
                    <Card>
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium">Quick Actions</h3>
                        <div className="mt-4 space-y-3">
                            <button onClick={() => document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full text-left p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">Create New Project</button>
                            <button onClick={() => document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full text-left p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">Create New Blog Post</button>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium">Content Stats</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <p className="dark:text-white">Total Projects</p>
                                <p className="text-2xl font-semibold dark:text-white">{projects.length}</p>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <p className="dark:text-white">Total Blog Posts</p>
                                <p className="text-2xl font-semibold dark:text-white">{posts.length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-12">
                     <Card>
                        <h2 id="project-form" className="text-xl font-semibold dark:text-white mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                            <input type="text" name="title" placeholder="Title" value={projectFormData.title} onChange={handleProjectChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                            <input type="text" name="url" placeholder="Project URL" value={projectFormData.url} onChange={handleProjectChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                            <textarea name="description" placeholder="Description" value={projectFormData.description} onChange={handleProjectChange} rows={3} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"></textarea>
                            <div className="flex gap-4">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingProject ? 'Update Project' : 'Create Project'}</button>
                                {editingProject && <button type="button" onClick={() => { setEditingProject(null); setProjectFormData({ title: '', description: '', url: '' }); }} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600">Cancel</button>}
                            </div>
                        </form>
                        <h3 className="text-lg font-semibold dark:text-white mt-8 mb-4">Existing Projects</h3>
                        <ul className="space-y-2">{projects.map(p => (
                            <li key={p.id} className="p-3 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                                <div><p className="font-medium dark:text-white">{p.title}</p></div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'projects')} title="Feature Project"><StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} /></button>
                                    <button onClick={() => handleEditProject(p)} className="text-sm text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteProject(p.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                                </div>
                            </li>))}
                        </ul>
                    </Card>

                    <Card>
                        <h2 id="blog-form" className="text-xl font-semibold dark:text-white mb-4">{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                        <form onSubmit={handleBlogSubmit} className="space-y-4">
                             <input type="text" name="title" placeholder="Title" value={blogFormData.title} onChange={handleBlogChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                             <input type="text" name="summary" placeholder="Summary" value={blogFormData.summary} onChange={handleBlogChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                             <input type="text" name="image_url" placeholder="Image URL (optional)" value={blogFormData.image_url} onChange={handleBlogChange} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                             <textarea name="content" placeholder="Content (HTML, optional)" value={blogFormData.content} onChange={handleBlogChange} rows={10} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"></textarea>
                            <div className="flex gap-4">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingPost ? 'Update Post' : 'Create Post'}</button>
                                {editingPost && <button type="button" onClick={() => { setEditingPost(null); setBlogFormData({ title: '', summary: '', url: '', image_url: '', content: '' }); }} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600">Cancel</button>}
                            </div>
                        </form>
                        <h3 className="text-lg font-semibold dark:text-white mt-8 mb-4">Existing Blog Posts</h3>
                        <ul className="space-y-2">{posts.map(p => (
                            <li key={p.id} className="p-3 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                                <div><p className="font-medium dark:text-white">{p.title}</p></div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'blogs')} title="Feature Post"><StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} /></button>
                                    <button onClick={() => handleEditPost(p)} className="text-sm text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDeletePost(p.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                                </div>
                            </li>))}
                        </ul>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-semibold dark:text-white">Bulk Import</h2>
                         {importStatus && <div className={`p-3 rounded my-4 text-sm ${importStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{importStatus.message}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                             <div>
                                <h3 className="font-semibold dark:text-white">Import Projects</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste a JSON array of project objects.</p>
                                <textarea value={jsonProjects} onChange={e => setJsonProjects(e.target.value)} placeholder='[{"title": "...", "description": "...", "url": "..."}]' rows={8} className="w-full p-2 mt-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 font-mono text-sm"></textarea>
                                <button onClick={() => handleBulkImport('projects')} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Import Projects</button>
                            </div>
                            <div>
                                <h3 className="font-semibold dark:text-white">Import Blog Posts</h3>
                                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste a JSON array of blog post objects.</p>
                                <textarea value={jsonBlogs} onChange={e => setJsonBlogs(e.target.value)} placeholder='[{"title": "...", "summary": "..."}]' rows={8} className="w-full p-2 mt-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 font-mono text-sm"></textarea>
                                <button onClick={() => handleBulkImport('blogs')} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Import Blog Posts</button>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};


// --- ROUTER & APP ---
const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('isAdminAuthenticated') === 'true');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching posts:", error);
        else setPosts(data || []);
    }, []);

    const fetchProjects = useCallback(async (admin = false) => {
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
        // On the public site, only fetch featured projects. In admin, fetch all.
        if (!admin) {
            query = query.eq('is_featured', true);
        }
        const { data, error } = await query;
        if (error) console.error("Error fetching projects:", error);
        else setProjects(data || []);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Pass true to fetchAllProjects for admin context, false otherwise
            const onAdminPage = window.location.hash.startsWith('#/admin');
            await Promise.all([fetchPosts(), fetchProjects(onAdminPage)]);
            setLoading(false);
        };
        fetchData();
    }, [fetchPosts, fetchProjects, route]); // Re-fetch data if route changes (e.g., navigating to admin)

    useEffect(() => {
        const asciiArt = `
VVVVVVVV           VVVVVVVV DDDDDDDDDDDDD       
V::::::V           V::::::V D::::::::::::DDD    
V::::::V           V::::::V D:::::::::::::::DD  
V::::::V           V::::::V DDD:::::DDDDD:::::D 
 V:::::V           V:::::V    D:::::D    D:::::D
  V:::::V         V:::::V     D:::::D     D:::::D
   V:::::V       V:::::V      D:::::D     D:::::D
    V:::::V     V:::::V       D:::::D     D:::::D
     V:::::V   V:::::V        D:::::D     D:::::D
      V:::::V V:::::V         D:::::D     D:::::D
       V:::::V:::::V          D:::::D     D:::::D
        V:::::::::V           D:::::D    D:::::D
         V:::::::V          DDD:::::DDDDD:::::D
          V:::::V           D:::::::::::::::DD 
           V:::V            D::::::::::::DDD   
            VVV             DDDDDDDDDDDD       
`;
        console.log(asciiArt);
        
        const logVisit = async () => {
            // Don't log visits from admin or during local development
            if (window.location.hash.startsWith('#/admin') || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
                return;
            }
            try {
                await supabase.from('page_visits').insert([{}]);
            } catch (error) {
                console.error('Error logging page visit:', error);
            }
        };
        logVisit();
    }, []);
    
    useEffect(() => {
        const handleHashChange = () => {
            window.scrollTo(0, 0);
            setRoute(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
        const applyTheme = (currentTheme: Theme) => {
            if (currentTheme === 'dark' || (currentTheme === 'system' && mediaQuery.matches)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };
    
        applyTheme(theme);
        localStorage.setItem('theme', theme);
    
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('theme') === 'system') {
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };
    
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [theme]);
    

    const handleLogin = (success: boolean) => {
        if (success) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            setIsAdminAuthenticated(true);
            setRoute('#/admin'); // Redirect to admin page on successful login
        }
    };

    const path = route.replace(/^#/, '');
    let pageContent;
    let showFooter = true;

    if (loading) {
        pageContent = <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;
        showFooter = false;
    } else if (path.startsWith('/blog/')) {
        const slug = path.substring('/blog/'.length);
        const post = posts.find(p => p.slug === slug);
        pageContent = post ? <BlogPostPage post={post} /> : <HomePage posts={posts} projects={projects} />;
    } else if (path === '/admin') {
        if (isAdminAuthenticated) {
            pageContent = <AdminPage posts={posts} refreshPosts={fetchPosts} projects={projects} refreshProjects={() => fetchProjects(true)} />;
        } else {
            pageContent = <LoginPage onLogin={handleLogin} />;
        }
        showFooter = false;
    } else {
        pageContent = <HomePage posts={posts} projects={projects} />;
    }
    
    return (
      <>
        {pageContent}
        {showFooter && <Footer theme={theme} setTheme={setTheme} />}
      </>
    );
};

export default App;