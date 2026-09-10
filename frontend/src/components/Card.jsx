import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext.jsx";

function Card({ image }) {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  return (
    <div
      className={`w-[220px] h-[300px] bg-black border-2 border-cyan-400 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(34,211,238,0.5)] 
        hover:border-white ${selectedImage == image ? "border-4 border-white shadow-2xl" : null}`}
      onClick={() => {
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)
      }

      }
    >
      <img
        src={image}
        alt="AI Assistant"
        className="w-full h-full object-contain bg-black"
      />
    </div>
  );
}

export default Card;
