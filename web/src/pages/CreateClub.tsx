import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClub, getCountries, getCities } from '../services/api';
import { Users, Info, ArrowLeft, MapPin } from 'lucide-react';

export function CreateClub() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countryId, setCountryId] = useState('');
  const [cityId, setCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCountries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    if (countryId) {
      getCities(countryId).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [countryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const club = await createClub({ name, description, cityId });
      navigate(`/clubs/${club.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/clubs')} className="flex items-center text-forest-green hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clubs
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-forest-green bg-opacity-10 rounded-xl flex items-center justify-center text-forest-green">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start a Hiking Club</h2>
            <p className="text-gray-500">Bring people together for new adventures.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition"
              placeholder="e.g. Peak Seekers Istanbul"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition"
              placeholder="What is your club about? What kind of hikes do you organize?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-forest-green" /> Country
              </label>
              <select
                required
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition bg-white"
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-forest-green" /> City
              </label>
              <select
                required
                disabled={!countryId}
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition bg-white disabled:bg-gray-50"
              >
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-sand bg-opacity-10 p-4 rounded-xl border border-sand border-opacity-20 flex items-start">
            <Info className="w-5 h-5 text-earth-brown mr-3 mt-0.5" />
            <p className="text-xs text-gray-600 italic">
              Providing your location helps local hikers find your club more easily.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-green text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Creating Group...' : 'Create Club'}
          </button>
        </form>
      </div>
    </div>
  );
}
