import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import DSA from "./pages/DSA";
import SystemDesign from "./pages/SystemDesign";
import Behavioral from "./pages/Behavioral";
import AuthPage from "@/components/AuthPage";
import Bookmarks from "./pages/Bookmarks";
import MockInterview from "./pages/MockInterview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename="/cracking-interview/">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/system-design" element={<SystemDesign />} />
            <Route path="/behavioral" element={<Behavioral />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
