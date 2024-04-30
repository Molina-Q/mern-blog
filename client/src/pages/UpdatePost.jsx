import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";

export default function UpdatePost() {
	const [imageFile, setImageFile] = useState(null);
	const [imageFileUploading, setImageFileUploading] = useState(null);
	const [imageFileUploadError, setImageFileUploadError] = useState(null);
	const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
	const [formData, setFormData] = useState({});

	const { currentUser } = useSelector((state) => state.user);

	const { postId } = useParams();

	const [publishError, setPublishError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		try {
			const fetchPost = async () => {
				const res = await fetch(`/api/post/getposts?postId=${postId}`);
				const data = await res.json();
				if (!res.ok) {
					console.log(data.message);
					setPublishError(data.message);
					return;
				}
				if (res.ok) {
					setPublishError(null);
					setFormData(data.posts[0]);
					console.log(data.posts[0]);
				}
			};
			fetchPost();
		} catch (error) {
			console.log(error);
		}
	}, [postId]);

	const handleImageChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			setImageFile(file);
		}
	};

	const uploadImage = async () => {
		try {
			if (!imageFile) {
				setImageFileUploadError("Please select an image");
				return;
			}

			setImageFileUploadError(null);
			setImageFileUploading(true);

			const storage = getStorage(app);
			const fileName = new Date().getTime() + imageFile.name;
			const storageRef = ref(storage, fileName);
			const uploadTask = uploadBytesResumable(storageRef, imageFile);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					setImageFileUploadProgress(progress.toFixed(0));
				},
				(error) => {
					setImageFileUploadError(
						"Could not upload image (File must be less than 2MB)"
					);
					setImageFileUploadProgress(null);
					setImageFile(null);
					setImageFileUploading(false);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						setFormData({
							...formData,
							image: downloadURL,
						});
						setImageFileUploading(false);
						setImageFileUploadProgress(null);
					});
				}
			);
		} catch (error) {
			setImageFileUploadError("Image upload failed");
			setImageFileUploadProgress(null);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const handleQuill = (e) => {
		setFormData({
			...formData,
			content: e,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (imageFileUploading) {
			// setUpdateUserError("Please wait for the file to upload");
			return;
		}

		try {
			setImageFileUploadError(null);

			const res = await fetch(
				`/api/post/updatepost/${formData._id}/${currentUser._id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			const data = await res.json();

			if (data.success === false) {
				setPublishError(data.message);
			}

			if (!res.ok) {
				setPublishError(data.message);
			}

			if (res.ok) {
				setPublishError(null);
				navigate(`/post/${data.slug}`);
			}
		} catch (error) {
			setPublishError("Something went wrong");
		}
	};

	return (
		<div className="p-3 max-w-3xl mx-auto min-h-screen">
			<h1 className="text-center text-3xl my-7 font-semibold">
				Update the post
			</h1>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 sm:flex-row justify-between">
					<TextInput
						type="text"
						placeholder="Title"
						required
						id="title"
						className="flex-1"
						onChange={handleChange}
						value={formData.title}
					/>
					<Select
						onChange={handleChange}
						id="category"
						value={formData.category}
					>
						<option value="uncategorized">Select a category</option>
						<option value="javascript">JavaScript</option>
						<option value="reactjs">React.js</option>
						<option value="nextjs">Next.js</option>
					</Select>
				</div>

				<div
					className="flex gap-4 items-center justify-between border-4
                border-teal-500 border-dotted p-3"
				>
					<FileInput
						type="file"
						accept="image/*"
						onChange={handleImageChange}
					/>
					<Button
						type="button"
						gradientDuoTone={"purpleToBlue"}
						size={"sm"}
						outline
						onClick={uploadImage}
						disabled={imageFileUploadProgress}
					>
						{imageFileUploadProgress ? (
							<div className="size-16">
								<CircularProgressbar
									value={imageFileUploadProgress}
									text={`${imageFileUploadProgress}%`}
								/>
							</div>
						) : (
							"Upload image"
						)}
					</Button>
				</div>
				{imageFileUploadError && (
					<Alert color={"failure"}>{imageFileUploadError}</Alert>
				)}

				{formData.image && (
					<img
						src={formData.image}
						alt="upload"
						className="w-full h-72 object-cover"
					></img>
				)}
				<ReactQuill
					theme="snow"
					value={formData.content}
					placeholder="Write something..."
					className="h-72 mb-12"
					required
					onChange={handleQuill}
				/>
				<Button type="submit" gradientDuoTone={"purpleToPink"}>
					Update post
				</Button>
				{publishError && (
					<Alert className="mt-5" color={"failure"}>
						{publishError}
					</Alert>
				)}
			</form>
		</div>
	);
}
