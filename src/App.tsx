import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { findCurriculum, findModule } from './data';
import { href, useRoute } from './lib/router';
import { setTheme, usePlaybook, type ThemePref } from './lib/store';
import { Rail } from './components/Rail';
import { SearchDialog } from './components/SearchDialog';
import { CurriculumView, Home, ModuleView } from './components/Views';

const THEME_NEXT: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<ThemePref, string> = { system: 'Tema: sistem', light: 'Tema: terang', dark: 'Tema: gelap' };

export default function App() {
  const route = useRoute();
  const theme = usePlaybook((s) => s.theme);
  const focusMode = usePlaybook((s) => s.focusMode);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);

  // Terapkan preferensi tema ke <html data-theme>. Mode "sistem" tidak menyentuh atribut
  // kecuali kita sendiri yang sebelumnya memasangnya (agar tidak menimpa tema host).
  const themeApplied = useRef(false);
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme !== 'system') {
      root.setAttribute('data-theme', theme);
      themeApplied.current = true;
    } else if (themeApplied.current) {
      root.removeAttribute('data-theme');
      themeApplied.current = false;
    }
  }, [theme]);

  // Pintasan keyboard: Ctrl/⌘+K atau "/" untuk mencari.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (route.name === 'home') window.scrollTo(0, 0);
  }, [route.name]);

  // Link lama (#algo…, #aws…) diarahkan ke kurikulum gabungan yang baru.
  useEffect(() => {
    if (route.name === 'home') return;
    const c = findCurriculum(route.cid);
    const hit = route.name === 'module' ? findModule(route.cid, route.mid) : undefined;
    if (c && (c.id !== route.cid || (route.name === 'module' && hit && hit.module.id !== route.mid))) {
      const next = route.name === 'module' && hit
        ? `${href.module(c.id, hit.module.id)}${route.focusId ? `/${route.focusId}` : ''}`
        : route.name === 'module' ? href.module(c.id, route.mid) : href.curriculum(c.id);
      history.replaceState(null, '', next);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }, [route]);

  useEffect(() => {
    if (!drawer && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [drawer, searchOpen]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)');
    const update = () => { setMobile(media.matches); if (!media.matches) setDrawer(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const nav = document.getElementById('playbook-navigation');
    nav?.querySelector<HTMLElement>('a, button')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = [...(nav?.querySelectorAll<HTMLElement>('a, button:not(:disabled)') ?? [])];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', trapFocus);
    return () => { window.removeEventListener('keydown', trapFocus); previous?.focus({ preventScroll: true }); };
  }, [drawer]);

  // Judul tab browser mengikuti halaman aktif.
  useEffect(() => {
    let t = 'Backend Playbook';
    if (route.name === 'curriculum') t = `${findCurriculum(route.cid)?.short ?? 'Kurikulum'} · Backend Playbook`;
    if (route.name === 'module') t = `${findModule(route.cid, route.mid)?.module.title ?? 'Modul'} · Backend Playbook`;
    document.title = t;
  }, [route]);

  const crumbs = breadcrumbs(route);

  return (
    <div className={`app ${drawer ? 'drawer-open' : ''} ${focusMode && route.name === 'module' ? 'is-focus' : ''}`}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Langsung ke materi</a>
      <Rail route={route} onNavigate={() => setDrawer(false)} inactive={searchOpen || (mobile && !drawer) || (focusMode && route.name === 'module')} />
      <div className="drawer-scrim" onClick={() => setDrawer(false)} aria-hidden="true" />

      <div className="main" inert={drawer || searchOpen}>
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label={drawer ? 'Tutup menu' : 'Buka menu'} aria-expanded={drawer} aria-controls="playbook-navigation" onClick={() => setDrawer(!drawer)}>
            <span className="burger" aria-hidden="true" />
          </button>
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) =>
              c.href && i < crumbs.length - 1 ? (
                <a key={i} href={c.href}>
                  {c.label}
                </a>
              ) : (
                <span key={i} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                  {c.label}
                </span>
              ),
            )}
          </nav>
          <button type="button" className="search-btn" aria-label="Cari materi" onClick={() => setSearchOpen(true)}>
            <span className="search-icon" aria-hidden="true" />
            <span className="search-btn-label">Cari materi…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn theme-btn"
            onClick={() => setTheme(THEME_NEXT[theme])}
            aria-label={`${THEME_LABEL[theme]}. Klik untuk ganti.`}
            title={THEME_LABEL[theme]}
          >
            <span className={`theme-glyph t-${theme}`} aria-hidden="true" />
          </button>
        </header>

        <main className="content" id="main" tabIndex={-1}>
          {route.name === 'home' && <Home />}
          {route.name === 'curriculum' && <CurriculumView cid={route.cid} />}
          {route.name === 'module' && <ModuleView key={`${route.cid}.${route.mid}`} cid={route.cid} mid={route.mid} focusId={route.focusId} />}
        </main>
      </div>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function breadcrumbs(route: ReturnType<typeof useRoute>) {
  const out: { label: string; href?: string }[] = [{ label: 'Beranda', href: href.home() }];
  if (route.name === 'home') return out;
  const c = findCurriculum(route.cid);
  if (c) out.push({ label: c.short, href: href.curriculum(c.id) });
  if (route.name === 'module') {
    const m = findModule(route.cid, route.mid);
    if (m) out.push({ label: `${m.module.code} · ${m.module.title}` });
  }
  return out;
}
