
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { ExternalLinkIcon, SunIcon, MoonIcon, CommandIcon, XIcon, InstagramIcon } from './components/Icons';

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
            )) : <p className="text-gray-500 dark:text-gray-400">No projects to display yet.</p>}
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
        <main className="min-h-screen flex items-center justify-center">
            <div className="max-w-sm w-full mx-auto px-6">
                <div className="space-y-6">
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


const AdminPage: React.FC<{
    posts: BlogPost[];
    refreshPosts: () => void;
}> = ({ posts, refreshPosts }) => {
    type FormData = Omit<BlogPost, 'id' | 'created_at' | 'slug'>;
    const emptyPost: FormData = { title: '', summary: '', url: '', image_url: '', content: '' };
    
    const [formData, setFormData] = useState<FormData>(emptyPost);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPost) { // Update
            const { error } = await supabase
                .from('blogs')
                .update({ ...formData, slug: slugify(formData.title) })
                .eq('id', editingPost.id);
            if (error) console.error("Error updating post:", error.message);
        } else { // Create
            const { error } = await supabase
                .from('blogs')
                .insert([{ ...formData, slug: slugify(formData.title) }]);
            if (error) console.error("Error creating post:", error.message);
        }
        setFormData(emptyPost);
        setEditingPost(null);
        refreshPosts();
    };
    
    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            summary: post.summary,
            url: post.url,
            image_url: post.image_url,
            content: post.content
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setFormData(emptyPost);
    };

    const handleDelete = async (postId: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            const { error } = await supabase.from('blogs').delete().eq('id', postId);
            if (error) console.error("Error deleting post:", error.message);
            else refreshPosts();
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-6 py-16">
            <a href="/#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                &larr; Back to Portfolio
            </a>
            <h1 className="text-3xl font-bold my-8 dark:text-white">Admin Panel</h1>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800">
                <h2 className="text-xl font-semibold dark:text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                <input type="text" name="summary" placeholder="Summary" value={formData.summary} onChange={handleChange} required className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                <input type="text" name="url" placeholder="Project URL" value={formData.url} onChange={handleChange} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                <input type="text" name="image_url" placeholder="Image URL" value={formData.image_url} onChange={handleChange} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"/>
                <textarea name="content" placeholder="Content (HTML)" value={formData.content} onChange={handleChange} rows={10} className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"></textarea>
                <div className="flex gap-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingPost ? 'Update Post' : 'Create Post'}</button>
                    {editingPost && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600">Cancel</button>}
                </div>
            </form>

            <div className="mt-12">
                <h2 className="text-2xl font-semibold dark:text-white">Existing Posts</h2>
                <ul className="mt-4 space-y-3">
                    {posts.map(post => (
                        <li key={post.id} className="p-4 flex justify-between items-center bg-gray-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800">
                            <div>
                               <p className="font-semibold dark:text-white">{post.title}</p>
                               <p className="text-sm text-gray-500">{post.summary}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handleEdit(post)} className="text-sm text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(post.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
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

    const fetchProjects = useCallback(async () => {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching projects:", error);
        else setProjects(data || []);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchPosts(), fetchProjects()]);
            setLoading(false);
        };
        fetchData();
    }, [fetchPosts, fetchProjects]);

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
        }
    };

    const path = route.replace(/^#/, '');
    let pageContent;
    let showFooter = true;

    if (loading) {
        pageContent = <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;
    } else if (path.startsWith('/blog/')) {
        const slug = path.substring('/blog/'.length);
        const post = posts.find(p => p.slug === slug);
        pageContent = post ? <BlogPostPage post={post} /> : <HomePage posts={posts} projects={projects} />;
    } else if (path === '/admin') {
        if (isAdminAuthenticated) {
            pageContent = <AdminPage posts={posts} refreshPosts={fetchPosts} />;
        } else {
            pageContent = <LoginPage onLogin={handleLogin} />;
            showFooter = false;
        }
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
