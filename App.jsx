import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const plans = [
  { name: "Monthly", price: "$49", cadence: "/ month", icon: CalendarClock, color: "emerald" },
  { name: "Student", price: "$32", cadence: "/ month", icon: ClipboardList, color: "cyan" },
  { name: "Personal Training", price: "$129", cadence: "/ month", icon: Activity, color: "purple" },
  { name: "Quarterly", price: "$125", cadence: "/ quarter", icon: CircleDollarSign, color: "orange" },
];

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: UsersRound },
  { id: "renewals", label: "Renewals", icon: CalendarClock },
  { id: "plans", label: "Plans", icon: ClipboardList },
];

const initialMember = { name: "", phone: "", plan: "Monthly", expiry_date: "" };

function getMembershipStatus(expiryDate) {
  if (!expiryDate) return "active";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const daysLeft = Math.ceil((expiry - today) / 86400000);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

function formatDate(date) {
  if (!date) return "No expiry date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getFirstName(user) {
  return user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return <AppLoader />;
  if (!session) return <LoginScreen />;
  return <Dashboard session={session} />;
}

function AppLoader() {
  return (
    <main className="center-screen">
      <div className="brand-mark"><Dumbbell size={22} /></div>
      <Loader2 className="spin" size={24} />
      <p>Loading GymFlow Pro...</p>
    </main>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function continueWithGoogle() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const action = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await action;
    setLoading(false);
    if (error) return setMessage(error.message);
    if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is enabled.");
    }
  }

  return (
    <main className="login-page">
      <div className="login-orb orb-one" />
      <div className="login-orb orb-two" />
      <section className="login-brand">
        <div className="brand-lockup">
          <div className="brand-mark"><Dumbbell size={22} /></div>
          <span>GymFlow <strong>Pro</strong></span>
        </div>
        <div className="login-copy">
          <div className="eyebrow"><Sparkles size={14} /> Gym operations, elevated</div>
          <h1>Run your gym.<br /><span>Own the flow.</span></h1>
          <p>Manage members, renewals, and plans in one place.</p>
        </div>
        <div className="login-highlights">
          <div><CheckCircle2 size={18} /><span>Member tracking</span></div>
          <div><CheckCircle2 size={18} /><span>Renewal insights</span></div>
          <div><CheckCircle2 size={18} /><span>Secure cloud access</span></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-logo brand-lockup">
            <div className="brand-mark"><Dumbbell size={20} /></div>
            <span>GymFlow <strong>Pro</strong></span>
          </div>
          <div>
            <p className="muted-label">WELCOME BACK</p>
            <h2>{mode === "login" ? "Sign in to your dashboard" : "Create your account"}</h2>
            <p className="login-subtitle">Use your account to manage your gym securely.</p>
          </div>

          <button className="google-button" onClick={continueWithGoogle} disabled={loading}>
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="divider"><span>or continue with email</span></div>

          <form onSubmit={handleEmailAuth}>
            <label>
              Email address
              <div className="input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="you@yourgym.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-wrap">
                <ShieldCheck size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {message && <p className="auth-message">{message}</p>}
            <button className="primary-button login-submit" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowUpRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "New to GymFlow Pro?" : "Already have an account?"}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ session }) {
  const [page, setPage] = useState("overview");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setNotice(error.message);
    else setMembers((data || []).map((member) => ({ ...member, status: getMembershipStatus(member.expiry_date) })));
    setLoading(false);
  }

  async function saveMember(member) {
    const payload = {
      name: member.name.trim(),
      phone: member.phone.trim(),
      plan: member.plan,
      expiry_date: member.expiry_date,
      status: getMembershipStatus(member.expiry_date),
      user_id: session.user.id,
    };
    const query = member.id
      ? supabase.from("members").update(payload).eq("id", member.id)
      : supabase.from("members").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setNotice(member.id ? "Member details updated." : "New member added.");
    setModal(null);
    await fetchMembers();
  }

  async function deleteMember(id) {
    if (!window.confirm("Delete this member? This cannot be undone.")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return setNotice(error.message);
    setNotice("Member deleted.");
    await fetchMembers();
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const stats = useMemo(() => {
    const count = (status) => members.filter((member) => member.status === status).length;
    return { total: members.length, active: count("active"), expiring: count("expiring"), expired: count("expired") };
  }, [members]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <div className="brand-mark"><Dumbbell size={20} /></div>
            <span>GymFlow <strong>Pro</strong></span>
          </div>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav>
          <p className="nav-section-label">MAIN MENU</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {item.id === "renewals" && stats.expiring + stats.expired > 0 && <b>{stats.expiring + stats.expired}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="pro-card">
            <div className="mini-icon"><Sparkles size={16} /></div>
            <p>GymFlow Pro</p>
            <span>Member operations made simple.</span>
          </div>
          <button className="nav-item sign-out" onClick={signOut}><LogOut size={18} /> Sign out</button>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div>
            <p className="muted-label">GYMFLOW PRO</p>
            <h2>{navigation.find((item) => item.id === page)?.label}</h2>
          </div>
          <div className="topbar-actions">
            <button className="primary-button" onClick={() => setModal({ ...initialMember })}><Plus size={18} /> <span>Add member</span></button>
            <div className="profile">
              <div className="profile-avatar">{getFirstName(session.user).slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{getFirstName(session.user)}</strong>
                <span>Gym admin</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
          {loading ? <LoadingBlock /> : (
            <>
              {page === "overview" && <Overview members={members} stats={stats} setPage={setPage} onAdd={() => setModal({ ...initialMember })} />}
              {page === "members" && <MembersPage members={members} onEdit={setModal} onDelete={deleteMember} />}
              {page === "renewals" && <RenewalsPage members={members} />}
              {page === "plans" && <PlansPage members={members} />}
            </>
          )}
        </section>
      </main>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      {modal && <MemberModal member={modal} onClose={() => setModal(null)} onSave={saveMember} />}
    </div>
  );
}

function Overview({ members, stats, setPage, onAdd }) {
  const recent = members.slice(0, 5);
  const statCards = [
    { label: "Total members", value: stats.total, icon: UsersRound, tone: "cyan", detail: "All registered members" },
    { label: "Active memberships", value: stats.active, icon: CheckCircle2, tone: "emerald", detail: "Currently active" },
    { label: "Expiring soon", value: stats.expiring, icon: AlertTriangle, tone: "orange", detail: "Within the next 7 days" },
    { label: "Expired memberships", value: stats.expired, icon: XCircle, tone: "pink", detail: "Require attention" },
  ];
  return (
    <>
      <section className="hero-card">
        <div>
          <p className="muted-label">OPERATIONS OVERVIEW</p>
          <h1>Good to see you.</h1>
          <p>Keep your members moving and your gym running smoothly.</p>
        </div>
        <button className="secondary-button" onClick={onAdd}><Plus size={18} /> Add new member</button>
      </section>
      <section className="stat-grid">
        {statCards.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.tone}`}><stat.icon size={20} /></div>
            <div className="stat-value">{stat.value}</div>
            <h3>{stat.label}</h3>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>
      <section className="section-grid">
        <article className="data-card wide">
          <CardHeader title="Recent members" subtitle="The latest members added to your gym" onView={() => setPage("members")} />
          <MemberTable members={recent} emptyText="No members yet. Add your first member to get started." />
        </article>
        <article className="data-card activity-panel">
          <CardHeader title="Renewal pulse" subtitle="Membership health at a glance" onView={() => setPage("renewals")} />
          <div className="pulse-content">
            <div className="pulse-ring">
              <strong>{stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%</strong>
              <span>active</span>
            </div>
            <div className="pulse-list">
              <div><i className="dot emerald" /> Active <strong>{stats.active}</strong></div>
              <div><i className="dot orange" /> Expiring <strong>{stats.expiring}</strong></div>
              <div><i className="dot pink" /> Expired <strong>{stats.expired}</strong></div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function MembersPage({ members, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = members.filter((member) => {
    const matchesSearch = `${member.name} ${member.phone || ""} ${member.plan || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === "all" || member.status === filter);
  });
  return (
    <>
      <PageIntro title="Members" subtitle="Track your member base, plans, and membership status." />
      <section className="data-card">
        <div className="toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="filter-tabs">
            <Filter size={16} />
            {["all", "active", "expiring", "expired"].map((item) => (
              <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <MemberTable members={filtered} onEdit={onEdit} onDelete={onDelete} emptyText="No members match your search." />
      </section>
    </>
  );
}

function RenewalsPage({ members }) {
  const renewals = members.filter((member) => member.status !== "active").sort((a, b) => (a.expiry_date || "").localeCompare(b.expiry_date || ""));
  return (
    <>
      <PageIntro title="Renewals" subtitle="Stay ahead of expiring memberships and follow up at the right time." />
      <section className="data-card">
        <CardHeader title="Renewal queue" subtitle={`${renewals.length} members need your attention`} />
        {renewals.length ? (
          <div className="renewal-list">
            {renewals.map((member) => (
              <div className="renewal-row" key={member.id}>
                <MemberIdentity member={member} />
                <div className="renewal-date"><span>Expiry date</span><strong>{formatDate(member.expiry_date)}</strong></div>
                <StatusBadge status={member.status} />
                <button className="whatsapp-button" title="WhatsApp reminders coming soon" disabled><MessageCircle size={17} /> WhatsApp reminder</button>
              </div>
            ))}
          </div>
        ) : <EmptyState text="Everything is looking healthy. No renewals need attention." />}
      </section>
    </>
  );
}

function PlansPage({ members }) {
  return (
    <>
      <PageIntro title="Plans" subtitle="An overview of your gym's membership packages and active subscribers." />
      <section className="plan-grid">
        {plans.map((plan) => {
          const active = members.filter((member) => member.plan === plan.name && member.status === "active").length;
          return (
            <article className="plan-card" key={plan.name}>
              <div className={`stat-icon ${plan.color}`}><plan.icon size={21} /></div>
              <button className="more-button"><MoreHorizontal size={20} /></button>
              <p className="muted-label">MEMBERSHIP PLAN</p>
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.price}<span>{plan.cadence}</span></div>
              <div className="plan-members"><UsersRound size={17} /><strong>{active}</strong> active members</div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function MemberTable({ members, onEdit, onDelete, emptyText }) {
  if (!members.length) return <EmptyState text={emptyText} />;
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Member</th><th>Phone</th><th>Plan</th><th>Expiry date</th><th>Status</th>{onEdit && <th />}</tr></thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td><MemberIdentity member={member} /></td>
              <td><span className="phone-cell"><Phone size={14} />{member.phone || "Not provided"}</span></td>
              <td>{member.plan || "Unassigned"}</td>
              <td>{formatDate(member.expiry_date)}</td>
              <td><StatusBadge status={member.status} /></td>
              {onEdit && <td className="row-actions">
                <button title="Edit member" onClick={() => onEdit(member)}><Edit3 size={16} /></button>
                <button title="Delete member" onClick={() => onDelete(member.id)}><Trash2 size={16} /></button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function update(key, value) { setForm({ ...form, [key]: value }); }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try { await onSave(form); } catch (err) { setError(err.message); setSaving(false); }
  }
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div><p className="muted-label">MEMBER PROFILE</p><h2>{member.id ? "Edit member" : "Add new member"}</h2></div>
          <button className="icon-button" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="form-grid">
          <label>Full name<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Maya Patel" required /></label>
          <label>Phone number<input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 012 3456" /></label>
          <label>Membership plan<select value={form.plan || "Monthly"} onChange={(e) => update("plan", e.target.value)}>{plans.map((plan) => <option key={plan.name}>{plan.name}</option>)}</select></label>
          <label>Expiry date<input type="date" value={form.expiry_date || ""} onChange={(e) => update("expiry_date", e.target.value)} required /></label>
        </div>
        {error && <p className="auth-message">{error}</p>}
        <div className="modal-footer">
          <button className="text-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={saving}>{saving ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}{member.id ? "Save changes" : "Add member"}</button>
        </div>
      </form>
    </div>
  );
}

function CardHeader({ title, subtitle, onView }) {
  return <header className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>{onView && <button onClick={onView}>View all <ChevronRight size={16} /></button>}</header>;
}
function PageIntro({ title, subtitle }) { return <div className="page-intro"><p className="muted-label">GYM OPERATIONS</p><h1>{title}</h1><span>{subtitle}</span></div>; }
function StatusBadge({ status }) { return <span className={`status ${status}`}><i />{status}</span>; }
function MemberIdentity({ member }) { return <div className="member-identity"><div className="member-avatar">{member.name.slice(0, 1).toUpperCase()}</div><strong>{member.name}</strong></div>; }
function EmptyState({ text }) { return <div className="empty-state"><UserRound size={24} /><p>{text}</p></div>; }
function LoadingBlock() { return <div className="loading-block"><Loader2 className="spin" size={24} /><p>Loading your gym data...</p></div>; }
function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" /><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.61 0-4.82-1.76-5.61-4.13H3.05v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.39 13.89A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.89V7.52H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.48l3.34-2.59Z" /><path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.82 1.49l2.87-2.87C16.96 2.99 14.7 2 12 2a10 10 0 0 0-8.95 5.52l3.34 2.59C7.18 7.74 9.39 5.98 12 5.98Z" /></svg>; }
