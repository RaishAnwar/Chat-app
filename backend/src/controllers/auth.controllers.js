import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"
export const signup = async(req,res) => {
    const {fullName,email,password} = req.body
   
    try{
        if(!fullName || !email || !password) {
        return res.status(400).json({message: "All Fields are required "});

        }
       //hash password
       if (password.length < 6) {
        return res.status(400).json({message: "Password must be at least 6 characters"});
       }

       const user = await User.findOne({email})


        if (user) return res.status(400).json({message: "Emsil already exists"});

       const salt = await bcrypt.genSalt(10)
       const hashedPassword = await bcrypt.hash(password,salt)
       
       const newUser = new User({
        fullName,
        email,
        password:hashedPassword,
       })
       
       if(newUser) {
        //generate jwt token here
        generateToken(newUser._id,res)
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic       
         });
       } else {
        res.status(400).json({ message: "Invalid user data"});
       }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internet Server Error"})
    }
};
export const login = async(req,res) => {
    const {email,password} = req.body
    try{
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id,res) 

        res.status(200).json ({
            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log("Error in login controller",error.message);
        res.status(500).json({message: "Internal Server Error"});
         
    }
};
export const logout = (req,res) => {
    try{
        res.cookie("jwt", "",{maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};



export const updateProfile = async (req, res) => {
  try {
    console.log("✅ updateProfile route hit!");
    console.log("Request Body:", req.body);

    const { profilePic } = req.body;

    if (!profilePic) {
      console.log("❌ Missing profilePic in base64");
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Upload base64 to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile_pictures",
      resource_type: "image",
    });

    console.log("✅ Cloudinary Upload Response:", uploadResponse);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    console.log("✅ Updated User:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const checkAuth = (req,res) => {
    try{
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in chekAuth controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}