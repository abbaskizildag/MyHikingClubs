import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, EventDetails, Login, Register, Clubs, CreateClub, ClubDetails, CreateEvent, EditEvent, EditClub } from './pages';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Map as MapIcon } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-forest-green text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-sand transition flex items-center">
          <MapIcon className="w-6 h-6 mr-2" />
          My Hiking Clubs
        </Link>
        <nav>
          <ul className="flex items-center space-x-6">
            <li><Link to="/" className="hover:text-sand transition">Home</Link></li>
            <li><Link to="/clubs" className="hover:text-sand transition">Clubs</Link></li>
            {user ? (
              <li className="flex items-center space-x-4 border-l pl-6 border-forest-green border-opacity-30">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-sand text-forest-green flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium hidden sm:inline">{user.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="bg-sand hover:bg-opacity-90 p-2.5 rounded-xl transition text-forest-green shadow-lg flex items-center group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition" />
                </button>
              </li>
            ) : (
              <li className="space-x-4">
                <Link to="/login" className="hover:text-sand transition">Login</Link>
                <Link to="/register" className="bg-sand text-forest-green px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition">
                  Register
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/new" element={<CreateClub />} />
              <Route path="/clubs/:id" element={<ClubDetails />} />
              <Route path="/clubs/:id/events/new" element={<CreateEvent />} />
              <Route path="/event/:id/edit" element={<EditEvent />} />
          <Route path="/clubs/:id/edit" element={<EditClub />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-gray-400 py-10 text-center border-t border-gray-800">
            <div className="container mx-auto px-4">
              <p className="text-white font-bold mb-2">My Hiking Clubs</p>
              <p className="text-sm mb-4">Discover the best hiking trails and join our passionate community.</p>
              <div className="flex justify-center space-x-6 mb-6">
                <Link to="/clubs" className="hover:text-white transition">Explore Clubs</Link>
                <Link to="/" className="hover:text-white transition">Upcoming Events</Link>
              </div>
              <p className="text-xs">&copy; {new Date().getFullYear()} My Hiking Clubs. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
