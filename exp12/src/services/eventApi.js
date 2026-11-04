import axios from 'axios';

export const EVENTS_API_URL = 'https://jsonplaceholder.typicode.com/posts';

const CATEGORIES = [
  { name: 'Tech & Coding', emoji: '💻', venue: 'CS Lab 3 & Auditorium' },
  { name: 'Arts & Culture', emoji: '🎨', venue: 'Student Activity Centre' },
  { name: 'Sports & Fitness', emoji: '⚽', venue: 'Main Sports Arena' },
  { name: 'Career & Placement', emoji: '💼', venue: 'Management Block Hall' },
  { name: 'Academic Seminar', emoji: '🔬', venue: 'Central Lecture Theatre' },
];

/**
 * Capitalizes the first letter of each word in a string.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Adapts raw REST API post objects from JSONPlaceholder into a campus-event schema.
 */
function transformApiItemToEvent(item) {
  const categoryIndex = (Number(item.id) || 1) % CATEGORIES.length;
  const category = CATEGORIES[categoryIndex];

  // Deterministically generate a realistic date within the upcoming 30 days
  const eventDay = ((Number(item.id) * 3) % 28) + 1;
  const eventDate = `Nov ${eventDay < 10 ? '0' + eventDay : eventDay}, 2026`;

  return {
    id: String(item.id),
    title: toTitleCase(item.title),
    description: item.body,
    category: category.name,
    emoji: category.emoji,
    venue: category.venue,
    date: eventDate,
    time: `${(Number(item.id) % 6) + 10}:00 AM - ${(Number(item.id) % 6) + 1}:00 PM`,
    organizer: `Campus ${category.name} Committee`,
    registeredCount: (Number(item.id) * 17) % 250 + 25,
  };
}

/**
 * Fetches dynamic campus events from the REST API endpoint using Axios.
 *
 * @param {number} [limit=15] - Maximum number of events to retrieve.
 * @returns {Promise<Array<Object>>} Formatted campus events.
 */
export async function fetchCampusEvents(limit = 15) {
  try {
    const response = await axios.get(EVENTS_API_URL, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected API response: Expected an array of events.');
    }

    const events = response.data
      .slice(0, limit)
      .map(transformApiItemToEvent);

    return events;
  } catch (error) {
    console.error('[eventApi] Error fetching campus events:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      if (error.response) {
        throw new Error(`Server returned status ${error.response.status}. Please try again later.`);
      }
      if (error.request) {
        throw new Error('No internet connection. Please verify your network and retry.');
      }
    }
    throw new Error(error.message || 'Failed to load events from server.');
  }
}
