
const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const uploadContent = document.getElementById("uploadContent");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const detectBtn = document.getElementById("detectBtn");
const placeholder = document.getElementById("placeholder");
const message = document.getElementById("message");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let resultURL = null;

uploadArea.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    selectedFile = file;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    uploadContent.style.display = "none";

    detectBtn.disabled = false;

    result.style.display = "none";
    placeholder.style.display = "block";
    downloadBtn.style.display = "none";

    if (resultURL) {
        URL.revokeObjectURL(resultURL);
        resultURL = null;
    }

    message.textContent = "Image uploaded successfully.";
});

uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
});

uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (!file || !file.type.startsWith("image/")) {
        alert("Please drop a valid image.");
        return;
    }

    imageInput.files = event.dataTransfer.files;

    imageInput.dispatchEvent(
        new Event("change", { bubbles: true })
    );
});

detectBtn.addEventListener("click", async () => {

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    detectBtn.disabled = true;
    detectBtn.textContent = "PROCESSING...";
    message.textContent = "YOLOv8 is analyzing your image...";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/detect/",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Detection failed.");
        }

        const blob = await response.blob();

        if (!blob.type.startsWith("image/")) {
            throw new Error("Invalid image response.");
        }

        if (resultURL) {
            URL.revokeObjectURL(resultURL);
        }

        resultURL = URL.createObjectURL(blob);

        result.src = resultURL;
        result.style.display = "block";
        placeholder.style.display = "none";

        downloadBtn.href = resultURL;
        downloadBtn.style.display = "inline-block";

        message.textContent = "Detection completed successfully!";

    } catch (error) {

        console.error(error);
        message.textContent = "Error: " + error.message;

    } finally {

        detectBtn.disabled = false;
        detectBtn.textContent = "RUN DETECTION →";
    }
});
