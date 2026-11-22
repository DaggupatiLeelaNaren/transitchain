import { Notification, ChatConversation, ChatMessage, Booking } from '../models/Operations.js';
import { Route, Stop } from '../models/Transport.js';
import { sendSuccess, sendError } from '../utils/response.js';

// --- NOTIFICATIONS ---
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    return sendSuccess(res, notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, notification);
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'system', userId } = req.body;
    const targetUser = userId || req.user._id;
    const notification = await Notification.create({
      userId: targetUser,
      title,
      message,
      type
    });
    return sendSuccess(res, notification, 'Notification sent', 201);
  } catch (err) {
    next(err);
  }
};

// --- SUPPORT CHATBOT ---
export const handleChatMessage = async (req, res, next) => {
  try {
    const { sessionId = 'default_session', text } = req.body;
    if (!text) return sendError(res, 'Message text is required', 400);

    let conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      conversation = await ChatConversation.create({
        sessionId,
        userId: req.user ? req.user._id : null
      });
    }

    // Save user message
    await ChatMessage.create({
      conversationId: conversation._id,
      sender: 'user',
      text
    });

    const lower = text.toLowerCase().trim();
    let reply = '';
    let intent = 'general';
    let actionPayload = null;

    if (lower.includes('how to search') || lower.includes('plan journey') || lower.includes('book a ticket')) {
      intent = 'journey_search_help';
      reply = `To plan a journey on TransitChain:
1. Enter your origin (e.g. Indira Nagar - Gachibowli) and destination (e.g. KPHB Colony).
2. Choose your preferred modes (Bus, Metro, Walk) and departure time.
3. Select your journey priority: Fastest, Lowest Fare, Fewest Transfers, or Balanced.
4. Click "Find Best Journeys" to see ranked multi-modal options with Leaflet map visualization!`;
    } else if (lower.includes('my booking') || lower.includes('booking status') || lower.includes('pnr')) {
      intent = 'booking_status_query';
      if (req.user) {
        const latestBooking = await Booking.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (latestBooking) {
          reply = `Here is your latest booking:
• Ref: ${latestBooking.bookingReference}
• Route: ${latestBooking.routeShortName} (${latestBooking.fromStopName} ➔ ${latestBooking.toStopName})
• Status: ${latestBooking.status.toUpperCase()}
• Departure: ${latestBooking.departureTime} | Fare: ₹${latestBooking.totalFare}`;
          actionPayload = { booking: latestBooking };
        } else {
          reply = "You don't have any bookings yet. You can search and book a bus or metro trip anytime!";
        }
      } else {
        reply = "Please log in to your TransitChain account to view your active bookings and tickets.";
      }
    } else if (lower.includes('cancel') || lower.includes('refund')) {
      intent = 'cancellation_help';
      reply = `TransitChain Cancellation Policy:
• You can cancel confirmed bookings from the "My Bookings" page.
• Metro QR tickets are 100% refundable prior to departure.
• TGSRTC City bus tickets can be cancelled with an instant automatic refund to your payment method.`;
    } else if (lower.includes('metro') || lower.includes('blue line') || lower.includes('red line')) {
      intent = 'metro_info';
      reply = `Hyderabad Metro Rail (HMRL) Information:
• Blue Line: Raidurg ➔ Hitec City ➔ Ameerpet ➔ Secunderabad East ➔ Nagole (Frequency: Every 6 mins).
• Red Line: Miyapur ➔ KPHB Colony ➔ Ameerpet ➔ MGBS ➔ LB Nagar (Frequency: Every 6 mins).
• Ameerpet is the primary two-level interchange station between Blue and Red lines.`;
    } else if (lower.includes('bus') || lower.includes('195w') || lower.includes('tgsrtc')) {
      intent = 'bus_info';
      reply = `TGSRTC Hyderabad City Bus Information:
• Route 195W: Runs directly between Waverock/Indira Nagar and KPHB/JNTU via Biodiversity & Raidurg.
• Feeder 113F: Connects Indira Nagar to Raidurg Metro station every 10 minutes.
• Ordinary & Metro Express buses accept digital passes and TransitChain tickets.`;
    } else if (lower.includes('track') || lower.includes('live') || lower.includes('gps')) {
      intent = 'tracking_info';
      reply = `Journey Tracking:
TransitChain provides live journey tracking with real-time stops, countdown to next boarding points, transfer reminders, and live vehicle positions when operating on supported lines.`;
    } else {
      intent = 'fallback';
      reply = `Hello! I am your TransitChain AI Assistant. I can help you with:
• Searching and planning multimodal journeys
• Bus and Metro route details (TGSRTC & HMRL)
• Ticket booking and cancellation policies
• Live tracking assistance
How can I assist your journey today?`;
    }

    const assistantMsg = await ChatMessage.create({
      conversationId: conversation._id,
      sender: 'assistant',
      text: reply,
      intent,
      actionPayload
    });

    return sendSuccess(res, {
      messageId: assistantMsg._id,
      text: reply,
      intent,
      actionPayload
    });
  } catch (err) {
    next(err);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId = 'default_session' } = req.params;
    const conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      return sendSuccess(res, []);
    }
    const messages = await ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    return sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
};

