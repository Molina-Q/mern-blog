import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
	const { username, email, password } = req.body;

	if (
		!username ||
		!email ||
		!password ||
		username === "" ||
		email === "" ||
		password === ""
	) {
		next(errorHandler(400, 'All fields are required')); // use 'errorHandler' because i am creating the error manually
	}

    const hashedPassword = bcryptjs.hashSync(password, 10);

	const newUser = new User({
		username,
		email,
		password: hashedPassword,
	});

	try {
		await newUser.save();
		res.json({ message: "User successfully created!" });
	} catch (error) {
		next(error); // only use 'next' because the error is created by the catch
	}
};
