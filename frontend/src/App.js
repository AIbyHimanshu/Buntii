import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";
import { stashAttribution } from "@/lib/api";
import Home from "@/pages/Home";
import Shoppers from "@/pages/Shoppers";
import Traders from "@/pages/Traders";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Admin from "@/pages/Admin";

const ScrollAndTrack = () => {
  const location = useLocation();

  useEffect(() => {
    stashAttribution(location.search);
  }, [location.search]);

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    track("page_view", { path: location.pathname, title: document.title });
  }, [location.pathname]);

  return null;
};

const SiteLayout = ({ children }) => (
  <>
    <Nav />
    {children}
    <Footer />
  </>
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollAndTrack />
      <Routes>
        <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
        <Route path="/shoppers" element={<SiteLayout><Shoppers /></SiteLayout>} />
        <Route path="/traders" element={<SiteLayout><Traders /></SiteLayout>} />
        <Route path="/privacy" element={<SiteLayout><Privacy /></SiteLayout>} />
        <Route path="/terms" element={<SiteLayout><Terms /></SiteLayout>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<SiteLayout><Home /></SiteLayout>} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}

export default App;
