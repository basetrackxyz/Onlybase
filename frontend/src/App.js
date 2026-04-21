import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
import DiscoverPage from "@/pages/DiscoverPage";
import SwapPage from "@/pages/SwapPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import CreatorProfilePage from "@/pages/CreatorProfilePage";
import CreatePostPage from "@/pages/CreatePostPage";

function App() {
  return (
    <div className="App font-sans">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/swap" element={<SwapPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/creator/:id" element={<CreatorProfilePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
