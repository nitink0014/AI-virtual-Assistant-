import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import { response } from "express";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Get current user error",
    });
  }
};

// updateAssistant
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true },
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);

    return res.status(400).json({
      message: "Update assistant error",
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        response: "User not found",
      });
    }

    const assistantName = user.assistantName;
    const userName = user.name;

    const result = await geminiResponse(command, assistantName, userName);

    console.log(result);

    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({
        response: "Invalid response from AI",
      });
    }

    const ai = JSON.parse(jsonMatch[0]);

    switch (ai.action) {
      case "get-date":
        ai.response = `Today is ${moment().format("DD MMMM YYYY")}`;
        break;

      case "get-time":
        ai.response = `Current time is ${moment().format("hh:mm A")}`;
        break;

      case "get-day":
        ai.response = `Today is ${moment().format("dddd")}`;
        break;

      case "get-month":
        ai.response = `Current month is ${moment().format("MMMM")}`;
        break;

      default:
        break;
    }

    return res.status(200).json(ai);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      response: "Assistant Error",
    });
  }
};
