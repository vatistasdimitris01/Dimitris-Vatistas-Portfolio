
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { ExternalLinkIcon, SunIcon, MoonIcon, CommandIcon, XIcon, InstagramIcon, StarIcon } from './components/Icons';
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

const BlogPostPage: React.FC<{ post: BlogPost; recommendedPosts: BlogPost[]; }> = ({ post, recommendedPosts }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy URL');

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy URL'), 2000);
        });
    };

    const contentHtml = post.content ? marked.parse(post.content) as string : '';

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
                      <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    ) : (
                      <p className="text-gray-500">This post is currently being written. Check back soon!</p>
                    )}
                </article>

                 <nav className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-800 space-y-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Further Reading</h2>
                    <div className="space-y-4">
                        {recommendedPosts.map(p => (
                            <a href={`/#/blog/${p.slug}`} key={p.id} className="group block text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors">
                                <div className="flex justify-between items-center font-semibold">
                                    <span>{p.title}</span>
                                    <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </nav>
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
type ModalType = 'create-project' | 'edit-project' | 'create-blog' | 'edit-blog' | null;

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};


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
    const [copyProjectJsonText, setCopyProjectJsonText] = useState('Copy Example');
    const [copyBlogJsonText, setCopyBlogJsonText] = useState('Copy Example');
    const [activeModal, setActiveModal] = useState<ModalType>(null);


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
    const closeModal = () => {
        setActiveModal(null);
        setEditingProject(null);
        setEditingPost(null);
        setProjectFormData({ title: '', description: '', url: '' });
        setBlogFormData({ title: '', summary: '', url: '', image_url: '', content: '' });
    };
    
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
            refreshPosts();
            closeModal();
        }
    };
    const handleEditPost = (post: BlogPost) => {
        setEditingPost(post);
        setBlogFormData({ title: post.title, summary: post.summary, url: post.url, image_url: post.image_url, content: post.content });
        setActiveModal('edit-blog');
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
            refreshProjects();
            closeModal();
        }
    };
    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setProjectFormData({ title: project.title, description: project.description, url: project.url });
        setActiveModal('edit-project');
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
    
    const handleCopyExample = (type: 'projects' | 'blogs') => {
        let exampleJson = '';
        if (type === 'projects') {
            exampleJson = `
[
  {
    // "title": (Required) The name of your project.
    "title": "My Awesome Project",

    // "description": (Required) A short summary of the project.
    "description": "This project does amazing things and solves a real-world problem.",

    // "url": (Required) The live URL where the project can be viewed.
    "url": "https://example.com/my-project",

    // "is_featured": (Optional, defaults to false) Set to true to show this project on the homepage.
    "is_featured": true
  }
]
            `.trim();
            setCopyProjectJsonText('Copied!');
            setTimeout(() => setCopyProjectJsonText('Copy Example'), 2000);
        } else {
            exampleJson = `
[
  {
    // "title": (Required) The title of your blog post.
    "title": "My First Post in Markdown",

    // "summary": (Required) A brief summary that appears on the blog list.
    "summary": "Discover how easy it is to write content using Markdown for rich formatting.",

    // "image_url": (Optional) A direct URL to a cover image for the post.
    "image_url": "https://example.com/images/markdown-post.png",

    // "content": (Optional) The full content of the post. Markdown is supported!
    // Use '\\n' for new lines in the JSON string.
    "content": "# Heading 1\\n\\nThis is a paragraph with **bold** and *italic* text.\\n\\n- List item 1\\n- List item 2\\n\\n\`\`\`javascript\\nconsole.log('Hello, Markdown!');\\n\`\`\`",
    
    // "is_featured": (Optional, defaults to false)
    "is_featured": false
  }
]
            `.trim();
            setCopyBlogJsonText('Copied!');
            setTimeout(() => setCopyBlogJsonText('Copy Example'), 2000);
        }
        navigator.clipboard.writeText(exampleJson);
    };

    // --- Admin Dashboard UI Components ---
    const Sparkline = ({ data }: { data: number[] }) => {
        if (!data.length) return <div className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-md" />;
        const maxVal = Math.max(...data) || 1;
        const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / maxVal) * 90}`).join(' ');
        
        return (
            <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                </defs>
                <polyline fill="none" stroke="#3B82F6" strokeWidth="1" points={points} />
                <polygon fill="url(#sparkline-gradient)" points={`0,100 ${points} 100,100`} />
            </svg>
        );
    };

    const AdminCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
        <div className={`bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm ${className}`}>
            <h3 className="text-lg font-semibold dark:text-white p-4 border-b dark:border-zinc-800">{title}</h3>
            <div className="p-4">{children}</div>
        </div>
    );
    
    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <header className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold dark:text-white">Admin Dashboard</h1>
                    <a href="/#" className="text-sm font-medium text-blue-600 hover:underline">← Back to Site</a>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <AdminCard title="Web Analytics" className="lg:col-span-2">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
                                <p className="text-4xl font-bold dark:text-white">{analytics.total ?? '...'}</p>
                            </div>
                            <p className="text-sm text-gray-400">Last 7 days</p>
                        </div>
                        <Sparkline data={analytics.daily} />
                    </AdminCard>
                    <AdminCard title="Quick Actions">
                        <div className="space-y-3">
                            <button onClick={() => setActiveModal('create-project')} className="w-full text-left p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">Create New Project</button>
                            <button onClick={() => setActiveModal('create-blog')} className="w-full text-left p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">Create New Blog Post</button>
                        </div>
                    </AdminCard>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AdminCard title="Manage Projects">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {projects.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                                    <span className="truncate pr-4">{p.title}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'projects')} aria-label="Toggle Featured">
                                            <StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
                                        </button>
                                        <button onClick={() => handleEditProject(p)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteProject(p.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>

                    <AdminCard title="Manage Blog Posts">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {posts.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                                    <span className="truncate pr-4">{p.title}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleToggleFeatured(p.id, p.is_featured, 'blogs')} aria-label="Toggle Featured">
                                            <StarIcon filled={p.is_featured} className={`w-5 h-5 ${p.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
                                        </button>
                                        <button onClick={() => handleEditPost(p)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDeletePost(p.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                </div>

                <div className="mt-6">
                    <AdminCard title="Bulk Import">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 dark:text-white">Import Projects (JSON)</h4>
                                <textarea value={jsonProjects} onChange={e => setJsonProjects(e.target.value)} className="w-full h-40 p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" placeholder='Paste JSON array of projects here...'></textarea>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleBulkImport('projects')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Import Projects</button>
                                    <button onClick={() => handleCopyExample('projects')} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-sm">{copyProjectJsonText}</button>
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2 dark:text-white">Import Blog Posts (JSON)</h4>
                                <textarea value={jsonBlogs} onChange={e => setJsonBlogs(e.target.value)} className="w-full h-40 p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" placeholder='Paste JSON array of blog posts here...'></textarea>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleBulkImport('blogs')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Import Blog Posts</button>
                                    <button onClick={() => handleCopyExample('blogs')} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-sm">{copyBlogJsonText}</button>
                                </div>
                            </div>
                        </div>
                        {importStatus && <p className={`mt-4 text-sm ${importStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{importStatus.message}</p>}
                    </AdminCard>
                </div>
            </main>

            {/* Modals for Editing/Creating */}
            <Modal isOpen={activeModal === 'create-project' || activeModal === 'edit-project'} onClose={closeModal} title={editingProject ? 'Edit Project' : 'Create Project'}>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <input name="title" value={projectFormData.title} onChange={handleProjectChange} placeholder="Project Title" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <textarea name="description" value={projectFormData.description} onChange={handleProjectChange} placeholder="Project Description" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-24" required></textarea>
                    <input name="url" value={projectFormData.url} onChange={handleProjectChange} placeholder="https://example.com" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Save Project</button>
                </form>
            </Modal>
            
            <Modal isOpen={activeModal === 'create-blog' || activeModal === 'edit-blog'} onClose={closeModal} title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}>
                <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <input name="title" value={blogFormData.title} onChange={handleBlogChange} placeholder="Post Title" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="summary" value={blogFormData.summary} onChange={handleBlogChange} placeholder="Post Summary" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" required />
                    <input name="image_url" value={blogFormData.image_url} onChange={handleBlogChange} placeholder="Image URL (Optional)" className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700" />
                    <textarea name="content" value={blogFormData.content} onChange={handleBlogChange} placeholder="Post content (Markdown supported)..." className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 h-48" required></textarea>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Save Blog Post</button>
                </form>
            </Modal>
        </div>
    );
};


// --- MAIN APP ---
const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentRoute, setCurrentRoute] = useState<string>(window.location.hash || '#/');
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Simple auth state
    const [isLoading, setIsLoading] = useState(true);

    const refreshPosts = useCallback(async () => {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching posts:", error.message);
        else setPosts(data || []);
    }, []);

    const refreshProjects = useCallback(async () => {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching projects:", error.message);
        else setProjects(data || []);
    }, []);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([refreshPosts(), refreshProjects()]);
            // Log a single page visit
            supabase.from('page_visits').insert([{}]).then();
            setIsLoading(false);
        };
        loadData();
    }, [refreshPosts, refreshProjects]);

    // Theme Management
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

    // Routing
    useEffect(() => {
        const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderPage = () => {
        if (isLoading) {
            return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
        }

        if (currentRoute.startsWith('#/blog/')) {
            const slug = currentRoute.split('/blog/')[1];
            const post = posts.find(p => p.slug === slug);
            if (post) {
                const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const recommendedPosts = sortedPosts.filter(p => p.slug !== slug).slice(0, 3);
                return <BlogPostPage post={post} recommendedPosts={recommendedPosts} />;
            }
            return <HomePage posts={posts} projects={projects.filter(p => p.is_featured)} />; // Fallback to home
        }
        
        if (currentRoute === '#/admin') {
            if (!isAuthenticated) {
                return <LoginPage onLogin={setIsAuthenticated} />;
            }
            return <AdminPage posts={posts} refreshPosts={refreshPosts} projects={projects} refreshProjects={refreshProjects} />;
        }

        return <HomePage posts={posts} projects={projects.filter(p => p.is_featured)} />;
    };
    
    return (
        <>
            {renderPage()}
            {currentRoute !== '#/admin' && <Footer theme={theme} setTheme={setTheme} />}
        </>
    );
};

export default App;
