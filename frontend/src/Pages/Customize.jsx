import React, { useContext, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import p2 from "../assets/p2.png";
import { RiImageUploadFill } from "react-icons/ri";
import { userDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {

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
  const navigate = useNavigate();
  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <MdKeyboardBackspace
        className="absolute top-6 left-6 z-20 text-cyan-300 text-4xl cursor-pointer transition-all duration-300 hover:text-white hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]"
        onClick={() => navigate("/")}
      />
      {/* Heading */}
      <h2 className="relative z-10 mb-10 text-4xl font-bold text-cyan-200 tracking-wider text-center">
        SELECT YOUR ASSISTANT IMAGE
      </h2>

      {/* Cards */}
      <div className="relative z-10 flex items-center justify-center gap-8">
        {/* JARVIS Card */}
        <Card image={p2} />

        {/* Upload Card */}
        <div
          className={`w-[220px] h-[300px]
          bg-black/50
          border-2 border-dashed border-cyan-400
          rounded-2xl overflow-hidden
          shadow-[0_0_35px_rgba(34,211,238,0.5)]
          flex flex-col items-center justify-center
          cursor-pointer
          hover:bg-cyan-500/10
          transition-all ${selectedImage == "input" ? "border-4 border-white shadow-2xl" : null}`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageUploadFill className="text-cyan-300 w-[50px] h-[50px] mb-4" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          onChange={handleImage}
          hidden
        />
      </div>

      {/* Continue button */}
      {selectedImage && (
        <button
          className="relative z-10 mt-10 px-10 py-3
        border border-cyan-400 rounded-lg
        text-cyan-300 font-semibold
        hover:bg-cyan-400 hover:text-black
        transition-all
        shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          onClick={() => navigate("/customize2")}
        >
          Continue
        </button>
      )}
    </div>
  );
}

export default Customize;
