import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import EditorContainer from './components/EditorContainer';
import ZenModeControls from './components/ZenMode/ZenModeControls';
import ZenModeBackground from './components/ZenMode/ZenModeBackground';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AppProvider>
      <ZenModeBackground>
        <div className="flex flex-col h-screen">
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          
          <div className="flex-grow flex relative">
            {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} />}
            
            <main className="flex-grow transition-all duration-300">
              <EditorContainer />
            </main>
          </div>
          
          <ZenModeControls />
        </div>
      </ZenModeBackground>
    </AppProvider>
  );
}

export default App;