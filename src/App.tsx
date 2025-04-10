
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ItemsProvider } from "@/context/ItemsContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import ReportItemPage from "@/pages/ReportItemPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Add title to document
document.title = "FindMyItem Kenya - Lost & Found";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ItemsProvider>
        <div className="flex min-h-screen flex-col">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/report" element={<ReportItemPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </div>
      </ItemsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
