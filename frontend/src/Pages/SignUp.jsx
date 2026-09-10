import React, { useContext } from "react";
import bg from "../assets/jarvisbg.png";
import { useState } from "react";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
function SignUp() {
  const [showPassword, setshowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl, userData, setUserData } = useContext(userDataContext);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true },

      );
      setUserData(result.data),
        setLoading(false),
        navigate("/customize")
    } catch (error) {
      setUserData(null);
      console.log(error);
      setErr(error.response.data.message);
      setLoading(false);
    }
  };
  return (
    <div
      className="relative h-[800px] w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Form */}
      <div className="absolute left-16 bottom-25 w-[380px]">
        <h2 className="mb-8 text-4xl font-bold text-cyan-300 tracking-wider">
          CREATE ACCOUNT
        </h2>

        <form className="space-y-6" onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-transparent border-b-2 border-cyan-400/70
        py-3 text-white text-lg outline-none
        placeholder:text-cyan-200
        focus:border-cyan-300"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-transparent border-b-2 border-cyan-400/70
        py-3 text-white text-lg outline-none
        placeholder:text-cyan-200
        focus:border-cyan-300"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-transparent border-b-2 border-cyan-400/70
        py-3 text-white text-lg outline-none
        placeholder:text-cyan-200
        focus:border-cyan-300"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {!showPassword && (
              <IoIosEye
                className="absolute top-[18px] right-[20px] w-[50px] text-white"
                onClick={() => setshowPassword((prev) => !prev)}
              />
            )}
            {showPassword && (
              <IoIosEyeOff
                className="absolute top-[18px] right-[20px] w-[50px] text-white"
                onClick={() => setshowPassword((prev) => !prev)}
              />
            )}
          </div>
          {err.length > 0 && <p className="text-red-500">*{err}</p>}
          <button
            className="mt-4 w-full rounded-lg border border-cyan-400
        bg-cyan-500/20 py-3
        text-lg font-semibold text-cyan-200
        backdrop-blur-md
        transition-all
        hover:bg-cyan-400 hover:text-black
        hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            disabled={loading}
          >
            {loading ? "Loading..." : "CREATE ACCOUNT"}
          </button>
          <p
            className="mt-5 text-center text-gray-300"
            onClick={() => navigate("/signin")}
          >
            Already have an account?
            <span className="ml-2 cursor-pointer text-cyan-400 hover:text-cyan-300">
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
