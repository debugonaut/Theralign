import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, ChevronLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { queryChatbotAPI } from '../../api/ai.api';

const MENU_TREE = {
  guest: {
    title: 'Select a category to view common topics:',
    categories: [
      { id: 'info', label: 'Platform & Care 🩺' },
      { id: 'account', label: 'Sign-Up & Login 👤' },
      { id: 'billing', label: 'Fees & Payments 💳' },
      { id: 'refunds', label: 'Cancellations & Refunds 🪙' }
    ],
    questions: {
      info: [
        { q: 'What is Theralign?', a: 'Theralign is a curated marketplace that connects patients with verified physiotherapy professionals across India for discovery, booking, and post-session care.', route: '/' },
        { q: 'What physiotherapy specialisations are available?', a: 'You can search for specialists in Orthopedic, Sports, Neurological, Pediatric, Geriatric, Cardiopulmonary, Postural/Spinal Rehab, and Women\'s Health.', route: '/doctors' },
        { q: 'Are the physiotherapists qualified?', a: 'Yes, every doctor goes through a strict verification process where the admin reviews their credentials, licenses, and experience documents before they can list public profiles.', route: '/standards' },
        { q: 'Who is Theralign built for?', a: 'It is built for patients seeking physical rehabilitation and practitioners wanting to manage their clinic and prescriptions.', route: '/' },
      ],
      account: [
        { q: 'How do I sign up as a patient?', a: 'Go to the Register page, choose the \'Patient\' role, and fill out your details.', route: '/register' },
        { q: 'How do I sign up as a doctor?', a: 'Go to the Register page, select the \'Doctor\' role, and fill out the onboarding application form.', route: '/register' },
        { q: 'Can I register a junior doctor under my clinic?', a: 'Yes, senior doctors can invite subordinate junior doctors using the register junior link or from their practice management panel.', route: '/register/junior' },
      ],
      billing: [
        { q: 'How does Theralign secure payments?', a: 'All payments are securely processed through Razorpay using industry-standard cryptographic validation. We do not store your credit card information.', route: '/refund' },
        { q: 'Can I pay at the clinic directly?', a: 'All appointments must be prepaid online to secure the slot and automate booking records.', route: '/pricing' },
        { q: 'Will I receive an invoice/receipt for my payment?', a: 'Yes, once payment is verified, a receipt is automatically generated and can be downloaded from your profile dashboard.', route: '/refund' },
      ],
      refunds: [
        { q: 'What is your refund policy for cancellations?', a: 'Patient-initiated cancellations are subject to review and require admin approval. Doctor-initiated cancellations are automatically approved and refunded immediately.', route: '/refund' },
        { q: 'What happens if a doctor cancels my session?', a: 'You will be notified instantly via email/in-app, and your payment will be refunded to your original payment source.', route: '/refund' },
        { q: 'Is there a cancellation fee?', a: 'No cancellation fees are charged, but cancellations must be requested prior to the appointment slot time.', route: '/refund' },
      ]
    }
  },
  patient: {
    title: 'Select a category to view common topics:',
    categories: [
      { id: 'booking', label: 'Booking & Slots 🗓️' },
      { id: 'treatment', label: 'Care & Home Exercises 📋' },
      { id: 'billing', label: 'Payments & Receipts 💳' },
      { id: 'refunds', label: 'Cancellations & Uploads 🪙' }
    ],
    questions: {
      booking: [
        { q: 'How do I book a session with a physiotherapist?', a: 'Browse verified doctors, click on a profile, select an available date and time slot, and click \'Book Now\'.', route: '/doctors' },
        { q: 'What is the \'slot-locking\' system?', a: 'To prevent double-booking, the slot you choose is temporarily locked at the database level for you during checkout.', route: '/doctors' },
        { q: 'How do I check if my booking was successful?', a: 'Navigate to your Appointments dashboard to see all booked sessions and their current status.', route: '/patient/appointments' },
      ],
      treatment: [
        { q: 'Where do I access my assigned home exercises?', a: 'Navigate to your Care Timeline to view your active exercise prescriptions, including sets, reps, and steps.', route: '/patient/care-timeline' },
        { q: 'Where can I watch demonstrations for my exercises?', a: 'Each exercise card contains a link to search for a video demonstration on YouTube.', route: '/patient/care-timeline' },
        { q: 'Where can I see my medical session records?', a: 'All notes, prescriptions, and updates shared by your therapist are displayed in your Care Timeline.', route: '/patient/care-timeline' },
        { q: 'Can my doctor see my private medical history?', a: 'Your private medical history entered in your profile settings is kept private and secure, and is not shared with doctors.', route: '/patient/profile' },
      ],
      billing: [
        { q: 'Where can I download my payment receipts?', a: 'Go to your Payments page, locate the transaction, and click the download button to save the receipt.', route: '/patient/payments' },
        { q: 'Does the consultation fee change after booking?', a: 'No, the consultation fee is snapshotted at the time of booking. Any subsequent fee adjustments by the doctor will not affect your booked sessions.', route: '/patient/payments' },
      ],
      refunds: [
        { q: 'How do I cancel my booked appointment?', a: 'Go to your Appointments page, select the active appointment, and click \'Request Cancellation\'.', route: '/patient/appointments' },
        { q: 'How do I upload MRI/X-ray reports before my appointment?', a: 'Go to your Appointment details page, scroll to the Pre-Appointment Media section, and upload your files.', route: '/patient/appointments' },
        { q: 'Is there a limit on how many files I can upload?', a: 'Yes, each appointment has a file count limit (maximum 5 files) to optimize cloud storage.', route: '/patient/appointments' },
      ]
    }
  },
  doctor: {
    title: 'Select a category to view common topics:',
    categories: [
      { id: 'availability', label: 'Availability & Slots ⏰' },
      { id: 'appointments', label: 'Patient Bookings 🗓️' },
      { id: 'notes', label: 'Clinical Notes & AI 📋' },
      { id: 'practice', label: 'Clinic & Juniors 👥' }
    ],
    questions: {
      availability: [
        { q: 'How do I create new availability slots?', a: 'Go to the Availability page, select a date and time, and click \'Create Slot\'.', route: '/doctor/availability' },
        { q: 'Can I delete an availability slot?', a: 'Yes, you can delete any slot as long as it has not been booked by a patient.', route: '/doctor/availability' },
      ],
      appointments: [
        { q: 'Where do I see my scheduled patient calendar?', a: 'Navigate to the Doctor Appointments tab to view your complete schedule.', route: '/doctor/appointments' },
        { q: 'How do I mark an appointment as completed?', a: 'Open the active appointment card on your dashboard and click \'Mark Completed\' once the session is done.', route: '/doctor/appointments' },
        { q: 'Can I cancel a patient appointment?', a: 'Yes. If you cancel, the system automatically triggers an immediate refund to the patient.', route: '/doctor/appointments' },
      ],
      notes: [
        { q: 'How do I write session notes for a completed session?', a: 'Go to your appointments page, click \'Create Session Record\' on the completed appointment, and fill out the details.', route: '/doctor/appointments' },
        { q: 'How does the AI Exercise Creator work?', a: 'A doctor-only tool powered by Llama 3.1 8B that generates structured clinical exercises from natural language prompts.', route: '/doctor/appointments' },
        { q: 'Can I edit a session record after signing off?', a: 'You can edit signed-off notes only within a strict 24-hour window. After 24 hours, the record is locked.', route: '/doctor/appointments' },
      ],
      practice: [
        { q: 'How do I invite a junior doctor to my clinic?', a: 'Open the Practice Management page and send an invitation using the junior doctor\'s email.', route: '/doctor/practice' },
        { q: 'What permissions do junior doctors have?', a: 'Junior doctors can manage appointments and session records, but cannot edit consultation fees or billing info.', route: '/doctor/practice' },
        { q: 'Do junior doctors require admin verification?', a: 'Junior doctors invited by verified senior clinics automatically bypass the admin verification queue.', route: '/doctor/practice' },
      ]
    }
  },
  admin: {
    title: 'Select a category to view common topics:',
    categories: [
      { id: 'verification', label: 'Doctor Verification 🛡️' },
      { id: 'financials', label: 'Financials & Refunds 🪙' },
      { id: 'management', label: 'Users & Reviews 👥' }
    ],
    questions: {
      verification: [
        { q: 'Where do I verify pending doctor applications?', a: 'Go to the Doctor Verification tab on the admin sidebar to view credentials of pending practitioners.', route: '/admin/doctors' },
        { q: 'How do I reject or suspend a doctor?', a: 'Click \'Reject\' or \'Suspend\' on the doctor profile to manage their listing status.', route: '/admin/doctors' },
      ],
      financials: [
        { q: 'Where do I manage patient refund requests?', a: 'Open the Refund queue under Admin Refunds to review, approve, or reject pending requests.', route: '/admin/refunds' },
        { q: 'Where can I see total platform revenue metrics?', a: 'View the Analytics or Revenue dashboard for a visual breakdown of commissions, payouts, and earnings.', route: '/admin/analytics' },
      ],
      management: [
        { q: 'How do I view/suspend patient or doctor accounts?', a: 'Open the Admin Users panel and toggle the active status of any user.', route: '/admin/users' },
        { q: 'How do I moderate review visibility?', a: 'Go to the Admin Reviews panel. You can toggle the visibility of individual reviews on/off.', route: '/admin/reviews' },
        { q: 'How do I trigger batch doctor AI summaries?', a: 'Go to the AI tools page and click \'Batch Generate Summaries\' to compile bios for verified doctors.', route: '/admin/ai-tools' },
      ]
    }
  }
};

