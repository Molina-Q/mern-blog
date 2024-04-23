import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [messageError, setMessageError] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value.trim(),
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.username || !formData.email || !formData.password) {
			return setMessageError("Please fill out all fields!");
		}
		try {
			setLoading(true);
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (data.success === false) {
				setLoading(false);
				return setMessageError(data.message);
			}
			setLoading(false);
			if(res.ok) {
				navigate('/sign-in');
			}
		} catch (error) {
			setMessageError(data.message);
			setLoading(false);
		}
	};
	return (
		<div className="min-h-screen mt-20">
			<div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
				{/* left side */}
				<div className="flex-1">
					<Link to="/" className="font-bold dark:text-white text-4xl">
						<span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
							Leblanc's
						</span>
						Blog
					</Link>
					<p className="text-sm mt-5">
						This is a demo project. You can sign up with your email and password
						or with Google.
					</p>
				</div>

				{/* right side */}
				<div className="flex-1">
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div>
							<Label htmlFor="username" value="Your username" />
							<TextInput
								type="text"
								placeholder="Username"
								id="username"
								onChange={handleChange}
							/>
						</div>
						<div>
							<Label htmlFor="email" value="Your email" />
							<TextInput
								type="email"
								placeholder="name@company.com"
								id="email"
								onChange={handleChange}
							/>
						</div>
						<div>
							<Label htmlFor="password" value="Your password" />
							<TextInput
								type="password"
								placeholder="Password"
								id="password"
								onChange={handleChange}
							/>
						</div>
						<Button
							gradientDuoTone="purpleToPink"
							type="submit"
							disabled={loading}
						>
							{loading ? (
								<>
									<Spinner size="sm" />
									<span className="pl-2">Loading...</span>
								</>
							) : (
								"Sign Up"
							)}
						</Button>
					</form>
					<div className="flex gap-2 text-sm mt-5">
						<span>Have an account?</span>
						<Link to="/sign-in" className="text-blue-500">
							Sign In
						</Link>
					</div>
					{messageError && (
						<Alert className="mt-5" color="failure">
							{messageError}
						</Alert>
					)}
				</div>
			</div>
		</div>
	);
}
