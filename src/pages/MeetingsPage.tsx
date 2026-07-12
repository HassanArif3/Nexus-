import React, { useState, useEffect } from 'react';
import { getMeetings, acceptMeeting, rejectMeeting, cancelMeeting } from '../services/meetingService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await getMeetings();
      if (data.success) {
        setMeetings(data.data.meetings);
      }
    } catch (err) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: Function, id: string) => {
    try {
      await action(id);
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
        <button onClick={() => navigate('/meetings/calendar')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">View Calendar</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {meetings.map((m: any) => (
            <div key={m._id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-bold">{m.title}</h3>
              <p className="text-sm text-gray-500">{new Date(m.startTime).toLocaleString()} - {new Date(m.endTime).toLocaleString()}</p>
              <p className="mt-2 text-sm">Status: <span className="font-bold">{m.status}</span></p>

              <div className="mt-4 flex gap-2">
                {m.status === 'pending' && (
                  <>
                    <button onClick={() => handleAction(acceptMeeting, m._id)} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                    <button onClick={() => handleAction(rejectMeeting, m._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                  </>
                )}
                {m.status === 'accepted' && (
                  <button onClick={() => navigate(`/video/${m._id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Join Video Call</button>
                )}
                <button onClick={() => handleAction(cancelMeeting, m._id)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
