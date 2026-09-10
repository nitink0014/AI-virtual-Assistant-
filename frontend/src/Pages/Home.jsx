import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import text from "../assets/text.gif";

function Home() {
  const navigate = useNavigate();

  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
  } = useContext(userDataContext);

  // ==========================
  // UI State
  // ==========================

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");

  const [isListening, setIsListening] = useState(false);

  // ==========================
  // Refs
  // ==========================

  const recognitionRef = useRef(null);

  const processingRef = useRef(false);

  const speakingRef = useRef(false);

  const shouldListenRef = useRef(true);

  const lastCommandRef = useRef("");

  // ==========================
  // Logout
  // ==========================

  const handleLogOut = async () => {
    try {
      await axios.get(
        `${serverUrl}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );

      setUserData(null);

      navigate("/signin");
    } catch (err) {
      console.log(err);

      setUserData(null);

      navigate("/signin");
    }
  };

  // ==========================
  // Start Listening
  // ==========================

  const startListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    if (processingRef.current) return;

    if (speakingRef.current) return;

    try {
      recognition.start();
    } catch (err) {
      // Ignore:
      // "recognition has already started"
    }
  };

  // ==========================
  // Stop Listening
  // ==========================

  const stopListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    try {
      recognition.stop();
    } catch (err) { }
  };

  // ==========================
  // Speak
  // ==========================

  const speak = (message) => {
    if (!message) return;

    stopListening();

    window.speechSynthesis.cancel();

    speakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "en-US";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      speakingRef.current = true;
    };

    utterance.onend = () => {
      speakingRef.current = false;

      setTimeout(() => {
        if (shouldListenRef.current) {
          startListening();
        }
      }, 100);
    };

    utterance.onerror = () => {
      speakingRef.current = false;

      setTimeout(() => {
        if (shouldListenRef.current) {
          startListening();
        }
      }, 100);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ==========================
  // Command Handler
  // ==========================

  const handleCommand = (data) => {
    const {
      action,
      response,
      userInput,
      data: extraData,
    } = data;

    setAiText(response);

    speak(response);

    switch (action) {
      case "google_search":
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(
            extraData?.query || userInput
          )}`,
          "_blank"
        );
        break;

      case "youtube_search":
      case "youtube_play":
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            extraData?.query || userInput
          )}`,
          "_blank"
        );
        break;

      case "instagram_open":
        window.open(
          "https://www.instagram.com",
          "_blank"
        );
        break;

      case "facebook_open":
        window.open(
          "https://www.facebook.com",
          "_blank"
        );
        break;

      case "github_open":
        window.open(
          "https://github.com",
          "_blank"
        );
        break;

      case "linkedin_open":
        window.open(
          "https://www.linkedin.com",
          "_blank"
        );
        break;

      case "calculator_open":
        window.open(
          "https://www.google.com/search?q=calculator",
          "_blank"
        );
        break;

      case "weather":
        window.open(
          "https://www.google.com/search?q=weather",
          "_blank"
        );
        break;

      case "open_website":
        if (extraData?.url) {
          window.open(
            extraData.url,
            "_blank"
          );
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    // -----------------------
    // Listening Started
    // -----------------------

    recognition.onstart = () => {
      console.log("🎤 Listening...");
      setIsListening(true);
    };

    // -----------------------
    // Listening Ended
    // -----------------------

    recognition.onend = () => {
      console.log("🛑 Recognition Ended");

      setIsListening(false);

      if (
        shouldListenRef.current &&
        !speakingRef.current &&
        !processingRef.current
      ) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    // -----------------------
    // Recognition Error
    // -----------------------

    recognition.onerror = (event) => {
      console.log("Recognition Error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert("Please allow microphone permission.");
        return;
      }

      if (event.error === "aborted") return;

      if (shouldListenRef.current) {
        setTimeout(() => {
          startListening();
        }, 800);
      }
    };

    // -----------------------
    // User Spoke
    // -----------------------

    recognition.onresult = async (event) => {
  if (processingRef.current || speakingRef.current) return;

  const result = event.results[event.results.length - 1];

  if (!result.isFinal) return;

  const transcript = result[0].transcript.trim();

  if (!transcript) return;

  if (
    transcript.toLowerCase() ===
    lastCommandRef.current.toLowerCase()
  ) {
    return;
  }

  lastCommandRef.current = transcript;

  if (
    !transcript
      .toLowerCase()
      .includes(userData.assistantName.toLowerCase())
  ) {
    return;
  }

  processingRef.current = true;

  // Stop microphone immediately
  try {
    recognition.stop();
  } catch {}

  setUserText(transcript);
  setAiText("Thinking...");

  try {
    const data = await getGeminiResponse(transcript);

    if (!data) {
      setAiText("");
      processingRef.current = false;
      return;
    }

    handleCommand(data);
  } catch (err) {
    console.log(err);
    speak("Sorry, I couldn't connect to the server.");
  } finally {
    processingRef.current = false;
  }
};

    // -----------------------
    // Start Listening
    // -----------------------

    startListening();

    // -----------------------
    // Cleanup
    // -----------------------

    return () => {
      shouldListenRef.current = false;

      try {
        recognition.stop();
      } catch { }

      recognitionRef.current = null;

      window.speechSynthesis.cancel();
    };
  }, [userData]);

  // ==========================
  // Auto Scroll (Optional)
  // ==========================

  useEffect(() => {
    if (!aiText) return;

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [aiText]);


  return <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#030712] flex items-center justify-center px-4 py-6">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_55%)]" />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
w-[850px] h-[850px]
rounded-full
bg-cyan-400/10
blur-[220px]
animate-pulse" />
    <div className="absolute -left-32 top-24
w-[400px] h-[400px]
rounded-full
bg-cyan-500/10
blur-[180px]" />

    <div className="absolute -right-32 bottom-20
w-[350px] h-[350px]
rounded-full
bg-blue-500/10
blur-[170px]" />

    <div className="absolute top-0 left-1/2
-translate-x-1/2
w-[500px] h-[180px]
bg-cyan-300/10
blur-[140px]" />
    <div className="absolute inset-0
bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.65)_100%)]" />

    {/* home content from here */}
   <div className="absolute top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-20 flex flex-row sm:flex-col gap-2 sm:gap-4 sm:w-64">
      <button
        className="flex-1 sm:w-full rounded-lg border border-cyan-400 bg-cyan-500/20 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-semibold text-cyan-200 backdrop-blur-md transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className="flex-1 sm:w-full rounded-lg border border-cyan-400 bg-cyan-500/20 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-semibold text-cyan-200 backdrop-blur-md transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
        onClick={() => navigate("/customize")}
      >
       <span className="sm:hidden">Customize</span>
<span className="hidden sm:inline">Customize Your Assistant</span>
      </button>
    </div>


    <div className="relative z-10 flex flex-col items-center justify-center">
      <div
        className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full border-2 border-cyan-400/60
    bg-black/30 backdrop-blur-md
    flex items-center justify-center
    shadow-[0_0_40px_rgba(34,211,238,0.45)]
    overflow-hidden"
      >
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover object-center translate-y-1 rounded-full transition-all duration-500 hover:scale-110"
        />
      </div>

      <h1 className="mt-6 sm:mt-8 text-3xl sm:text-4xl md:text-5xl font-extrabold text-cyan-300 tracking-wide sm:tracking-widest text-center leading-tight break-words">
        Hello, I'm{" "}
        <span className="text-white">
          {userData?.assistantName}
        </span>
      </h1>
      <div
        className="mt-5 sm:mt-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-cyan-400/60
    bg-black/30 backdrop-blur-md
    flex items-center justify-center
    shadow-[0_0_40px_rgba(34,211,238,0.45)]
    overflow-hidden"
      >
        <img
          src={text}
          alt="Assistant"
          className="w-full h-full object-cover object-center rounded-full transition-all duration-500 hover:scale-110"
        />
      </div>
     <div className="mt-6 sm:mt-8 w-full max-w-[700px] px-1 sm:px-2 flex flex-col gap-4">

        {/* User Message */}
        {userText && (
          <div className="self-end max-w-[90%] sm:max-w-[80%] rounded-2xl bg-cyan-600 px-4 sm:px-5 py-3 shadow-lg break-words">
            <p className="text-sm text-cyan-100 font-semibold mb-1">
              You
            </p>

            <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed">
              {userText}
            </p>
          </div>
        )}

        {/* AI Message */}
        {aiText && (
          <div className="self-start max-w-[90%] sm:max-w-[80%] rounded-2xl bg-gray-800 px-4 sm:px-5 py-3 shadow-lg border border-cyan-500 break-words">

            <p className="text-sm text-cyan-300 font-semibold mb-1">
              {userData?.assistantName}
            </p>

            <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed">
              {aiText}
            </p>

          </div>
        )}

      </div>
    </div>

  </div>
}

export default Home;
