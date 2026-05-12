const Event = require("../models/Event");
const Registration = require("../models/Registration");

const normalize = (value = "") => String(value).toLowerCase().trim();

const includesAny = (text, words) => words.some((word) => text.includes(word));

const isUnrelatedQuery = (text) =>
  includesAny(text, [
    "weather",
    "movie",
    "sports",
    "cricket",
    "stock",
    "bitcoin",
    "recipe",
    "song",
    "joke",
  ]);

const extractEventName = (message = "") => {
  const text = String(message).trim();

  const quoted = text.match(/"([^"]+)"|'([^']+)'/);
  if (quoted) return (quoted[1] || quoted[2] || "").trim();

  const patterns = [
    /(?:details|detail|about|for|of)\s+(?:event\s+)?(.+)/i,
    /(?:status|registration status)\s+(?:for|of)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/[?.!,]+$/g, "").trim();
    }
  }

  return "";
};

const detectIntent = (message = "") => {
  const text = normalize(message);

  if (!text) return "missing_message";
  if (isUnrelatedQuery(text)) return "unrelated";
  if (includesAny(text, ["hi", "hello", "hey"])) return "greeting";

  if (
    includesAny(text, ["faq", "question", "rules"]) ||
    (includesAny(text, ["deadline", "cancel", "refund", "edit"]) &&
      text.includes("event"))
  ) {
    return "faq";
  }

  if (
    (includesAny(text, ["show", "list", "available"]) &&
      text.includes("event")) ||
    text === "events"
  ) {
    return "show_events";
  }

  if (
    includesAny(text, [
      "event details",
      "detail",
      "about event",
      "event info",
    ]) ||
    (text.includes("event") && includesAny(text, ["about", "detail"]))
  ) {
    return "event_details";
  }

  if (
    includesAny(text, ["register", "registration"]) &&
    includesAny(text, ["help", "how", "steps", "guide"])
  ) {
    return "register_help";
  }

  if (
    text.includes("team") &&
    includesAny(text, ["help", "create", "member", "register", "guide"])
  ) {
    return "team_help";
  }

  if (
    includesAny(text, [
      "registration status",
      "status of registration",
      "my registration",
      "my registrations",
    ]) ||
    (text.includes("status") && text.includes("register"))
  ) {
    return "registration_status";
  }

  return "unknown";
};

const formatEventSummary = (event) => {
  const dateText = event.date
    ? new Date(event.date).toLocaleDateString()
    : "Date N/A";
  return `${event.name} | ${dateText} | ${event.time || "Time N/A"} | ${event.venue || "Venue N/A"}`;
};

const findEventByName = async (name) => {
  if (!name) return null;
  const safePattern = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Event.findOne({ name: { $regex: safePattern, $options: "i" } })
    .populate("mainEvent", "name")
    .select(
      "name description date time endDate endTime venue domain eventType maxParticipants registrationDeadline mainEvent",
    );
};

exports.chatbot = async (req, res) => {
  try {
    const { message } = req.body || {};
    const intent = detectIntent(message);

    switch (intent) {
      case "missing_message":
        return res.json({
          reply:
            "Please type your question. I can help with events, registrations, team registrations, and status.",
        });

      case "greeting":
        return res.json({
          reply:
            "Hello! I can help with event listing, registration steps, team registration, and registration status.",
        });

      case "show_events": {
        const now = new Date();
        const events = await Event.find()
          .select(
            "name date endDate time endTime venue eventType registrationDeadline",
          )
          .sort({ date: 1 });

        const availableEvents = events.filter((event) => {
          const deadline = new Date(event.registrationDeadline);
          const endDate = new Date(event.endDate || event.date);
          const deadlineOk =
            Number.isNaN(deadline.getTime()) || deadline >= now;
          const eventNotEnded =
            Number.isNaN(endDate.getTime()) || endDate >= now;
          return deadlineOk && eventNotEnded;
        });

        if (!availableEvents.length) {
          return res.json({
            reply: "No available events right now.",
            data: [],
          });
        }

        return res.json({
          reply: `Available events:\n- ${availableEvents.map(formatEventSummary).join("\n- ")}`,
          data: availableEvents,
        });
      }

      case "event_details": {
        const eventName = extractEventName(message);
        if (!eventName) {
          return res.json({
            reply:
              "Please share the event name. Example: details for event Tech Quiz.",
          });
        }

        const event = await findEventByName(eventName);
        if (!event) {
          return res.json({
            reply:
              "I could not find that event. Please check the name or ask me to show available events.",
          });
        }

        return res.json({
          reply:
            `Event details:\n` +
            `- Name: ${event.name}\n` +
            `- Main Event: ${event.mainEvent?.name || "N/A"}\n` +
            `- Date: ${new Date(event.date).toLocaleDateString()} ${event.time || ""}\n` +
            `- End: ${event.endDate ? new Date(event.endDate).toLocaleDateString() : "N/A"} ${event.endTime || ""}\n` +
            `- Venue: ${event.venue || "N/A"}\n` +
            `- Type: ${event.eventType}\n` +
            `- Max Participants: ${event.maxParticipants}\n` +
            `- Registration Deadline: ${event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : "N/A"}\n` +
            `- Description: ${event.description || "No description"}`,
          data: [event],
        });
      }

      case "register_help":
        return res.json({
          reply:
            "How to register:\n1. Login as user.\n2. Open User Dashboard.\n3. Choose an event from Unregistered Events.\n4. Click Register.\n5. For team events, enter Team ID as team leader.",
        });

      case "team_help":
        return res.json({
          reply:
            "Team registration steps:\n1. Open Team Management.\n2. Create a team for the selected team event.\n3. Add members.\n4. Register from User Dashboard using Team ID (leader only).",
        });

      case "registration_status": {
        if (!req.user) {
          return res.json({
            reply: "Please login first to check your registration status.",
          });
        }

        const regs = await Registration.find({ user: req.user._id })
          .populate("event", "name date venue")
          .populate("team", "teamName");

        if (!regs.length) {
          return res.json({
            reply: "You have no registrations yet.",
            data: [],
          });
        }

        const eventName = extractEventName(message);
        if (eventName) {
          const match = regs.find((reg) =>
            (reg.event?.name || "")
              .toLowerCase()
              .includes(eventName.toLowerCase()),
          );

          if (!match) {
            return res.json({
              reply: "No registration found for that event in your account.",
            });
          }

          return res.json({
            reply:
              `Registration status:\n- Event: ${match.event?.name || "N/A"}\n- Status: ${match.status}\n` +
              `- Venue: ${match.event?.venue || "N/A"}${match.team ? `\n- Team: ${match.team.teamName}` : ""}`,
            data: [match],
          });
        }

        return res.json({
          reply: `Your registrations:\n- ${regs
            .map(
              (reg) =>
                `${reg.event?.name || "Event"} | ${reg.status}${reg.team ? ` | Team: ${reg.team.teamName}` : ""}`,
            )
            .join("\n- ")}`,
          data: regs,
        });
      }

      case "faq":
        return res.json({
          reply:
            "FAQs:\n- Registration closes on the event deadline.\n- Team events require Team ID and leader registration.\n- Check status by asking: my registration status.\n- Need event info? Ask: details for event <name>.",
        });

      case "unrelated":
        return res.json({
          reply:
            "I can help only with event-related tasks: events list, event details, registrations, team registrations, and status checks.",
        });

      default:
        return res.json({
          reply:
            'I can help with: "show available events", "details for event <name>", "how to register", "team registration help", or "my registration status".',
        });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
