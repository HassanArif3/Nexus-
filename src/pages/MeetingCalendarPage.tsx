import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getMeetingCalendar } from '../services/meetingService';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

export const MeetingCalendarPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const data = await getMeetingCalendar();
      if (data.success) {
        const mappedEvents = data.data.events.map((e: any) => ({
          title: e.title,
          start: new Date(e.start),
          end: new Date(e.end),
          allDay: false,
          resource: e
        }));
        setEvents(mappedEvents);
      }
    } catch (err) {
      toast.error('Failed to load calendar');
    }
  };

  return (
    <div className="p-6 h-[80vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Meeting Calendar</h1>
      <div className="bg-white p-4 rounded-lg shadow h-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};