const getRouteLabel = (route) => {
  if (!route) return null;
  let cleanRoute = route;
  if (cleanRoute === '/patient/dashboard') cleanRoute = '/patient/appointments';
  else if (cleanRoute === '/doctor/dashboard') cleanRoute = '/doctor/appointments';
  else if (cleanRoute === '/admin/dashboard') cleanRoute = '/admin/doctors';

  if (cleanRoute === '/') return { action: 'GO HOME', details: 'to view landing page' };
  if (cleanRoute === '/doctors') return { action: 'EXPLORE DOCTORS', details: 'to search and book sessions' };
  if (cleanRoute === '/register') return { action: 'REGISTER ACCOUNT', details: 'to sign up on Theralign' };
  if (cleanRoute === '/register/junior') return { action: 'ONBOARD JUNIOR', details: 'to register subordinate doctor' };
  if (cleanRoute === '/login') return { action: 'LOG IN', details: 'to access your portal' };
  if (cleanRoute === '/patient/care-timeline') return { action: 'VIEW CARE TIMELINE', details: 'to check exercise plans' };
  if (cleanRoute === '/patient/appointments') return { action: 'OPEN APPOINTMENTS', details: 'to manage your bookings' };
  if (cleanRoute === '/patient/payments') return { action: 'VIEW PAYMENTS', details: 'to check receipts' };
  if (cleanRoute === '/doctor/availability') return { action: 'MANAGE SLOTS', details: 'to set availability calendar' };
  if (cleanRoute === '/doctor/practice') return { action: 'MANAGE PRACTICE', details: 'to manage junior team' };
  if (cleanRoute === '/doctor/earnings') return { action: 'VIEW EARNINGS', details: 'to check platform payouts' };
  if (cleanRoute === '/admin/doctors') return { action: 'VERIFY DOCTORS', details: 'to review doctor credentials' };
  if (cleanRoute === '/admin/refunds') return { action: 'MANAGE REFUNDS', details: 'to process patient refunds' };
  if (cleanRoute === '/admin/analytics') return { action: 'VIEW ANALYTICS', details: 'to see platform metrics' };
  return { action: 'NAVIGATE', details: 'to target page' };
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Airtel-style menu states: 'categories' | 'questions' | 'custom'
  const [menuState, setMenuState] = useState('categories');
  const [activeCategory, setActiveCategory] = useState(null);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const scrollRef = useRef(null);

  const userRole = user?.role || 'guest';
  const displayRoleName = userRole.toUpperCase();

  // Initialize greeting on mount or role change
  useEffect(() => {
    const greeting = isAuthenticated && user
      ? `Hello ${user.name || 'User'}! As a verified Theralign ${userRole}, how can I assist you with your dashboard features today?`
      : "Welcome to Theralign! I'm your virtual clinical assistant. Select a topic below or type any question to get started.";

    setMessages([
      {
        id: 'greet',
        role: 'assistant',
        content: greeting,
        isScripted: true,
      },
    ]);
    setMenuState('categories');
    setActiveCategory(null);
  }, [userRole, isAuthenticated, user]);

  // Auto-scroll to the bottom of the feed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, menuState]);

  const handleNavigation = (route) => {
    if (!route || typeof route !== 'string') return;
    let targetRoute = route;
    if (targetRoute === '/patient/dashboard') targetRoute = '/patient/appointments';
    else if (targetRoute === '/doctor/dashboard') targetRoute = '/doctor/appointments';
    else if (targetRoute === '/admin/dashboard') targetRoute = '/admin/doctors';

    // Safety check: ensure route starts with a single '/' and does not contain protocol headers (e.g. 'http:') or domains
    if (targetRoute.startsWith('/') && !targetRoute.startsWith('//') && !targetRoute.includes(':')) {
      navigate(targetRoute);
      setIsOpen(false);
    }
  };

  const handlePredefinedClick = (qText, aText, route) => {
    // 1. Add user message
    const userMsgObj = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: qText,
    };
    // 2. Add answer message instantly
    const aiMsgObj = {
      id: Date.now().toString() + '-ai',
      role: 'assistant',
      content: aText,
      route: route || null,
      isScripted: true,
    };

    setMessages((prev) => [...prev, userMsgObj, aiMsgObj]);
    
    // Reset menu back to top-level
    setMenuState('categories');
    setActiveCategory(null);
  };

  const handleSubmit = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    // Add user message
    const userMsgObj = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setQuery('');
    setIsLoading(true);

    try {
      // Create request payload history
      const apiHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await queryChatbotAPI(userMessage, apiHistory);
      const { answer, route, isScripted } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: answer,
          route: route || null,
          isScripted: !!isScripted,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Error: Unable to connect to the assistant right now. Please try again.',
          route: null,
          isScripted: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Keep menu in categories if custom query completes
      setMenuState('categories');
      setActiveCategory(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(query);
    }
  };

  const roleTree = MENU_TREE[userRole] || MENU_TREE.guest;

  return (
    <div className="fixed bottom-6 right-6 z-9999 font-swiss">
      {/* Closed Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="font-swiss flex items-center gap-2 bg-primary text-white border-2 border-primary hover:bg-primary-dark px-4 py-3 rounded-full shadow-level-2 transition-all duration-fast ease-swiss hover:-translate-y-1 active:scale-98"
          title="Ask Theralign AI Assistant"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-ui-xs font-bold uppercase tracking-wider">Ask Theralign AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white border-2 border-neutral-200 rounded-xl shadow-level-3 flex flex-col overflow-hidden animate-swiss-slide-in">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between border-b border-primary-dark">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <div>
                <h4 className="text-white text-ui-md font-bold leading-none">Theralign AI Guide</h4>
                <span className="text-[10px] text-primary-light font-medium tracking-wider uppercase leading-none block mt-1">
                  ROLE: {displayRoleName}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="font-swiss text-white hover:text-accent transition-colors duration-fast p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-xl text-ui-sm max-w-[85%] shadow-level-1 border ${
                    msg.role === 'user'
                      ? 'bg-primary-light text-primary border-primary-light'
                      : 'bg-white text-neutral-900 border-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  
                  {msg.route && (() => {
                    const label = getRouteLabel(msg.route);
                    if (!label) return null;
                    return (
                      <button
                        onClick={() => handleNavigation(msg.route)}
                        className="font-swiss mt-3 w-full text-center bg-primary text-white hover:bg-primary-dark text-ui-xs py-2 px-3 rounded-md transition-all duration-fast ease-swiss flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        <span className="font-bold uppercase tracking-wider">{label.action}</span>
                        <span className="font-regular opacity-85">→ {label.details}</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}

            {/* AI Loading Skeleton */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-neutral-900 border border-neutral-200 p-3 rounded-xl shadow-level-1 max-w-[85%]">
                  <div className="flex space-x-1 items-center h-4">
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full" />
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full delay-75" />
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Decision-Tree Suggestion Panel */}
          <div className="p-3 bg-white border-t border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block mb-2">
              {menuState === 'categories' ? roleTree.title : 'Choose a sub-topic:'}
            </span>
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
              {/* State A: Render top-level categories */}
              {menuState === 'categories' && (
                <>
                  {roleTree.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setMenuState('questions');
                        setActiveCategory(cat.id);
                      }}
                      className="font-swiss bg-neutral-100 hover:bg-primary hover:text-white text-neutral-900 border border-neutral-200 font-semibold text-[11px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-fast ease-swiss cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMenuState('custom');
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: 'Type your custom query or describe symptoms in detail in the chat box below.',
                          isScripted: true,
                        },
                      ]);
                    }}
                    className="font-swiss bg-accent-light hover:bg-accent text-accent-dark hover:text-white border border-accent/20 font-semibold text-[11px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-fast ease-swiss cursor-pointer"
                  >
                    Others / Custom Query 💬
                  </button>
                </>
              )}

              {/* State B: Render plethora of questions inside category */}
              {menuState === 'questions' && activeCategory && (
                <>
                  {roleTree.questions[activeCategory].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePredefinedClick(item.q, item.a, item.route)}
                      className="font-swiss bg-neutral-100 hover:bg-primary hover:text-white text-neutral-900 border border-neutral-200 font-semibold text-[11px] px-2.5 py-1.5 rounded-lg text-left transition-all duration-fast ease-swiss cursor-pointer w-full truncate"
                      title={item.q}
                    >
                      • {item.q}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMenuState('categories');
                      setActiveCategory(null);
                    }}
                    className="font-swiss bg-neutral-200 hover:bg-neutral-900 hover:text-white text-neutral-700 border border-neutral-300 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-fast ease-swiss flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to menu
                  </button>
                </>
              )}

              {/* State C: Custom input guidelines */}
              {menuState === 'custom' && (
                <button
                  onClick={() => {
                    setMenuState('categories');
                    setActiveCategory(null);
                  }}
                  className="font-swiss bg-neutral-200 hover:bg-neutral-900 hover:text-white text-neutral-700 border border-neutral-300 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-fast ease-swiss flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Return to Categories
                </button>
              )}
            </div>
          </div>

          {/* User Input Section */}
          <div className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              placeholder={menuState === 'custom' ? 'Type custom question...' : 'Type or select category above...'}
              className="font-swiss flex-1 border border-neutral-200 rounded-md px-3 py-2 text-ui-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-neutral-900 placeholder-neutral-300"
            />
            <button
              onClick={() => handleSubmit(query)}
              disabled={isLoading || !query.trim()}
              className="font-swiss p-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center disabled:opacity-50 transition-colors duration-fast ease-swiss cursor-pointer border-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
