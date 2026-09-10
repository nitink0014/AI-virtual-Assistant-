import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Customize2() {
    const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext)
    const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const handleUpdateAssitant = async () => {
        setLoading(true)
        try {
            let formData = new FormData()
            formData.append("assistantName", assistantName)
            if (backendImage) {
                formData.append("assistantImage", backendImage)
            } else {
                formData.append("imageUrl", selectedImage)
            }
            const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true })
            setLoading(false)
            console.log(result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center 
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_50%)] 
        before:pointer-events-none">
            <MdKeyboardBackspace
                className="absolute top-6 left-6 z-20 text-cyan-300 text-4xl cursor-pointer transition-all duration-300 hover:text-white hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                onClick={() => navigate("/customize")}
            />
            <h1 className="relative z-10 mb-10 text-2xl font-bold text-cyan-200 tracking-[0.2em] text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                ENTER YOUR ASSISTANT NAME
            </h1>
            <input
                type="text"
                placeholder="eg. jarvis"
                className="w-[400px] bg-transparent border-b-2 border-cyan-400/70
                     py-3 text-white text-lg outline-none
                     placeholder:text-cyan-200/60
                     focus:border-cyan-300
                     focus:shadow-[0_2px_15px_rgba(34,211,238,0.4)]
                     transition-all duration-300"
                required
                onChange={(e) => setAssistantName(e.target.value)}
                value={assistantName}
            />
            {assistantName && <button
                className="relative z-10 mt-10 px-10 py-3
                    border border-cyan-400 rounded-lg
                    text-cyan-300 font-semibold tracking-wider
                    bg-cyan-400/5
                    hover:bg-cyan-400 hover:text-black
                    hover:shadow-[0_0_30px_rgba(34,211,238,0.7)]
                    transition-all duration-300"
                disabled={loading}
                onClick={() => {
                    handleUpdateAssitant()
                }}
            >
                {!loading ? "CREATE YOUR ASSISTANT" : "Loading..."}
            </button>}

        </div>
    );
}

export default Customize2;
