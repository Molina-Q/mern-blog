import { Alert, Button, Modal, TextInput } from "flowbite-react";
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch } from "react-redux";
import {
	updateStart,
	updateSuccess,
	updateFailure,
	deleteUserFailure,
	deleteUserSuccess,
	deleteUserStart,
	signoutSuccess,
} from "../redux/user/userSlice";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function DashProfile() {
	const { currentUser, error, loading } = useSelector((state) => state.user);
	const [imageFile, setImageFile] = useState(null);
	const [imageFileUrl, setImageFileUrl] = useState(null);
	const [imageFileUploading, setImageFileUploading] = useState(false);
	const [imageFileUploadingProgress, setImageFileUploadingProgress] =
		useState(null);
	const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
	const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
	const [updateUserError, setUpdateUserError] = useState(null);
	const filePickerRef = useRef();
	const [formData, setFormData] = useState({});
	const [showModal, setShowModal] = useState(false);

	const dispatch = useDispatch();

	const handleImageChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			setImageFile(file);
			setImageFileUrl(URL.createObjectURL(file));
		}
	};

	useEffect(() => {
		if (imageFile) {
			uploadImage();
		}
	}, [imageFile]);

	const uploadImage = async () => {
		setImageFileUploadingError(null);
		setImageFileUploading(true);

		const storage = getStorage(app);
		const fileName = new Date().getTime() + imageFile.name;
		const storageRef = ref(storage, fileName);
		const uplaodTask = uploadBytesResumable(storageRef, imageFile);
		uplaodTask.on(
			"state_changed",
			(snapshot) => {
				const progress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				setImageFileUploadingProgress(progress.toFixed(0));
			},
			(error) => {
				setImageFileUploadingError(
					"Could not upload image (File must be less than 2MB)"
				);
				setImageFileUploadingProgress(null);
				setImageFile(null);
				setImageFileUrl(null);
				setImageFileUploading(false);
			},
			() => {
				getDownloadURL(uplaodTask.snapshot.ref).then((downloadURL) => {
					setImageFileUrl(downloadURL);
					setFormData({
						...formData,
						profilePicture: downloadURL,
					});
					setImageFileUploading(false);
				});
			}
		);
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdateUserError(null);
		setUpdateUserSuccess(null);

		if (Object.keys(formData).length === 0) {
			setUpdateUserError("No changes made");
			return;
		}

		if (imageFileUploading) {
			setUpdateUserError("Please wait for the file to upload");
			return;
		}

		try {
			dispatch(updateStart());

			const res = await fetch(`/api/user/update/${currentUser._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok) {
				dispatch(updateFailure(data.message));
				setUpdateUserError(data.message);
			} else {
				dispatch(updateSuccess(data));
				setUpdateUserSuccess("User's profile updated successfully");
			}
		} catch (error) {
			dispatch(updateFailure(error));
			setUpdateUserError(data.message);
		}
	};

	const handleDeleteUser = async () => {
		setShowModal(false);

		try {
			dispatch(deleteUserStart());

			const res = await fetch(`/api/user/delete/${currentUser._id}`, {
				method: "DELETE",
			});

			const data = await res.json();
			if (!res.ok) {
				dispatch(deleteUserFailure(data.message));
			} else {
				dispatch(deleteUserStart(data));
			}

			dispatch(deleteUserSuccess());
		} catch (error) {
			dispatch(deleteUserFailure(error.message));
		}
	};

	const handleSignout = async () => {
		try {
			const res = await fetch("/api/user/signout", {
				method: "POST",
			});

			const data = await res.json();

			if (!res.ok) {
				console.log(data.message);
			} else {
				dispatch(signoutSuccess());
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div className="max-w-lg mx-auto p-3 w-full">
			<h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<input
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					ref={filePickerRef}
					hidden
				/>
				<div
					className="h-32 w-32 self-center cursor-pointer shadow-md rounded-full relative"
					onClick={() => filePickerRef.current.click()}
				>
					{imageFileUploadingProgress && (
						<CircularProgressbar
							value={imageFileUploadingProgress || 0}
							text={`${imageFileUploadingProgress}%`}
							strokeWidth={5}
							styles={{
								root: {
									width: "100%",
									height: "100%",
									position: "absolute",
									top: 0,
									left: 0,
								},
								path: {
									stroke: `rgba(62, 152 ,199 , ${
										imageFileUploadingProgress / 100
									})`,
								},
							}}
						/>
					)}
					<img
						src={imageFileUrl || currentUser.profilePicture}
						alt="user avatar"
						className={`rounded-full size-full object-cover border-8 border-[lightgray] ${
							imageFileUploadingProgress &&
							imageFileUploadingProgress < 100 &&
							"opacity-60"
						}`}
					/>
				</div>
				{imageFileUploadingError && (
					<Alert color="failure">{imageFileUploadingError}</Alert>
				)}

				<TextInput
					type="text"
					id="username"
					placeholder="username"
					defaultValue={currentUser.username}
					onChange={handleChange}
				/>
				<TextInput
					type="email"
					id="email"
					placeholder="email"
					defaultValue={currentUser.email}
					onChange={handleChange}
				/>
				<TextInput
					type="password"
					id="password"
					placeholder="password"
					onChange={handleChange}
				/>

				<Button
					type="submit"
					gradientDuoTone="purpleToBlue"
					outline
					disabled={loading || imageFileUploading}
				>
					{loading ? "Loading..." : "Update"}
				</Button>
				{currentUser.isAdmin && (
					<Link to={"/create-post"}>
						<Button
							type="button"
							gradientDuoTone="purpleToPink"
							className="w-full"
						>
							Create a Post
						</Button>
					</Link>
				)}
			</form>
			<div className="text-red-500 flex justify-between mt-5">
				<span onClick={() => setShowModal(true)} className="cursor-pointer">
					Delete Account
				</span>
				<span onClick={handleSignout} className="cursor-pointer">
					Sign Out
				</span>
			</div>
			{updateUserSuccess && (
				<Alert color="success" className="mt-5">
					{updateUserSuccess}
				</Alert>
			)}

			{updateUserError && (
				<Alert color="failure" className="mt-5">
					{updateUserError}
				</Alert>
			)}

			{error && (
				<Alert color="failure" className="mt-5">
					{error}
				</Alert>
			)}

			<Modal
				show={showModal}
				onClose={() => setShowModal(false)}
				popup
				size="md"
			>
				<Modal.Header />
				<Modal.Body>
					<div className="text-center">
						<HiOutlineExclamationCircle className="size-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
						<h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
							Are you sure you want to delete your account?
						</h3>

						<div className="flex justify-center gap-4">
							<Button color="failure" onClick={handleDeleteUser}>
								Yes, delete
							</Button>

							<Button color="gray" onClick={() => setShowModal(false)}>
								No, cancel
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
}