// --- NEARBY PLACES & FOOD DISCOVERY ---
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lon, category = 'all' } = req.query;
    if (!lat || !lon) {
      return sendError(res, 'lat and lon are required', 400);
    }

    const cLat = parseFloat(lat);
    const cLon = parseFloat(lon);

    // Curated high-relevance Hyderabad locations around transit nodes
    const verifiedPlaces = [
      {
        id: 'p1',
        name: 'Paradise Biryani & Kebabs',
        category: 'food',
        rating: 4.5,
        address: 'Near KPHB Colony Metro Pillar 782',
        lat: 17.4982,
        lon: 78.4020,
        cuisine: 'Hyderabadi Biryani',
        price: '₹₹'
      },
      {
        id: 'p2',
        name: 'Chai Point & Bakeries',
        category: 'cafe',
        rating: 4.3,
        address: 'KPHB Metro Concourse Level',
        lat: 17.4972,
        lon: 78.4011,
        cuisine: 'Tea & Snacks',
        price: '₹'
      },
      {
        id: 'p3',
        name: 'Minerva Coffee Shop',
        category: 'food',
        rating: 4.6,
        address: 'Hitec City Road, Raidurg',
        lat: 17.4380,
        lon: 78.3805,
        cuisine: 'South Indian & Filter Coffee',
        price: '₹₹'
      },
      {
        id: 'p4',
        name: 'Subway Fresh Station',
        category: 'food',
        rating: 4.2,
        address: 'Raidurg Metro Station Concourse',
        lat: 17.4376,
        lon: 78.3792,
        cuisine: 'Subs & Salads',
        price: '₹₹'
      },
      {
        id: 'p5',
        name: 'Hotel Sitara Grand',
        category: 'hotel',
        rating: 4.1,
        address: 'Kukatpally Main Road',
        lat: 17.4950,
        lon: 78.4035,
        cuisine: 'Stay & Multi-Cuisine',
        price: '₹₹₹'
      },
      {
        id: 'p6',
        name: 'Gachibowli Food Court & Street Bites',
        category: 'food',
        rating: 4.4,
        address: 'Indira Nagar Main X Road',
        lat: 17.4439,
        lon: 78.3589,
        cuisine: 'Street Food & Dosas',
        price: '₹'
      },
      {
        id: 'p7',
        name: 'Shilparamam Cultural Crafts Village',
        category: 'attraction',
        rating: 4.7,
        address: 'Hitec City, Madhapur',
        lat: 17.4520,
        lon: 78.3780,
        cuisine: 'Arts & Culture',
        price: '₹'
      }
    ];

    // Calculate distance to each place
    const results = verifiedPlaces.map(p => {
      const dLat = (p.lat - cLat) * Math.PI / 180;
      const dLon = (p.lon - cLon) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(cLat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = Math.round(6371000 * c);
      return { ...p, distanceMeters: dist };
    });

    results.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const filtered = category === 'all'
      ? results
      : results.filter(r => r.category === category);

    return sendSuccess(res, filtered.slice(0, 8));
  } catch (err) {
    next(err);
  }
};
