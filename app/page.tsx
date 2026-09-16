import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, Users, MessageSquare, WandSparkles, Target, Play, ShieldCheck } from 'lucide-react'

const benefits = [
  { icon: Target, title: 'Discover', text: 'Find creators and content that actually match your niche and interests.' },
  { icon: Users, title: 'Support', text: 'Give genuine feedback and build relationships with creators on the same journey.' },
  { icon: WandSparkles, title: 'Improve', text: 'Use practical AI coaching for hooks, titles, CTAs, ideas and positioning.' },
  { icon: Sparkles, title: 'Grow', text: 'Turn useful attention into a stronger creator network and a clearer content strategy.' },
]

const creatorTypes = ['YouTube Creators', 'Shorts Creators', 'Emerging Creators', 'African Creators']

export default function Home() {
  return <main>
    <nav className="nav container"><Link className="brand" href="/">theophos<span>hub</span></Link><div className="navlinks"><a href="#how">How it works</a><a href="#why">Why creators</a></div><div className="navactions"><Link href="/login" className="btn ghost">Sign in</Link><Link href="/join" className="btn primary">Join free <ArrowRight size={16}/></Link></div></nav>

    <section className="hero container"><div className="heroCopy"><div className="eyebrow"><span className="pulse"/> Built for creators, not random users</div><h1>Your content deserves to be <em>discovered.</em></h1><p className="lead">Theophos Hub helps creators discover relevant creators, receive meaningful feedback, improve their content, build relationships, and grow a real audience.</p><div className="heroActions"><Link href="/join" className="btn primary large">Join the Creator Community <ArrowRight size={18}/></Link><a href="#how" className="btn soft large"><Play size={17}/> See how it works</a></div><div className="trust"><ShieldCheck size={17}/> Genuine discovery. No fake likes. No guaranteed subscribers.</div></div><div className="dashboardMock"><div className="mockTop"><div><small>Creator dashboard</small><strong>Good morning, Creator 👋</strong></div><span className="avatar">EC</span></div><div className="mission"><div><span className="tag">TODAY'S MISSION</span><h3>Support 3 relevant creators</h3><p>Give useful feedback. Build genuine connections.</p></div><div className="progress">2/3</div></div><div className="mockGrid"><div><small>XP</small><b>1,240</b><span>+180 this week</span></div><div><small>Reputation</small><b>86</b><span>Community Builder</span></div><div><small>Streak</small><b>5 days</b><span>Keep going 🔥</span></div></div><div className="coach"><div className="coachIcon"><Sparkles size={17}/></div><div><small>AI CREATOR COACH</small><p>Your topic is strong. Make the first 10 seconds more specific to the viewer's problem.</p></div></div></div></section>

    <section className="ticker"><div className="container tickerInner">{creatorTypes.map(x => <span key={x}><CheckCircle2 size={15}/>{x}</span>)}</div></section>

    <section id="how" className="section container"><div className="sectionHead"><span className="eyebrow">THE CREATOR LOOP</span><h2>A better way to grow <span>together.</span></h2><p>Not a watch-exchange. A practical community where creators help creators become better.</p></div><div className="benefitGrid">{benefits.map(({icon: Icon,title,text},i)=><article className="benefit" key={title}><div className="iconBox"><Icon size={21}/></div><span className="num">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section id="why" className="darkSection"><div className="container split"><div><span className="eyebrow light">WHY THEOPHOS</span><h2>Creating alone is hard.<br/><span>Growing together is different.</span></h2><p>Small creators don't need empty numbers. They need relevant people, honest feedback, useful tools and reasons to keep improving.</p><Link href="/join" className="btn primary large">Become a Founding Creator <ArrowRight size={18}/></Link></div><div className="principles"><div><MessageSquare/><div><b>Meaningful feedback</b><p>Structured feedback on hooks, titles, thumbnails, value, presentation and CTAs.</p></div></div><div><WandSparkles/><div><b>Actionable AI</b><p>Turn feedback into concrete next steps instead of generic motivation.</p></div></div><div><Users/><div><b>Relevant relationships</b><p>Discover creators based on niches, interests and shared goals.</p></div></div></div></div></section>

    <section className="founder container"><div className="founderCard"><div><span className="eyebrow">FOUNDING CREATOR PROGRAM</span><h2>Help build the creator community from day one.</h2><p>Early creators can earn a Founding Creator badge, shape future features and get early access to new tools.</p></div><Link href="/join" className="btn primary large">Join the founding community <ArrowRight size={18}/></Link></div></section>

    <footer className="footer container"><Link className="brand" href="/">theophos<span>hub</span></Link><p>Create. Discover. Support. Grow.</p><small>© 2026 Theophos Hub</small></footer>
  </main>
}
