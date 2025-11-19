import { useState, useEffect } from 'react';
import { userAPI } from '@/api';
import { useAuth } from '@/context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [assignment, setAssignment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
    fetchAllUsers();
  }, []);

  const fetchAssignment = async () => {
    try {
      const data = await userAPI.getAssignment();
      setAssignment(data.assigned_to);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { msg?: string } } };
        setError(error.response?.data?.msg || 'Failed to load assignment');
      } else {
        setError('Failed to load assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await userAPI.getAllUsers();
      const nonAdminNames = data.users
        .filter(user => !user.is_admin)
        .map(user => user.name);
      setAllUsers(nonAdminNames);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleReveal = async () => {
    if (!assignment || allUsers.length === 0) return;
    
    try {
      const data = await userAPI.getAssignment();
      if (data.has_drawn) {
        setRevealed(true);
        return;
      }
    } catch (err) {
      console.error('Failed to check view status:', err);
    }
    
    setRolling(true);
    let index = 0;
    let speed = 50;
    const maxSpeed = 300;
    const acceleration = 1.08;
    let iterations = 0;
    
    const roll = () => {
      setCurrentName(allUsers[index % allUsers.length]);
      index++;
      iterations++;
      
      if (speed < maxSpeed) {
        speed *= acceleration;
        setTimeout(roll, speed);
      } else if (iterations < 40) {
        setTimeout(roll, speed);
      } else {
        setTimeout(() => {
          setCurrentName(assignment);
          setTimeout(async () => {
            setRolling(false);
            setRevealed(true);
            try {
              await userAPI.markAssignmentViewed();
            } catch (err) {
              console.error('Failed to mark as viewed:', err);
            }
          }, 500);
        }, maxSpeed);
      }
    };
    
    roll();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 text-center sm:text-left">🎄 Your Secret Santa</h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center">
            <p className="text-red-600 text-base sm:text-lg">{error}</p>
            <p className="text-gray-600 text-sm sm:text-base mt-4">Assignments haven't been generated yet. Check back later!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                Click below to reveal your Secret Santa assignment
              </h2>

              {!revealed && !rolling ? (
                <button
                  onClick={handleReveal}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white text-lg sm:text-xl font-bold rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
                  disabled={allUsers.length === 0}
                >
                  🎁 Reveal Your Person
                </button>
              ) : rolling ? (
                <div className="mt-4 sm:mt-6 p-6 sm:p-8 bg-white rounded-lg border-2 sm:border-4 border-red-600 shadow-xl">
                  <p className="text-gray-700 text-lg sm:text-xl mb-4">Rolling...</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 animate-pulse wrap-break-word">{currentName}</p>
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 sm:mt-6 p-6 sm:p-8 bg-linear-to-r from-red-100 to-green-100 rounded-lg border-2 sm:border-4 border-green-600 shadow-xl">
                  <p className="text-gray-700 text-lg sm:text-xl mb-4">You are the Secret Santa for:</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-4 wrap-break-word">{assignment}</p>
                  <p className="text-gray-600 text-sm sm:text-base mt-4 sm:mt-6">
                    🤫 Remember, it's a secret! Don't tell anyone who you got!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
